import angular from 'angular';
import * as modalTemplates from './templates/modal';

const EcommerceFactory = ($rootScope, $window, $http, $q, $log, $mdDialog, ConfigFactory, HelperFactory, ModalService, appConfig) => {
  'ngInject';

  const service = {};

  service.search = (type, options) => $q((resolve, reject) => {
    const params = {
      q: options.q || '*:*',
      sort: options.sort || '<score>',
      limit: options.limit || 200,
      include_docs: true,
    };

    if (options.bookmark) {
      params.bookmark = options.bookmark;
    }

    $http({
      method: 'GET',
      url: `${appConfig.apiUrl}/ecommerce/${type}`,
      params,
    })
      .then((response) => {
        if (!response.data.error) {
          const result = {
            total: response.data.total_rows,
            bookmark: response.data.bookmark,
            results: response.data.rows.map(row => row.doc),
          };

          resolve(result);
        } else {
          resolve({});
        }
      }, reject);
  });

  service.save = (type, obj) => $q((resolve, reject) => {
    obj = angular.fromJson(angular.toJson(obj));

    obj.modifiedBy = ConfigFactory.getUser().id;
    obj.modifiedAt = HelperFactory.now();

    $http({
      method: 'POST',
      url: `${appConfig.apiUrl}/ecommerce/${type}`,
      data: {
        item: obj,
      },
    })
      .then((response) => {
        obj._rev = response.data._rev;
        resolve(obj);
      }, reject);
  });

  service.delete = (type, objs) => $q((resolve, reject) => {
    $http({
      method: 'DELETE',
      url: `${appConfig.apiUrl}/ecommerce/${type}`,
      data: {
        items: objs,
      },
    })
      .then(resolve, reject);
  });

  service.editOrder = order => $q((resolve, reject) => {
    ModalService.showModal({
      template: modalTemplates.order,
      controller(
        $scope,
        $modal,
        HelperFactory,
        EcommerceFactory,
        order
      ) {
        'ngInject';

        const vm = this;

        vm.order = order;

        $scope.$watch(() => vm.order.status, (status, oldStatus) => {
          if (status !== oldStatus) {
            EcommerceFactory.save('order', vm.order).then((obj) => {
              vm.order = obj;
            });
          }
        });

        vm.close = () => {
          $modal.close(vm.order);
        };

        vm.refund = () => {
          EcommerceFactory.refundOrder(vm.order)
            .then((order) => {
              vm.order = order;
            });
        };

        vm.previewEmailTemplate = (template) => {
          $window.open(`${appConfig.apiUrl}/ecommerce/order/message/${template}?orderId=${vm.order._id}&apiToken=${$rootScope.apiToken}`);
        };
      },
      controllerAs: 'vm',
      inputs: {
        order,
      },
    }).then((modal) => {
      modal.result.then(resolve, reject);
    });
  });

  service.editDiscount = discount => $q((resolve, reject) => {
    discount = discount || {
      discountType: 'percentage',
      dateStart: new Date(),
      usageLimit: 0,
    };

    ModalService.showModal({
      template: modalTemplates.discount,
      controller(HelperFactory, discount) {
        'ngInject';

        const vm = this;

        vm.discount = discount;
      },
      controllerAs: 'vm',
      inputs: {
        HelperFactory,
        discount,
      },
    }).then((modal) => {
      modal.result.then((obj) => {
        service.save('discount', obj).then(resolve, reject);
      });
    });
  });

  service.refundOrder = order => $q((resolve, reject) => {
    ModalService.showModal({
      template: modalTemplates.refund,
      controller(HelperFactory, order) {
        'ngInject';

        const vm = this;

        vm.order = order;

        vm.amount = (vm.order.charge.amount - vm.order.charge.amountRefunded) / 100;
        vm.maxAmount = vm.amount;
      },
      controllerAs: 'vm',
      inputs: {
        HelperFactory,
        order,
      },
    }).then((modal) => {
      modal.result.then((amount) => {
        service.stripeRefund(order, amount)
          .then((response) => {
            resolve(response.data);
          })
          .catch((response) => {
            $mdDialog.show(
              $mdDialog.alert()
                .title('Refund Error')
                .textContent(response.data.message)
                .ok('Close')
            );
          });
      });
    });
  });

  service.stripeRefund = (order, amount) => $q((resolve, reject) => {
    $http({
      method: 'POST',
      url: `${appConfig.apiUrl}/stripe/refund`,
      data: {
        order,
        amount,
      },
    })
      .then(resolve, reject);
  });

  return service;
};

export default EcommerceFactory;
