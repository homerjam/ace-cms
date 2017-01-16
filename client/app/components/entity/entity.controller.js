import _ from 'lodash';
import angular from 'angular';
import Handlebars from 'handlebars/dist/handlebars';

class EntityController {
  /* @ngInject */
  constructor($rootScope, $scope, $window, $log, $state, $stateParams, $mdDialog, AdminFactory, EntityFactory, EntityGridFactory, FieldFactory, BatchFactory, SettingsFactory, BatchUploadFactory) {
    const vm = this;

    vm.entity = vm.entities[0] || {};

    const schemas = AdminFactory.getByKey('schema');
    const fields = AdminFactory.getByKey('field');

    if (vm.entity.schema && schemas[vm.entity.schema]) {
      vm.schema = angular.copy(schemas[vm.entity.schema]);
    }

    if (vm.mode === 'singular' && $stateParams.id && schemas[$stateParams.id]) {
      vm.schema = angular.copy(schemas[$stateParams.id]);
      vm.entity._id = `entity.${vm.schema.slug}`;
    }

    vm.schema.fields = vm.schema.fields || [];

    vm.schema.fields.map(field => angular.extend(field, fields[field.slug]));

    vm.schema.actions = vm.schema.actions || [];

    vm.schema.actions.map(action => angular.extend(action, AdminFactory.getByKey('action')[action.slug]));

    if (vm.mode === 'batchEdit') {
      if (vm.entities.length === 0) {
        $state.go('^');
        return;
      }

      vm.entity = BatchFactory.consolidate(vm.entities);

      vm.schema.fields.forEach((field) => {
        field.apply = false;
      });
    }

    if (!vm.entity.fields) {
      vm.entity.fields = {};
    }

    vm.entity.published = vm.entity.published === undefined || vm.entity.published === null ? true : vm.entity.published;
    vm.entity.publishedAt = vm.entity.publishedAt === undefined || vm.entity.publishedAt === null ? new Date() : vm.entity.publishedAt;

    $log.log('schema', vm.schema);
    $log.log('entity', vm.entity);

    vm.fieldDisabled = (field) => {
      if (vm.entity.trashed) {
        return true;
      }

      return FieldFactory.field(field.fieldType).modeDisabled[vm.mode];
    };

    const modeBreadcrumbs = {
      batchUpload: 'Batch Upload',
      batchEdit: 'Batch Edit',
      new: 'New',
    };

    vm.modeBreadcrumb = modeBreadcrumbs[vm.mode];

    // Prompt for unsaved changes

    if (vm.mode !== 'batchUpload') {
      const isChanged = $scope.$on('$stateChangeStart', (event, toState, toParams) => {
        if (vm.entityForm.$dirty) {
          event.preventDefault();

          const confirm = $mdDialog.confirm()
            // .title('Confirm Action')
            .textContent('You have unsaved changes, are you sure?')
            .cancel('Cancel')
            .ok('Confirm');

          $mdDialog
            .show(confirm)
            .then(() => {
              isChanged();

              $state.go(toState, toParams);
            });
        }
      });
    }

    // Revisions

    vm.currentRevId = vm.entity._rev;
    vm.revisions = [];

    vm.restoreRevision = (revision) => {
      vm.currentRevId = revision._rev;
      vm.entity.fields = revision.fields;
    };

    vm.showRevisions = () => {
      EntityFactory.getRevisions({
        id: vm.entity._id,
      }).then((revisions) => {
        vm.revisions = revisions.reverse();
      });
    };

    $scope.$watch(() => vm.entity.published, (newValue, oldValue) => {
      if (newValue === true && oldValue === false) {
        if (vm.entity.publishedAt === undefined || vm.entity.publishedAt === null) {
          vm.entity.publishedAt = new Date();
        }
      }
    });

    // Title

    if (!vm.schema.singular && vm.mode !== 'batchEdit') {
      $scope.$watch(() => vm.entity.fields, () => {
        vm.title = EntityFactory.getTitleSlug(vm.entity).title;
      }, true);
    }

    // Functions

    vm.action = (action) => {
      if (action.actionType === 'url') {
        const urlTemplate = Handlebars.compile(action.url);

        let compiledUrlTemplate = urlTemplate(vm.entity);

        const settingsUrl = SettingsFactory.settings().url || '';

        if (!/https?:\/\//.test(compiledUrlTemplate) && settingsUrl) {
          compiledUrlTemplate = settingsUrl + compiledUrlTemplate;
        }

        const url = new $window.URL(compiledUrlTemplate);

        url.search += `${/^\?/.test(url.search) ? '&' : '?'}token=${$rootScope.token}`;

        $window.open(url);
      }
    };

    vm.saveEntity = () => {
      if (!vm.entity._rev && vm.entities.length <= 1) {
        vm.createEntity();

      } else {
        vm.updateEntity();
      }
    };

    vm.createEntity = () => {
      if (vm.entityForm.$invalid) {
        return;
      }

      EntityFactory.createEntity(vm.schema.slug, vm.entity)
        .then((entity) => {
          vm.entityForm.$setPristine();

          if (!vm.schema.singular) {
            $state.go('entity', {
              id: entity._id,
            });
          }
        }, $log.error);
    };

    vm.updateEntity = () => {
      if (vm.entityForm.$invalid) {
        return;
      }

      const entities = vm.entities.map((entity) => {
        angular.forEach(vm.schema.fields, (field) => {
          if (vm.mode !== 'batchEdit' || field.apply) {
            if (vm.entity.fields[field.slug]) {
              if (!entity.fields[field.slug]) {
                entity.fields[field.slug] = {};
              }
              entity.fields[field.slug].value = vm.entity.fields[field.slug].value;
            }
          }
        });

        if (vm.batchPublish) {
          entity.published = vm.entity.published;
          entity.publishedAt = vm.entity.publishedAt;
        }

        return entity;
      });

      EntityFactory.updateEntities(entities)
        .then((entities) => {
          vm.entityForm.$setPristine();
          BatchFactory.setRecentEdits(entities);
        }, $log.error);
    };

    vm.cloneEntity = () => {
      if (vm.entityForm.$invalid) {
        return;
      }

      const entity = angular.copy(vm.entity);

      delete entity._id;
      delete entity._rev;
      delete entity.createdBy;

      EntityFactory.createEntity(vm.schema.slug, entity)
        .then((entity) => {
          $state.go('entity', {
            id: entity._id,
          });
        }, $log.error);
    };

    vm.deleteEntity = (forever = false) => {
      const confirm = $mdDialog.confirm()
        // .title('Confirm Action')
        .textContent(forever ? 'Delete entity forever? You cannot undo this.' : 'Delete entity?')
        .cancel('Cancel')
        .ok('Delete');

      $mdDialog
        .show(confirm)
        .then(() => {
          EntityFactory.deleteEntities(vm.entity, forever).then(() => {
            if (forever || $state.previous.name === '') {
              $state.go('trash');

            } else {
              BatchFactory.setRecentTrashed([vm.entity]);

              vm.back();
            }
          });
        });
    };

    vm.restoreEntity = () => {
      EntityFactory.restoreEntities(vm.entity).then(() => {
        $state.go('entity', { id: vm.entity._id }, { reload: true });
      });
    };

    vm.back = () => {
      if (vm.entity.trashed) {
        $state.go('trash');

      } else if (vm.mode === 'new') {
        $state.go('entityGrid', {
          schemaSlug: vm.schema.slug,
        });

      } else if (vm.mode === 'batchUpload') {
        $state.go('selectSchema');

      } else if ($state.previous) {
        $window.history.back();

      } else {
        $state.go('entityGrid', {
          schemaSlug: vm.schema.slug,
        });
      }
    };

    vm.nextEntityId = null;
    vm.prevEntityId = null;

    if (vm.mode === 'normal') {
      if (EntityGridFactory.states[vm.entity.schema]) {
        const items = EntityGridFactory.states[vm.entity.schema].data;
        items.forEach((item, i) => {
          if (item._id === vm.entity._id) {
            vm.nextEntityId = items[i < items.length - 1 ? i + 1 : 0]._id;
            vm.prevEntityId = items[i > 0 ? i - 1 : items.length - 1]._id;
          }
        });
      }
    }

    vm.nextEntity = () => {
      $state.go('entity', {
        id: vm.nextEntityId,
      });
    };

    vm.prevEntity = () => {
      $state.go('entity', {
        id: vm.prevEntityId,
      });
    };

    vm.dropdownMore = (vm.schema.actions || []).map(action => ({
      text: action.name,

      click() {
        vm.action(action);
      },
    }));

    if (!vm.schema.singular) {
      vm.dropdownMore.push({
        text: 'Clone',
        click() {
          if (vm.entityForm.$valid) {
            vm.cloneEntity();

          } else {
            $mdDialog.show(
              $mdDialog.alert()
                .title('Cannot clone entity')
                .textContent('Please check all fields are valid and retry')
                .ok('Close')
            );
          }
        },
      });
    }

    vm.dropdownMore.push({
      text: 'History',
      click() {
        vm.showRevisions();
      },
    });

    $scope.$on('fieldCtrl:batchUpload', (event, fieldOptions, files) => {
      BatchUploadFactory.init(vm.entity, files, vm.schema, fieldOptions);

      $state.go('batchUpload', {
        schemaSlug: vm.schema.slug,
        fieldSlug: fieldOptions.slug,
      });
    });

    const fieldOptionsMap = _.mapValues(fields, (field) => {
      const options = _.omitBy(field, (value, key) => key.startsWith('_'));

      options.entityId = vm.entity._id;
      options.entityMode = vm.mode;

      return options;
    });

    vm.fieldOptions = fieldSlug => fieldOptionsMap[fieldSlug];

  }
}

export default EntityController;
