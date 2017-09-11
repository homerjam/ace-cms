class FieldKeyValueController {
  /* @ngInject */
  constructor() {
    const vm = this;

    if (!vm.fieldModel.value) {
      vm.fieldModel.value = [];
    }
  }
}

export default FieldKeyValueController;
