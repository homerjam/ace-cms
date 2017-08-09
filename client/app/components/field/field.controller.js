class FieldController {
  /* @ngInject */
  constructor() {
    const vm = this;

    if (!vm.fieldModel) {
      vm.fieldModel = {};
    }

    vm.fieldModel.type = vm.fieldType;
  }
}

export default FieldController;
