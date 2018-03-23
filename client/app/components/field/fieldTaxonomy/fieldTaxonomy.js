import _ from 'lodash';
import angular from 'angular';
import fieldTaxonomyComponent from './fieldTaxonomy.component';
import FieldTaxonomySettingsFactory from './fieldTaxonomy.settings.factory';

const fieldTaxonomyModule = angular.module('fieldTaxonomy', [])

  .config(() => {
    'ngInject';
  })

  .run((FieldFactory, FieldTaxonomySettingsFactory) => {
    'ngInject';

    FieldFactory.registerField('taxonomy', {
      name: 'Taxonomy',
      editSettings: FieldTaxonomySettingsFactory.edit,
      toString(value) {
        if (!value || !value.terms) {
          return '';
        }

        if (_.isArray(value.terms)) {
          return value.terms.map(term => (term ? term.title : undefined)).filter(term => term).join(', ');
        }

        if (_.isObject(value.terms)) {
          return value.terms.title;
        }

        return value || '';
      },
      toDb(value, settings) {
        let terms = value.terms[0] ? value.terms : [];

        terms = terms.map((term) => {
          term.slug = _.kebabCase(term.title);
          term.parents = (term.parents || []).map((term) => {
            term.slug = _.kebabCase(term.title);
            return _.pick(term, ['id', 'title', 'slug']);
          });
          return _.pick(term, ['id', 'title', 'slug', 'parents']);
        });

        return {
          taxonomy: settings.taxonomy,
          terms,
        };
      },
    });

  })

  .factory('FieldTaxonomySettingsFactory', FieldTaxonomySettingsFactory)

  .directive('fieldTaxonomy', fieldTaxonomyComponent);

export default fieldTaxonomyModule;
