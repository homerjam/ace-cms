import angular from 'angular';

export default angular.module('ace.srcChange', []).directive('aceSrcChange', ['$timeout', $timeout => ({
  priority: 0,
  restrict: 'A',

  link($scope, $element, $attrs) {
    let oldSrc;
    let timeout;
    const BLANK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

    $attrs.$observe('src', (newSrc) => {
      $timeout.cancel(timeout);

      timeout = $timeout(() => {
        if (newSrc !== oldSrc && newSrc !== BLANK) {
          $attrs.$set('src', BLANK);

          $timeout(() => {
            $attrs.$set('src', newSrc);
          });
        }
      }, 50);

      oldSrc = newSrc;
    });
  },
})]);
