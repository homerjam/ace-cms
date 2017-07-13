import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ecommerceComponent from './ecommerce.component';
import EcommerceFactory from './ecommerce.factory';

const ecommerceModule = angular.module('ecommerce', [
  uiRouter,
])

  .config(($stateProvider, $authProvider) => {
    'ngInject';

    $authProvider.oauth2({
      name: 'stripe',
      authorizationEndpoint: 'https://connect.stripe.com/oauth/authorize',
      scope: ['read_write'],
      defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
      responseType: 'code',
      responseParams: {
        code: 'code',
        clientId: 'clientId',
        redirectUri: 'redirectUri',
      },
    });

    $stateProvider.state('ecommerce', {
      abstract: true,
    });

    $stateProvider.state('ecommerce.orders', {
      url: '/ecommerce/orders',
      views: {
        'content@': {
          template: '<ecommerce></ecommerce>',
        },
      },
      data: {
        ecommerceType: 'order',
        permissions: 'ecommerce',
      },
    });

    $stateProvider.state('ecommerce.discounts', {
      url: '/ecommerce/discounts',
      views: {
        'content@': {
          template: '<ecommerce></ecommerce>',
        },
      },
      data: {
        ecommerceType: 'discount',
        permissions: 'ecommerce',
      },
    });

    $stateProvider.state('ecommerce.settings', {
      url: '/ecommerce/settings',
      views: {
        'content@': {
          template: '<ecommerce></ecommerce>',
        },
      },
      data: {
        ecommerceType: 'settings',
        permissions: 'ecommerce',
      },
    });

  })

  .filter('currency', ($filter, EcommerceFactory) => {
    'ngInject';

    return (input, currencySymbol) => {
      currencySymbol = currencySymbol || EcommerceFactory.currencySymbol;
      return currencySymbol + $filter('toFixed')(input);
    };
  })

  .filter('chargeStatus', ($filter, EcommerceFactory) => {
    'ngInject';

    return (charge) => {
      if (!charge) {
        return '';
      }
      const currencySymbol = EcommerceFactory.currencySymbol;
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
