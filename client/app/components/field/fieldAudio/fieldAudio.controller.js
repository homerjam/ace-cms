class FieldAudioController {
  /* @ngInject */
  constructor ($rootScope, $scope, $window, $http, $timeout, $mdDialog, appConfig) {
    const vm = this;

    const audioExtensions = 'mp3,aac,wav,flac,ogg,wma';

    const uploadOptions = vm.fieldOptions;

    vm.flowOptions = {
      target: `${$rootScope.assistUrl}/${$rootScope.assetSlug}/file/upload`,
      query: {
        options: JSON.stringify(uploadOptions),
      },
      headers: {
        Authorization: `Basic ${$rootScope.assistCredentials}`,
      },
      singleFile: true,
      events: {
        fileAdded: (flow, file) => {
          const extensions = audioExtensions;

          const valid = extensions.indexOf(file.getExtension()) > -1;

          if (!valid) {
            $mdDialog.show(
              $mdDialog.alert()
                .title('Upload Error')
                .textContent(`${file.name} is not a valid file type.`)
                .ok('Close')
            );
          }

          file.valid = valid;

          return valid;
        },
        fileSuccess: (flow, file, message) => {
          const result = JSON.parse(message);

          const audioStream = result.metadata.streams.filter(stream => stream.codec_type === 'audio')[0];

          const metadata = {
            duration: Number(result.metadata.format.duration) * 1000,
            format: result.file.ext.replace('.', ''),
          };

          vm.fieldModel.value = {
            file: result.file,
            original: result.original,
            metadata,
          };
        },
        filesSubmitted: (flow, files) => {
          if (files.filter(file => file.valid).length) {
            flow.upload();
          }
        },
        uploadStart: () => {
          vm.uploading = true;
        },
        complete: () => {
          vm.uploading = false;
        },
        progress: (flow) => {
          vm.progress = Math.round(flow.progress() * 100);
        },
        error: (flow, error) => {
          flow.cancel();

          $mdDialog.show(
            $mdDialog.alert()
              .title('Upload Error')
              .textContent(error.message || error)
              .ok('Close')
          );
        },
      },
    };

    vm.download = () => {
      $window.open(`${appConfig.assistUrl}/${$rootScope.assetSlug}/file/download/${vm.fieldModel.value.file.name}${vm.fieldModel.value.file.ext}/${vm.fieldModel.value.original.fileName}`);
    };
  }
}

export default FieldAudioController;
