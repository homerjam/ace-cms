class FieldAudioController {
  /* @ngInject */
  constructor ($rootScope, $scope, $window, $http, $timeout, $mdDialog, appConfig) {
    const vm = this;

    const audioExtensions = 'mp3,aac,wav,flac,ogg,wma';

    vm.flowOptions = {
      target: `${appConfig.apiUrl}/upload`,
      headers: {
        'X-Api-Token': $rootScope.apiToken,
      },
      query: {
        options: JSON.stringify(vm.fieldOptions),
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
          const _file = JSON.parse(message);

          vm.fieldModel.value = _file;

          checkZencoderJob();
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
          $mdDialog.show(
            $mdDialog.alert()
              .title('Upload Error')
              .textContent(error.message || error)
              .ok('Close')
          );
        },
      },
    };

    function checkZencoderJob () {
      $http.get(`${appConfig.apiUrl}/zencode/job`, {
        params: {
          id: vm.fieldModel.value.metadata.zencoder.job.id,
        },
      })
        .then((response) => {
          const job = response.data;

          if (/pending|waiting|processing/.test(job.jobState)) {
            $timeout(checkZencoderJob, 10000);
            return;
          }

          vm.fieldModel.value.metadata.zencoder = job;
        });
    }

    vm.download = () => {
      $window.open(`${appConfig.apiUrl}/file/download/s3?bucket=${vm.fieldModel.value.metadata.s3.bucket}&key=${vm.fieldModel.value.metadata.s3.src}&filename=${vm.fieldModel.value.original.fileName}&apiToken=${$rootScope.apiToken}`);
    };
  }
}

export default FieldAudioController;
