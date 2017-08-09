import angular from 'angular';

class AdminController {
  /* @ngInject */
  constructor($rootScope, $scope, $state, $stateParams, $window, $timeout, $q, $log, ModalService, AdminFactory, HelperFactory, uiGridConstants, $mdDialog) {
    const vm = this;

    vm.adminType = $stateParams.adminType;

    vm.items = [];
    vm.selected = [];
    vm.totalItems = 0;
    vm.searchTerm = '';
    vm.page = 0;
    vm.filters = [];
    vm.sortColumns = [
      {
        name: 'name',
        sort: {
          direction: uiGridConstants.DESC,
        },
      },
    ];
    vm.columnDefs = [];
    vm.sortFields = [];
    vm.searching = false;

    let bookmarks = {};

    const info = {
      schema: {
        heading: 'Schemas',
        description: 'A schema defines the properties of an entity.',
      },
      field: {
        heading: 'Fields',
        description: 'Manage the fields available to schemas.',
      },
      action: {
        heading: 'Actions',
        description: 'Configure available actions.',
      },
      user: {
        heading: 'Users',
        description: 'Create and manage users and their permissions.',
      },
      taxonomy: {
        heading: 'Taxonomy',
        description: 'Taxonomies are used for classification and to define relationships between entities.',
      },
    };

    vm.info = info[vm.adminType];

    if (/schema|field|action|taxonomy/.test(vm.adminType)) {
      vm.columnDefs.push({
        name: 'name',
        sortType: 'string',
        displayName: 'Name',
      });

      vm.columnDefs.push({
        name: 'slug',
        sortType: 'string',
        displayName: 'Slug',
      });
    }

    if (vm.adminType === 'schema') {
      vm.columnDefs.push({
        name: 'fields',
        displayName: 'Fields(s)',
        cellFilter: 'fieldNames',
        enableSorting: false,
      });

      vm.columnDefs.push({
        name: 'actions',
        displayName: 'Actions(s)',
        cellFilter: 'actionNames',
        enableSorting: false,
      });
    }

    if (vm.adminType === 'field') {
      vm.columnDefs.push({
        name: 'type',
        sortType: 'string',
        displayName: 'Type',
        cellFilter: 'typeName',
      });

      vm.columnDefs.push({
        name: '_schemas',
        displayName: 'Schema(s)',
        cellFilter: 'schemaName',
        enableSorting: false,
      });
    }

    if (vm.adminType === 'action') {
      vm.columnDefs.push({
        name: 'type',
        sortType: 'string',
        displayName: 'Type',
        cellFilter: 'typeName',
      });

      vm.columnDefs.push({
        name: '_schemas',
        displayName: 'Schema(s)',
        cellFilter: 'schemaName',
        enableSorting: false,
      });
    }

    if (vm.adminType === 'user') {
      vm.columnDefs.push({
        name: 'email',
        sortType: 'string',
        displayName: 'Email',
      });

      vm.columnDefs.push({
        name: 'firstName',
        sortType: 'string',
        displayName: 'First Name',
      });

      vm.columnDefs.push({
        name: 'lastName',
        sortType: 'string',
        displayName: 'Last Name',
      });

      vm.columnDefs.push({
        name: 'role',
        sortType: 'string',
        displayName: 'Role',
        cellFilter: 'roleName',
      });

      vm.columnDefs.push({
        name: 'active',
        displayName: 'Active',
        cellTemplate: '<div class="ui-grid-cell-contents"><span class="{{grid.getCellValue(row, col) | crossCheck}}"></span></div>',
        enableSorting: false,
      });
    }

    if (vm.adminType === 'taxonomy') {
      vm.columnDefs.push({
        name: 'modified',
        sortType: 'number',
        displayName: 'Modified',
        cellFilter: 'parseDate',
      });
    }

    // var buttons = [];

    // buttons.push('<span class="hint--right" data-hint="Edit"><butto class="btn btn-sm btn-default btn-round" ng-click="grid.appScope.edit($event, row.entity)"><i class="fa fa-lg fa-pencil"></i></button></span>');
    // buttons.push('<span class="hint--right" data-hint="Delete"><button class="btn btn-sm btn-default btn-round" ng-click="grid.appScope.delete($event, row.entity)"><i class="fa fa-lg fa-trash-o"></i></button></span>');

    // if (/schema|field|action|taxonomy/.test(vm.adminType)) {
    //   buttons.push('<span class="hint--right" data-hint="Clone"><button class="btn btn-sm btn-default btn-round" ng-click="grid.appScope.clone($event, row.entity)"><i class="fa fa-lg fa-copy"></i></button></span>');
    // }

    // vm.columnDefs.push({
    //   name: ' ',
    //   cellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell--actions">' + buttons.join('') + '</div>',
    //   enableSorting: false,
    // });

    function search (term) {
      vm.searchTerm = term || '';

      getResults(true);
    }

    function sort (sortColumns) {
      vm.sortColumns = sortColumns;

      getResults(true);
    }

    function getResults (reset) {
      if (vm.searching) {
        return false;
      }

      const deferred = $q.defer();

      if (reset) {
        vm.page = 0;
        bookmarks = {};
      }

      vm.selectNone();

      const options = {
        q: [],
        sort: [],
        page: vm.page,
        bookmark: bookmarks[vm.page - 1] || null,
        trashed: vm.mode === 'trash',
      };

      options.q = options.q.join(' AND ');

      vm.sortColumns.forEach((column) => {
        const direction = column.sort.direction === uiGridConstants.ASC ? '-' : '';

        let dataType = '';

        vm.columnDefs.forEach((columnDef) => {
          if (columnDef.sortType) {
            dataType = `<${columnDef.sortType}>`;
          }
        });

        options.sort.push(direction + column.name + dataType);
      });

      vm.searching = true;

      AdminFactory.search(vm.adminType, options)
        .then((items) => {
          vm.totalItems = items.length;

          if (reset) {
            vm.items = items;

          } else {
            vm.items = vm.items.concat(items);
          }

          vm.grid.data = vm.items;

          deferred.resolve();
        })
        .finally(() => {
          vm.searching = false;
        });

      return deferred.promise;
    }

    vm.grid = {
      data: vm.items,
      rowHeight: 50,
      headerRowHeight: 45,
      enableSorting: true,
      useExternalSorting: true,
      enableColumnMenus: false,
      columnDefs: vm.columnDefs,
      infiniteScrollPercentage: 10,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
      appScopeProvider: vm,
      onRegisterApi(gridApi) {
        vm.gridApi = gridApi;

        vm.gridApi.core.on.sortChanged($scope, (grid, sortColumns) => {
          sort(sortColumns);
        });

        let lastClick = 0;
        let lastRow;

        gridApi.selection.on.rowSelectionChanged($scope, (row, event) => {
          if (event.timeStamp - lastClick < 300 && row === lastRow) {
            vm.editItems([row.entity]);
          }
          lastClick = event.timeStamp;
          lastRow = row;

          vm.selected = gridApi.selection.getSelectedRows();
        });

        vm.gridApi.selection.on.rowSelectionChangedBatch($scope, () => {
          vm.selected = vm.gridApi.selection.getSelectedRows();
        });

        vm.gridApi.infiniteScroll.on.needLoadMoreData($scope, () => {
          if (vm.items.length < vm.totalItems) {
            vm.page++;

            getResults().then(() => {
              vm.gridApi.infiniteScroll.dataLoaded();
            });
          }
        });
      },
    };

    vm.selectAll = () => {
      vm.gridApi.selection.selectAllRows();
    };

    vm.selectNone = () => {
      vm.gridApi.selection.clearSelectedRows();
    };

    const updateItems = (updatedItems) => {
      vm.items = vm.items.map((item) => {
        let returnItem = item;

        updatedItems.forEach((updatedItem) => {
          if (vm.adminType === 'user') {
            if (item.email === updatedItem.email) {
              returnItem = updatedItem;
            }
          } else if (item.slug === updatedItem.slug) {
            returnItem = updatedItem;
          }
        });

        return returnItem;
      });

      vm.grid.data = vm.items;
    };

    vm.newItem = (type) => {
      type = type || vm.adminType;

      AdminFactory.newItem(type)
        .then((item) => {
          vm.items.push(item);

          $timeout(() => {
            vm.grid.data = vm.items;
          });
        });
    };

    vm.editItems = (items, type) => {
      type = type || vm.adminType;

      AdminFactory.editItems(type, items)
        .then(updateItems);
    };

    vm.deleteItems = (items, type) => {
      type = type || vm.adminType;

      const itemNames = items.map((item) => {
        return item.name;
      });

      const confirm = $mdDialog.confirm()
        // .title('Confirm Action')
        .textContent(`Are you sure you want to delete ${itemNames.join(', ')}?`)
        .cancel('Cancel')
        .ok('Delete');

      $mdDialog
        .show(confirm)
        .then(() => {
          AdminFactory.deleteItems(type, items)
            .then((data) => {
              if (!data.error) {
                getResults(true);
              }
            });
        });
    };

    vm.cloneItem = (items, type) => {
      type = type || vm.adminType;

      AdminFactory.cloneItem(type, items[0])
        .then((item) => {
          vm.items.push(item);

          $timeout(() => {
            vm.grid.data = vm.items;
          });
        });
    };

    $timeout(() => {
      getResults(true);
    });

  }
}

export default AdminController;
