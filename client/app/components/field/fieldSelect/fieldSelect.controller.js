import _ from 'lodash';

class FieldSelectController {
  /* @ngInject */
  constructor($q) {
    const vm = this;

    if (!vm.fieldModel.value) {
      vm.fieldModel.value = [];
    }

    vm.search = query => $q((resolve, reject) => {
      const options = (vm.fieldOptions.settings.options || []).map(option => ({
        slug: _.camelCase(option),
        title: option,
        type: 'option',
      }));

      resolve(options);
    });

    vm.transformChip = (chip) => {
      // If it is an object, it's already a known chip
      if (_.isObject(chip)) {
        return chip;
      }
      // Otherwise, create a new one
      return { title: chip, type: 'new' };
    };
  }
}

export default FieldSelectController;
