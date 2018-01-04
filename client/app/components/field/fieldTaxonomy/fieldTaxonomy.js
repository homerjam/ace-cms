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
        if (!value.terms) {
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
        return {
          taxonomy: settings.taxonomy,
          terms: value.terms[0] ? value.terms : [],
        };
      },
    });

  })

  .factory('FieldTaxonomySettingsFactory', FieldTaxonomySettingsFactory)

  .directive('fieldTaxonomy', fieldTaxonomyComponent);

export default fieldTaxonomyModule;
