import _ from 'lodash';
import angular from 'angular';
import fieldKeyValueComponent from './fieldKeyValue.component';
import settingsTemplate from './fieldKeyValue.settings.jade';

const fieldKeyValueModule = angular.module('fieldKeyValue', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('keyValue', {
      name: 'Key/Value',
      settingsTemplate,
      sources: [
        {
          name: 'Default',
          value: 'default',
        },
        {
          name: 'Taxonomy',
          value: 'taxonomy',
        },
      ],
      toString(value) {
        if (_.isArray(value)) {
          return value.map(obj => `${obj.key}: ${obj.value}`).join(', ');
        }

        return value || '';
      },
      toDb(value, settings) {
        return value.map((keyValue) => {
          keyValue.type = 'keyValue';
          return keyValue;
        });
      },
    });

  })

  .directive('fieldKeyValue', fieldKeyValueComponent);

export default fieldKeyValueModule;
