import _ from 'lodash';

class SchemaController {
  /* @ngInject */
  constructor($scope, ConfigFactory, SchemaFactory) {
    const vm = this;

    vm.schemas = ConfigFactory.getConfig().schemas;

    vm.selected = [];

    // vm.order = 'name';

    vm.changeOrder = (order) => {
      if (!order) {
        return;
      }
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
      await SchemaFactory.editSchema(schema, event);

      vm.schemas = ConfigFactory.getConfig().schemas;

      vm.changeOrder(vm.order);

      $scope.$apply();
    };

    vm.new = async (event) => {
      await SchemaFactory.editSchema(null, event);

      vm.schemas = ConfigFactory.getConfig().schemas;

      vm.changeOrder(vm.order);

      $scope.$apply();
    };

    vm.delete = async (event, selected) => {
      const schemaSlugs = selected.map(schema => schema.slug);

      const deleted = await SchemaFactory.deleteSchemas(schemaSlugs, event);

      if (deleted) {
        vm.schemas = ConfigFactory.getConfig().schemas;

        vm.changeOrder(vm.order);

        $scope.$apply();
      }
    };

    $scope.$on('aceSortable:change', (event, { collection }) => {
      SchemaFactory.updateSchemas(collection);
    });
  }
}

export default SchemaController;
