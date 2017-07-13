import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import dashboardComponent from './dashboard.component';

const dashboardModule = angular.module('dashboard', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('dashboard', {
        url: '/',
        views: {
          content: {
            template: '<dashboard></dashboard>',
          },
        },
      });
  })

  .directive('dashboard', dashboardComponent);

export default dashboardModule;
