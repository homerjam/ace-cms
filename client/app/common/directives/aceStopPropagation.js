import angular from 'angular';

export default angular.module('ace.stopPropagation', []).directive('aceStopPropagation', [() => ({
  priority: 0,
  restrict: 'A',

  link($scope, $element) {
    $element.on('keydown keyup keypress', (event) => {
      if (event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  },
})]);
