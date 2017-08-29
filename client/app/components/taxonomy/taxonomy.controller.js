import _ from 'lodash';
import angular from 'angular';
import termTemplate from './taxonomy.term.jade';

class TaxonomyController {
  /* @ngInject */
  constructor($rootScope, $scope, $document, $state, $stateParams, $transitions, $timeout, $log, $q, $mdDialog, ConfigFactory, TaxonomyFactory) {
    const vm = this;

    vm.taxonomy = ConfigFactory.getTaxonomy($stateParams.taxonomySlug);

    vm.termTemplate = termTemplate;

    if (!vm.taxonomy.terms) {
      vm.taxonomy.terms = [];
    }

    let originalTerms = angular.copy(vm.taxonomy.terms);

    const isUnchanged = () => angular.equals(originalTerms, angular.copy(vm.taxonomy.terms));

    // const hasChanged = $transitions.onStart({ to: '*' }, (trans) => {
    //   if (!isUnchanged()) {
    //     const confirm = $mdDialog.confirm()
    //       .textContent('You have unsaved changes, are you sure?')
    //       .cancel('Cancel')
    //       .ok('Confirm');

    //     $mdDialog
    //       .show(confirm)
    //       .then(() => {
    //         hasChanged();
    //         $state.go(trans.to().name, trans.params('to'));
    //       });

    //     return false;
    //   }
    // });

    const editChild = (scope, prevTitle) => {
      const childNodes = scope.childNodes();

      const childScope = childNodes[0];

      childScope.prevTitle = prevTitle || childScope.$modelValue.title;
      childScope.$handleScope.$editTitle = true;
    };

    vm.newTerm = () => {
      const term = TaxonomyFactory.getNewTerm();

      vm.taxonomy.terms.unshift(term);

      $timeout(() => {
        $document[0].querySelector('.angular-ui-tree input').focus();
      });
    };

    vm.newNode = ($event, scope) => {
      const term = TaxonomyFactory.getNewTerm();

      if (!scope.$modelValue.terms) {
        scope.$modelValue.terms = [];
      }

      scope.$modelValue.terms.unshift(term);

      $timeout(() => {
        editChild(scope);
      });
    };

    vm.removeNode = ($event, scope) => {
      const confirm = $mdDialog.confirm()
        .textContent('Delete term?')
        .cancel('Cancel')
        .ok('Delete');

      $mdDialog
        .show(confirm)
        .then(() => {
          TaxonomyFactory.deleteTerm({
            id: scope.$modelValue.id,
          })
            .then(
              (response) => {
                scope.remove();

                vm.save();
              },
              (error) => {
                $log.error(error);
              }
            );
        });
    };

    vm.toggleNode = ($event, scope) => {
      scope.toggle();
    };

    vm.editNode = ($event, scope) => {
      scope.prevTitle = scope.$modelValue.title;
      scope.$handleScope.$editTitle = true;
    };

    vm.revertNode = ($event, scope) => {
      $timeout(() => {
        if (scope.$saving) {
          return;
        }

        if (scope.prevTitle === '') {
          scope.remove();

        } else {
          scope.$modelValue.title = scope.prevTitle;
          scope.$handleScope.$editTitle = false;
        }
      }, 300);
    };

    vm.saveNode = ($event, scope) => {
      if ($event.type === 'keypress' && $event.keyCode !== 13) {
        return;
      }

      if (scope.$modelValue.title !== '') {
        if (scope.$modelValue.id) {
          scope.$saving = true;

          TaxonomyFactory.updateTerm({
            id: scope.$modelValue.id,
            title: scope.$modelValue.title,
            slug: _.kebabCase(scope.$modelValue.title),
          })
            .then(
              (response) => {
                scope.prevTitle = scope.$modelValue.title;

                scope.$handleScope.$editTitle = false;

                vm.save();

                scope.$saving = false;
              },
              (error) => {
                $log.error(error);

                scope.$modelValue.title = scope.prevTitle;

                scope.$saving = false;
              }
            );
        }
      }
    };

    vm.treeOptions = {
      defaultCollapsed: true,
      accept() {
        return true;
      },
      dropped() {
        $timeout(() => {
          if (!angular.equals(originalTerms, vm.taxonomy.terms)) {
            vm.save();
          }
        });
      },
    };

    vm.collapseAll = () => {
      $scope.$broadcast('angular-ui-tree:collapse-all');
    };

    vm.expandAll = () => {
      $scope.$broadcast('angular-ui-tree:expand-all');
    };

    const slugifyTerms = (term) => {
      term.slug = _.kebabCase(term.title);

      (term.terms || []).forEach((term) => {
        slugifyTerms(term);
      });
    };

    vm.save = () => {
      vm.taxonomy.terms.forEach((term) => {
        slugifyTerms(term);
      });

      const taxonomy = angular.fromJson(angular.toJson(vm.taxonomy));

      TaxonomyFactory.updateTaxonomy(taxonomy)
        .then(
          (response) => {
            // vm.taxonomy = _.find(response.data.taxonomies, { slug: taxonomy.slug });

            originalTerms = angular.copy(vm.taxonomy.terms);
          },
          (error) => {
            $log.error(error);

            vm.taxonomy.terms = originalTerms;
          }
        );
    };

    vm.delete = async (event) => {
      const deleted = await TaxonomyFactory.deleteTaxonomy(vm.taxonomy, event);

      if (deleted) {
        $state.go('dashboard');
      }
    };

  }
}

export default TaxonomyController;
