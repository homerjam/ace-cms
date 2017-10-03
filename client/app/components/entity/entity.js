import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import entityComponent from './entity.component';
import EntityFactory from './entity.factory';

const entityModule = angular.module('entity', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('newEntity', {
      url: '/entity/new/{schemaSlug:[a-zA-Z0-9_-]{2,50}}',
      resolve: {
        entities($stateParams) {
          'ngInject';

          return [{
            schema: $stateParams.schemaSlug,
          }];
        },
      },
      views: {
        'content@': {
          template: '<entity mode="new" entities="vm.entities"></entity>',
          controller(entities) {
            'ngInject';

            this.entities = entities;
          },
          controllerAs: 'vm',
        },
      },
      data: {
        permissions: 'entityCreate',
      },
    });

    $stateProvider.state('entity', {
      url: '/entity/{id:[a-zA-Z0-9_-]{2,50}}',
      resolve: {
        entities($stateParams, EntityFactory) {
          return EntityFactory.getById({
            id: $stateParams.id,
            children: 1,
          });
        },
      },
      views: {
        content: {
          template: '<entity mode="normal" entities="vm.entities"></entity>',
          controller(entities) {
            'ngInject';

            this.entities = entities;
          },
          controllerAs: 'vm',
        },
      },
      data: {
        permissions: 'entityRead',
      },
    });

    $stateProvider.state('singularEntity', {
      url: '/entity/singular/{id:[a-zA-Z0-9_-]{2,50}}',
      resolve: {
        entities($stateParams, EntityFactory) {
          return EntityFactory.getById({
            id: `entity.${$stateParams.id}`,
            children: 1,
          });
        },
      },
      views: {
        content: {
          template: '<entity mode="singular" entities="vm.entities"></entity>',
          controller(entities) {
            'ngInject';

            this.entities = entities;
          },
          controllerAs: 'vm',
        },
      },
      data: {
        permissions: 'entityRead',
      },
    });

    $stateProvider.state('batchUploadEntity', {
      url: '/entity/batch-upload/{schemaSlug:[a-zA-Z0-9_-]{2,50}}',
      resolve: {
        entities($stateParams) {
          'ngInject';

          return [{
            schema: $stateParams.schemaSlug,
          }];
        },
      },
      views: {
        content: {
          template: '<entity mode="batchUpload" entities="vm.entities"></entity>',
          controller(entities) {
            'ngInject';

            this.entities = entities;
          },
          controllerAs: 'vm',
        },
      },
      onEnter($state, BatchUploadFactory) {
        if (BatchUploadFactory.inProgress) {
          $state.go('batchUpload', {
            schemaSlug: BatchUploadFactory.schema.slug,
            fieldSlug: BatchUploadFactory.field.slug,
          });
        }
      },
      data: {
        permissions: 'entityCreate',
      },
    });

  })

  .factory('EntityFactory', EntityFactory)

  .directive('entity', entityComponent);

export default entityModule;
