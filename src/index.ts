import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

import Fastify, { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import fastifyCompress from '@fastify/compress';
import fastifyCors from '@fastify/cors';
import fastifySession from '@fastify/secure-session';
import fastifyMultipart from '@fastify/multipart';
import app from './app';
import authRoute from './routes/auth';
import adminAuthRoute from './routes/admin/auth';
import googleAuth from './plugins/googleAuth';
import mongo from './plugins/mongo';
import path from 'path';
import fs from 'fs';
import jwt from './plugins/jwt';
import filtersRoute from './routes/admin/filter';
import productRoute from './routes/admin/product';
import subcategoryRoute from './routes/admin/subcategory';
import categoryRoute from './routes/admin/category';
import subcategoryUserRoute from './routes/subcategory';
import categoryUserRoute from './routes/category';
import filterUserRoute from './routes/filter';
import productUserRoute from './routes/product';

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
    domain: process.env.FRONTEND_DOMAIN,
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
    await fastify.register(fastifyMultipart, { attachFieldsToBody: true });

    //routes
    await fastify.register(authRoute);
    await fastify.register(subcategoryUserRoute);
    await fastify.register(categoryUserRoute);
    await fastify.register(filterUserRoute);
    await fastify.register(productUserRoute);

    //admin routes
    await fastify.register(adminAuthRoute, { prefix: 'admin' });
    await fastify.register(filtersRoute, { prefix: 'admin' });
    await fastify.register(productRoute, { prefix: 'admin' });
    await fastify.register(subcategoryRoute, { prefix: 'admin' });
    await fastify.register(categoryRoute, { prefix: 'admin' });

    await fastify
      .listen(fastify.appConfig.port, '0.0.0.0')
      .then(() => console.log(`🎉 Server started at ${fastify.appConfig.port} port`));
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
