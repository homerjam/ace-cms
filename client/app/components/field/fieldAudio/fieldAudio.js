import angular from 'angular';
import fieldAudioComponent from './fieldAudio.component';
import settingsTemplate from './fieldAudio.settings.jade';

const fieldAudioModule = angular.module('fieldAudio', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('audio', {
      name: 'Audio',
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

  .directive('fieldAudio', fieldAudioComponent);

export default fieldAudioModule;
