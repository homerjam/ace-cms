import angular from 'angular';
import uiRouter from 'angular-ui-router';
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
      resolve: {
        taxonomy: ($stateParams, TaxonomyFactory) => {
          'ngInject';

          return TaxonomyFactory.getByKey($stateParams.taxonomySlug);
        },
      },
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
