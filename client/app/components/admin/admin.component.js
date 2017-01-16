import template from './admin.jade';
import controller from './admin.controller';
import './admin.scss';

const adminComponent = function adminComponent() {
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

export default adminComponent;
