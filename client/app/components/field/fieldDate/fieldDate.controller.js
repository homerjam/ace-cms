import _ from 'lodash';

class FieldDateController {
  /* @ngInject */
  constructor() {
    const vm = this;

    // Catch invalid dates
    if (!_.isDate(vm.fieldModel) || _.isNaN(vm.fieldModel.getTime())) {
      vm.fieldModel = new Date();
    }

    if (!vm.fieldModel && vm.fieldOptions.settings.required) {
      vm.fieldModel = new Date();
    }
  }
}

export default FieldDateController;
