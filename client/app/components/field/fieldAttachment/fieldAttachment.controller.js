class FieldAttachmentController {
  /* @ngInject */
  constructor ($rootScope, $scope, $window, $http, $timeout, $location, $mdDialog, appConfig) {
    const vm = this;

    const attachmentExtensions = 'pdf,doc,docx,csv,xls,txt';

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
          const extensions = attachmentExtensions;

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

    vm.download = () => {
      $window.open(`${appConfig.apiUrl}/file/download/s3?bucket=${vm.fieldModel.value.metadata.s3.bucket}&key=${vm.fieldModel.value.metadata.s3.src}&filename=${vm.fieldModel.value.original.fileName}`);
    };

    vm.fileUrl = async () => {
      const apiToken = (await $http.get(`${appConfig.apiUrl}/token`, { params: { slug: appConfig.slug, role: 'guest' } })).data.token;

      const apiFileUrl = `${appConfig.apiUrl}/file/s3/${vm.fieldModel.value.metadata.s3.bucket}/${vm.fieldModel.value.metadata.s3.src}/${vm.fieldModel.value.original.fileName}?apiToken=${apiToken}`;

      const locationUrl = `${$location.protocol()}://${$location.host()}${[80, 443].indexOf($location.port()) === -1 ? `:${$location.port()}` : ''}`;

      const fileUrl = /https?:\/\//.test(apiFileUrl) ? apiFileUrl : locationUrl + apiFileUrl;

      $mdDialog.show(
        $mdDialog.prompt()
          .title('File URL')
          .placeholder('File URL')
          .ariaLabel('File URL')
          .initialValue(fileUrl)
          .ok('Close')
      );
    };
  }
}

export default FieldAttachmentController;
