import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ecommerceComponent from './ecommerce.component';
import EcommerceFactory from './ecommerce.factory';

const ecommerceModule = angular.module('ecommerce', [
  uiRouter,
])

  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state('ecommerceOrders', {
      url: '/ecommerce/orders',
      views: {
        content: {
          template: '<ecommerce></ecommerce>',
        },
      },
      data: {
        ecommerceType: 'order',
        permissions: 'ecommerce',
      },
    });

    $stateProvider.state('ecommerceDiscounts', {
      url: '/ecommerce/discounts',
      views: {
        content: {
          template: '<ecommerce></ecommerce>',
        },
      },
      data: {
        ecommerceType: 'discount',
        permissions: 'ecommerce',
      },
    });

    $stateProvider.state('ecommerceSettings', {
      url: '/ecommerce/settings',
      views: {
        content: {
          template: '<ecommerce></ecommerce>',
        },
      },
      data: {
        ecommerceType: 'settings',
        permissions: 'ecommerce',
      },
    });

  })

  .filter('currency', ($filter, $rootScope) => {
    'ngInject';

    return (input, currencySymbol) => {
      currencySymbol = currencySymbol || $rootScope.$config.module.ecommerce.currency.symbol;
      return currencySymbol + $filter('toFixed')(input);
    };
  })

  .filter('chargeStatus', ($filter, $rootScope) => {
    'ngInject';

    return (charge) => {
      if (!charge) {
        return '';
      }
      const currencySymbol = $rootScope.$config.module.ecommerce.currency.symbol;
      if (charge.status === 'failed') {
        return 'Unpaid';
      }
      if (charge.amountRefunded === 0) {
        return 'Paid in full';
      }
      if (charge.amount === charge.amountRefunded) {
        return 'Full refund';
      }
      return `${currencySymbol + $filter('toFixed')(charge.amountRefunded / 100)} refunded`;
    };
  })

  .factory('EcommerceFactory', EcommerceFactory)

  .directive('ecommerce', ecommerceComponent);

export default ecommerceModule;
