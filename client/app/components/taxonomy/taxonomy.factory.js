import _ from 'lodash';
import uuid from 'uuid';
import taxonomyModalTemplate from './taxonomy.modal.jade';

const TaxonomyFactory = ($rootScope, $http, $q, $timeout, $mdDialog, $log, ConfigFactory, HelperFactory, Slug, appConfig) => {
  'ngInject';

  const service = {};

  $rootScope.$taxonomy = service;

  const defaultTaxonomy = {
    name: '',
    slug: '',
    terms: [],
  };

  const slugPattern = (existing, slug) => (({
    test: function (existing, slug, value) {
      const validRegExp = /^[^\d][a-zA-Z0-9]*$/;
      const existsRegExp = new RegExp(`^(${existing.join('|')})$`);
      return validRegExp.test(value) && (!existsRegExp.test(value) || value === slug);
    }.bind(null, existing, slug),
  }));

  const slugify = (item) => {
    item.slug = _.camelCase(item.name);
  };

  service.editTaxonomy = async (taxonomySlug, event) => {
    const createNew = !taxonomySlug;

    let taxonomy = taxonomySlug ? ConfigFactory.getTaxonomy(taxonomySlug) : {};

    let config = ConfigFactory.getConfig();

    const taxonomyDialog = {
      controller: 'DefaultModalController',
      bindToController: true,
      controllerAs: 'vm',
      template: taxonomyModalTemplate,
      targetEvent: event,
      clickOutsideToClose: true,
      locals: {
        taxonomy: _.merge({}, defaultTaxonomy, taxonomy),
        createNew,
        slugPattern: slugPattern(config.taxonomies.map(taxonomy => taxonomy.slug), taxonomy ? taxonomy.slug : null),
        slugify,
      },
    };

    try {
      taxonomy = await $mdDialog.show(taxonomyDialog);
    } catch (error) {
      return false;
    }

    if (createNew) {
      config = (await $http.post(`${appConfig.apiUrl}/taxonomy`, { taxonomy })).data;
    } else {
      config = (await $http.put(`${appConfig.apiUrl}/taxonomy`, { taxonomy })).data;
    }

    ConfigFactory.setConfig(config);

    return taxonomy;
  };

  service.deleteTaxonomy = async (taxonomy, event) => {
    const confirmDialog = $mdDialog.confirm({
      title: 'Delete Taxonomy?',
      textContent: `Are you sure you want to delete ${taxonomy.name}?`,
      targetEvent: event,
      ok: 'Confirm',
      cancel: 'Cancel',
    });

    try {
      await $mdDialog.show(confirmDialog);
    } catch (error) {
      return false;
    }

    const taxonomySlugs = [taxonomy.slug];

    const config = (await $http.delete(`${appConfig.apiUrl}/taxonomy`, { data: { taxonomySlugs } })).data;

    ConfigFactory.setConfig(config);

    return true;
  };

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

