import * as dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  rabbitmq: process.env.RABBITMQ_URL,
  mongoDb: process.env.MONGODB_URL,
  secretKey: process.env.SECRET_KEY,
};
