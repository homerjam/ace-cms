import angular from 'angular';

class ConfigModalController {
  /* @ngInject */
  constructor ($scope, $modal, $filter, $timeout, $mdDialog, ConfigFactory, FieldFactory, ActionFactory, ConfigFieldSettingsFactory, Slug, mode, configType, items) {
    const vm = this;

    vm.mode = mode;

    vm.items = items;

    if (vm.mode !== 'edit') {
      const keys = ConfigFactory.get(configType)
        .filter(item => !item.trashed)
        .map((item) => {
          if (configType === 'user') {
            return item.email;
          }

          return item.slug;
        });

      vm.keyPattern = ((() => {
        const validChars = /^[^\d][a-zA-Z0-9]*$/;
        const existingItems = new RegExp(`^(${keys.join('|')})$`);
        return {
          test(value) {
            return (validChars.test(value) || configType === 'user') && !existingItems.test(value);
          },
        };
      }))();
    }

    if (vm.items.length === 1) {
      vm.item = angular.copy(vm.items[0]);
    } else {
      if (configType === 'schema') {
        vm.item = {
          name: '',
          slug: '',
          fields: [],
          actions: [],
        };
      }

      if (configType === 'field') {
        vm.item = {
          name: '',
          slug: '',
          type: 'text',
          settings: {},
        };
      }

      if (configType === 'action') {
        vm.item = {
          name: '',
          slug: '',
          type: 'url',
        };
      }

      if (configType === 'user') {
        vm.item = {
          email: '',
          firstName: '',
          lastName: '',
          role: 'config',
          active: true,
          trashed: false,
        };
      }

      if (configType === 'taxonomy') {
        vm.item = {
          name: '',
          slug: '',
        };
      }
    }

    // schema/field/action
    $scope.$watch(() => vm.item.name, (newValue) => {
      if (newValue !== undefined && vm.mode !== 'edit') {
        vm.item.slug = $filter('camelCase')(Slug.slugify(newValue));
      }
    });

    // schema
    const fields = ConfigFactory.getByKey('field');
    const actions = ConfigFactory.getByKey('action');

    if (vm.item.fields) {
      vm.item.fields = vm.item.fields.map(field => fields[field.slug]);
    }

    if (vm.item.actions) {
      vm.item.actions = vm.item.actions.map(action => actions[action.slug]);
    }

    if (vm.item.sortFields) {
      vm.item.sortFields = vm.item.sortFields.map(field => fields[field]);
    }

    // field
    $scope.$watch(() => vm.item.type, (type) => {
      if (!type) {
        return;
      }
      vm.fieldSettingsTemplate = FieldFactory.field(type).settingsTemplate;
    });

    if (vm.item.settings && vm.item.settings.schemas) {
      vm.item.settings.schemas = vm.item.settings.schemas.map(schema => ConfigFactory.getByKey('schema')[schema.slug]);
    }

    if (vm.item.settings && vm.item.settings.taxonomy) {
      vm.item.settings.taxonomy = ConfigFactory.getByKey('taxonomy')[vm.item.settings.taxonomy.slug];
    }

    // action
    $scope.$watch(() => vm.item.type, (type) => {
      if (!type) {
        return;
      }
      vm.actionSettingsTemplate = ActionFactory.action(type).settingsTemplate;
    });

    vm.newItem = (type, model) => {
      ConfigFactory.newItem(type)
        .then((item) => {
          $timeout(() => {
            model.push(item);
          });
        });
    };

    // fieldSettings
    vm.fieldSettingsAdd = (fieldSettingsType) => {
      ConfigFieldSettingsFactory.edit(fieldSettingsType)
        .then((newSetting) => {
          if (!vm.item.settings[fieldSettingsType]) {
            vm.item.settings[fieldSettingsType] = [];
          }
          vm.item.settings[fieldSettingsType].push(newSetting);
        });
    };

    vm.fieldSettingsEdit = (fieldSettingsType, setting) => {
      ConfigFieldSettingsFactory.edit(fieldSettingsType, setting)
        .then((updatedSetting) => {
          vm.item.settings[fieldSettingsType]
            .splice(vm.item.settings[fieldSettingsType].indexOf(setting), 1, updatedSetting);
        });
    };

    vm.fieldSettingsDelete = (fieldSettingsType, setting) => {
      const confirm = $mdDialog.confirm()
        // .title('Confirm Action')
        .textContent(`Are you sure you want to delete ${setting.name}?`)
        .cancel('Cancel')
        .ok('Delete');

      $mdDialog
        .show(confirm)
        .then(() => {
          vm.item.settings[fieldSettingsType]
            .splice(vm.item.settings[fieldSettingsType].indexOf(setting), 1);
        });
    };

    vm.save = () => {
      // schema
      if (vm.item.fields) {
        vm.item.fields = vm.item.fields.map(field => ({
          slug: field.slug,
          type: field.type,
        }));
      }

      if (vm.item.actions) {
        vm.item.actions = vm.item.actions.map(action => ({
          slug: action.slug,
          type: action.type,
        }));
      }

      if (vm.item.sortFields) {
        vm.item.sortFields = vm.item.sortFields.map(field => field.slug);
      }

      // field
      if (vm.item.settings && vm.item.settings.schemas) {
        vm.item.settings.schemas = vm.item.settings.schemas.map(schema => ({
          slug: schema.slug,
        }));
      }

      if (vm.item.settings && vm.item.settings.taxonomy) {
        vm.item.settings.taxonomy = {
          slug: vm.item.settings.taxonomy.slug,
        };
      }

      $modal.close({
        item: vm.item,
        items: vm.items,
      });
    };
  }
}

export default ConfigModalController;