import template from './user.jade';
import controller from './user.controller';
import './user.scss';

const userComponent = function userComponent() {
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

export default userComponent;
