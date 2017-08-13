import angular from 'angular';
import angularCropify from 'angular-cropify';
import fieldImageComponent from './fieldImage.component';
import FieldImageSettingsFactory from './fieldImage.settings.factory';

const fieldImageModule = angular.module('fieldImage', [
  angularCropify,
])

  .config(() => {
    'ngInject';
  })

  .run(($rootScope, FieldFactory, FieldImageSettingsFactory) => {
    'ngInject';

    FieldFactory.registerField('image', {
      name: 'Image',
      editSettings: FieldImageSettingsFactory.edit,
      thumbnailField: true,
      gridOptions: {
        style: 'thumbnail',
      },
      modeDisabled: {
        batchEdit: true,
      },
      toString(value) {
        return value.original ? value.original.fileName : '';
      },
      thumbnail(value) {
        const thumbnail = {
          thumbnailType: 'image',
          thumbnailUrl: [$rootScope.assistUrl, $rootScope.slug, value.fileName].join('/'),
          mimeType: value.mimeType,
          location: value.location,
          fileName: value.fileName,
          width: value.metadata ? value.metadata.width || 0 : value.width || 0,
          height: value.metadata ? value.metadata.height || 0 : value.height || 0,
        };
        if (value.crops) {
          thumbnail.crops = value.crops;
        }
        if (value.dzi) {
          thumbnail.dzi = value.dzi;
        }
        return thumbnail;
      },
    });

  })

  .factory('FieldImageSettingsFactory', FieldImageSettingsFactory)

  .directive('fieldImage', fieldImageComponent);

export default fieldImageModule;
