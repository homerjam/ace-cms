import template from './entityGrid.jade';
import controller from './entityGrid.controller';
import './entityGrid.scss';

const entityGridComponent = function entityGridComponent() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {
      mode: '@',
      schema: '=?',
      selected: '=?',
    },
    template,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default entityGridComponent;
