import { FastifyPluginAsync } from 'fastify';
import { RequestParamsI } from '../interfaces/category/request-params.interface';
import { CategoryModel } from '../models/Category';

const categoryUserRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/categories', async (request, reply) => {
    const lang = request.headers['accept-language'] || 'uk';

    const categories = await CategoryModel.aggregate([
      {
        $lookup: {
          from: 'subcategories',
          as: 'subcategories',
          let: { subcategories_ids: '$subcategories' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$subcategories_ids'] },
              },
            },
            {
              $project: {
                slug: 1,
                image: 1,
                products: 1,
                name: {
                  $filter: {
                    input: '$name',
                    as: 'item',
                    cond: { $eq: ['$$item.lang', lang] },
                  },
                },
              },
            },
            {
              $unwind: '$name',
            },
          ],
        },
      },
      {
        $project: {
          slug: 1,
          subcategories: 1,
          name: {
            $filter: {
              input: '$name',
              as: 'item',
              cond: { $eq: ['$$item.lang', lang] },
            },
          },
        },
      },
      {
        $unwind: '$name',
      },
    ]);

    reply.code(200).send(categories);
  });

  fastify.get<{ Params: RequestParamsI }>('/category/:slug', async (request, reply) => {
    if (request.params.slug) {
      const category = await CategoryModel.findOne({ slug: request.params.slug });

      if (category) reply.code(200).send(category);
      else reply.code(404).send();
    } else reply.code(422).send();
  });
};

export default categoryUserRoute;
