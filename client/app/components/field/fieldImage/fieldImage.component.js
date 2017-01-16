import template from './fieldImage.jade';
import controller from './fieldImage.controller';
import './fieldImage.scss';

const fieldImageComponent = function fieldImageComponent() {
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

export default fieldImageComponent;
