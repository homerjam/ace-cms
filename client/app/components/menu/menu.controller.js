class MenuController {
  /* @ngInject */
  constructor($rootScope, $window, $filter, AdminFactory, SettingsFactory) {
    const vm = this;

    vm.preview = () => {
      $window.open(`${SettingsFactory.settings().url}?apiToken=${$rootScope.apiToken}`);
    };

    const updateDropdownContent = () => {
      vm.dropdownContent = [];

      vm.schemas.forEach((schema) => {
        if (schema.hidden) {
          return;
        }

        vm.dropdownContent.push({
          text: schema.singular ? schema.name : $filter('pluralize')(schema.name),
          schema,
        });
      });
    };

    const updateDropdownTaxonomy = () => {
      vm.dropdownTaxonomy = [];

      vm.taxonomies.forEach((taxonomy) => {
        vm.dropdownTaxonomy.push({
          text: taxonomy.name,
          taxonomy,
        });
      });
    };

    const refreshDropdowns = () => {
      vm.schemas = AdminFactory.get('schema', true);
      vm.taxonomies = AdminFactory.get('taxonomy', true);

      vm.batchUploadSchemas = vm.schemas.filter((schema) => {
        if (schema.singular) {
          return false;
        }

        const uploadFields = schema.fields.filter(field => /image/.test(field.fieldType));

        if (uploadFields.length === 0) {
          return false;
        }

        return true;
      });

      updateDropdownContent();
      updateDropdownTaxonomy();
    };

    refreshDropdowns();

    AdminFactory.registerObserverCallback(refreshDropdowns);
  }
}

export default MenuController;
