import angular from 'angular';
import Flow from '@flowjs/flow.js';

export default angular.module('ace.flow', [])
  .directive('aceFlow', () => ({
    restrict: 'EA',

    scope: {
      options: '=',
    },

    bindToController: true,
    controllerAs: 'vm',

    controller: ['$scope', '$element', '$timeout',
      function aceFlow ($scope, $element, $timeout) {
        const vm = this;

        const flow = new Flow(vm.options);

        if (vm.options.events) {
          angular.forEach(vm.options.events, (callback, eventName) => {
            flow.on(eventName, (...args) => {
              args.unshift(flow);

              $timeout(() => {
                callback(...args);
              });
            });
          });
        }

        vm.$onInit = () => {
          $timeout(() => {
            const browse = $element[0].querySelectorAll('[ace-flow-browse]');
            flow.assignBrowse(browse);

            const drop = $element[0].querySelectorAll('[ace-flow-drop]');
            flow.assignDrop(drop);

            if (vm.options.onInit) {
              vm.options.onInit(flow);
            }
          });
        };

        vm.$onDestroy = () => {
          flow.cancel();
        };
      }],
  }));
