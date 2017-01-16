class BatchUploadController {
  /* @ngInject */
  constructor($scope, $state, BatchUploadFactory) {
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
        $state.go('entityGrid', {
          schemaSlug: entity.schema,
        });
      }
    });

    vm.cancel = () => {
      BatchUploadFactory.cancel();
    };
  }
}

export default BatchUploadController;
