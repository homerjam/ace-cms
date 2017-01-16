import angular from 'angular';

const FileFactory = ($http, $q, $log, AdminFactory, apiPrefix) => {
  'ngInject';

  const service = {};

  const observerCallbacks = [];

  service.registerObserverCallback = (callback) => {
    observerCallbacks.push(callback);
  };

  const notifyObservers = () => {
    observerCallbacks.forEach((callback) => {
      callback();
    });
  };

  service.search = options => $q((resolve, reject) => {
    const params = {
      q: options.q || '*:*',
      sort: options.sort || '<score>',
      limit: options.limit || 200,
      include_docs: true,
    };

    if (options.bookmark) {
      params.bookmark = options.bookmark;
    }

    $http({
      method: 'GET',
      url: `${apiPrefix}/file/search`,
      params,
    })
      .then((response) => {
        if (!response.data.error) {
          const result = {
            total: response.data.total_rows,
            bookmark: response.data.bookmark,
            results: response.data.rows.map(row => row.doc),
          };

          result.results = result.results.map((doc) => {
            doc.fileSize = doc.fileSize || doc.original.fileSize;
            return doc;
          });

          resolve(result);
        } else {
          resolve({});
        }
      }, reject);
  });

  service.createFile = file => $q((resolve, reject) => {
    file = angular.copy(file);

    file.type = 'file';
    file.uploadedBy = AdminFactory.getCurrentUser()._id;
    file.uploaded = JSON.stringify(new Date()).replace(/"/g, '');

    $http({
      method: 'POST',
      url: `${apiPrefix}/file`,
      data: {
        file,
      },
    })
      .then((response) => {
        file.id = response.data.id;

        resolve(file);
      }, reject)
      .finally(notifyObservers);
  });

  service.deleteFiles = files => $q((resolve, reject) => {
    files = !angular.isArray(files) ? [files] : files;

    files = files.map(file => file._id);

    $http({
      method: 'DELETE',
      url: `${apiPrefix}/file`,
      data: {
        files,
      },
    })
      .then((response) => {
        resolve(response.data);
      }, reject)
      .finally(notifyObservers);
  });

  service.emptyTrash = () => $q((resolve, reject) => {
    $http({
      method: 'DELETE',
      url: `${apiPrefix}/file/trashed`,
    })
      .then((response) => {
        resolve(response.data);
      }, reject)
      .finally(notifyObservers);
  });

  return service;
};

export default FileFactory;
