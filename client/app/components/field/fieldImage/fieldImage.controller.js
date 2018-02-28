import cropTemplate from './crop/crop.jade';
import cropController from './crop/crop.controller';
import dziTemplate from './dzi/dzi.jade';

import ImagePrep from '../../../lib/imagePrep';

class FieldImageController {
  /* @ngInject */
  constructor ($rootScope, $scope, $state, $window, $mdDialog, BatchUploadFactory, FileFactory, HelperFactory) {
    const vm = this;

    let mode = 'normal';

    if ($state.is('batchUploadEntity')) {
      mode = 'batchUpload';
    }

    vm.download = () => {
      const originalFileName = vm.fieldModel.value.original.fileName.replace(/^(#|\?)/, '_');
      $window.open(`${$rootScope.assistUrl}/${$rootScope.assetSlug}/file/download/${vm.fieldModel.value.file.name + vm.fieldModel.value.file.ext}/${originalFileName}`);
    };

    vm.dzi = async () => {
      const dziDialog = {
        controller: 'DefaultModalController',
        bindToController: true,
        controllerAs: 'vm',
        template: dziTemplate,
        // targetEvent: event,
        // clickOutsideToClose: true,
        multiple: true,
        locals: {
          image: [
            $rootScope.assistUrl,
            $rootScope.assetSlug,
            vm.fieldModel.value.file.name,
            vm.fieldModel.value.dzi.fileName].join('/'),
        },
      };

      try {
        await $mdDialog.show(dziDialog);

        return true;
      } catch (error) {
        return false;
      }
    };

    vm.crop = async () => {
      const cropDialog = {
        controller: cropController,
        bindToController: true,
        controllerAs: 'vm',
        template: cropTemplate,
        // targetEvent: event,
        // clickOutsideToClose: true,
        multiple: true,
        locals: {
          availableCrops: vm.fieldOptions.settings.crops,
          image: vm.fieldModel.value,
        },
      };

      try {
        const crops = await $mdDialog.show(cropDialog);

        vm.fieldModel.value.crops = crops;

        return true;
      } catch (error) {
        return false;
      }
    };

    vm.preview = () => {
      HelperFactory.mediaPreview([{
        type: 'image',
        src: [$rootScope.assistUrl, $rootScope.assetSlug, 'transform', 'h:1000;q:80', vm.fieldModel.value.file.name + vm.fieldModel.value.file.ext].join('/'),
      }], 0);
    };

    vm.getThumbnail = settings => (vm.fieldModel.value ? [$rootScope.assistUrl, $rootScope.assetSlug, 'transform', settings, vm.fieldModel.value.file.name + vm.fieldModel.value.file.ext].join('/') : null);

    const settings = vm.fieldOptions.settings || {};

    const uploadOptions = {
      slug: $rootScope.assetSlug,
    };

    uploadOptions.resize = {
      maxWidth: settings.maxWidth === 0 ? Infinity : settings.maxWidth || 3000,
      maxHeight: settings.maxHeight === 0 ? Infinity : settings.maxHeight || 2000,
      quality: 95,
    };

    if (settings.dzi) {
      uploadOptions.dzi = {
        size: 256,
        overlap: 0,
      };
    }

    const imageExtensions = 'jpg,jpeg,png,svg';

    vm.flowOptions = {
      target: `${$rootScope.assistUrl}/${$rootScope.assetSlug}/file/upload`,
      query: {
        options: JSON.stringify(uploadOptions),
      },
      headers: {
        Authorization: `Basic ${$rootScope.assistCredentials}`,
      },
      singleFile: mode !== 'batchUpload',
      initFileFn: (flowFile) => {
        // Don't process files, just send to batch uploader
        if (mode === 'batchUpload') {
          return;
        }

        if (flowFile._prepared) {
          return;
        }

        const fileName = flowFile.file.name;

        flowFile.pause();

        const imagePrep = new ImagePrep({
          maxWidth: uploadOptions.resize.maxWidth,
          maxHeight: uploadOptions.resize.maxHeight,
          quality: uploadOptions.resize.quality,
        });

        imagePrep.loadImage(flowFile.file)
          .then((result) => {
            flowFile._prepared = true;

            flowFile.file = result.blob;
            flowFile.file.name = fileName;
            flowFile.size = flowFile.file.size;

            flowFile.bootstrap();

            function upload() {
              flowFile._status = 'uploading';
              flowFile.resume();
            }

            function cancel() {
              flowFile._status = 'canceled';
              flowFile.cancel();
            }

            if (!result.profile) {
              $mdDialog.show(
                $mdDialog.confirm()
                  .multiple(true)
                  .title('Upload Warning')
                  .textContent(`${fileName} has no colour profile, for best results please convert to sRGB`)
                  .ok('Upload')
                  .cancel('Cancel')
              )
                .then(upload, cancel);
              return;
            }

            if (result.profile && result.profile.colorSpace !== 'RGB') {
              $mdDialog.show(
                $mdDialog.confirm()
                  .multiple(true)
                  .title('Upload Warning')
                  .textContent(`${fileName} is in ${result.profile.colorSpace} colour space, for best results please convert to sRGB`)
                  .ok('Upload')
                  .cancel('Cancel')
              )
                .then(upload, cancel);
              return;
            }

            if (result.profile && result.profile.colorSpace === 'RGB' && !/sRGB/i.test(result.profile.description)) {
              $mdDialog.show(
                $mdDialog.confirm()
                  .multiple(true)
                  .title('Upload Warning')
                  .textContent(`${fileName} has ${result.profile.description} profile, for best results please convert to sRGB`)
                  .ok('Upload')
                  .cancel('Cancel')
              )
                .then(upload, cancel);
              return;
            }

            upload();
          });
      },
      events: {
        fileAdded: (flow, file) => {
          const extensions = imageExtensions;

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

          const metadata = {
            width: result.metadata.width,
            height: result.metadata.height,
            format: result.metadata.format,
          };

          vm.fieldModel.value = {
            file: result.file,
            original: result.original,
            dzi: result.metadata.dzi,
            metadata,
          };
        },
        filesSubmitted: (flow, files) => {
          // Trigger a batch upload event, send files
          if (mode === 'batchUpload') {
            if (files.filter(file => file.valid).length) {
              const _files = files.map(file => file.file);

              flow.cancel();

              $scope.$emit('fieldCtrl:batchUpload', vm.fieldOptions, _files);
            }
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
        error: (flow, message, file) => {
          file.cancel();

          $mdDialog.show(
            $mdDialog.alert()
              .title('Upload Error')
              .textContent(message)
              .ok('Close')
          );
        },
      },
    };

  }
}

export default FieldImageController;
