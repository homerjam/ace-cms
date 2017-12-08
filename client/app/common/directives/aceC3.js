import angular from 'angular';
import c3 from 'c3';
import 'c3/c3.css';

export default angular.module('ace.c3', [])
  .component('aceC3', {
    bindings: {
      options: '<',
    },
    controller ($scope, $element, $window, $timeout) {
      const ctrl = this;

      let chart;
      let resizeTimeout;

      function resize() {
        if (ctrl.options && !ctrl.options.width && !ctrl.options.height) {
          chart.resize({
            width: $element[0].clientWidth,
            height: $element[0].clientHeight,
          });
        }
      }

      function resizeHandler() {
        $timeout.cancel(resizeTimeout);
        resizeTimeout = $timeout(resize, 50);
      }

      ctrl.$onChanges = () => {
        if (!ctrl.options) {
          return;
        }

        ctrl.options.bindto = $element[0];

        chart = c3.generate(ctrl.options);

        $timeout(resize);
      };

      angular.element($window).on('resize', resizeHandler);

      ctrl.$onDestroy = () => {
        angular.element($window).off('resize', resizeHandler);
      };
    },
  });
