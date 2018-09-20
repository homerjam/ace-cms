import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import entityGridComponent from './entityGrid.component';
import EntityGridFactory from './entityGrid.factory';

const entityGridModule = angular.module('entityGrid', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('entityGrid', {
      url: '/entities/{schemaSlug:[a-zA-Z0-9_-]{2,50}}',
      views: {
        content: {
          template: '<entity-grid mode="normal"></entity-grid>',
        },
      },
      data: {
        permissions: 'entityGrid',
      },
    });

    $stateProvider.state('trash', {
      url: '/trash',
      views: {
        content: {
          template: '<entity-grid mode="trash"></entity-grid>',
        },
      },
      data: {
        permissions: 'entityGrid',
      },
    });

  })

  .filter('filterFields', () => input => (input || []).filter(field => /text|select|number|date|entity/.test(field.type)))

  .factory('EntityGridFactory', EntityGridFactory)

  .directive('entityGrid', entityGridComponent);

export default entityGridModule;
