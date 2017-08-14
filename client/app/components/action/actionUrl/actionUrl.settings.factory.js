import _ from 'lodash';
import settingsModalTemplate from './actionUrl.settings.jade';

const ActionUrlSettingsFactory = function ActionUrlSettingsFactory($mdDialog) {
  'ngInject';

  const service = {};

  const defaultSettings = {
    url: '',
  };

  service.edit = async (action, event) => {
    const settingsDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: settingsModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      multiple: true,
      locals: {
        settings: _.merge({}, defaultSettings, action.settings),
      },
    };

    let settings;

    try {
      settings = await $mdDialog.show(settingsDialog);
    } catch (error) {
      return false;
    }

    return settings;
  };

  return service;
};

export default ActionUrlSettingsFactory;
