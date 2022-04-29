import { FastifyPluginAsync } from 'fastify';
import { RequestParamsI } from '../interfaces/filter/request-params.interface';
import { FilterModel } from '../models/Filter';
import mongoose from 'mongoose';

const filterUserRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/filters', async (request, reply) => {
    const filters = await FilterModel.find({}, { __v: 0 });
    reply.code(200).send(filters);
  });

  fastify.get<{ Params: RequestParamsI }>('/filter/:id', async (request, reply) => {
    const id = request.params.id;
    const lang = request.headers['accept-language'] || 'uk';

    if (id) {
      const filter = await FilterModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        {
          $project: {
            filters: {
              $filter: {
                input: '$filters',
                as: 'item',
                cond: { $eq: ['$$item.lang', lang] },
              },
            },
          },
        },
        {
          $unwind: '$filters',
        },
        {
          $group: {
            _id: '$_id',
            filters: { $push: '$filters.value' },
          },
        },
      ]);

      reply.code(200).send(filter);
    } else reply.code(422).send();
  });
};

export default filterUserRoute;
