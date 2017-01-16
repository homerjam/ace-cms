// import template from './menu.html';
import template from './menu.jade';
import controller from './menu.controller';
import './menu.scss';

const menuComponent = function menuComponent() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {},
    template,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default menuComponent;
