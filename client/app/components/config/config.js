import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import configComponent from './config.component';
// import ConfigFactory from './config.factory';
import ConfigFieldSettingsFactory from './fieldSettings/config.fieldSettings.factory';

const configModule = angular.module('config', [
  uiRouter,
])

  .directive('config', configComponent)
  // .factory('ConfigFactory', ConfigFactory)
  .factory('ConfigFieldSettingsFactory', ConfigFieldSettingsFactory)

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('config', {
      url: '/config',
      resolve: {
        config(ConfigFactory) {
          'ngInject';

          return ConfigFactory.load();
        },
      },
      views: {
        content: {
          template: '<config></config>',
        },
      },
      data: {
        permissions: 'super',
      },
    });
  })

  .filter('thumbnailFields', (FieldFactory) => {
    'ngInject';

    return input => (input || []).filter(field => FieldFactory.field(field.fieldType).thumbnailField);
  })

  .filter('fieldNames', (ConfigFactory) => {
    'ngInject';

    return (input) => {
      if (!input) {
        return '';
      }
      const fields = input.map(field => ConfigFactory.getByKey('field', true)[field.slug].name);
      return fields.join(', ');
    };
  })

  .filter('actionNames', (ConfigFactory) => {
    'ngInject';

    return (input) => {
      if (!input) {
        return '';
      }
      const actions = input.map(action => ConfigFactory.getByKey('action')[action.slug].name);
      return actions.join(', ');
    };
  })

  .filter('fieldTypeName', (FieldFactory) => {
    'ngInject';

    return fieldType => FieldFactory.field(fieldType).name;
  })

  .filter('actionTypeName', (ActionFactory) => {
    'ngInject';

    return actionType => ActionFactory.action(actionType).name;
  })

  .filter('schemaName', () => (input) => {
    if (!input) {
      return '';
    }
    const schemas = [];
    input.forEach((schema) => {
      schemas.push(schema.name);
    });
    return schemas.join(', ');
  })

  .filter('roleName', (ConfigFactory) => {
    'ngInject';

    return (input) => {
      const roles = ConfigFactory.getRolesByKey();
      if (!roles[input]) {
        return '';
      }
      return roles[input].name;
    };
  });

export default configModule;
