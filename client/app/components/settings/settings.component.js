import template from './settings.jade';
import controller from './settings.controller';
import './settings.scss';

const settingsComponent = function settingsComponent() {
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

export default settingsComponent;
