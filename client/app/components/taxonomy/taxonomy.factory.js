import angular from 'angular';
import uuid from 'uuid';

const TaxonomyFactory = ($rootScope, $http, $q, $timeout, $log, ConfigFactory, HelperFactory, Slug, appConfig) => {
  'ngInject';

  const service = {};

  $rootScope.$taxonomy = service;

  service.getByKey = key => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${appConfig.apiUrl}/taxonomy?slug=${key}`,
    })
      .then((response) => {
        resolve(response.data);
      }, reject);
  });

  const slugifyTerms = (term) => {
    term.slug = Slug.slugify(term.title);

    (term.terms || []).forEach((term) => {
      slugifyTerms(term);
    });
  };

  service.save = taxonomy => $q((resolve, reject) => {
    taxonomy = angular.fromJson(angular.toJson(taxonomy));

    taxonomy.terms.forEach((term) => {
      slugifyTerms(term);
    });

    const now = JSON.stringify(new Date()).replace(/"/g, '');

    if (!taxonomy.createdBy) {
      taxonomy.createdBy = ConfigFactory.user().id;
      taxonomy.created = now;
    }

    taxonomy.modifiedBy = ConfigFactory.user().id;
    taxonomy.modified = now;

    AdminFactory.update('taxonomy', [taxonomy], taxonomy)
      .then(resolve, reject);
  });

  service.newTerm = () => ({
    id: uuid.v4(),
    title: '',
    slug: '',
  });

  service.addTerm = (taxonomySlug, term) => $q((resolve, reject) => {
    $http({
      method: 'POST',
      url: `${appConfig.apiUrl}/taxonomy/term`,
      data: {
        taxonomySlug,
        term,
      },
    })
      .then(resolve, reject);
  });

  service.editTerm = term => $q((resolve, reject) => {
    $http({
      method: 'PUT',
      url: `${appConfig.apiUrl}/taxonomy/term`,
      params: term,
    })
      .then(resolve, reject);
  });

  service.removeTerm = term => $q((resolve, reject) => {
    $http({
      method: 'DELETE',
      url: `${appConfig.apiUrl}/taxonomy/term`,
      params: term,
    })
      .then(resolve, reject);
  });

  return service;
};

export default TaxonomyFactory;

