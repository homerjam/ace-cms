class FieldKeyValueController {
  /* @ngInject */
  constructor() {
    const vm = this;

    if (!vm.fieldModel.value) {
      vm.fieldModel.value = [];
    }

    vm.getIndex = (scope) => {
      return scope.$parent.$index;
    };

    vm.getCollection = (scope) => {
      return vm.fieldModel.value;
    };
  }
}

export default FieldKeyValueController;
