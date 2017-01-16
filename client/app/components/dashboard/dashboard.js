import angular from 'angular';
import uiRouter from 'angular-ui-router';
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

