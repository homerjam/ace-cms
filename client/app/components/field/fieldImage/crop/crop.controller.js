import angular from 'angular';

class CropController {
  /* @ngInject */
  constructor($rootScope, $scope, $window, availableCrops, image) {
    const vm = this;

    vm.crops = image.crops ? angular.copy(image.crops) : {};
    vm.availableCrops = availableCrops;
    vm.activeCrop = 0;

    const setCrop = (crop) => {
      if (crop) {
        vm.coords = {
          left: crop[0],
          top: crop[1],
          right: crop[2],
          bottom: crop[3],
          width: crop[2] - crop[0],
          height: crop[3] - crop[1],
        };
      } else {
        vm.coords = {};
      }
    };

    $scope.$watch(() => vm.activeCrop, (cropIndex) => {
      vm.cropSettings = vm.availableCrops[vm.activeCrop];

      const crop = vm.crops[vm.cropSettings.slug];

      setCrop(crop);
    });

    $scope.$watch(() => vm.coords, (coords) => {
      if (!coords) {
        return;
      }

      if (
        Object.keys(coords).length &&
        !isNaN(coords.top) &&
        !isNaN(coords.left) &&
        !isNaN(coords.right) &&
        !isNaN(coords.bottom) &&
        !isNaN(coords.width) &&
        !isNaN(coords.height)
      ) {
        vm.crops[vm.cropSettings.slug] = [coords.left, coords.top, coords.right, coords.bottom];

      } else {
        // delete vm.crops[vm.cropSettings.slug];
        vm.crops[vm.cropSettings.slug] = null;
      }
    });

    vm.cropSize = () => {
      const availWidth = ($window.innerWidth * 0.5) - 100;
      const availHeight = $window.innerHeight - 250;
      let w;
      let h;

      if (image.metadata.width / image.metadata.height > availWidth / availHeight) {
        w = availWidth;
        h = w * (image.metadata.height / image.metadata.width);
      } else {
        h = availHeight;
        w = h * (image.metadata.width / image.metadata.height);
      }

      return {
        width: w,
        height: h,
        'vertical-align': 'top',
      };
    };

    vm.getThumbnail = () => [$rootScope.assistUrl, $rootScope.assetSlug, 'transform', 'h:500;q:60', image.fileName].join('/');

  }
}

export default CropController;
