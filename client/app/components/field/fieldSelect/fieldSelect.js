import _ from 'lodash';
import angular from 'angular';
import fieldSelectComponent from './fieldSelect.component';
import settingsTemplate from './fieldSelect.settings.jade';

const fieldSelectModule = angular.module('fieldSelect', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('select', {
      name: 'Select',
      settingsTemplate,
      toString(value) {
        if (!value) {
          return '';
        }

        if (_.isArray(value)) {
          return value.map(term => term.title).join(', ');
        }

        if (_.isObject(value)) {
          return value.title || '';
        }

        return value || '';
      },
      toDb(value, settings) {
        if (value && !_.isArray(value)) {
          return [value];
        }
        return value;
      },
      fromDb(value, settings) {
        if (!settings.multiple && value && value[0]) {
          return value[0];
        }
        return value;
      },
    });

  })

  .directive('fieldSelect', fieldSelectComponent);

export default fieldSelectModule;
