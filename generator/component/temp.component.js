import template from './<%= name %>.jade';
import controller from './<%= name %>.controller';
import './<%= name %>.scss';

const <%= name %>Component = function <%= name %>Component() {
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

export default <%= name %>Component;
