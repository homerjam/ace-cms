import angular from 'angular';
import OpenSeadragon from 'openseadragon';

export default angular.module('ace.openSeadragon', [])
  .directive('aceOpenSeadragon', () => ({
    restrict: 'AE',
    template: '<div class="ace-open-seadragon"></div>',
    replace: true,
    link($scope, $element, $attrs) {
      const openSeaDragon = OpenSeadragon;
      openSeaDragon({
        element: $element[0],
        tileSources: $attrs.aceOpenSeadragon || $attrs.src,
        prefixUrl: $attrs.prefixUrl || '',
      });
    },
  }));

