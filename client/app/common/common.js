import _ from 'lodash';
import angular from 'angular';
import Helper from './helper/helper';
import generalFilters from './filters/general.filters';
import proprietaryFilters from './filters/proprietary.filters';
import BatchFactory from './factories/batch.factory';
import * as directives from './directives';

const commonDependencies = [
  Helper.name,
  generalFilters.name,
  proprietaryFilters.name,
];

_.forEach(directives, (directive) => {
  commonDependencies.push(directive.name);
});

const commonModule = angular.module('app.common', commonDependencies)

  .factory('BatchFactory', BatchFactory)

export default commonModule;

