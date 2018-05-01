import _ from 'lodash';
import angular from 'angular';
import fieldUserComponent from './fieldUser.component';
import FieldUserSettingsFactory from './fieldUser.settings.factory';

const fieldUserModule = angular.module('fieldUser', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory, FieldUserSettingsFactory) => {
    'ngInject';

    FieldFactory.registerField('user', {
      name: 'User',
      editSettings: FieldUserSettingsFactory.edit,
      toString(value) {
        if (!value) {
          return '';
        }

        if (_.isArray(value)) {
          return value.map(user => (user ? user.title : undefined)).filter(user => user).join(', ');
        }

        if (_.isObject(value)) {
          return value.title || '';
        }

        return value || '';
      },
    });

  })

  .factory('FieldUserSettingsFactory', FieldUserSettingsFactory)

  .directive('fieldUser', fieldUserComponent);

export default fieldUserModule;
