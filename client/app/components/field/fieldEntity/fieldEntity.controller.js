import _ from 'lodash';
import he from 'he/he';

class FieldEntityController {
  /* @ngInject */
  constructor($scope, $q, $log, ConfigFactory, EntityFactory) {
    const vm = this;

    $scope.$on('aceSortable:change', (event, obj) => {
      console.log(event, obj);
    });

    if (!vm.fieldModel.value && vm.fieldOptions.settings.multiple) {
      vm.fieldModel.value = [];
    }

    const schemas = _.get(vm.fieldOptions, 'settings.schemas', []);

    if (!schemas.length) {
      $log.error(`No schemas specified for '${vm.fieldOptions.name}' field`);
    }

    vm.schemas = schemas.map(schema => ({
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
      let schemas = _.get(vm.fieldOptions, 'settings.schemas', []);

      if (!schemas.length) {
        $log.error(`No schemas specified for '${vm.fieldOptions.name}' field`);

        resolve([]);

        return;
      }

      schemas = schemas.map(schema => `schema:${schema}`);

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

    vm.clear = () => {
      vm.searchText = '';
      vm.fieldModel.value = null;
    };

  }
}

export default FieldEntityController;
