import _ from 'lodash';
import settingsModalTemplate from './fieldDate.settings.jade';

const FieldDateSettingsFactory = function FieldDateSettingsFactory($mdDialog) {
  'ngInject';

  const service = {};

  const defaultSettings = {
    format: 'dd/MM/yyyy',
  };

  const formats = [
    {
      name: 'dd/MM/yyyy',
      value: 'dd/MM/yyyy',
    },
    {
      name: 'MM/dd/yyyy',
      value: 'MM/dd/yyyy',
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

export default FieldDateSettingsFactory;
