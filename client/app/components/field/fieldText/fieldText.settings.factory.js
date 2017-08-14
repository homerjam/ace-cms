import _ from 'lodash';
import settingsModalTemplate from './fieldText.settings.jade';

const FieldTextSettingsFactory = function FieldTextSettingsFactory($mdDialog) {
  'ngInject';

  const service = {};

  const defaultSettings = {
    format: 'default',
  };

  const formats = [
    {
      name: 'Default',
      value: 'default',
    },
    {
      name: 'URL',
      value: 'url',
    },
    {
      name: 'Email',
      value: 'email',
    },
  ];

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
        formats,
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

export default FieldTextSettingsFactory;
