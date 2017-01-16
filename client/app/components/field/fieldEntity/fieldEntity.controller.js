import he from 'he/he';

class FieldEntityController {
  /* @ngInject */
  constructor($scope, $q, $log, AdminFactory, EntityFactory) {
    const vm = this;

    if (!vm.fieldModel && vm.fieldOptions.settings.multiple) {
      vm.fieldModel = [];
    }

    const schemas = AdminFactory.getByKey('schema');

    vm.schemas = vm.fieldOptions.settings.schemas.map(schema => ({
      name: schemas[schema.slug].name,
      slug: schema.slug,
    }));

    vm.newEntity = (schemaSlug) => {
      EntityFactory.newEntity(schemaSlug)
        .then((entity) => {
          if (vm.fieldOptions.settings.multiple) {
            vm.fieldModel.push(entity);
          } else {
            vm.fieldModel = entity;
          }
        });
    };

    // vm.group = function (entity) {
    //   return AdminFactory.getByKey('schema')[entity.schema].name;
    // };

    vm.search = query => $q((resolve, reject) => {
      const schemas = vm.fieldOptions.settings.schemas.map(schema => `schema:${schema.slug}`);

      if (!schemas.length) {
        $log.error('No schemas specified');

        return resolve([]);
      }

      const and = ['!trashed:true', `(${schemas.join(' OR ')})`];

      if (query !== '') {
        and.push(`title:${query}*`);
      }

      EntityFactory.search({
        q: and.join(' AND '),
        sort: 'sort.title<string>',
        include_docs: true,
      }).then((results) => {
        const options = results.map((result) => {
          const doc = result.doc;
          doc.id = doc._id;
          doc.title = he.decode(doc.title);
          return doc;
        });

        resolve(options);
      });
    });

  }
}

export default FieldEntityController;
