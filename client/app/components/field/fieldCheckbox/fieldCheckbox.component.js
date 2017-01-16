import template from './fieldCheckbox.jade';
import controller from './fieldCheckbox.controller';
import './fieldCheckbox.scss';

const fieldCheckboxComponent = function fieldCheckboxComponent() {
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

export default fieldCheckboxComponent;
