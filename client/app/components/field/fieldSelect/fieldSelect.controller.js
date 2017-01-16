import angular from 'angular';

class FieldSelectController {
  /* @ngInject */
  constructor($q, Slug) {
    const vm = this;

    if (!vm.fieldModel) {
      vm.fieldModel = [];
    }

    vm.search = query => $q((resolve, reject) => {
      const options = (vm.fieldOptions.settings.options || []).map(option => ({
        slug: Slug.slugify(option),
        title: option,
        type: 'option',
      }));

      resolve(options);
    });

    vm.transformChip = (chip) => {
      // If it is an object, it's already a known chip
      if (angular.isObject(chip)) {
        return chip;
      }
      // Otherwise, create a new one
      return { title: chip, type: 'new' };
    };
  }
}

export default FieldSelectController;
