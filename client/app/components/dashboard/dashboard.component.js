import template from './dashboard.jade';
import controller from './dashboard.controller';
import './dashboard.scss';

const dashboardComponent = function dashboardComponent() {
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

export default dashboardComponent;

