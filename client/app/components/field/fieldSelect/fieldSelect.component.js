import template from './fieldSelect.jade';
import controller from './fieldSelect.controller';
import './fieldSelect.scss';

const fieldSelectComponent = function fieldSelectComponent() {
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

export default fieldSelectComponent;
