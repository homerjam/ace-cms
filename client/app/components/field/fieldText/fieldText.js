import angular from 'angular';
import fieldTextComponent from './fieldText.component';
import settingsTemplate from './fieldText.settings.jade';

const fieldTextModule = angular.module('fieldText', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('text', {
      name: 'Text',
      settingsTemplate,
      formats: [
        {
          name: 'Default',
          value: 'default',
        },
        {
          name: 'URL',
          value: 'url',
        },
        {
          name: 'Email',
          value: 'email',
        },
      ],
    });
  })

  .directive('fieldText', fieldTextComponent);

export default fieldTextModule;
