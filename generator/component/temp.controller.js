class <%= upCaseName %>Controller {
  /* @ngInject */
  constructor($rootScope, $state) {
    let vm = this;

    vm.name = '<%= upCaseName %>';

    let locals = $scope.$parent.$resolve;
  }
}

export default <%= upCaseName %>Controller;
