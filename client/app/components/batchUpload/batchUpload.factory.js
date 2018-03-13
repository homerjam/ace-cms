import angular from 'angular';
import Flow from '@flowjs/flow.js';

import ImagePrep from '../../lib/imagePrep';

const BatchUploadFactory = ($rootScope, $document, $timeout, $mdDialog, EntityFactory) => {
  'ngInject';

  const service = {};

  const extensions = {
    image: 'jpg,jpeg,png,svg',
  };

  let flow;
  let isUploading = false;
  let observers = {
    start: [],
    progress: [],
    complete: [],
  };

  const onStart = (...args) => {
    observers.start.forEach(fn => fn(...args));
  };
  const onProgress = (...args) => {
    observers.progress.forEach(fn => fn(...args));
  };
  const onComplete = (...args) => {
    observers.complete.forEach(fn => fn(...args));
  };

  service.onStart = fn => observers.start.push(fn);
  service.onProgress = fn => observers.progress.push(fn);
  service.onComplete = fn => observers.complete.push(fn);

  service.init = (entity, files, schema, field) => {
    observers = {
      start: [],
      progress: [],
      complete: [],
    };

    service.cancel();

    isUploading = true;

    const uploadOptions = {
      slug: $rootScope.assetSlug,
    };

    const settings = field.settings || {};

    if (field.type === 'image') {
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
      target: `${$rootScope.assistUrl}/${$rootScope.assetSlug}/file/upload`,
      query: {
        options: JSON.stringify(uploadOptions),
      },
      headers: {
        Authorization: `Basic ${$rootScope.assistCredentials}`,
      },
      initFileFn: (flowFile) => {
        if (field.type !== 'image') {
          return;
        }

        if (flowFile._prepared) {
          return;
        }

        const fileName = flowFile.file.name;
        const ext = flowFile.getExtension();

        if (/^(svg)$/i.test(ext)) {
          return;
        }

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

            // function cancel() {
            //   flowFile._status = 'canceled';
            //   // flowFile.cancel();
            // }

            if (
              !result.profile
              || (result.profile && result.profile.colorSpace !== 'RGB')
              || (result.profile && result.profile.colorSpace === 'RGB' && !/sRGB/i.test(result.profile.description))
            ) {
              flowFile._validProfile = false;
            } else {
              flowFile._validProfile = true;
            }

            // if (!result.profile) {
            //   $mdDialog.show(
            //     $mdDialog.confirm()
            //       .multiple(true)
            //       .title('Upload Warning')
            //       .textContent(`${fileName} has no colour profile, for best results please convert to sRGB`)
            //       .ok('Upload')
            //       .cancel('Cancel')
            //   )
            //     .then(upload, cancel);
            //   return;
            // }

            // if (result.profile && result.profile.colorSpace !== 'RGB') {
            //   $mdDialog.show(
            //     $mdDialog.confirm()
            //       .multiple(true)
            //       .title('Upload Warning')
            //       .textContent(`${fileName} is in ${result.profile.colorSpace} colour space, for best results please convert to sRGB`)
            //       .ok('Upload')
            //       .cancel('Cancel')
            //   )
            //     .then(upload, cancel);
            //   return;
            // }

            // if (result.profile && result.profile.colorSpace === 'RGB' && !/sRGB/i.test(result.profile.description)) {
            //   $mdDialog.show(
            //     $mdDialog.confirm()
            //       .multiple(true)
            //       .title('Upload Warning')
            //       .textContent(`${fileName} has ${result.profile.description} profile, for best results please convert to sRGB`)
            //       .ok('Upload')
            //       .cancel('Cancel')
            //   )
            //     .then(upload, cancel);
            //   return;
            // }

            upload();
          });
      },
    });

    flow.on('fileAdded', (file) => {
      const valid = extensions[field.type].indexOf(file.getExtension()) > -1;

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
      const result = JSON.parse(message);

      const _entity = angular.copy(entity);

      if (!_entity.fields[field.slug]) {
        _entity.fields[field.slug] = {};
      }

      if (field.type === 'image') {
        const metadata = {
          width: result.metadata.width,
          height: result.metadata.height,
          format: result.metadata.format,
        };

        _entity.fields[field.slug].value = {
          file: result.file,
          original: result.original,
          dzi: result.metadata.dzi,
          metadata,
        };
      }

      EntityFactory.createEntity(schema.slug, _entity)
        .then(() => {
          file._status = 'complete';

          onComplete(flow, file, _entity);
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

    flow.upload();
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
