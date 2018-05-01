import _ from 'lodash';
import settingsModalTemplate from './fieldUser.settings.jade';

const FieldUserSettingsFactory = function FieldUserSettingsFactory($mdDialog) {
  'ngInject';

  const service = {};

  const defaultSettings = {
    multiple: false,
  };

  service.edit = async (field, event) => {
    const settingsDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: settingsModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      multiple: true,
      locals: {
        settings: _.merge({}, defaultSettings, field.settings),
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

export default FieldUserSettingsFactory;
