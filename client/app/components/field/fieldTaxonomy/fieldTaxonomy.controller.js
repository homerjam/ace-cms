import _ from 'lodash';
import angular from 'angular';

class FieldTaxonomyController {
  /* @ngInject */
  constructor($q, ConfigFactory, TaxonomyFactory, Slug) {
    const vm = this;

    if (!vm.fieldModel.value) {
      vm.fieldModel.value = {};
    }

    vm.fieldModel.value.taxonomy = vm.fieldOptions.settings.taxonomy;

    if (!vm.fieldModel.value.terms) {
      vm.fieldModel.value.terms = [];
    }

    let options = [];
    const taxonomy = ConfigFactory.getTaxonomy(vm.fieldOptions.settings.taxonomy);

    const buildTaxonomy = (term, parents, options) => {
      if (term.terms && term.terms.length) {
        const newParents = parents.slice(0);

        newParents.push({
          id: term.id,
          title: term.title,
          slug: term.slug,
        });

        term.terms.forEach((term) => {
          options.push(buildTaxonomy(term, newParents, options));
        });

        return {
          id: term.id,
          title: term.title,
          slug: term.slug,
          parents,
          hasChildren: true,
        };
      }

      return {
        id: term.id,
        title: term.title,
        slug: term.slug,
        parents,
      };
    };

    if (taxonomy) {
      (taxonomy.terms || []).forEach((term) => {
        options.push(buildTaxonomy(term, [], options));
      });

      options = options.filter(option => !option.hasChildren);
    }

    vm.clear = () => {
      vm.fieldModel.value.terms = [];
    };

    vm.search = query => $q((resolve, reject) => {
      const selected = _.isArray(vm.fieldModel.value.terms) ? vm.fieldModel.value.terms.map(term => term.id) : [];

      const filteredOptions = options.filter((term) => {
        if (selected.indexOf(term.id) > -1) {
          return false;
        }
        const searchTerms = term.parents.map(term => term.title);
        searchTerms.unshift(term.title);
        const searchString = searchTerms.join(' ');
        const regExp = new RegExp(query, 'gi');
        const match = regExp.test(searchString);
        return match;
      });

      resolve(filteredOptions);
    });

    vm.getParents = (term) => {
      if (!term.parents) {
        return '';
      }

      const parents = term.parents.map(parent => parent.title);

      return parents.join(' / ');
    };

    vm.transformChip = (chip) => {
      if (angular.isObject(chip)) {
        return chip;
      }

      const term = TaxonomyFactory.newTerm();

      term.title = chip;
      term.slug = Slug.slugify(chip);
      term.parents = [];

      TaxonomyFactory.addTerm(vm.fieldOptions.settings.taxonomy.slug, term);

      return term;
    };

  }
}

export default FieldTaxonomyController;
