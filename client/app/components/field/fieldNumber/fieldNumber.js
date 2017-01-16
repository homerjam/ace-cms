import angular from 'angular';
import fieldNumberComponent from './fieldNumber.component';
import settingsTemplate from './fieldNumber.settings.jade';

const fieldNumberModule = angular.module('fieldNumber', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('number', {
      name: 'Number',
      settingsTemplate,
      formats: [
        {
          name: 'Default',
          value: 'default',
        },
        {
          name: 'Currency',
          value: 'currency',
        },
      ],
      toString(value) {
        return value.toString();
      },
    });

  })

  .directive('fieldNumber', fieldNumberComponent);

export default fieldNumberModule;
