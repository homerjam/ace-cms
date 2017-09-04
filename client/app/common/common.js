import _ from 'lodash';
import angular from 'angular';

import generalFilters from './filters/general.filters';
import proprietaryFilters from './filters/proprietary.filters';

import DefaultModalController from './controllers/default.modal.controller';

import BatchFactory from './factories/batch.factory';
import HelperFactory from './factories/helper.factory';

import * as directives from './directives';

const commonDependencies = [
  generalFilters.name,
  proprietaryFilters.name,
];

_.forEach(directives, (directive) => {
  commonDependencies.push(directive.name);
});

const commonModule = angular.module('app.common', commonDependencies)

  .controller('DefaultModalController', DefaultModalController)
  .factory('BatchFactory', BatchFactory)
  .factory('HelperFactory', HelperFactory);

export default commonModule;

