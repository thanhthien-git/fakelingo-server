import {
  BadGatewayException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendMessageDto } from 'src/dtos/send-message.dto';
import { MessageGateway } from 'src/gateway/message.gateway';
import { Message } from 'src/schemas/message.schema';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class MessageService {
  constructor(
    @Inject(forwardRef(() => MessageGateway))
    private readonly messageGateway: MessageGateway,
    private notificationService: NotificationService,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}
  async create(data: SendMessageDto) {
    const { fromUsername, toUserName, content } = data;
    const message = await this.messageModel.create({
      senderId: fromUsername,
      receiverId: toUserName,
      isRead: false,
      content: content,
    });

    return message;
  }

  async notifyReceiver(message: Message) {
    this.messageGateway.emitToUser(message.receiverId, message);

    this.notificationService.pushNotification({
      userId: message.receiverId,
      title: 'Tin nhắn mới',
      body: message.content,
    });
  }

  async getMessageByUserId(userId: string): Promise<Message[]> {
    try {
      const message: Message[] = await this.messageModel.find({});

      return message;
    } catch (err) {
      throw new BadGatewayException(err);
    }
  }
}
