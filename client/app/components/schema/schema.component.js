import template from './schema.jade';
import controller from './schema.controller';
import './schema.scss';

const schemaComponent = function schemaComponent() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {},
    template,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default schemaComponent;
