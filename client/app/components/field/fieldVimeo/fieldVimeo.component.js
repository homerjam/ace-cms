import template from './fieldVimeo.jade';
import controller from './fieldVimeo.controller';
import './fieldVimeo.scss';

const fieldVimeoComponent = function fieldVimeoComponent() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {
      fieldOptions: '=',
      fieldModel: '=',
      fieldApply: '=?',
      fieldDisabled: '=?',
    },
    template,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default fieldVimeoComponent;
