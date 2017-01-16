import template from './file.jade';
import controller from './file.controller';
import './file.scss';

const fileComponent = function fileComponent() {
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

export default fileComponent;
