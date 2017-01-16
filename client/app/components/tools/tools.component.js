import template from './tools.jade';
import controller from './tools.controller';
import './tools.scss';

const toolsComponent = function toolsComponent() {
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

export default toolsComponent;
