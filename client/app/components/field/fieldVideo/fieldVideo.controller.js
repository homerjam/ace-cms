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
          const _file = JSON.parse(message);

          console.log(_file);

          vm.fieldModel.value = _file;

          // checkZencoderJob();
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

    // function checkZencoderJob () {
    //   $http.get(`${appConfig.apiUrl}/zencode/job`, {
    //     params: {
    //       id: vm.fieldModel.value.metadata.zencoder.job.id,
    //     },
    //   })
    //     .then((response) => {
    //       const job = response.data;

    //       if (/pending|waiting|processing/.test(job.jobState)) {
    //         $timeout(checkZencoderJob, 10000);
    //         return;
    //       }

    //       vm.fieldModel.value.metadata.zencoder = job;
    //     });
    // }

    vm.download = () => {
      $window.open(`${appConfig.apiUrl}/file/download/s3?bucket=${vm.fieldModel.value.metadata.s3.bucket}&key=${vm.fieldModel.value.metadata.s3.src}&filename=${vm.fieldModel.value.original.fileName}&apiToken=${$rootScope.apiToken}`);
    };
  }
}

export default FieldVideoController;
