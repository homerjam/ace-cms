import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import menuComponent from './menu.component';

const menuModule = angular.module('menu', [
  uiRouter,
])

  .directive('menu', menuComponent)

  .filter('batchUploadSchemas', () => (input) => {
    if (!input) {
      return [];
    }
    return input.filter((schema) => {
      if (schema.settings.singular) {
        return false;
      }

      if (schema.fields.filter(field => /^(image)$/.test(field.type)).length === 0) {
        return false;
      }

      return true;
    });
  });

export default menuModule;

