import angular from 'angular';

class EcommerceController {
  /* @ngInject */
  constructor ($rootScope, $scope, $state, $window, $http, $timeout, $q, $log, $mdDialog, EcommerceFactory, SettingsFactory, HelperFactory, ModalService, uiGridConstants, appConfig) {
    const vm = this;

    const type = $state.current.data.ecommerceType;
    const ecommerceSettings = EcommerceFactory.settings();

    $scope.template = type;

    vm.type = type;
    vm.selected = [];

    /* Settings */

    vm.ecommerceSettings = ecommerceSettings;

    vm.saveSettings = () => {
      EcommerceFactory.saveSettings(vm.ecommerceSettings).then((settings) => {
        vm.ecommerceSettings = settings;
      });
    };

    vm.authenticateWithProvider = (provider) => {
      SettingsFactory.authenticateWithProvider(provider)
        .then((providerSettings) => {
          if (provider === 'stripe') {
            $http.get(`${appConfig.apiUrl}/stripe/account`)
              .then((response) => {
                providerSettings.account = response.data;
                vm.ecommerceSettings[provider] = providerSettings;
              });
            return;
          }
          vm.ecommerceSettings[provider] = providerSettings;
        });
    };

    /* Shared */

    vm.items = [];

    vm.options = {
      page: 0,
    };

    let bookmarks = {};
    const columnDefs = {};

    const sort = (sortColumns) => {
      if (sortColumns.length) {
        vm.options.sort = sortColumns.map((column) => {
          const direction = column.sort.direction === uiGridConstants.ASC ? '-' : '';

          let dataType = '';

          columnDefs[type].forEach((columnDef) => {
            if (columnDef.sortType) {
              dataType = `<${columnDef.sortType}>`;
            }
          });

          return `${direction}sort.${column.name}${dataType}`;
        })[0];
      }
    };

    const search = (type, reset) => {
      const deferred = $q.defer();

      if (reset) {
        vm.options.page = 0;
        bookmarks = {};
      }

      // vm.selectNone()

      const options = angular.copy(vm.options);

      options.bookmark = bookmarks[options.page - 1] || null;

      // options.filters.forEach(function(filter) {
      //     options.q.push(filter)
      // })

      options.q = (options.q || []).join(' AND ');

      vm.searching = true;

      EcommerceFactory.search(type, options)
        .then((data) => {
          bookmarks[options.page] = data.bookmark;

          vm.total = data.total;

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
    };

    vm.search = ($event, term) => {
      if ($event !== undefined && $event.type === 'keypress') {
        if ($event.keyCode !== 13) {
          return;
        }
      }

      vm.searchTerm = term || '';

      const q = [];

      if (type === 'order') {
        q.push(`test:${ecommerceSettings.testMode ? 'true' : 'false'}`);
      }

      if (vm.searchTerm !== '') {
        const fieldTerms = [];

        if (type === 'order') {
          fieldTerms.push(`orderId:${vm.searchTerm}*`);
          fieldTerms.push(`customer.email:${vm.searchTerm}*`);
          fieldTerms.push(`customer.name:${vm.searchTerm}*`);
        }

        if (type === 'discount') {
          fieldTerms.push(`name:${vm.searchTerm}*`);
          fieldTerms.push(`code:${vm.searchTerm}*`);
        }

        q.push(`(${fieldTerms.join(' OR ')})`);
      }

      vm.options.q = q;
    };

    const updateItems = (items, updatedItems, key) => {
      items = items.map((item) => {
        let returnItem = item;

        updatedItems.forEach((updatedItem) => {
          if (item[key] === updatedItem[key]) {
            returnItem = updatedItem;
          }
        });

        return returnItem;
      });

      return items;
    };

    const removeItems = (items, removedItems, key) => {
      items = items.filter(item => removedItems.filter(removedItem => removedItem[key] !== item[key]).length);

      return items;
    };

    /* Orders */

    columnDefs.order = [
      {
        name: 'orderId',
        displayName: 'Order ID',
        enableSorting: false,
      }, {
        name: 'customer.name',
        sortType: 'string',
        displayName: 'Customer Name',
      }, {
        name: 'customer.email',
        sortType: 'string',
        displayName: 'Customer Email',
      }, {
        name: 'created',
        sortType: 'number',
        displayName: 'Created',
        cellFilter: 'parseDate',
      }, {
        name: 'status',
        sortType: 'string',
        displayName: 'Order Status',
        cellFilter: 'toTitleCase',
      }, {
        name: 'total',
        sortType: 'number',
        displayName: 'Total',
        cellFilter: 'currency',
      }, {
        name: 'charge',
        displayName: 'Charge Status',
        cellFilter: 'chargeStatus',
        enableSorting: false,
      },
    ];

    vm.editOrder = (order) => {
      EcommerceFactory.editOrder(order)
        .then((item) => {
          vm.items = updateItems(vm.items, [item], '_id');

          $timeout(() => {
            vm.grid.data = vm.items;
          });
        });
    };

    /* Discounts */

    columnDefs.discount = [
      {
        name: 'name',
        sortType: 'string',
        displayName: 'Name',
      },
      {
        name: 'code',
        sortType: 'string',
        displayName: 'Code',
      },
      {
        name: 'discountType',
        sortType: 'string',
        displayName: 'Type',
      },
      {
        name: 'amount',
        sortType: 'number',
        displayName: 'Amount',
      },
      {
        name: 'dateStart',
        sortType: 'number',
        displayName: 'Start Date',
        cellFilter: 'parseDate',
      },
      {
        name: 'dateEnd',
        sortType: 'number',
        displayName: 'End Date',
        cellFilter: 'parseDate',
      },
    // {
    //   name: 'usageAmount',
    //   sortType: 'number',
    //   displayName: 'Used',
    // },
    // {
    //   name: 'usageLimit',
    //   sortType: 'number',
    //   displayName: 'Limit',
    // },
    ];

    vm.editDiscount = (discount) => {
      const isNew = !discount;

      if (discount) {
        discount = angular.copy(discount);
      }

      EcommerceFactory.editDiscount(discount).then((item) => {
        if (isNew) {
          vm.items.push(item);
        } else {
          vm.items = updateItems(vm.items, [item], '_id');
        }

        $timeout(() => {
          vm.grid.data = vm.items;
        });
      });
    };

    vm.deleteDiscounts = (discounts) => {
      const discountNames = discounts.map(discount => discount.name);

      const confirm = $mdDialog.confirm()
        // .title('Confirm Action')
        .textContent(`Are you sure you want to delete ${discountNames.join(', ')}?`)
        .cancel('Cancel')
        .ok('Delete');

      $mdDialog
        .show(confirm)
        .then(() => {
          EcommerceFactory.delete('discount', discounts).then(() => {
            vm.items = removeItems(vm.items, discounts, '_id');

            $timeout(() => {
              vm.grid.data = vm.items;
            });
          });
        });
    };

    /* Shared */

    vm.grid = {
      data: vm.items,
      rowHeight: 50,
      headerRowHeight: 45,
      enableSorting: true,
      useExternalSorting: true,
      enableColumnMenus: false,
      columnDefs: columnDefs[type],
      infiniteScrollPercentage: 10,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
      appScopeProvider: vm,
      excessRows: 20,
      onRegisterApi(gridApi) {
        vm.gridApi = gridApi;

        gridApi.core.on.sortChanged(null, (grid, sortColumns) => {
          sort(sortColumns);
        });

        let lastClick = 0;
        let lastRow;

        gridApi.selection.on.rowSelectionChanged(null, (row, event) => {
          if (event.timeStamp - lastClick < 300 && row === lastRow) {
            if (type === 'order') {
              vm.editOrder(row.entity);
            }
            if (type === 'discount') {
              vm.editDiscount(row.entity);
            }
          }
          lastClick = event.timeStamp;
          lastRow = row;

          vm.selected = gridApi.selection.getSelectedRows();
        });

        gridApi.selection.on.rowSelectionChangedBatch($scope, (rows, event) => {
          vm.selected = gridApi.selection.getSelectedRows();
        });

        gridApi.infiniteScroll.on.needLoadMoreData(null, () => {
          if (vm.items.length < vm.total) {
            vm.options.page++;

            search(type).then(() => {
              gridApi.infiniteScroll.dataLoaded();
            });
          }
        });
      },
    };

    if (/orders|customers|discounts/.test($state.current.name)) {
      if (type === 'order') {
        sort([
          {
            name: 'created',
            sort: {
              direction: uiGridConstants.ASC,
            },
          },
        ]);
      } else if (type === 'discount') {
        sort([
          {
            name: 'dateEnd',
            sort: {
              direction: uiGridConstants.ASC,
            },
          }, {
            name: 'dateStart',
            sort: {
              direction: uiGridConstants.ASC,
            },
          }, {
            name: 'name',
            sort: {
              direction: uiGridConstants.ASC,
            },
          },
        ]);
      }

      vm.search();

      $scope.$watch(() => vm.options, () => {
        search(type, true);
      }, true);
    }
  }
}

export default EcommerceController;
