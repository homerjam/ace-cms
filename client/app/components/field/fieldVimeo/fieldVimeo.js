import angular from 'angular';
import fieldVimeoComponent from './fieldVimeo.component';

const fieldVimeoModule = angular.module('fieldVimeo', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('vimeo', {
      name: 'Vimeo',
      thumbnailField: true,
      gridOptions: {
        style: 'thumbnail',
        minWidth: 132,
      },
      toString(value) {
        if (!value || !value.url) {
          return '';
        }
        return value.url;
      },
      thumbnail(value) {
        if (!value || !value.video) {
          return null;
        }

        return {
          thumbnailType: 'oembed',
          thumbnailUrl: value.video.thumbnail.url,
          width: value.video.thumbnail.width,
          height: value.video.thumbnail.height,
        };
      },
    });

  })

  .directive('fieldVimeo', fieldVimeoComponent);

export default fieldVimeoModule;
