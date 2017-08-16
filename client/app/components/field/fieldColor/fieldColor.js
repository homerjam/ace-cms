import angular from 'angular';
// import tinyColor from 'tinycolor2';
// import mdColorPicker from 'imports-loader?tinycolor=>tinycolor!md-color-picker/dist/mdColorPicker';
import fieldColorComponent from './fieldColor.component';

// const fieldColorModule = angular.module('fieldColor', ['mdColorPicker'])
const fieldColorModule = angular.module('fieldColor', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('color', {
      name: 'Color',
      dataType: 'string',
    });
  })

  .directive('fieldColor', fieldColorComponent);

export default fieldColorModule;
