import angular from 'angular';
import actionUrlComponent from './actionUrl.component';
import ActionUrlSettingsFactory from './actionUrl.settings.factory';

const actionUrlModule = angular.module('actionUrl', [])

  .config(() => {
    'ngInject';
  })

  .run((ActionFactory, ActionUrlSettingsFactory) => {
    'ngInject';

    ActionFactory.registerAction('url', {
      name: 'URL',
      editSettings: ActionUrlSettingsFactory.edit,
    });
  })

  .factory('ActionUrlSettingsFactory', ActionUrlSettingsFactory)

  .directive('actionUrl', actionUrlComponent);

export default actionUrlModule;
