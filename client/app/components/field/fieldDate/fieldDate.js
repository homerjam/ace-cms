import angular from 'angular';
import fieldDateComponent from './fieldDate.component';
import settingsTemplate from './fieldDate.settings.jade';

const fieldDateModule = angular.module('fieldDate', [])

  .config(() => {
    'ngInject';
  })

  .run(($filter, FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('date', {
      name: 'Date',
      settingsTemplate,
      formats: [
        {
          name: 'dd/MM/yyyy',
          value: 'dd/MM/yyyy',
        },
        {
          name: 'MM/dd/yyyy',
          value: 'MM/dd/yyyy',
        },
      ],
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

  .directive('fieldDate', fieldDateComponent);

export default fieldDateModule;
