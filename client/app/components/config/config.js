import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import configComponent from './config.component';
import ConfigFactory from './config.factory';

const configModule = angular.module('config', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('config', {
        url: '/config',
        views: {
          content: {
            template: '<config></config>',
          },
        },
        data: {
          permissions: 'super',
        },
      });
  })

  .factory('ConfigFactory', ConfigFactory)

  .directive('config', configComponent);

export default configModule;
