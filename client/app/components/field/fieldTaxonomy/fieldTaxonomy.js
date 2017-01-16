import _ from 'lodash';
import angular from 'angular';
import fieldTaxonomyComponent from './fieldTaxonomy.component';
import settingsTemplate from './fieldTaxonomy.settings.jade';

const fieldTaxonomyModule = angular.module('fieldTaxonomy', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory) => {
    'ngInject';

    FieldFactory.registerField('taxonomy', {
      name: 'Taxonomy',
      settingsTemplate,
      toString(value) {
        if (!value.terms) {
          return '';
        }

        if (_.isArray(value.terms)) {
          return value.terms.map(term => term.title).join(', ');
        }

        if (_.isObject(value.terms)) {
          return value.terms.title;
        }

        return value || '';
      },
      toDb(value, settings) {
        let terms = value.terms || [];

        if (!_.isArray(terms)) {
          terms = [terms];
        }

        return {
          taxonomy: settings.taxonomy,
          type: 'taxonomy',
          terms,
        };
      },
      fromDb(value, settings) {
        if (!settings.multiple && value && value.terms && value.terms[0]) {
          value.terms = value.terms[0];
        }
        return value;
      },
    });

  })

  .directive('fieldTaxonomy', fieldTaxonomyComponent);

export default fieldTaxonomyModule;
