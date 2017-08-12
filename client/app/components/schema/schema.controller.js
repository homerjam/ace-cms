import _ from 'lodash';

class SchemaController {
  /* @ngInject */
  constructor(ConfigFactory, SchemaFactory, HelperFactory) {
    const vm = this;

    vm.schemas = ConfigFactory.getConfig().schemas;

    vm.selected = [];

    vm.order = 'name';

    vm.changeOrder = (order) => {
      const desc = /-/.test(order);
      order = /[a-z]+/i.exec(order)[0];

      vm.schemas.sort((a, b) => {
        if (a[order] < b[order]) {
          return desc ? 1 : -1;
        }
        if (a[order] > b[order]) {
          return desc ? -1 : 1;
        }
        return 0;
      });
    };

    vm.edit = async (event, schema) => {
      schema = await SchemaFactory.editSchema(schema, event);

      if (schema) {
        vm.schemas = HelperFactory.replace(vm.schemas, schema, 'slug');

        vm.changeOrder(vm.order);
      }
    };

    vm.new = async (event) => {
      const schema = await SchemaFactory.editSchema(null, event);

      if (schema) {
        vm.schemas.push(schema);

        vm.changeOrder(vm.order);
      }
    };

    vm.delete = async (event, selected) => {
      const schemaSlugs = selected.map(schema => schema.slug);

      const deleted = await SchemaFactory.deleteSchemas(schemaSlugs, event);

      if (deleted) {
        vm.schemas = _.remove(vm.schemas, schema => schemaSlugs.indexOf(schema.slug) === -1);
      }
    };
  }
}

export default SchemaController;
