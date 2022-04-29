import mongoose from 'mongoose';
import { FastifyPluginAsync } from 'fastify';
import { RequestQueryI } from '../interfaces/subcategory/request-query.interface';
import { SubcategoryModel } from '../models/Subcategory';
import { RouteParamsI } from '../interfaces/subcategory/request-params.interface';

const subcategoryUserRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get<{ Querystring: RequestQueryI }>('/subcategories', async (request, reply) => {
    let populate,
      populateSelect = '';

    if (request.query.populate) {
      populate = Array.isArray(request.query.populate) ? request.query.populate[0] : request.query.populate;
      populateSelect = Array.isArray(request.query.populate) ? request.query.populate[1] : '';
    }

    const subcategories = await SubcategoryModel.find({}, { __v: 0 }).populate(populate, populateSelect);
    reply.code(200).send(subcategories);
  });

  fastify.get<{ Params: RouteParamsI }>('/subcategory/:id/filters', async (request, reply) => {
    const id = request.params.id;
    const lang = request.headers['accept-language'] || 'uk';

    const filters = await SubcategoryModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products',
          foreignField: '_id',
          as: 'products',
        },
      },
      {
        $unwind: '$products',
      },
      {
        $project: {
          products: {
            $filter: {
              input: '$products.properties',
              as: 'item',
              cond: { $eq: ['$$item.lang', lang] },
            },
          },
          filters: {
            $map: {
              input: {
                $filter: {
                  input: '$products.properties',
                  as: 'item',
                  cond: { $eq: ['$$item.lang', lang] },
                },
              },
              as: 'property',
              in: {
                name: '$$property.value',
                value: '$$property.valueSlug',
                slug: '$$property.slug',
                length: { $strLenCP: '$$property.valueSlug' },
              },
            },
          },
        },
      },
      {
        $addFields: {
          filters: { $arrayElemAt: ['$filters', 0] },
        },
      },
      {
        $group: {
          _id: { $toString: { $arrayElemAt: ['$products.name', 0] } },
          filters: { $push: '$filters' },
        },
      },
      {
        $project: {
          name: '$_id',
          filters: 1,
          _id: 0,
        },
      },
      {
        $sort: { 'filters.length': -1 },
      },
    ]);

    reply.code(200).send(filters);
  });
};

export default subcategoryUserRoute;
