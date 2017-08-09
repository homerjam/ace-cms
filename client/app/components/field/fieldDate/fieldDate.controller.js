import _ from 'lodash';

class FieldDateController {
  /* @ngInject */
  constructor() {
    const vm = this;

    // Catch invalid dates
    if (!_.isDate(vm.fieldModel.value) || _.isNaN(vm.fieldModel.value.getTime())) {
      vm.fieldModel.value = new Date();
    }

    if (!vm.fieldModel.value && vm.fieldOptions.settings.required) {
      vm.fieldModel.value = new Date();
    }
  }
}

export default FieldDateController;
