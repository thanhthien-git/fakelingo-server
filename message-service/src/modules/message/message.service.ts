import {
  BadGatewayException,
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SendMessageDto } from 'src/dtos/send-message.dto';
import { MessageGateway } from 'src/gateway/message.gateway';
import { Message } from 'src/schemas/message.schema';
import { Conversation } from 'src/schemas/conversation.schema';
import { HttpService } from '@nestjs/axios';
import { GetUserByIdsDto } from 'src/dtos/get-user-by-ids.dto';
import { IUser } from 'src/interface/IUser';
import { IChatList } from 'src/interface/IChatList';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationPayloadDto } from './dtos/send-notification-payload';

@Injectable()
export class MessageService {
  private USER_SERVICE_ENDPOINT = process.env.USER_SERVICE;
  constructor(
    @Inject(forwardRef(() => MessageGateway))
    private readonly messageGateway: MessageGateway,
    private httpService: HttpService,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @Inject('NOTIFICATION_QUEUE') private readonly client: ClientProxy,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}
  async create(data: SendMessageDto) {
    const { content } = data;
    const fromUserId = new Types.ObjectId(data.fromUserId);
    const toUserId = new Types.ObjectId(data.toUserId);

    const session = await this.messageModel.db.startSession();
    session.startTransaction();

    try {
      const participants = [fromUserId, toUserId].sort();

      const conversation = await this.conversationModel.findOneAndUpdate(
        { participants },
        {
          $setOnInsert: { participants },
        },
        {
          new: true,
          upsert: true,
          session,
        },
      );

      const message = await this.messageModel.create(
        [
          {
            senderId: fromUserId,
            receiverId: toUserId,
            conversationId: conversation._id,
            isRead: false,
            content,
          },
        ],
        { session },
      );

      await this.conversationModel.updateOne(
        { _id: conversation._id },
        { lastMessageId: message[0]._id, lastMessageAt: new Date() },
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      this.sendEventToNotificationService(message[0]);

      return message[0];
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async notifyReceiver(message: Message) {
    this.messageGateway.emitToUser(String(message.receiverId), message);
  }

  async getMessageByUserId(
    userId: string,
    page = 1,
    limit = 10,
    req: Request,
  ): Promise<IChatList[]> {
    try {
      const skip = (page - 1) * limit;

      const conversations = await this.conversationModel
        .find({ participants: new Types.ObjectId(userId) })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('lastMessageId');

      const userIds: string[] = Array.from(
        new Set(
          conversations
            .flatMap((c) => c.participants)
            .filter((id) => id.toString() !== userId)
            .map((id) => id.toString()),
        ),
      );

      const ids: GetUserByIdsDto = {
        ids: userIds,
      };

      const response = await this.httpService
        .post(`${this.USER_SERVICE_ENDPOINT}/user/get-by-ids`, ids, {
          headers: {
            Authorization: req.headers['authorization'],
          },
        })
        .toPromise();

      const userFromResponse: IUser[] = response.data;

      const chatList: IChatList[] = conversations.map((c) => {
        const targetUserId = c.participants.find(
          (id) => id.toString() !== userId,
        );
        const user = userFromResponse.find(
          (u) => u._id === targetUserId.toString(),
        );

        const lastMessage = c.lastMessageId as unknown as Message;

        return {
          user,
          conversationId: String(c._id),
          lastMessageId: lastMessage?._id?.toString() ?? null,
          lastMessageContent: lastMessage?.content ?? null,
        };
      });

      return chatList;
    } catch (err) {
      console.log(err);

      throw new BadGatewayException(err);
    }
  }

  async findOrCreateConversation(userA: string, userB: string) {
    const participants = [userA, userB].sort();

    const conversation = await this.conversationModel.findOneAndUpdate(
      { participants },
      { $setOnInsert: { participants } },
      { new: true, upsert: true },
    );

    return conversation;
  }

  async getConversationMessages(
    conversationId: string,
    before?: string,
    limit = 15,
  ): Promise<Message[]> {
    const query: any = { conversationId: new Types.ObjectId(conversationId) };

    if (before) {
      query._id = { $lt: new Types.ObjectId(before) };
    }

    const messages = await this.messageModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limit);

    return messages.reverse();
  }

  sendEventToNotificationService(message: Message) {
    const notification: NotificationPayloadDto = {
      type: 'message',
      userId: message.receiverId.toString(),
      fromUserId: message.senderId.toString(),
      body: message.content,
      title: 'new_message',
    };
    this.client.emit('notification_message', {
      ...notification,
    });
    console.log('✅ Đã emit notification_message');
  }
}
