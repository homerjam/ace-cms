import angular from 'angular';

export default angular.module('ace.disableAnimate', []).directive('aceDisableAnimate', ['$animate',
  $animate => ({
    restrict: 'AC',

    link($scope, $element) {
      $animate.enabled(false, $element);
    },
  }),
]);
