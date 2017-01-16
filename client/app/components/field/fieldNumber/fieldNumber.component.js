import template from './fieldNumber.jade';
import controller from './fieldNumber.controller';
import './fieldNumber.scss';

const fieldNumberComponent = function fieldNumberComponent() {
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

export default fieldNumberComponent;
