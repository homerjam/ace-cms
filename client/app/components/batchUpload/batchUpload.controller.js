class BatchUploadController {
  /* @ngInject */
  constructor($scope, $state, $stateParams, BatchUploadFactory) {
    const vm = this;

    vm.uploadComplete = false;

    vm.isUploading = BatchUploadFactory.isUploading();

    vm.files = BatchUploadFactory.uploader() ? BatchUploadFactory.uploader().files : [];

    BatchUploadFactory.onComplete((uploader) => {
      if (!uploader.files.filter(file => file._status !== 'complete').length) {
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
