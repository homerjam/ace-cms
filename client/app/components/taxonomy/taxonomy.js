import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import taxonomyComponent from './taxonomy.component';
import TaxonomyFactory from './taxonomy.factory';

const taxonomyModule = angular.module('taxonomy', [
  uiRouter,
])

  .config(($stateProvider, treeConfig) => {
    'ngInject';

    treeConfig.defaultCollapsed = true;
    treeConfig.appendChildOnHover = false;

    $stateProvider.state('taxonomy', {
      url: '/taxonomy/{taxonomySlug:[a-zA-Z0-9_-]{2,200}}',
      views: {
        content: {
          template: '<taxonomy></taxonomy>',
        },
      },
      data: {
        permissions: 'taxonomyRead',
      },
    });

  })

  .factory('TaxonomyFactory', TaxonomyFactory)

  .directive('taxonomy', taxonomyComponent);

export default taxonomyModule;
