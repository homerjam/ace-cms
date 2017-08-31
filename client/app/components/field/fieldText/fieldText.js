import angular from 'angular';
import fieldTextComponent from './fieldText.component';
import FieldTextSettingsFactory from './fieldText.settings.factory';

const fieldTextModule = angular.module('fieldText', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory, FieldTextSettingsFactory) => {
    'ngInject';

    FieldFactory.registerField('text', {
      name: 'Text',
      editSettings: FieldTextSettingsFactory.edit,
    });
  })

  .factory('FieldTextSettingsFactory', FieldTextSettingsFactory)

  .directive('fieldText', fieldTextComponent);

export default fieldTextModule;
