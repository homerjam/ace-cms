import _ from 'lodash';
import settingsModalTemplate from './fieldEntityTile.settings.jade';

const FieldEntityTileSettingsFactory = function FieldEntityTileSettingsFactory($mdDialog, ConfigFactory, SchemaFactory) {
  'ngInject';

  const service = {};

  const defaultSettings = {
    schemas: [],
    groupEnabled: false,
  };

  const newSchema = async (schemas, event) => {
    const schema = await SchemaFactory.editSchema(null, event);

    if (schema) {
      schemas.push(schema.slug);
    }
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
        schemas: ConfigFactory.getConfig().schemas,
        transformChip: chip => chip.slug,
        newSchema,
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

export default FieldEntityTileSettingsFactory;
