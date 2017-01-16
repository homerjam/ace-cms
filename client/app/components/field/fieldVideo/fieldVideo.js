import angular from 'angular';
import fieldVideoComponent from './fieldVideo.component';
import settingsTemplate from './fieldVideo.settings.jade';

const fieldVideoModule = angular.module('fieldVideo', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('video', {
      name: 'Video',
      settingsTemplate,
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

  .directive('fieldVideo', fieldVideoComponent);

export default fieldVideoModule;
