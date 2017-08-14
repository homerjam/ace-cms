import angular from 'angular';
import fieldEmbedlyComponent from './fieldEmbedly.component';

const fieldEmbedlyModule = angular.module('fieldEmbedly', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('embedly', {
      name: 'Embed.ly',
      thumbnailField: true,
      gridOptions: {
        style: 'thumbnail',
      },
      modeDisabled: {
        batchEdit: true,
        batchUpload: true,
      },
      toString(value) {
        if (!value || !value.url) {
          return '';
        }
        return value.url;
      },
      thumbnail(value) {
        if (!value || !value.oembed) {
          return null;
        }

        const thumbnail = {
          thumbnailType: 'oembed',
          thumbnailUrl: value.oembed.thumbnail_url,
          width: value.oembed.thumbnail_width,
          height: value.oembed.thumbnail_height,
          oembed: value.oembed,
        };

        if (thumbnail.oembed) {
          thumbnail.oembed.ratio = value.oembed.width / value.oembed.height;
        }

        return thumbnail;
      },
    });

  })

  .directive('fieldEmbedly', fieldEmbedlyComponent);

export default fieldEmbedlyModule;
