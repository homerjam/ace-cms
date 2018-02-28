import angular from 'angular';
import fieldVideoComponent from './fieldVideo.component';
import FieldVideoSettingsFactory from './fieldVideo.settings.factory';

const fieldVideoModule = angular.module('fieldVideo', [])

  .config(() => {
    'ngInject';
  })

  .run(($rootScope, FieldFactory, FieldVideoSettingsFactory) => {
    'ngInject';

    FieldFactory.registerField('video', {
      name: 'Video',
      editSettings: FieldVideoSettingsFactory.edit,
      thumbnailField: true,
      gridOptions: {
        style: 'thumbnail',
      },
      modeDisabled: {
        batchEdit: true,
        batchUpload: true,
      },
      toString(value) {
        if (!value) {
          return '';
        }
        return value.original ? value.original.fileName : '';
      },
      thumbnail(value) {
        if (!value) {
          return null;
        }

        const thumbnail = {
          thumbnailType: 'video',
          thumbnailUrl: `${$rootScope.assistUrl}/${$rootScope.assetSlug}/${value.file.name}/thumb.jpg`,
          mimeType: value.original.mimeType,
          fileName: value.file.name + value.file.ext,
          width: value.metadata ? value.metadata.width || 0 : value.width || 0,
          height: value.metadata ? value.metadata.height || 0 : value.height || 0,
        };

        return thumbnail;
      },
    });

  })

  .factory('FieldVideoSettingsFactory', FieldVideoSettingsFactory)

  .directive('fieldVideo', fieldVideoComponent);

export default fieldVideoModule;
