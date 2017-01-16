import template from './fieldKeyValue.jade';
import controller from './fieldKeyValue.controller';
import './fieldKeyValue.scss';

const fieldKeyValueComponent = function fieldKeyValueComponent() {
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

export default fieldKeyValueComponent;
