import angular from 'angular';
import 'angular-cropify/angular-cropify';
import 'angular-cropify/angular-cropify.css';
import fieldImageComponent from './fieldImage.component';
import FieldImageSettingsFactory from './fieldImage.settings.factory';

const fieldImageModule = angular.module('fieldImage', [
  'hj.cropify',
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
        if (!value) {
          return '';
        }
        return value.original ? value.original.fileName : '';
      },
      thumbnail(value) {
        if (!value) {
          return null;
        }

        const fileName = value.fileName || (value.name || value.file.name) + (value.ext || value.file.ext);

        const thumbnail = {
          thumbnailType: 'image',
          thumbnailUrl: `${$rootScope.assistUrl}/${$rootScope.assetSlug}/${fileName}`,
          fileName,
          name: value.name || value.file.name,
          ext: value.ext || value.file.ext,
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
