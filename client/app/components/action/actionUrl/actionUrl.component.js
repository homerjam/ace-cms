import template from './actionUrl.jade';
import controller from './actionUrl.controller';
import './actionUrl.scss';

const actionUrlComponent = function actionUrlComponent() {
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

export default actionUrlComponent;
