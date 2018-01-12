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
      toString(value) {
        if (!value) {
          return '';
        }
        return value.toString();
      },
    });

  })

  .directive('fieldNumber', fieldNumberComponent);

export default fieldNumberModule;
