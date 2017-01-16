import angular from 'angular';
import uiRouter from 'angular-ui-router';
import settingsComponent from './settings.component';
import SettingsFactory from './settings.factory';

const settingsModule = angular.module('settings', [
  uiRouter,
])

  .config(($stateProvider, $authProvider) => {
    'ngInject';

    $authProvider.instagram({
      scope: ['basic', 'public_content'],
    });

    $authProvider.oauth2({
      name: 'vimeo',
      authorizationEndpoint: 'https://api.vimeo.com/oauth/authorize',
      scope: ['public', 'private', 'video_files'],
      defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
      responseType: 'code',
      responseParams: {
        code: 'code',
        clientId: 'clientId',
        redirectUri: 'redirectUri',
      },
    });

    $stateProvider
      .state('settings', {
        url: '/settings',
        views: {
          content: {
            template: '<settings></settings>',
          },
        },
        data: {
          permissions: 'settings',
        },
      });
  })

  .factory('SettingsFactory', SettingsFactory)

  .directive('settings', settingsComponent);

export default settingsModule;
