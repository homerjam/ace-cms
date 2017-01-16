class <%= upCaseName %>Controller {
  /* @ngInject */
  constructor($rootScope, $state) {
    let vm = this;

    vm.name = '<%= upCaseName %>';

    let locals = $state.$current.locals.globals;
  }
}

export default <%= upCaseName %>Controller;
