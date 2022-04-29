import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import mongoose from 'mongoose';

export interface PluginOptions {
  user: string;
  pass: string;
  db: string;
}

const mongoPlugin: FastifyPluginAsync = async (fastify, opts) => {
  mongoose.connect(
    `${fastify.appConfig.mongoURI}`,
    {
      dbName: fastify.appConfig.mongoDB,
      connectTimeoutMS: 5000,
    },
    (err) => {
      if (!err) console.log('🟢 MongoDB Connected!');
      else console.log(`❌ MongoDB connection error:`, err);
    },
  );
};

export default fp(mongoPlugin, {
  fastify: '3.x',
  name: 'mongodb-connect',
});
