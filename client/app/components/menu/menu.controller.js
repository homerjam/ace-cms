class MenuController {
  /* @ngInject */
  constructor($rootScope, $window, $filter, ConfigFactory) {
    const vm = this;

    vm.preview = () => {
      $window.open(`${ConfigFactory.config().client.baseUrl}?apiToken=${$rootScope.apiToken}`);
    };
  }
}

export default MenuController;
