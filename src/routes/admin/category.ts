import { FastifyPluginAsync } from 'fastify';
import { RequestBodyI } from '../../interfaces/category/request-body.interface';
import { RequestParamsI } from '../../interfaces/category/request-params.interface';
import { CategoryModel } from '../../models/Category';
import { slugItem } from '../../utils';

const categoryRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.delete<{ Params: RequestParamsI }>(
    '/category/:id',
    { preHandler: [fastify.isAdmin] },
    async (request, reply) => {
      const id = request.params.id;

      if (id) {
        await CategoryModel.findByIdAndRemove(id);
        reply.code(200).send();
      } else reply.code(422).send();
    },
  );

  fastify.put<{ Params: RequestParamsI; Body: RequestBodyI }>(
    '/category/:id',
    { preHandler: [fastify.isAdmin] },
    async (request, reply) => {
      const id = request.params.id;

      if (id) {
        const { names, subcategories } = request.body;

        const doc = await CategoryModel.findById(id);

        if (doc) {
          await CategoryModel.findByIdAndUpdate(id, {
            name: names ? names : doc.name,
            slug: names ? slugItem(names[0].value) : doc.slug,
            subcategories: subcategories ? subcategories : doc.subcategories,
          });

          reply.code(200).send();
        } else reply.code(404).send();
      } else reply.code(422).send();
    },
  );

  fastify.post<{ Body: RequestBodyI }>('/category', { preHandler: [fastify.isAdmin] }, async (request, reply) => {
    const { names, subcategories } = request.body;

    if (names.length && subcategories.length) {
      const category = new CategoryModel({
        name: names,
        slug: slugItem(names[0].value),
        subcategories: subcategories,
      });

      await category.save();
      reply.code(200).send();
    } else reply.code(422).send();
  });
};

export default categoryRoute;
