import angular from 'angular';
import uiRouter from 'angular-ui-router';
import batchUploadComponent from './batchUpload.component';
import BatchUploadFactory from './batchUpload.factory';

const batchUploadModule = angular.module('batchUpload', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('batchUpload', {
      url: '/batch-upload/{schemaSlug:[a-zA-Z0-9_-]{2,50}}/{fieldSlug:[a-zA-Z0-9_-]{2,50}}',
      views: {
        content: {
          template: '<batch-upload></batch-upload>',
        },
      },
      onEnter($state, BatchUploadFactory) {
        'ngInject';

        // if (!BatchUploadFactory.isUploading()) {
        //   $state.go('dashboard');
        // }
      },
      data: {
        permissions: 'entityCreate',
      },
    });

  })

  .factory('BatchUploadFactory', BatchUploadFactory)

  .directive('batchUpload', batchUploadComponent);

export default batchUploadModule;
