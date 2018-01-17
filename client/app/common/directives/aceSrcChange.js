import angular from 'angular';

export default angular.module('ace.srcChange', []).directive('aceSrcChange', ['$timeout', $timeout => ({
  priority: 0,
  restrict: 'A',

  link($scope, $element, $attrs) {
    let oldSrc;
    let timeout;
    const BLANK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

    $element.on('load', () => {
      $element.css('opacity', 1);
    });

    $element.on('error', () => {
      $element.css('opacity', 1);
    });

    $attrs.$observe('src', (newSrc) => {
      console.dir($element[0]);

      if (oldSrc && newSrc !== oldSrc && !$element[0].complete) {
        $element.css('opacity', 0);
      }

      oldSrc = newSrc;
    });
  },
})]);
