import fastifyPassport from '@fastify/passport';
import { Strategy } from 'passport-google-oauth20';
import { FastifyPluginAsync, RouteHandlerMethod } from 'fastify';
import { UserModel } from '../models/User';
import fp from 'fastify-plugin';

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (strategy: string, options?: object) => RouteHandlerMethod;
  }

  export interface FastifyRequest {
    logOut: () => Promise<void>;
  }
}

const sessionPlugin: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.register(fastifyPassport.initialize());
  fastify.register(fastifyPassport.secureSession());

  fastifyPassport.use(
    'google',
    new Strategy(
      {
        clientID: fastify.appConfig.google.id,
        clientSecret: fastify.appConfig.google.secret,
        callbackURL: fastify.appConfig.google.callbackURL,
      },

      function (accessToken, refreshToken, profile, done) {
        done(undefined, profile);
      },
    ),
  );

  fastifyPassport.registerUserSerializer(async (user: any) => user);

  fastifyPassport.registerUserDeserializer(async (user: any) => {
    let user_doc = await UserModel.findOne({ id: user.id }).exec();

    if (user_doc) {
      return user_doc;
    } else {
      let new_user = new UserModel({
        id: user.id,
        name: user.displayName,
        email: user.emails[0].value,
        img: user.photos[0].value,
        provider: user.provider,
      });
      await new_user.save();
      return new_user;
    }
  });

  fastify.decorate('authenticate', (strategy: string, options: object) => {
    return fastifyPassport.authenticate(strategy, options);
  });
};

export default fp(sessionPlugin, {
  fastify: '3.x',
  name: 'session-auth',
});
