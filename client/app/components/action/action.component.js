import controller from './action.controller';
import './action.scss';

const actionComponent = function actionComponent() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {},
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default actionComponent;
