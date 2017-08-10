import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import settingsComponent from './settings.component';

const settingsModule = angular.module('settings', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('settings', {
        url: '/settings',
        views: {
          content: {
            template: '<settings></settings>',
          },
        },
        data: {
          permissions: 'settings',
        },
      });
  })

  .directive('settings', settingsComponent);

export default settingsModule;
