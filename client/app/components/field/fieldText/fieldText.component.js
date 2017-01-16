import template from './fieldText.jade';
import controller from './fieldText.controller';
import './fieldText.scss';

const fieldTextComponent = function fieldTextComponent() {
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

export default fieldTextComponent;
