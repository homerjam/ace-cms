import _ from 'lodash';
import angular from 'angular';
import he from 'he/he';

const GRID_RESTORE_DELAY = 100;
const GRID_INITIAL_RESIZE_DELAY = 2000;
const GRID_RESTORE_SCROLL_FOCUS_OFFSET = 5;

class EntityGridController {
  /* @ngInject */
  constructor ($rootScope, $scope, $state, $stateParams, $transitions, $q, $filter, $log, $timeout, $window, $mdDialog, HelperFactory, EntityGridFactory, ConfigFactory, EntityFactory, BatchFactory, uiGridConstants) {
    const vm = this;

    vm.items = [];
    vm.selected = [];
    vm.totalItems = 0;
    vm.searchTerm = '';
    vm.showSearch = false;
    vm.page = 0;
    vm.filters = [];
    vm.sortColumns = [
      {
        name: 'modifiedAt',
        sort: {
          direction: uiGridConstants.ASC,
        },
      },
    ];
    vm.columnDefs = [];
    vm.sortFields = [];
    vm.searching = false;

    const schemaSlugs = vm.schema ?
      [vm.schema] : vm.mode === 'trash' ?
        [] : $stateParams.schemaSlug ?
          [$stateParams.schemaSlug] : [];

    let hasImageColumn = false;
    let bookmarks = {};

    const schemas = ConfigFactory.getConfig().schemas.filter(schema => schemaSlugs.indexOf(schema.slug) > -1);

    if (vm.mode !== 'trash' && !schemas[0]) {
      // throw Error(`Schema not found: ${schemaSlugs[0]}`);
      $log.error(`Schema not found: ${schemaSlugs[0]}`);
      $state.go('dashboard');
      return;
    }

    vm.heading = vm.mode === 'trash' ? 'Trash' : $filter('pluralize')(schemas[0] ? schemas[0].name : '');

    vm.sortFields = [];

    schemas.forEach((schema) => {
      schema.fields.forEach((field) => {
        if (field.settings.gridColumn) {
          vm.sortFields.push(field);
        }
      });
    });

    vm.filterFields = $filter('filterFields')(vm.sortFields);

    if (vm.mode === 'trash' || vm.sortFields.length === 0) {
      vm.columnDefs.push(
        {
          name: 'title',
          displayName: 'Title',
          allowCellFocus: false,
        }, {
          name: 'schema',
          displayName: 'Schema',
          cellFilter: 'schemaSlug2Name',
          allowCellFocus: false,
        }
      );
    }

    if (vm.mode !== 'trash' && vm.sortFields.length > 0) {
      vm.sortFields.forEach((field) => {
        const columnOptions = HelperFactory.getColumnOptions(field);

        if (columnOptions.style === 'thumbnail') {
          hasImageColumn = true;
        }

        vm.columnDefs.push(columnOptions);
      });
    }

    vm.columnDefs.push({
      name: 'modifiedAt',
      displayName: 'Modified',
      cellFilter: 'parseDate',
      allowCellFocus: false,
    });

    vm.columnDefs.push({
      name: 'publishedAt',
      displayName: 'Published',
      cellFilter: 'datePublished : row.entity',
      allowCellFocus: false,
    });

    const state = EntityGridFactory.states[schemaSlugs[0]];

    const onRegisterApi = (gridApi) => {
      vm.gridApi = gridApi;

      gridApi.core.on.renderingComplete($scope, (grid) => {
        if (state) {
          bookmarks = state.bookmarks;
          vm.grid.data = state.data;
          vm.items = state.data;
          vm.totalItems = state.totalItems;
          vm.searchTerm = state.searchTerm;
          vm.showSearch = state.showSearch;
          vm.page = state.page;
          vm.sortColumns = state.sortColumns;
          vm.filters = state.filters;
          vm.showSearch = vm.searchTerm !== '';

          // applyEdits();

          $timeout(() => {
            gridApi.core.handleWindowResize();

            if (state) {
              gridApi.saveState.restore(vm, state.state);

              if (state.state.scrollFocus.rowVal) {
                $timeout(() => {
                  gridApi.core.scrollTo(vm.grid.data[state.state.scrollFocus.rowVal.row + GRID_RESTORE_SCROLL_FOCUS_OFFSET]);
                });
              }
            }
          }, GRID_RESTORE_DELAY);
        } else {
          getResults(true);
        }

        $timeout(() => {
          gridApi.core.handleWindowResize();
        }, GRID_INITIAL_RESIZE_DELAY);
      });

      gridApi.core.on.sortChanged($scope, (grid, sortColumns) => {
        sort(sortColumns);
      });

      let lastClick = 0;
      let lastRow;

      gridApi.selection.on.rowSelectionChanged($scope, (row, event) => {
        if (event) {
          if (event.timeStamp - lastClick < 300 && row === lastRow) {
            // Double click

            if (vm.mode !== 'modal') {
              vm.editSelected([row.entity]);
            }
          }
          lastClick = event.timeStamp;
          lastRow = row;
        }

        vm.selected = gridApi.selection.getSelectedRows();
      });

      gridApi.selection.on.rowSelectionChangedBatch($scope, () => {
        vm.selected = gridApi.selection.getSelectedRows();
      });

      gridApi.infiniteScroll.on.needLoadMoreData($scope, () => {
        if (vm.items.length < vm.totalItems) {
          vm.page++;

          getResults().then(() => {
            gridApi.infiniteScroll.dataLoaded();
          });
        }
      });
    };

    vm.grid = {
      data: vm.items,
      rowHeight: hasImageColumn ? 100 : 50,
      headerRowHeight: 45,
      enableSorting: true,
      useExternalSorting: true,
      enableColumnMenus: false,
      columnDefs: vm.columnDefs,
      infiniteScrollPercentage: 10,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
      appScopeProvider: vm,
      excessRows: 20,
      saveSelection: true,
      onRegisterApi,
    };

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

        vm.selectNone();
      }

      const options = {
        query: [],
        sort: [],
        page: vm.page,
        bookmark: bookmarks[vm.page - 1] || null,
        trashed: vm.mode === 'trash',
      };

      if (vm.mode !== 'trash') {
        const schemas = schemaSlugs.map(slug => `schema:${slug}`);
        options.query.push(`(${schemas.join(' OR ')})`);
      }

      if (vm.searchTerm !== '') {
        const fieldTerms = [];

        schemas.forEach((schema) => {
          schema.fields.forEach((field) => {
            if (/image|video/.test(field.type)) {
              fieldTerms.push(`fields.${field.slug}.fileName:${vm.searchTerm}*`);
              fieldTerms.push(`fields.${field.slug}.original.fileName:${vm.searchTerm}*`);
            } else {
              fieldTerms.push(`fields.${field.slug}:${vm.searchTerm}*`);
            }
          });
        });

        options.query.push(`(${fieldTerms.join(' OR ')})`);
      }

      vm.filters.forEach((filter) => {
        if (filter.value) {
          options.query.push(`fields.${filter.fieldSlug}:"${filter.value.toLowerCase()}"`);
        }
      });

      options.query = options.query.join(' AND ');

      vm.sortColumns.forEach((column) => {
        const direction = column.sort.direction === uiGridConstants.ASC ? '-' : '';

        let type = '';

        let columnName = column.name.replace(/fields\.|\.value/g, '');

        if (/^(modifiedAt|publishedAt)$/.test(columnName)) {
          type = '<number>';

        } else if (/^(slug|title|schema)$/.test(columnName)) {
          type = '<string>';

        } else {
          columnName = `fields.${columnName}`;
          type = '<string>';
        }

        options.sort.push(`${direction}sort.${columnName}${type}`);
      });

      vm.searching = true;

      EntityGridFactory.search(options)
        .then((data) => {
          bookmarks[options.page] = data.bookmark;

          vm.totalItems = data.total;

          if (reset) {
            vm.items = data.results;
          } else {
            vm.items = vm.items.concat(data.results);
          }

          vm.grid.data = vm.items;

          saveState();

          deferred.resolve();
        })
        .finally(() => {
          vm.searching = false;
        });

      return deferred.promise;
    }

    vm.search = ($event, term) => {
      if ($event !== undefined && $event.type === 'keypress') {
        if ($event.keyCode !== 13) {
          return;
        }
      }

      search(term);
    };

    vm.selectAll = () => {
      vm.gridApi.selection.selectAllRows();
      vm.selected = vm.gridApi.selection.getSelectedRows();
    };

    vm.selectNone = () => {
      vm.gridApi.selection.clearSelectedRows();
      vm.selected = vm.gridApi.selection.getSelectedRows();
    };

    vm.newEntity = () => {
      $state.go('newEntity', {
        schemaSlug: schemaSlugs[0],
      });
    };

    $scope.$on('EntityFactory:updateEntities', (event, entities) => {
      vm.items.forEach((item) => {
        entities.forEach((entity) => {
          if (item._id && item._id === entity._id) {
            angular.extend(item, entity);
          }
        });
      });
      vm.grid.data = vm.items;
    });

    vm.editSelected = (items) => {
      EntityFactory.editEntities(items);
    };

    vm.deleteSelected = (items, forever) => {
      forever = forever || false;

      const confirm = $mdDialog.confirm()
        // .title('Confirm Action')
        .textContent('Delete selected entities?')
        .cancel('Cancel')
        .ok('Delete');

      $mdDialog
        .show(confirm)
        .then(() => {
          EntityFactory.deleteEntities(items, forever)
            .then((data) => {
              if (!data.error) {
                // TODO: replace with splice
                getResults(true);
              }
            });
        });
    };

    vm.restoreSelected = (items) => {
      const confirm = $mdDialog.confirm()
        // .title('Confirm Action')
        .textContent('Restore selected entities?')
        .cancel('Cancel')
        .ok('Restore');

      $mdDialog
        .show(confirm)
        .then(() => {
          EntityFactory.restoreEntities(items)
            .then((data) => {
              if (!data.error) {
                // TODO: replace with splice
                getResults(true);
              }
            });
        });
    };

    vm.emptyTrash = () => {
      const confirm = $mdDialog.confirm()
        // .title('Confirm Action')
        .textContent('Empty the trash?')
        .cancel('Cancel')
        .ok('Confirm');

      $mdDialog
        .show(confirm)
        .then(() => {
          EntityFactory.emptyTrash()
            .then((data) => {
              if (!data.error) {
                // TODO: replace with splice
                getResults(true);
              }
            });
        });
    };

    /* Filters */

    vm.addFilter = (field) => {
      vm.filters.push({
        name: field.name,
        value: null,
        fieldSlug: field.slug,
      });
    };

    vm.removeFilter = (i) => {
      vm.filters.splice(i, 1);

      getResults(true);
    };

    vm.selectFilter = () => {
      getResults(true);
    };

    vm.filterOptions = async (filter, searchTerm) => {
      const result = await EntityFactory.fieldValues(filter.fieldSlug, searchTerm);
      return result;
    };

    /* State */

    function saveState() {
      if (schemaSlugs[0]) {
        EntityGridFactory.states[schemaSlugs[0]] = {
          bookmarks,
          data: vm.grid.data,
          totalItems: vm.totalItems,
          searchTerm: vm.searchTerm,
          showSearch: vm.showSearch,
          page: vm.page,
          sortColumns: vm.sortColumns,
          filters: vm.filters,
          state: vm.gridApi.saveState.save(),
        };
      }
    }

    // Record last grid state and options per schema on destroy
    vm.$onDestroy = () => {
      saveState();
    };

    $scope.$watch(() => vm.showSearch, () => {
      $timeout(() => {
        vm.gridApi.core.handleWindowResize();
      });
    });

    $scope.$watch(() => vm.filters.length, () => {
      $timeout(() => {
        vm.gridApi.core.handleWindowResize();
      });
    });
  }
}

export default EntityGridController;
