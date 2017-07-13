import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import toolsComponent from './tools.component';

const toolsModule = angular.module('tools', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('tools', {
      url: '/tools',
      views: {
        content: {
          template: '<tools></tools>',
        },
      },
      data: {
        permissions: 'super',
      },
    });

  })

  .directive('tools', toolsComponent);

export default toolsModule;
