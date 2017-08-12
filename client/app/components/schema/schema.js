import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import schemaComponent from './schema.component';
import SchemaFactory from './schema.factory';

const schemasModule = angular.module('schema', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('schema', {
      url: '/schemas',
      views: {
        content: {
          template: '<schema></schema>',
        },
      },
      data: {
        permissions: 'schema',
      },
    });
  })

  .factory('SchemaFactory', SchemaFactory)

  .directive('schema', schemaComponent);

export default schemasModule;
