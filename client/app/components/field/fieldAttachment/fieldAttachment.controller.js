class FieldAttachmentController {
  /* @ngInject */
  constructor ($scope, $window, $http, $timeout, $location, $mdDialog, apiPrefix) {
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

    vm.downloadUrl = () => {
      const downloadUrl = `${apiPrefix}/file/download/s3/${vm.fieldModel.original.fileName}?bucket=${vm.fieldModel.metadata.s3.bucket}&key=${vm.fieldModel.metadata.s3.src}`;

      // $mdDialog.show(
      //   $mdDialog.prompt()
      //     .title('Download URL')
      //     .placeholder('Download URL')
      //     .ariaLabel('Download URL')
      //     .initialValue(downloadUrl)
      //     .ok('Close')
      // );

      $mdDialog.show(
        $mdDialog.alert()
          .title('Download URL')
          .textContent(`${$location.protocol()}://${$location.host()}${[80, 443].indexOf($location.port()) === -1 ? `:${$location.port()}` : ''}${downloadUrl}`)
          .ok('Close')
      );
    };
  }
}

export default FieldAttachmentController;
