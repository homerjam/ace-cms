import angular from 'angular';
import Flow from '@flowjs/flow.js';

import ImagePrep from '../../lib/imagePrep';

const BatchUploadFactory = ($rootScope, $document, $timeout, $mdDialog, FileFactory, EntityFactory) => {
  'ngInject';

  const service = {};

  const extensions = {
    image: 'jpg,jpeg,png,svg',
  };

  let isUploading = false;
  let flow;

  let onStart = () => {};
  let onProgress = () => {};
  let onComplete = () => {};

  service.onStart = fn => onStart = fn;
  service.onProgress = fn => onProgress = fn;
  service.onComplete = fn => onComplete = fn;

  service.init = (entity, files, schema, field) => {
    service.cancel();

    isUploading = true;

    const uploadOptions = {
      slug: $rootScope.slug,
    };

    const settings = field.settings || {};

    if (field.fieldType === 'image') {
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
    }

    flow = new Flow({
      target: [$rootScope.assistUrl, 'upload'].join('/'),
      query: {
        options: JSON.stringify(uploadOptions),
      },
      headers: {
        Authorization: `Basic ${$rootScope.assistCredentials}`,
      },
      initFileFn: (file) => {
        const fileName = file.file.name;

        if (file._prepared) {
          return;
        }

        file.pause();

        const imagePrep = new ImagePrep({
          maxWidth: uploadOptions.resize.maxWidth,
          maxHeight: uploadOptions.resize.maxHeight,
          quality: uploadOptions.resize.quality,
        });

        imagePrep.loadImage(file.file)
          .then((result) => {
            file._prepared = true;

            file.file = result.blob;
            file.file.name = fileName;
            file.size = file.file.size;

            file.bootstrap();

            function upload() {
              file._status = 'uploading';
              file.resume();
            }

            function cancel() {
              file._status = 'canceled';
              // file.cancel();
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
    });

    flow.on('fileAdded', (file) => {
      const valid = extensions[field.fieldType].indexOf(file.getExtension()) > -1;

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
    });

    flow.on('fileSuccess', (file, message) => {
      const info = JSON.parse(message);

      FileFactory.createFile(info)
        .then((newFile) => {
          const _entity = angular.copy(entity);

          if (!_entity.fields[field.slug]) {
            _entity.fields[field.slug] = {};
          }

          _entity.fields[field.slug].value = newFile;

          EntityFactory.createEntity(schema.slug, _entity)
            .then(() => {
              file._status = 'complete';

              onComplete(flow, file, _entity);
            });
        });
    });

    flow.on('uploadStart', () => {
      onStart(flow);
    });

    flow.on('complete', () => {
      // onComplete(flow);
    });

    flow.on('progress', () => {
      onProgress(flow);
    });

    flow.on('error', (message, file) => {
      file._status = 'error';

      $mdDialog.show(
        $mdDialog.alert()
          .title('Upload Error')
          .textContent(message)
          .ok('Close')
      );
    });

    files.forEach((file) => {
      flow.addFile(file);
    });
  };

  service.cancel = () => {
    if (flow) {
      flow.cancel();
      flow = null;
    }

    isUploading = false;
  };

  service.uploader = () => flow;

  service.isUploading = () => isUploading;

  return service;
};

export default BatchUploadFactory;
