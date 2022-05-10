import { FastifyPluginAsync } from 'fastify';
import { RequestFormI } from '../interfaces/user/request-form.interface';
import { UserModel } from '../models/User';

const authRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    '/login',
    {
      preValidation: fastify.authenticate('google', {
        session: false,
        scope: ['profile', 'email'],
      }),
    },
    async () => {},
  );

  fastify.get(
    '/auth/google/callback',
    {
      preValidation: fastify.authenticate('google', {
        session: true,
        scope: ['profile', 'email'],
      }),
    },
    async (request, reply) => {
      reply.redirect(fastify.appConfig.frontendURL);
    },
  );

  fastify.get('/logout', async (request, reply) => {
    await request.logOut();
    reply.code(200).send();
  });

  fastify.get('/me', async (request, reply) => {
    if (request.user) {
      reply.code(200).send(request.user);
    } else {
      reply.code(401).send();
    }
  });

  fastify.put<{ Body: RequestFormI }>('/me', async (request, reply) => {
    if (request.user) {
      await UserModel.findByIdAndUpdate(request.body._id, request.body);
      reply.code(200).send(request.user);
    } else {
      reply.code(401).send();
    }
  });
};

export default authRoute;
