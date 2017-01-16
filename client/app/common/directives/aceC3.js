import angular from 'angular';
import c3 from 'c3';
import 'c3/c3.css';

export default angular.module('ace.c3', [])
  .directive('aceC3', () => ({
    restrict: 'EA',

    scope: {
      options: '=',
    },

    bindToController: true,
    controllerAs: 'vm',

    controller: ['$scope', '$element', '$window', '$timeout',
    function ($scope, $element, $window, $timeout) {
      const vm = this;

      let chart;
      let resizeTimeout;

      const resize = () => {
        if (vm.options && !vm.options.width && !vm.options.height) {
          chart.resize({
            width: $element[0].clientWidth,
            height: $element[0].clientHeight,
          });
        }
      };

      const resizeHandler = () => {
        $timeout.cancel($timeout);
        resizeTimeout = $timeout(resize, 500);
      };

      $scope.$watch(() => vm.options, (newData) => {
        if (!newData) {
          return;
        }

        vm.options.bindto = $element[0];

        chart = c3.generate(vm.options);

        $timeout(resize);
      });

      angular.element($window).on('resize', resizeHandler);

      $scope.$on('$destroy', () => {
        angular.element($window).off('resize', resizeHandler);
      });

    }],
  }));
