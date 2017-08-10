import uuid from 'uuid';

const TaxonomyFactory = ($rootScope, $http, $q, $timeout, $log, ConfigFactory, HelperFactory, Slug, appConfig) => {
  'ngInject';

  const service = {};

  $rootScope.$taxonomy = service;

  service.getNewTerm = () => ({
    id: uuid.v4(),
    title: '',
    slug: '',
    terms: [],
    parents: [],
  });

  service.updateTaxonomy = taxonomy => $http.put(`${appConfig.apiUrl}/taxonomy`, { taxonomy });

  service.createTerm = async (taxonomySlug, term) => {
    const config = (await $http.post(`${appConfig.apiUrl}/taxonomy/term`, { taxonomySlug, term })).data;
    ConfigFactory.setConfig(config);
  };

  service.updateTerm = term => $http.put(`${appConfig.apiUrl}/taxonomy/term`, { term });

  service.deleteTerm = term => $http.delete(`${appConfig.apiUrl}/taxonomy/term`, { data: { term } });

  return service;
};

export default TaxonomyFactory;

