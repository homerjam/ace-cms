import _ from 'lodash';
import angular from 'angular';
import generalFilters from './filters/general.filters';
import proprietaryFilters from './filters/proprietary.filters';
import BatchFactory from './factories/batch.factory';
import ConfigFactory from './factories/config.factory';
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

  .factory('BatchFactory', BatchFactory)
  .factory('ConfigFactory', ConfigFactory)
  .factory('HelperFactory', HelperFactory);

export default commonModule;

