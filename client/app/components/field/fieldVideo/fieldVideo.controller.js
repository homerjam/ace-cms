class FieldVideoController {
  /* @ngInject */
  constructor ($rootScope, $scope, $window, $http, $timeout, $mdDialog, appConfig) {
    const vm = this;

    const videoExtensions = 'gif,mp4,avi,mov,webm,mkv,flv,ogg,ogv,qt,wmv,mpg,m4v';

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
          const extensions = videoExtensions;

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

          const videoStream = result.metadata.streams.filter(stream => stream.codec_type === 'video')[0];
          const audioStream = result.metadata.streams.filter(stream => stream.codec_type === 'audio')[0];

          const metadata = {
            duration: Number(result.metadata.format.duration) * 1000,
            width: videoStream.width,
            height: videoStream.height,
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

export default FieldVideoController;
