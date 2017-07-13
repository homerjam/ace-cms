import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import menuComponent from './menu.component';

const menuModule = angular.module('menu', [
  uiRouter,
])

  .directive('menu', menuComponent);

export default menuModule;

