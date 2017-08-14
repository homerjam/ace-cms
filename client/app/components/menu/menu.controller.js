class MenuController {
  /* @ngInject */
  constructor($rootScope, $window, $state, ConfigFactory, TaxonomyFactory) {
    const vm = this;

    vm.newTaxonomy = async (event) => {
      const taxonomy = await TaxonomyFactory.editTaxonomy(null, event);

      if (taxonomy) {
        $state.go('taxonomy', { taxonomySlug: taxonomy.slug });
      }
    };

    vm.preview = () => {
      $window.open(`${ConfigFactory.getConfig().client.baseUrl}?apiToken=${$rootScope.apiToken}`);
    };
  }
}

export default MenuController;
