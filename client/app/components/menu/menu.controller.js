class MenuController {
  /* @ngInject */
  constructor($rootScope, $window, $state, $transitions, $mdSidenav, ConfigFactory, TaxonomyFactory) {
    const vm = this;

    $transitions.onSuccess({ to: '*' }, (trans) => {
      $state.previous = trans.from().name === '' ? null : trans.from();
      $state.previousParams = trans.params('from');

      $mdSidenav('mainMenu').close();
    });

    $rootScope.toggleMainMenu = () => {
      $mdSidenav('mainMenu').toggle();
    };

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
