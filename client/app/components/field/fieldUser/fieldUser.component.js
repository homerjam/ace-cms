import template from './fieldUser.jade';
import controller from './fieldUser.controller';
import './fieldUser.scss';

const fieldUserComponent = function fieldUserComponent() {
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

export default fieldUserComponent;
