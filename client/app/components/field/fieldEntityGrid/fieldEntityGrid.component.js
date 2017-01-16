import template from './fieldEntityGrid.jade';
import controller from './fieldEntityGrid.controller';
import './fieldEntityGrid.scss';

const fieldEntityGridComponent = function fieldEntityGridComponent() {
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

export default fieldEntityGridComponent;
