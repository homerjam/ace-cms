import template from './fieldEmbedly.jade';
import controller from './fieldEmbedly.controller';
import './fieldEmbedly.scss';

const fieldEmbedlyComponent = function fieldEmbedlyComponent() {
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

export default fieldEmbedlyComponent;
