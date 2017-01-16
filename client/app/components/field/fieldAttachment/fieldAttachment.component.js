import template from './fieldAttachment.jade';
import controller from './fieldAttachment.controller';
import './fieldAttachment.scss';

const fieldAttachmentComponent = function fieldAttachmentComponent() {
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

export default fieldAttachmentComponent;
