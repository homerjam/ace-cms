class VideoOutputsController {
  /* @ngInject */
  constructor ($scope, $filter, $mdDialog, AdminFieldSettingsFactory, Slug, input) {
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
        value: 'mp4',
        name: 'mp4',
      },
      {
        value: 'webm',
        name: 'webm',
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

    vm.thumbnailAdd = () => {
      AdminFieldSettingsFactory.edit('thumbnails').then((thumbnail) => {
        if (!vm.output.thumbnails) {
          vm.output.thumbnails = [];
        }

        vm.output.thumbnails.push(thumbnail);
      });
    };

    vm.thumbnailEdit = (thumbnail) => {
      AdminFieldSettingsFactory.edit('thumbnails', thumbnail).then((updatedThumbnail) => {
        vm.output.thumbnails.splice(vm.output.thumbnails.indexOf(thumbnail), 1, updatedThumbnail);
      });
    };

    vm.thumbnailDelete = (thumbnail) => {
      const confirm = $mdDialog.confirm()
        // .title('Confirm Action')
        .textContent(`Are you sure you want to delete ${thumbnail.name}?`)
        .cancel('Cancel')
        .ok('Delete');

      $mdDialog
        .show(confirm)
        .then(() => {
          vm.output.thumbnails.splice(vm.output.thumbnails.indexOf(thumbnail), 1);
        });
    };

  }
}

export default VideoOutputsController;
