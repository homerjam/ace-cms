import angular from 'angular';
import fieldVideoComponent from './fieldVideo.component';
import FieldVideoSettingsFactory from './fieldVideo.settings.factory';

const fieldVideoModule = angular.module('fieldVideo', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory, FieldVideoSettingsFactory) => {
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
        return value.original ? value.original.fileName : '';
      },
      thumbnail(value) {
        let thumbnailUrl;
        let width;
        let height;
        try {
          thumbnailUrl = value.metadata.zencoder.thumbnail.url;
          width = value.metadata.zencoder.thumbnail.width;
          height = value.metadata.zencoder.thumbnail.height;
        } catch (error) {
          //
        }
        return {
          thumbnailType: 'video',
          thumbnailUrl,
          width,
          height,
        };
      },
    });

  })

  .factory('FieldVideoSettingsFactory', FieldVideoSettingsFactory)

  .directive('fieldVideo', fieldVideoComponent);

export default fieldVideoModule;
