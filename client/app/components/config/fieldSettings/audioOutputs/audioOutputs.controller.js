class AudioOutputsController {
  /* @ngInject */
  constructor ($scope, $filter, Slug, input) {
    const vm = this;

    vm.output = input;

    if (Object.keys(vm.output).length === 0) {
      $scope.$watch(() => vm.output.name, (newName) => {
        if (newName !== undefined) {
          vm.output.slug = $filter('camelCase')(Slug.slugify(newName));
        }
      });
    }

    vm.formatOptions = [
      {
        value: 'mp3',
        name: 'mp3',
      },
      {
        value: 'aac',
        name: 'aac',
      },
    ];

    vm.qualityOptions = [
      {
        value: 1,
        name: 'Mediocre',
      },
      {
        value: 2,
        name: 'Acceptable',
      },
      {
        value: 3,
        name: 'Good',
      },
      {
        value: 4,
        name: 'Great',
      },
      {
        value: 5,
        name: 'Lossless',
      },
    ];

  }
}

export default AudioOutputsController;
