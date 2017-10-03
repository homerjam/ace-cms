import template from './entity.jade';
import controller from './entity.controller';
import './entity.scss';

const entityComponent = function entityComponent() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {
      mode: '@',
      entity: '=?',
      entities: '=?',
      schema: '=?',
      options: '=?',
      entityForm: '=?',
      modal: '=?',
    },
    template,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default entityComponent;
