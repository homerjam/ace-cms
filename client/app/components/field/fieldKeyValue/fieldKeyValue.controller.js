class FieldKeyValueController {
  /* @ngInject */
  constructor() {
    const vm = this;

    if (!vm.fieldModel) {
      vm.fieldModel = [];
    }

    vm.getIndex = (scope) => {
      return scope.$parent.$index;
    };

    vm.getCollection = (scope) => {
      return vm.fieldModel;
    };
  }
}

export default FieldKeyValueController;
