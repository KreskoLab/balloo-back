import { FastifyPluginAsync } from 'fastify';
import { RequestBodyI } from '../../interfaces/subcategory/request-body.interface';
import { RouteParamsI } from '../../interfaces/subcategory/request-params.interface';
import { Lang } from '../../models/Lang';
import { SubcategoryModel } from '../../models/Subcategory';
import { removeImage, saveImage, slugItem } from '../../utils';

const subcategoryRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.delete<{ Params: RouteParamsI }>(
    '/subcategory/:id',
    { preHandler: [fastify.isAdmin] },
    async (request, reply) => {
      const id = request.params.id;

      if (id) {
        try {
          await SubcategoryModel.findByIdAndRemove(id).then(async (doc) => {
            if (doc) {
              await removeImage(doc.image);
              reply.code(200).send();
            }
          });
        } catch (error) {
          reply.code(404).send();
        }
      } else {
        reply.code(422).send('Subcategory id is required');
      }
    },
  );

  fastify.put<{ Params: RouteParamsI; Body: RequestBodyI }>(
    '/subcategory/:id',
    { preHandler: [fastify.isAdmin] },
    async (request, reply) => {
      const id = request.params.id;
      const form = request.body;

      const subcategory = await SubcategoryModel.findById(id);

      if (subcategory) {
        const names: Lang[] = form.name ? JSON.parse(form.name.value) : subcategory.name;
        const imageName = form.image ? await saveImage(form.image) : subcategory.image;

        const res = await SubcategoryModel.findByIdAndUpdate(id, {
          name: names,
          slug: slugItem(names[0].value),
          image: imageName,
        });

        if (res) {
          if (form.image) await removeImage(res.image);
          reply.code(200).send();
        } else reply.code(404).send();
      } else reply.code(404).send();
    },
  );

  fastify.post<{ Body: RequestBodyI }>('/subcategory', { preHandler: [fastify.isAdmin] }, async (request, reply) => {
    const form = request.body;

    const names: Lang[] = JSON.parse(form.name.value);
    const imageName = await saveImage(form.image);

    const subcategory = new SubcategoryModel({
      name: names,
      slug: slugItem(names[0].value),
      filter: form.filter.value,
      image: imageName,
    });

    await subcategory.save();
    reply.code(200).send();
  });
};

export default subcategoryRoute;
