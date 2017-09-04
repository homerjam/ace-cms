import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import settingsComponent from './settings.component';
import SettingsFactory from './settings.factory';

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

  .factory('SettingsFactory', SettingsFactory)

  .directive('settings', settingsComponent);

export default settingsModule;
