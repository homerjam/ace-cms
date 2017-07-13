import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import fileComponent from './file.component';
import FileFactory from './file.factory';

const fileModule = angular.module('file', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('file', {
      url: '/file',
      views: {
        content: {
          template: '<file></file>',
        },
      },
      data: {
        permissions: 'fileRead',
      },
    });

  })

  .factory('FileFactory', FileFactory)

  .directive('file', fileComponent);

export default fileModule;
