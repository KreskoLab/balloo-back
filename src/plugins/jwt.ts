import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { accessTokenI } from '../interfaces/admin/access-token.interface';
import { refreshTokenI } from '../interfaces/admin/refresh-token.interface';

declare module 'fastify' {
  interface FastifyInstance {
    signAccessToken: (payload: object, time: string) => Promise<string>;
    signRefreshToken: (payload: object, time: string) => Promise<string>;
    verifyAccessToken: (token: string) => Promise<accessTokenI>;
    verifyRefreshToken: (token: string) => Promise<refreshTokenI>;
    isAdmin: (request: FastifyRequest, reply: FastifyReply) => boolean;
  }
}

const jwtPlugin: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.decorate('signAccessToken', async (payload: object, time: string) => {
    return jwt.sign(payload, fastify.appConfig.jwt.accessSecret, {
      expiresIn: time,
    });
  });

  fastify.decorate('signRefreshToken', async (payload: object, time: string) => {
    return jwt.sign(payload, fastify.appConfig.jwt.refreshSecret, {
      expiresIn: time,
    });
  });

  fastify.decorate('verifyAccessToken', (token: string) => {
    return jwt.verify(token, fastify.appConfig.jwt.accessSecret);
  });

  fastify.decorate('verifyRefreshToken', (token: string) => {
    return jwt.verify(token, fastify.appConfig.jwt.refreshSecret);
  });

  fastify.decorate('isAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers['authorization'] as string;

      if (authHeader && fastify.verifyAccessToken(authHeader.replace('Barear', '').trim())) {
        return true;
      } else throw new Error();
    } catch (e) {
      reply.code(403).send();
    }
  });

  done();
};

export default fp(jwtPlugin, {
  fastify: '3.x',
  name: 'jwt-auth',
});
