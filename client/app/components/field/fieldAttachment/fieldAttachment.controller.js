class FieldAttachmentController {
  /* @ngInject */
  constructor ($scope, $window, $http, $timeout, $mdDialog, apiPrefix) {
    const vm = this;

    const attachmentExtensions = 'pdf,doc,docx,csv,xls,txt';

    vm.flowOptions = {
      target: `${apiPrefix}/upload`,
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

          vm.fieldModel = _file;

          $scope.$apply();
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
        error: (flow, message) => {
          $mdDialog.show(
            $mdDialog.alert()
              .title('Upload Error')
              .textContent(message)
              .ok('Close')
          );
        },
      },
    };

    vm.download = () => {
      $window.open(`${apiPrefix}/file/download/s3?bucket=${vm.fieldModel.metadata.s3.bucket}&key=${vm.fieldModel.metadata.s3.src}&filename=${vm.fieldModel.original.fileName}`);
    };
  }
}

export default FieldAttachmentController;
