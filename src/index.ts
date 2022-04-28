import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

import Fastify, { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import fastifyCompress from 'fastify-compress';
import fastifyCors from 'fastify-cors';
import fastifySession from '@fastify/secure-session';
import app from './app';
import authRoute from './routes/auth';
import session from './plugins/session';
import mongo from './plugins/mongo';
import path from 'path';
import fs from 'fs';

const fastify: FastifyInstance<Server, IncomingMessage, ServerResponse> =
  Fastify({
    logger: false,
    bodyLimit: 12485760, // 10 MB
    maxParamLength: 120,
  });

//AUTH PLUGINS
//fastify.register(require('./auth/session'));
// fastify.register(require('./auth/jwt'));
//

// fastify.register(require('fastify-cors'), {
//   origin: '*',
// });

// fastify.register(require('fastify-static'), {
//   root: path.join(__dirname, 'images'),
//   prefix: '/images', // optional: default '/'
// });

// fastify.register(require('fastify-compress'));

//routes
// fastify.register(require('./routes/auth'));
// fastify.register(require('./routes/category'));
// fastify.register(require('./routes/filter'));
// fastify.register(require('./routes/subcategory'));
// fastify.register(require('./routes/product'));

// fastify.register(require('./routes/crm/category'), { prefix: 'crm' });
// fastify.register(require('./routes/crm/subcategory'), { prefix: 'crm' });
// fastify.register(require('./routes/crm/product'), { prefix: 'crm' });
// fastify.register(require('./routes/crm/filter'), { prefix: 'crm' });
// fastify.register(require('./routes/crm/auth'), { prefix: 'crm' });
//

fastify.register(fastifySession, {
  key: fs.readFileSync(path.join(process.cwd(), 'secret-key')),
  cookieName: 'session-id',
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 1000, // 1 day
  },
});

const start = async () => {
  try {
    await fastify.register(app);
    await fastify.register(mongo);
    await fastify.register(session);
    await fastify.register(fastifyCompress);
    await fastify.register(fastifyCors, { origin: '*' });
    await fastify.register(authRoute);
    await fastify
      .listen(fastify.appConfig.port)
      .then(() =>
        console.log(`🎉 Server started at ${fastify.appConfig.port} port`),
      );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
