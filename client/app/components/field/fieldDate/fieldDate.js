import angular from 'angular';
import fieldDateComponent from './fieldDate.component';
import FieldDateSettingsFactory from './fieldDate.settings.factory';

const fieldDateModule = angular.module('fieldDate', [])

  .config(() => {
    'ngInject';
  })

  .run(($filter, FieldFactory, FieldDateSettingsFactory) => {
    'ngInject';

    FieldFactory.registerField('date', {
      name: 'Date',
      editSettings: FieldDateSettingsFactory.edit,
      toString(value) {
        return $filter('date')(value, 'short');
      },
      toDb(value, settings) {
        return JSON.stringify(value).replace(/"/g, '');
      },
      fromDb(value, settings) {
        return new Date(Date.parse(value));
      },
    });

  })

  .factory('FieldDateSettingsFactory', FieldDateSettingsFactory)

  .directive('fieldDate', fieldDateComponent);

export default fieldDateModule;
