import _ from 'lodash';
import settingsModalTemplate from './fieldTaxonomy.settings.jade';

const FieldTaxonomySettingsFactory = function FieldTaxonomySettingsFactory($mdDialog, ConfigFactory) {
  'ngInject';

  const service = {};

  const defaultSettings = {
    multiple: false,
    existingOnly: false,
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
        taxonomies: ConfigFactory.getConfig().taxonomies,
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

export default FieldTaxonomySettingsFactory;
