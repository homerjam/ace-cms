import angular from 'angular';

const EntityGridFactory = ($http, $q, apiPrefix) => {
  'ngInject';

  const service = {
    states: {},
    lastResult: {
      total: 0,
      bookmark: null,
      results: [],
    },
  };

  service.search = params => $q((resolve, reject) => {
    const defaultParams = {
      q: '*:*',
      sort: '<score>',
      limit: 100,
      include_docs: true,
    };

    $http({
      method: 'GET',
      url: apiPrefix + '/entities/search',
      params: angular.extend(defaultParams, params),
    })
      .then((response) => {
        if (!response.data.error) {
          const result = {
            total: response.data.total_rows,
            bookmark: response.data.bookmark,
            results: response.data.rows.map(row => row.doc),
          };

          resolve(result);
        } else {
          resolve({});
        }
      }, reject);
  });

  return service;
};

export default EntityGridFactory;
