import template from './taxonomy.jade';
import controller from './taxonomy.controller';
import './taxonomy.scss';

const taxonomyComponent = function taxonomyComponent() {
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

export default taxonomyComponent;
