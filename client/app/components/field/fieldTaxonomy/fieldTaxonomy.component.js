import template from './fieldTaxonomy.jade';
import controller from './fieldTaxonomy.controller';
import './fieldTaxonomy.scss';

const fieldTaxonomyComponent = function fieldTaxonomyComponent() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {
      fieldOptions: '=',
      fieldModel: '=',
      fieldApply: '=?',
    },
    template,
    controller,
    controllerAs: 'vm',
    bindToController: true,
  };
};

export default fieldTaxonomyComponent;
