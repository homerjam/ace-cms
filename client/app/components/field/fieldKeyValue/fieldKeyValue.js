import _ from 'lodash';
import angular from 'angular';
import fieldKeyValueComponent from './fieldKeyValue.component';

const fieldKeyValueModule = angular.module('fieldKeyValue', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('keyValue', {
      name: 'Key/Value',
      toString(value) {
        if (_.isArray(value)) {
          return value.map(obj => `${obj.key}: ${obj.value}`).join(', ');
        }

        return value || '';
      },
    });

  })

  .directive('fieldKeyValue', fieldKeyValueComponent);

export default fieldKeyValueModule;
