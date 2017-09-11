import angular from 'angular';
import fieldTextAreaComponent from './fieldTextArea.component';

const fieldTextAreaModule = angular.module('fieldTextArea', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('textArea', {
      name: 'Text Area',
    });
  })


  .directive('fieldTextArea', fieldTextAreaComponent);

export default fieldTextAreaModule;
