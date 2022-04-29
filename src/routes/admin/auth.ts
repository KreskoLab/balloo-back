import bcrypt from 'bcrypt';
import { AdminModel } from '../../models/Admin';
import { FastifyPluginAsync } from 'fastify';
import { AuthHeaderI } from '../../interfaces/admin/auth-header.interface';
import { CookieI } from '../../interfaces/admin/cookie.interface';
import { LoginBodyI } from '../../interfaces/admin/login-body.interface';

const adminAuthRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.post<{ Body: LoginBodyI }>('/login', async (request, reply) => {
    const login: string = request.body.login;
    const password: string = request.body.password;

    let admin = await AdminModel.findOne({ login: login }).select('password login refreshTokens');

    if (admin) {
      const match = await bcrypt.compare(password, admin.password);

      if (match) {
        let id = { id: admin._id.toString() };

        let accessToken = await fastify.signAccessToken(id, '1h');
        let refreshToken = await fastify.signRefreshToken(id, '7d');

        admin.refreshTokens.push({
          token: refreshToken,
          createdAt: new Date(),
        });

        await admin.save();

        reply.setCookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 604800 });
        reply.code(200).send({ access_token: accessToken });
      } else {
        reply.code(401).send('login/password incorrect');
      }
    } else {
      reply.code(401).send('login/password incorrect');
    }
  });

  fastify.get<{ Headers: AuthHeaderI }>('/me', async (request, reply) => {
    const accessToken = request.headers['authorization']?.replace('Barear', '').trim();

    if (accessToken) {
      let validAccessToken = await fastify.verifyAccessToken(accessToken);

      if (validAccessToken) {
        const admin = await AdminModel.findById(validAccessToken.id).select('login');
        reply.code(200).send({ user: admin });
      }
    } else {
      reply.code(401).send();
    }
  });

  fastify.get<{ Headers: CookieI }>('/refresh', async (request, reply) => {
    const refreshToken = request.cookies['refresh_token'];

    if (refreshToken) {
      let validRefreshToken = await fastify.verifyRefreshToken(refreshToken);

      if (validRefreshToken) {
        let admin = await AdminModel.findById(validRefreshToken.id).select('refreshTokens __v');

        if (admin) {
          let lastRefreshToken = admin.refreshTokens[admin.refreshTokens.length - 1].token;

          if (lastRefreshToken === refreshToken) {
            let id = { id: admin._id.toString() };

            let newAccessToken = await fastify.signAccessToken(id, '1h');
            let newRefreshToken = await fastify.signRefreshToken(id, '7d');

            admin.refreshTokens.push({
              token: newRefreshToken,
              createdAt: new Date(),
            });

            await admin.save();

            reply.setCookie('refresh_token', newRefreshToken, { httpOnly: true, maxAge: 604800 });

            reply.code(200).send({
              access_token: newAccessToken,
            });
          }
        } else reply.code(404).send();
      }
    } else reply.code(401).send();
  });

  fastify.post<{ Headers: CookieI }>('/logout', async (request, reply) => {
    const refreshToken = request.cookies['refresh_token'];

    if (refreshToken) {
      const validRefreshToken = await fastify.verifyRefreshToken(refreshToken);

      if (validRefreshToken) {
        const admin = await AdminModel.findById(validRefreshToken.id).select('refreshTokens __v');

        if (admin) {
          admin.refreshTokens.pop();
          await admin.save();

          reply.code(200).send();
        } else {
          reply.code(404).send();
        }
      }
    }
  });
};

export default adminAuthRoute;
