import template from './fieldEntity.jade';
import controller from './fieldEntity.controller';
import './fieldEntity.scss';

const fieldEntityComponent = function fieldEntityComponent() {
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

export default fieldEntityComponent;
