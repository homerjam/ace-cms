import angular from 'angular';
import fieldVimeoComponent from './fieldVimeo.component';
import settingsTemplate from './fieldVimeo.settings.jade';

const fieldVimeoModule = angular.module('fieldVimeo', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('vimeo', {
      name: 'Vimeo',
      settingsTemplate,
      thumbnailField: true,
      gridOptions: {
        style: 'thumbnail',
      },
      toString(value) {
        if (!value || !value.url) {
          return '';
        }
        return value.url;
      },
      thumbnail(value) {
        if (!value.video) {
          return null;
        }

        return {
          thumbnailType: 'video',
          thumbnailUrl: value.video.thumbnail.url,
          width: value.video.thumbnail.width,
          height: value.video.thumbnail.height,
        };
      },
    });

  })

  .directive('fieldVimeo', fieldVimeoComponent);

export default fieldVimeoModule;
