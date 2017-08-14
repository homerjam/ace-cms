import _ from 'lodash';
import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import schemaComponent from './schema.component';
import SchemaFactory from './schema.factory';

const schemasModule = angular.module('schema', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('schemas', {
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

  .filter('fieldTypeName', (FieldFactory) => {
    'ngInject';

    return type => FieldFactory.field(type).name;
  })

  .filter('actionTypeName', (ActionFactory) => {
    'ngInject';

    return type => ActionFactory.action(type).name;
  })

  .filter('schemaName', (ConfigFactory) => {
    'ngInject';

    return (schemas) => {
      if (!schemas) {
        return '';
      }

      schemas = _.isArray(schemas) ? schemas : [schemas];

      schemas = schemas.map(schema => ConfigFactory.getSchema(schema.slug || schema).name);

      return schemas.join(', ');
    };
  })

  .factory('SchemaFactory', SchemaFactory)

  .directive('schema', schemaComponent);

export default schemasModule;
