import angular from 'angular';

export default angular.module('ace.syncFocus', []).directive('aceSyncFocus', ['$timeout',
  $timeout => ({
    restrict: 'A',

    scope: {
      focusValue: '=aceSyncFocus',
    },

    link(scope, element) {
      scope.$watch('focusValue', (currentValue) => {
        $timeout(() => {
          if (currentValue === true) {
            element[0].focus();
          } else if (currentValue === false) {
            element[0].blur();
          }
        });
      });
    },
  }),
]);
