import angular from 'angular';
import tinyColor from 'tinycolor2';
import mdColorPicker from 'imports?tinycolor=>tinycolor!md-color-picker/dist/mdColorPicker';
import fieldColorComponent from './fieldColor.component';
import settingsTemplate from './fieldColor.settings.jade';

const fieldColorModule = angular.module('fieldColor', ['mdColorPicker'])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('color', {
      name: 'Color',
      settingsTemplate,
      formats: [
        {
          name: 'RGB',
          value: 'rgb',
        },
        {
          name: 'RGBA',
          value: 'rgba',
        },
        {
          name: 'HEX',
          value: 'hex',
        },
      ],
    });
  })

  .directive('fieldColor', fieldColorComponent);

export default fieldColorModule;
