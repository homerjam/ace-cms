import template from './fieldColor.jade';
import controller from './fieldColor.controller';
import './fieldColor.scss';

const fieldColorComponent = function fieldColorComponent() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {
      fieldOptions: '=',
      fieldModel: '=',
      fieldApply: '=?',
    },
    template,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default fieldColorComponent;
