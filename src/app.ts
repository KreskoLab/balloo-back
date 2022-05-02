import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  export interface FastifyInstance {
    appConfig: AppConfig;
  }
}

function loadEnv(key: string) {
  const val = process.env[key];

  if (!val) {
    throw new Error(`${key} is a required env variable`);
  }

  return val;
}

type AppConfig = typeof appConfig;

const appConfig = {
  google: {
    id: loadEnv('GOOGLE_ID'),
    secret: loadEnv('GOOGLE_SECRET'),
    callbackURL: loadEnv('GOOGLE_CALLBACK_URL'),
  },
  jwt: {
    accessSecret: loadEnv('ACCESS_TOKEN_SECRET'),
    refreshSecret: loadEnv('REFRESH_TOKEN_SECRET'),
  },
  session: {
    secret: loadEnv('SECURE_SESSION_SECRET'),
    salt: loadEnv('SECURE_SESSION_SALT'),
  },
  frontendURL: loadEnv('FRONTEND_URL'),
  port: loadEnv('PORT'),
  mongoURI: loadEnv('MONGO_URI'),
  mongoDB: loadEnv('MONGO_DB'),
};

const app: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.decorate('appConfig', appConfig);
};

export default fp(app, '3.x');
