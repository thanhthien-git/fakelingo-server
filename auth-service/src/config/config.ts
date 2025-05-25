export default () => ({
  mongodb: {
    uri: process.env.MONGODB_URL,
  },
  redis: {
    uri: process.env.REDIS_URL,
  },
  jwt: {
    secret: process.env.SECRET_KEY,
  },
});
