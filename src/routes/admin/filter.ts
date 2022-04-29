import { FastifyPluginAsync } from 'fastify';
import { RequestBodyI } from '../../interfaces/filter/request-body.interface';
import { RequestParamsI } from '../../interfaces/filter/request-params.interface';

import { FilterModel } from '../../models/Filter';
import { SubcategoryModel } from '../../models/Subcategory';

const filtersRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/filters', { preHandler: [fastify.isAdmin] }, async (request, reply) => {
    let filters = await FilterModel.find({}, { __v: 0 });
    reply.code(200).send(filters);
  });

  fastify.get<{ Params: RequestParamsI }>('/filter/:id', { preHandler: [fastify.isAdmin] }, async (request, reply) => {
    const id = request.params.id;
    const filter = await FilterModel.findById(id, { __v: 0 });

    reply.code(200).send(filter);
  });

  fastify.delete<{ Params: RequestParamsI }>(
    '/filter/:id',
    { preHandler: [fastify.isAdmin] },
    async (request, reply) => {
      const id = request.params.id;

      await FilterModel.findByIdAndRemove(id).then(async (doc) => {
        if (doc) {
          await SubcategoryModel.findOneAndUpdate({ filter: doc._id }, { $unset: { filter: '' } });
          reply.code(200).send();
        } else {
          reply.code(404).send();
        }
      });
    },
  );

  fastify.put<{ Params: RequestParamsI; Body: RequestBodyI }>(
    '/filter/:id',
    { preHandler: [fastify.isAdmin] },
    async (request, reply) => {
      const id = request.params.id;
      const { names, newFilters } = request.body;

      await FilterModel.findByIdAndUpdate(id, { name: names, filters: newFilters });

      reply.code(200).send();
    },
  );

  fastify.post<{ Body: RequestBodyI }>('/filter', { preHandler: [fastify.isAdmin] }, async (request, reply) => {
    const { names, newFilters } = request.body;

    const filter = new FilterModel({ name: names, filters: newFilters });
    await filter.save();

    reply.code(200).send();
  });
};

export default filtersRoute;
