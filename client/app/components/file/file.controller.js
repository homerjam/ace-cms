import angular from 'angular';

class FileController {
  /* @ngInject */
  constructor($rootScope, $scope, $state, $window, $q, $log, $timeout, $mdDialog, HelperFactory, FileFactory, uiGridConstants, appConfig) {
    const vm = this;

    vm.status = 'active';

    vm.items = [];
    vm.selected = [];
    vm.totalItems = 0;
    vm.searchTerm = '';
    vm.page = 0;
    vm.filters = [];
    vm.sortColumns = [
      {
        name: 'uploadedAt',
        sort: {
          direction: uiGridConstants.ASC,
        },
      },
    ];
    vm.columnDefs = [];
    vm.sortFields = [];
    vm.searching = false;

    let bookmarks = {};

    vm.columnDefs.push({
      name: 'original.fileName',
      displayName: 'Name',
    });

    vm.columnDefs.push({
      name: 'fileSize',
      displayName: 'Size',
      cellFilter: 'fileSize',
    });

    vm.columnDefs.push({
      name: 'mediaType',
      displayName: 'Type',
    });

    vm.columnDefs.push({
      name: 'uploadedBy',
      displayName: 'Uploaded By',
    });

    vm.columnDefs.push({
      name: 'uploadedAt',
      displayName: 'Uploaded',
      cellFilter: "date: 'HH:mm dd/MM/yyyy'",
    });

    // vm.columnDefs.push({
    //   name: 'trashed',
    //   displayName: 'Status',
    //   cellFilter: 'status',
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

      if (vm.status !== 'all') {
        options.q.push(`trashed:${vm.status === 'trashed' ? 'true' : 'false'}`);
      }

      options.q = options.q.join(' AND ');

      vm.sortColumns.forEach((column) => {
        const direction = column.sort.direction === uiGridConstants.ASC ? '-' : '';
        let type = '';

        const columnName = column.name;

        if (/^(uploadedAt|fileSize)$/.test(columnName)) {
          type = '<number>';

        } else if (/^(originalFileName|mimeType|uploadedBy)$/.test(columnName)) {
          type = '<string>';
        }

        options.sort.push(`${direction}sort.${columnName}${type}`);
      });

      vm.searching = true;

      FileFactory.search(options)
        .then((data) => {
          bookmarks[options.page] = data.bookmark;

          vm.totalItems = data.total;

          if (reset) {
            vm.items = data.results;
          } else {
            vm.items = vm.items.concat(data.results);
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

        gridApi.core.on.sortChanged($scope, (grid, sortColumns) => {
          sort(sortColumns);
        });

        let lastClick = 0;
        let lastRow;

        gridApi.selection.on.rowSelectionChanged($scope, (row, event) => {
          if (event.timeStamp - lastClick < 300 && row === lastRow) {
            vm.downloadSelected(row.entity);
          }
          lastClick = event.timeStamp;
          lastRow = row;

          vm.selected = gridApi.selection.getSelectedRows();
        });

        gridApi.selection.on.rowSelectionChangedBatch($scope, (rows, event) => {
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
      },
    };

    vm.viewSelected = (item) => {
      $state.go('entity', {
        id: item.entity.id,
      });
    };

    vm.downloadSelected = (item) => {
      if (item.location === 's3') {
        $window.open(`${appConfig.apiUrl}/file/download/s3?bucket=${item.metadata.s3.bucket}&key=${item.metadata.s3.src}&filename=${item.original.fileName}`);
      }

      if (item.location === 'assist') {
        $window.open(`${$rootScope.assistUrl}/${$rootScope.slug}/file/download/${item.fileName}/${item.original.fileName}`);
      }
    };

    vm.isTrashed = (items) => {
      return items.filter(item => item.trashed === 'false').length === 0;
    };

    vm.deleteSelected = (items) => {
      const confirm = $mdDialog.confirm()
        // .title('Confirm Action')
        .textContent('Delete selected file(s)?')
        .cancel('Cancel')
        .ok('Delete');

      $mdDialog
        .show(confirm)
        .then(() => {
          FileFactory.deleteFiles(items)
            .then((data) => {
              if (!data.error) {
                // @TODO: replace with splice
                getResults(true);
              }
            });
        });
    };

    vm.emptyTrash = () => {
      const confirm = $mdDialog.confirm()
        // .title('Confirm Action')
        .textContent('Empty trash?')
        .cancel('Cancel')
        .ok('Confirm');

      $mdDialog
        .show(confirm)
        .then(() => {
          FileFactory.emptyTrash()
            .then((data) => {
              if (!data.error) {
                // @TODO: replace with splice
                getResults(true);
              }
            });
        });
    };

    vm.changeStatus = () => {
      getResults(true);
    };

    vm.selectAll = () => {
      vm.gridApi.selection.selectAllRows();
    };

    vm.selectNone = () => {
      vm.gridApi.selection.clearSelectedRows();
    };

    $timeout(() => {
      getResults(true);
    });

  }
}

export default FileController;
