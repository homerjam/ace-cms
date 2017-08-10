import template from './users.jade';
import controller from './users.controller';
import './users.scss';

const usersComponent = function usersComponent() {
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

export default usersComponent;
