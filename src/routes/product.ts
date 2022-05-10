import { FastifyPluginAsync } from 'fastify';
import { RequestParamsI } from '../interfaces/product/request-params.interface';
import { ProductModel } from '../models/Product';

import mongoose from 'mongoose';
import { RequestQueryI } from '../interfaces/product/request-query.interface';

const productUserRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: RequestParamsI }>('/product/:slug', async (request, reply) => {
    const slugParam = request.params.slug;
    const lang = request.headers['accept-language'] || 'uk';

    if (slugParam) {
      const product = await ProductModel.aggregate([
        {
          $match: { slug: slugParam },
        },
        {
          $project: {
            image: 1,
            price: 1,
            slug: 1,
            code: 1,
            quantity: 1,
            name: {
              $filter: {
                input: '$name',
                as: 'item',
                cond: { $eq: ['$$item.lang', lang] },
              },
            },
            properties: {
              $filter: {
                input: '$properties',
                as: 'property',
                cond: { $eq: ['$$property.lang', lang] },
              },
            },
            description: {
              $filter: {
                input: '$description',
                as: 'item',
                cond: { $eq: ['$$item.lang', lang] },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            slug: 1,
            price: 1,
            image: 1,
            code: 1,
            quantity: 1,
            properties: 1,
            description: { $toString: { $arrayElemAt: ['$description.value', 0] } },
            name: { $toString: { $arrayElemAt: ['$name.value', 0] } },
          },
        },
      ]);

      reply.code(200).send(product);
    } else reply.code(422).send();
  });

  fastify.get<{ Querystring: RequestQueryI }>('/products', async (request, reply) => {
    let { subcategories, slugs } = request.query;
    const lang = request.headers['accept-language'] || 'uk';

    let subcategories_filter = {};
    let slugs_filter = {};

    if (subcategories) {
      if (!Array.isArray(subcategories)) {
        subcategories = subcategories.split();
      }

      subcategories.forEach((id: any, index: any) => (subcategories[index] = new mongoose.Types.ObjectId(id)));
      subcategories_filter = { subcategory: { $in: subcategories } };
    }

    if (slugs) {
      if (!Array.isArray(slugs)) {
        slugs = slugs.split();
      }

      slugs_filter = { slug: { $in: slugs } };
    }

    const products = await ProductModel.aggregate([
      {
        $match: subcategories_filter,
      },
      {
        $match: slugs_filter,
      },
      {
        $project: {
          price: 1,
          image: 1,
          subcategory: 1,
          slug: 1,
          quantity: 1,
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
        $lookup: {
          from: 'subcategories',
          localField: 'subcategory',
          foreignField: '_id',
          as: 'subcategory',
        },
      },
      {
        $project: {
          price: 1,
          image: 1,
          subcategory: 1,
          quantity: 1,
          slug: 1,
          name: { $toString: { $arrayElemAt: ['$name.value', 0] } },
        },
      },
    ]);

    reply.code(200).send(products);
  });

  fastify.get<{ Params: RequestParamsI }>('/products/:subcategory', async (request, reply) => {
    const locale = request.headers['accept-language'];

    if (locale !== 'uk' && locale !== 'ru') {
      reply.code(406).send('Only uk or ru accept-language');
    } else {
      let subcategory = request.params.subcategory;
      let query: any = request.query;
      let matchQuery: any = { $and: [] };

      if (query) {
        for (const item in query) {
          matchQuery['$and'].push({
            'properties.valueSlug': Array.isArray(query[item]) ? { $in: query[item] } : query[item],
            'properties.slug': item,
          });
        }

        if (matchQuery['$and'].length === 0) {
          matchQuery = {
            'properties.valueSlug': { $exists: true },
            'properties.slug': { $exists: true },
          };
        }
      }

      const products = await ProductModel.aggregate([
        {
          $match: { subcategory: new mongoose.Types.ObjectId(subcategory) },
        },
        {
          $project: {
            image: 1,
            price: 1,
            slug: 1,
            name: {
              $filter: {
                input: '$name',
                as: 'item',
                cond: { $eq: ['$$item.lang', locale] },
              },
            },
            properties: {
              $filter: {
                input: '$properties',
                as: 'property',
                cond: { $eq: ['$$property.lang', locale] },
              },
            },
          },
        },
        {
          $addFields: {
            name: { $toString: { $arrayElemAt: ['$name.value', 0] } },
          },
        },
        {
          $match: matchQuery,
        },
      ]);

      reply.code(200).send(products);
    }
  });
};

export default productUserRoute;
