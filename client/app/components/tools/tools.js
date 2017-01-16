import angular from 'angular';
import uiRouter from 'angular-ui-router';
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
