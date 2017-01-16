import angular from 'angular';
import HelperFactory from './helper.factory';

const helperModule = angular.module('helper', [])

  .config(() => {
    'ngInject';
  })

  .factory('HelperFactory', HelperFactory);

export default helperModule;
