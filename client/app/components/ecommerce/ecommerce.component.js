import order from './templates/order.jade';
import discount from './templates/discount.jade';
import settings from './templates/settings.jade';
import controller from './ecommerce.controller';
import './ecommerce.scss';

const ecommerceComponent = function ecommerceComponent($compile) {
  'ngInject';

  const templates = {
    order,
    discount,
    settings,
  };

  const link = ($scope, $element) => {
    $element.html(templates[$scope.template]);

    $compile($element.contents())($scope);
  };

  return {
    restrict: 'E',
    scope: {
      template: '=',
    },
    link,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default ecommerceComponent;
