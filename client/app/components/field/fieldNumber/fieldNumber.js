import angular from 'angular';
import fieldNumberComponent from './fieldNumber.component';

const fieldNumberModule = angular.module('fieldNumber', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('number', {
      name: 'Number',
      dataType: 'number',
      toString(value) {
        if (value === undefined || value === null) {
          return '';
        }
        return value.toString();
      },
    });

  })

  .directive('fieldNumber', fieldNumberComponent);

export default fieldNumberModule;
