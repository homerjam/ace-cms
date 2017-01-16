import angular from 'angular';
import fieldAttachmentComponent from './fieldAttachment.component';
import settingsTemplate from './fieldAttachment.settings.jade';

const fieldAttachmentModule = angular.module('fieldAttachment', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('attachment', {
      name: 'Attachment',
      settingsTemplate,
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
