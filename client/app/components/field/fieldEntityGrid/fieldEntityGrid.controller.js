import _ from 'lodash';
import angular from 'angular';

class FieldEntityGridController {
  /* @ngInject */
  constructor($timeout, $log, EntityFactory, ConfigFactory, HelperFactory, uiGridConstants) {
    const vm = this;

    if (!vm.fieldModel.value) {
      vm.fieldModel.value = [];
    }

    const schemas = _.get(vm.fieldOptions, 'settings.schemas', []);

    if (!schemas.length) {
      $log.error(`No schemas specified for '${vm.fieldOptions.name}' field`);
    }

    vm.schemas = schemas.map(schema => ({
      name: ConfigFactory.getSchema(schema).name,
      slug: schema,
    }));

    vm.newEntity = (schemaSlug) => {
      EntityFactory.newEntity(schemaSlug)
        .then((entity) => {
          vm.fieldModel.value.push(entity);
        });
    };

    vm.insertEntity = (schemaSlug) => {
      EntityFactory.selectEntity(schemaSlug)
        .then((selected) => {
          selected.forEach((entity) => {
            vm.fieldModel.value.push(entity);
          });
        });
    };

    vm.entityEdit = (event, entity) => {
      EntityFactory.editEntity(entity).then((updatedEntity) => {
        vm.fieldModel.value.splice(vm.fieldModel.value.indexOf(entity), 1, updatedEntity);
      });
    };

    vm.entityRemove = (event, entity) => {
      vm.fieldModel.value.splice(vm.fieldModel.value.indexOf(entity), 1);
    };

    let grid;

    vm.getGrid = () => {
      if (grid) {
        return grid;
      }

      const columnDefs = [];
      const sortFields = [];
      const buttons = [];

      vm.fieldOptions.settings.schemas.forEach((schema) => {
        schema = ConfigFactory.getSchema(schema);
        schema.fields.forEach((field) => {
          if (field.settings.gridColumn) {
            sortFields.push(field);
          }
        });
      });

      if (sortFields.length === 0) {
        columnDefs.push({
          name: 'title',
          displayName: 'Title',
        });

      } else {
        sortFields.forEach((field) => {
          const colOpts = HelperFactory.getColumnOptions(field);
          columnDefs.push(colOpts);
        });
      }

      buttons.push('<md-button class="md-icon-button" ng-click="grid.appScope.entityEdit($event, row.entity)"><md-icon md-icon-set="material-icons">create</md-icon></md-button>');
      buttons.push('<md-button class="md-icon-button" ng-click="grid.appScope.entityRemove($event, row.entity)"><md-icon md-icon-set="material-icons">close</md-icon></md-button>');

      columnDefs.push({
        name: ' ',
        cellTemplate: `<div class="ui-grid-cell-contents ui-grid-cell--actions">${buttons.join('')}</div>`,
        enableHiding: false,
      });

      grid = {
        data: vm.fieldModel.value,
        rowHeight: 70,
        headerRowHeight: 45,
        enableGridMenu: true,
        enableSorting: false,
        useExternalSorting: false,
        enableColumnMenus: false,
        columnDefs,
        enableRowHeaderSelection: false,
        enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
        enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
        appScopeProvider: vm,
        excessRows: Infinity,
        rowTemplate: '<div grid="grid" class="ui-grid-draggable-row" draggable="true"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'custom\': true }" ui-grid-cell></div></div>',
        onRegisterApi(gridApi) {
          // Disable wheel event capture to allow parent scrolling instead
          $timeout(() => {
            const viewport = gridApi.grid.element[0].querySelector('.ui-grid-render-container');
            angular.element(viewport).off('wheel');
          });

          vm.gridApi = gridApi;
        },
      };

      return grid;
    };

  }
}

export default FieldEntityGridController;
