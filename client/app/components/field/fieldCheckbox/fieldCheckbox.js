import angular from 'angular';
import fieldCheckboxComponent from './fieldCheckbox.component';

const fieldCheckboxModule = angular.module('fieldCheckbox', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('checkbox', {
      name: 'Checkbox',
      dataType: 'boolean',
      gridOptions: {
        style: 'boolean',
      },
      toString(value) {
        return value ? 'true' : 'false';
      },
    });

  })

  .directive('fieldCheckbox', fieldCheckboxComponent);

export default fieldCheckboxModule;
