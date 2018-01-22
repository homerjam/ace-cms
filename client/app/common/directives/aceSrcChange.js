import angular from 'angular';

export default angular.module('ace.srcChange', []).directive('aceSrcChange', ['$timeout', $timeout => ({
  priority: 0,
  restrict: 'A',

  link($scope, $element, $attrs) {
    let oldSrc;

    $element.on('load', () => {
      $element.css('opacity', 1);
    });

    $element.on('error', () => {
      $element.css('opacity', 1);
    });

    $attrs.$observe('src', (newSrc) => {
      if (oldSrc && newSrc !== oldSrc && !$element[0].complete) {
        $element.css('opacity', 0);
      }

      oldSrc = newSrc;
    });
  },
})]);
