import angular from 'angular';

import actionComponent from './action.component';
import ActionFactory from './action.factory';

import actionUrl from './actionUrl/actionUrl';

const actionModule = angular.module('action', [
  actionUrl.name,
])

  .config(() => {
    'ngInject';
  })

  .factory('ActionFactory', ActionFactory)

  .directive('action', actionComponent);

export default actionModule;
