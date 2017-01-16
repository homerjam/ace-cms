import template from './fieldDate.jade';
import controller from './fieldDate.controller';
import './fieldDate.scss';

const fieldDateComponent = function fieldDateComponent() {
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

export default fieldDateComponent;
