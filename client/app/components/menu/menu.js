import angular from 'angular';
import uiRouter from 'angular-ui-router';
import menuComponent from './menu.component';

const menuModule = angular.module('menu', [
  uiRouter,
])

  .directive('menu', menuComponent);

export default menuModule;

