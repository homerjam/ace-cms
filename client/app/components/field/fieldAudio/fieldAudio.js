import angular from 'angular';
import fieldAudioComponent from './fieldAudio.component';
import FieldAudioSettingsFactory from './fieldAudio.settings.factory';

const fieldAudioModule = angular.module('fieldAudio', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory, FieldAudioSettingsFactory) => {
    'ngInject';

    FieldFactory.registerField('audio', {
      name: 'Audio',
      editSettings: FieldAudioSettingsFactory.edit,
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
    });

  })

  .factory('FieldAudioSettingsFactory', FieldAudioSettingsFactory)

  .directive('fieldAudio', fieldAudioComponent);

export default fieldAudioModule;
