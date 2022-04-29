import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

import Fastify, { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import fastifyCompress from 'fastify-compress';
import fastifyCors from 'fastify-cors';
import fastifySession from '@fastify/secure-session';
import app from './app';
import authRoute from './routes/auth';
import adminAuthRoute from './routes/admin/auth';
import googleAuth from './plugins/googleAuth';
import mongo from './plugins/mongo';
import path from 'path';
import fs from 'fs';
import jwt from './plugins/jwt';

const fastify: FastifyInstance<Server, IncomingMessage, ServerResponse> = Fastify({
  logger: false,
  bodyLimit: 12485760, // 10 MB
  maxParamLength: 120,
});

fastify.register(fastifySession, {
  key: fs.readFileSync(path.join(process.cwd(), 'secret-key')),
  cookieName: 'session-id',
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 86400, // 1 day
  },
});

const start = async () => {
  try {
    //plugins
    await fastify.register(app);
    await fastify.register(mongo);
    await fastify.register(googleAuth);
    await fastify.register(jwt);
    await fastify.register(fastifyCompress);
    await fastify.register(fastifyCors, { origin: '*' });

    //routes
    await fastify.register(authRoute);

    //admin routes
    await fastify.register(adminAuthRoute, { prefix: 'admin' });

    await fastify
      .listen(fastify.appConfig.port)
      .then(() => console.log(`🎉 Server started at ${fastify.appConfig.port} port`));
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
