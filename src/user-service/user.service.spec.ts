import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user-schema';
import { UserService } from './user.service';
import { CachingService } from '../../caching-service/src/caching.service';

describe('UserService', () => {
  let service: UserService;

  const mockCachingService = {
    get: jest.fn(),
    set: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(''),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [
        UserService,
        { provide: CachingService, useValue: mockCachingService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('test function call only', async () => {
    const dto = {
      condition: {
        preferences: {
          gender: 'F',
          ageRange: { min: 15, max: 22 },
          max_distance: 1000,
        },
        location: { coordinates: [106.6297, 10.8231] },
      },
    };

    const userId = '68219049e659cf0e074f5628';
    const result = await service.findUserByCondition(dto as any, 10, userId);

    console.log(
      '👉 Returned result:',
      result.map((id) => id.toString()),
    );
  });
});
