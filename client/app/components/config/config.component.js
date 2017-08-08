import template from './config.jade';
import controller from './config.controller';
import './config.scss';

const configComponent = function configComponent() {
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

export default configComponent;
