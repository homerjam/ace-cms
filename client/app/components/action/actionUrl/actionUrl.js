import angular from 'angular';
import actionUrlComponent from './actionUrl.component';
import settingsTemplate from './actionUrl.settings.jade';

const actionUrlModule = angular.module('actionUrl', [])

  .config(() => {
    'ngInject';
  })

  .run((ActionFactory) => {
    'ngInject';

    ActionFactory.registerAction('url', {
      name: 'URL',
      settingsTemplate,
    });
  })

  .directive('actionUrl', actionUrlComponent);

export default actionUrlModule;
