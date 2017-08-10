class <%= upCaseName %>Controller {
  /* @ngInject */
  constructor($scope) {
    const vm = this;

    vm.name = '<%= upCaseName %>';

    const locals = $scope.$parent.$resolve;
  }
}

export default <%= upCaseName %>Controller;
