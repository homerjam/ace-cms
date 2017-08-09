import he from 'he/he';

class FieldEntityController {
  /* @ngInject */
  constructor($scope, $q, $log, ConfigFactory, EntityFactory) {
    const vm = this;

    if (!vm.fieldModel.value && vm.fieldOptions.settings.multiple) {
      vm.fieldModel.value = [];
    }

    vm.schemas = vm.fieldOptions.settings.schemas.map(schema => ({
      name: ConfigFactory.getSchema(schema).name,
      slug: schema,
    }));

    vm.newEntity = (schemaSlug) => {
      EntityFactory.newEntity(schemaSlug)
        .then((entity) => {
          if (vm.fieldOptions.settings.multiple) {
            vm.fieldModel.value.push(entity);
          } else {
            vm.fieldModel.value = entity;
          }
        });
    };

    vm.search = query => $q((resolve, reject) => {
      const schemas = vm.fieldOptions.settings.schemas.map(schema => `schema:${schema}`);

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
