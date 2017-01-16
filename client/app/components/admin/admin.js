import angular from 'angular';
import uiRouter from 'angular-ui-router';
import adminComponent from './admin.component';
import AdminFactory from './admin.factory';
import AdminFieldSettingsFactory from './fieldSettings/admin.fieldSettings.factory';

const adminModule = angular.module('admin', [
  uiRouter,
])

  .directive('admin', adminComponent)
  .factory('AdminFactory', AdminFactory)
  .factory('AdminFieldSettingsFactory', AdminFieldSettingsFactory)

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('admin', {
      url: '/admin/{adminType:[a-z]{1,20}}',
      resolve: {
        fields(AdminFactory) {
          'ngInject';

          return AdminFactory.load('field');
        },
        schemas(AdminFactory) {
          'ngInject';

          return AdminFactory.load('schema');
        },
      },
      views: {
        content: {
          template: '<admin></admin>',
        },
      },
      data: {
        permissions(params) {
          if (params.adminType === 'user') {
            return ['user'];
          }

          return ['super'];
        },
      },
    });
  })

  .filter('thumbnailFields', (FieldFactory) => {
    'ngInject';

    return input => (input || []).filter(field => FieldFactory.field(field.fieldType).thumbnailField);
  })

  .filter('fieldNames', (AdminFactory) => {
    'ngInject';

    return (input) => {
      if (!input) {
        return '';
      }
      const fields = input.map(field => AdminFactory.getByKey('field', true)[field.slug].name);
      return fields.join(', ');
    };
  })

  .filter('actionNames', (AdminFactory) => {
    'ngInject';

    return (input) => {
      if (!input) {
        return '';
      }
      const actions = input.map(action => AdminFactory.getByKey('action')[action.slug].name);
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

  .filter('roleName', (AdminFactory) => {
    'ngInject';

    return (input) => {
      const roles = AdminFactory.getRolesByKey();
      if (!roles[input]) {
        return '';
      }
      return roles[input].name;
    };
  });

export default adminModule;
