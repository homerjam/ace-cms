class CropsController {
  /* @ngInject */
  constructor ($scope, $filter, Slug, input) {
    const vm = this;

    vm.crop = input;

    if (Object.keys(vm.crop).length === 0) {
      $scope.$watch(() => vm.crop.name, (newName) => {
        if (newName !== undefined) {
          vm.crop.slug = $filter('camelCase')(Slug.slugify(newName));
        }
      });
    }

    vm.gravityOptions = [
      {
        value: 'Center',
        name: 'Center',
      },
      {
        value: 'North',
        name: 'North',
      },
      {
        value: 'East',
        name: 'East',
      },
      {
        value: 'South',
        name: 'South',
      },
      {
        value: 'West',
        name: 'West',
      },
    ];
  }
}

export default CropsController;
