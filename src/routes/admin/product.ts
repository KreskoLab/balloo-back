import { FastifyPluginAsync } from 'fastify';
import { RequestFormI } from '../../interfaces/product/request-form.interface';
import { Lang } from '../../models/Lang';

import { ProductModel, Property } from '../../models/Product';
import { SubcategoryModel } from '../../models/Subcategory';
import { removeImage, saveImage, slugItem } from '../../utils';
import { RequestParamsI } from '../../interfaces/product/request-params.interface';

const productRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.delete<{ Params: RequestParamsI }>(
    '/product/:id',
    { preHandler: [fastify.isAdmin] },
    async (request, reply) => {
      const id = request.params.id;

      if (id) {
        try {
          await ProductModel.findByIdAndRemove(id).then(async (doc) => {
            if (doc) {
              await SubcategoryModel.findOneAndUpdate({ products: doc._id }, { $pull: { products: doc._id } });
              await removeImage(doc.image);

              reply.code(200).send();
            }
          });
        } catch (error) {
          reply.code(404).send();
        }
      } else {
        reply.code(422).send('Product id is required');
      }
    },
  );

  fastify.post<{ Body: RequestFormI }>('/product', { preHandler: [fastify.isAdmin] }, async (request, reply) => {
    const form = request.body;

    const names: Lang[] = JSON.parse(form.name.value);

    const productProperties: Property[] = [];
    const formProperties: Lang[] = JSON.parse(form.properties.value);

    if (formProperties.length && names.length) {
      const imageName = await saveImage(form.image);

      const subcategoryDoc = await SubcategoryModel.findById(form.subcategory.value).populate('filter');

      if (subcategoryDoc) {
        const filter = subcategoryDoc.filter;

        filter.filters.forEach((filter, index) => {
          productProperties.push({
            lang: filter.lang,
            name: filter.value,
            slug: slugItem(filter.value),
            value: formProperties.find((item) => item.lang === filter.lang)!.value,
            valueSlug: slugItem(formProperties.find((item) => item.lang === filter.lang)!.value),
          });
        });

        const product = new ProductModel({
          name: names,
          slug: slugItem(names[0].value),
          subcategory: form.subcategory.value,
          image: imageName,
          price: form.price.value,
          code: form.code.value,
          quantity: form.quantity.value,
          properties: productProperties,
        });

        await product.save().then(async (res) => {
          subcategoryDoc.products.push(res._id);
          await subcategoryDoc.save();
        });

        reply.code(200).send(product);
      } else reply.code(404).send();
    } else reply.code(422).send();
  });
};

export default productRoute;
