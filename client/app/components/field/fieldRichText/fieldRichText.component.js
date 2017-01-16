import template from './fieldRichText.jade';
import controller from './fieldRichText.controller';
import './fieldRichText.scss';

const fieldRichTextComponent = function fieldRichTextComponent() {
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

export default fieldRichTextComponent;
