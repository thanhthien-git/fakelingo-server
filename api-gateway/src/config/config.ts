import * as dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  AUTH_SERVICE: {
    service: 'AUTH_SERVICE',
    queue: 'AUTH_QUEUE',
    url: process.env.AUTH_SERVICE,
  },
  USER_SERVICE: {
    service: 'USER_SERVICE',
    queue: 'USER_QUEUE',
    url: process.env.USER_SERVICE,
  },
  CACHING_SERVICE: {
    service: 'CACHING_SERVICE',
    queue: 'CACHING_QUEUE',
    url: process.env.CACHING_SERVICE,
  },
  MESSAGE_SERVICE: {
    service: 'MESSAGE_SERVICE',
    queue: 'MESSAGE_QUEUE',
    url: process.env.MESSAGE_SERVICE,
  },
  FEED_SERVICE: {
    service: 'FEED_SERVICE',
    queue: 'FEED_QUEUE',
    url: process.env.FEED_SERVICE,
  },
  NOTIFICATION_SERVICE: {
    service: 'NOTIFICATION_SERVICE',
    queue: 'NOTIFICATION_QUEUE',
    url: process.env.NOTIFICATION_SERVICE,
  },
  MATCH_SERVICE: {
    service: 'MATCH_SERVICE',
    queue: 'MATCH_QUEUE',
    url: process.env.MATCH_SERVICE,
  },
  SWIPE_SERVICE: {
    service: 'SWIPE_SERVICE',
    queue: 'SWIPE_QUEUE',
    url: process.env.SWIPE_SERVICE,
  },
};
