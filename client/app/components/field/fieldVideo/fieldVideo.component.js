import template from './fieldVideo.jade';
import controller from './fieldVideo.controller';
import './fieldVideo.scss';

const fieldVideoComponent = function fieldVideoComponent() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {
      fieldOptions: '=',
      fieldModel: '=',
      fieldApply: '=?',
    },
    template,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default fieldVideoComponent;
