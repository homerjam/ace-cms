import template from './fieldTextArea.jade';
import controller from './fieldTextArea.controller';
import './fieldTextArea.scss';

const fieldTextAreaComponent = function fieldTextAreaComponent() {
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

export default fieldTextAreaComponent;
