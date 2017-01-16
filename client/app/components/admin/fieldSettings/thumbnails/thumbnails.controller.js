class ThumbnailsController {
  /* @ngInject */
  constructor ($scope, $filter, Slug, input) {
    const vm = this;

    vm.thumbnail = input;

    if (Object.keys(vm.thumbnail).length === 0) {
      $scope.$watch(() => vm.thumbnail.name, (newName) => {
        if (newName !== undefined) {
          vm.thumbnail.slug = $filter('camelCase')(Slug.slugify(newName));
        }
      });
    }

    vm.thumbnailFormatOptions = [
      {
        value: 'jpg',
        name: 'jpg',
      },
      {
        value: 'png',
        name: 'png',
      },
    ];
  }
}

export default ThumbnailsController;
