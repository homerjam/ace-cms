class BatchUploadController {
  /* @ngInject */
  constructor($scope, $state, $stateParams, BatchUploadFactory) {
    const vm = this;

    vm.uploadComplete = false;

    vm.isUploading = BatchUploadFactory.isUploading();

    vm.files = BatchUploadFactory.uploader() ? BatchUploadFactory.uploader().files : [];

    BatchUploadFactory.onComplete((uploader, file, entity) => {
      let complete = true;

      uploader.files.forEach((file) => {
        if (file._status !== 'complete') {
          complete = false;
        }
      });

      if (complete) {
        vm.uploadComplete = true;
      }
    });

    vm.cancel = () => {
      BatchUploadFactory.cancel();
    };

    vm.continue = () => {
      $state.go('entityGrid', {
        schemaSlug: $stateParams.schemaSlug,
      });
    };
  }
}

export default BatchUploadController;
