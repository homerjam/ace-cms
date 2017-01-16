import angular from 'angular';

class AdminModalController {
  /* @ngInject */
  constructor ($scope, $modal, $filter, $timeout, $mdDialog, AdminFactory, FieldFactory, ActionFactory, AdminFieldSettingsFactory, Slug, mode, adminType, items) {
    const vm = this;

    vm.mode = mode;

    vm.items = items;

    if (vm.mode !== 'edit') {
      const keys = AdminFactory.get(adminType)
        .filter(item => !item.trashed)
        .map((item) => {
          if (adminType === 'user') {
            return item.email;
          }

          return item.slug;
        });

      vm.keyPattern = ((() => {
        const validChars = /^[^\d][a-zA-Z0-9]*$/;
        const existingItems = new RegExp(`^(${keys.join('|')})$`);
        return {
          test(value) {
            return (validChars.test(value) || adminType === 'user') && !existingItems.test(value);
          },
        };
      }))();
    }

    if (vm.items.length === 1) {
      vm.item = angular.copy(vm.items[0]);
    } else {
      if (adminType === 'schema') {
        vm.item = {
          name: '',
          slug: '',
          fields: [],
          actions: [],
        };
      }

      if (adminType === 'field') {
        vm.item = {
          name: '',
          slug: '',
          fieldType: 'text',
          settings: {},
        };
      }

      if (adminType === 'action') {
        vm.item = {
          name: '',
          slug: '',
          actionType: 'url',
        };
      }

      if (adminType === 'user') {
        vm.item = {
          email: '',
          firstName: '',
          lastName: '',
          role: 'admin',
          active: true,
          trashed: false,
        };
      }

      if (adminType === 'taxonomy') {
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
    const fields = AdminFactory.getByKey('field');
    const actions = AdminFactory.getByKey('action');

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
    $scope.$watch(() => vm.item.fieldType, (fieldType) => {
      if (!fieldType) {
        return;
      }
      vm.fieldSettingsTemplate = FieldFactory.field(fieldType).settingsTemplate;
    });

    if (vm.item.settings && vm.item.settings.schemas) {
      vm.item.settings.schemas = vm.item.settings.schemas.map(schema => AdminFactory.getByKey('schema')[schema.slug]);
    }

    if (vm.item.settings && vm.item.settings.taxonomy) {
      vm.item.settings.taxonomy = AdminFactory.getByKey('taxonomy')[vm.item.settings.taxonomy.slug];
    }

    // action
    $scope.$watch(() => vm.item.actionType, (actionType) => {
      if (!actionType) {
        return;
      }
      vm.actionSettingsTemplate = ActionFactory.action(actionType).settingsTemplate;
    });

    vm.newItem = (type, model) => {
      AdminFactory.newItem(type)
        .then((item) => {
          $timeout(() => {
            model.push(item);
          });
        });
    };

    // fieldSettings
    vm.fieldSettingsAdd = (fieldSettingsType) => {
      AdminFieldSettingsFactory.edit(fieldSettingsType)
        .then((newSetting) => {
          if (!vm.item.settings[fieldSettingsType]) {
            vm.item.settings[fieldSettingsType] = [];
          }
          vm.item.settings[fieldSettingsType].push(newSetting);
        });
    };

    vm.fieldSettingsEdit = (fieldSettingsType, setting) => {
      AdminFieldSettingsFactory.edit(fieldSettingsType, setting)
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
          fieldType: field.fieldType,
        }));
      }

      if (vm.item.actions) {
        vm.item.actions = vm.item.actions.map(action => ({
          slug: action.slug,
          actionType: action.actionType,
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

export default AdminModalController;
