import angular from 'angular';
import uuid from 'uuid';

const TaxonomyFactory = ($rootScope, $http, $q, $timeout, $log, AdminFactory, HelperFactory, Slug, apiPrefix) => {
  'ngInject';

  const service = {};

  $rootScope.$taxonomy = service;

  service.getByKey = key => $q((resolve, reject) => {
    $http({
      method: 'GET',
      url: `${apiPrefix}/taxonomy?slug=${key}`,
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
      taxonomy.createdBy = AdminFactory.getCurrentUser()._id;
      taxonomy.created = now;
    }

    taxonomy.modifiedBy = AdminFactory.getCurrentUser()._id;
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
      url: `${apiPrefix}/taxonomy/term`,
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
      url: `${apiPrefix}/taxonomy/term`,
      params: term,
    })
      .then(resolve, reject);
  });

  service.removeTerm = term => $q((resolve, reject) => {
    $http({
      method: 'DELETE',
      url: `${apiPrefix}/taxonomy/term`,
      params: term,
    })
      .then(resolve, reject);
  });

  return service;
};

export default TaxonomyFactory;

