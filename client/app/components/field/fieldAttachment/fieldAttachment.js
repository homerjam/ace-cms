import angular from 'angular';
import fieldAttachmentComponent from './fieldAttachment.component';

const fieldAttachmentModule = angular.module('fieldAttachment', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('attachment', {
      name: 'Attachment',
      modeDisabled: {
        batchEdit: true,
        batchUpload: true,
      },
      toString(value) {
        return value.original ? value.original.fileName : '';
      },
    });

  })

  .directive('fieldAttachment', fieldAttachmentComponent);

export default fieldAttachmentModule;
