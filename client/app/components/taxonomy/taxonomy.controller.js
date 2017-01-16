import angular from 'angular';
import termTemplate from './taxonomy.term.jade';

class TaxonomyController {
  /* @ngInject */
  constructor($rootScope, $scope, $document, $state, $timeout, $log, $q, $mdDialog, TaxonomyFactory, HelperFactory, Slug) {
    const vm = this;

    vm.taxonomy = $state.$current.locals.globals.taxonomy;

    vm.termTemplate = termTemplate;

    if (!vm.taxonomy.terms) {
      vm.taxonomy.terms = [];
    }

    let originalTerms = angular.copy(vm.taxonomy.terms);

    const isChanged = $scope.$on('$stateChangeStart', (event, toState, toParams) => {
      if (!angular.equals(originalTerms, vm.taxonomy.terms)) {
        event.preventDefault();

        const confirm = $mdDialog.confirm()
          // .title('Confirm Action')
          .textContent('You have unsaved changes, are you sure?')
          .cancel('Cancel')
          .ok('Confirm');

        $mdDialog
          .show(confirm)
          .then(() => {
            isChanged();

            $state.go(toState, toParams);
          });
      }
    });

    const editChild = (scope, prevTitle) => {
      const childNodes = scope.childNodes();

      // var childScope = childNodes[childNodes.length - 1];
      const childScope = childNodes[0];

      childScope.prevTitle = prevTitle || childScope.$modelValue.title;
      childScope.$handleScope.$editTitle = true;
    };

    vm.newTerm = () => {
      const term = TaxonomyFactory.newTerm();
      term.terms = [];
      vm.taxonomy.terms.unshift(term);

      $timeout(() => {
        $document[0].querySelector('.angular-ui-tree input').focus();
      });
    };

    vm.newNode = ($event, scope) => {
      const term = TaxonomyFactory.newTerm();
      term.terms = [];

      if (!scope.$modelValue.terms) {
        scope.$modelValue.terms = [];
      }

      // scope.$modelValue.terms.push(term);
      scope.$modelValue.terms.unshift(term);

      $timeout(() => {
        editChild(scope);
      });
    };

    vm.removeNode = ($event, scope) => {
      const confirm = $mdDialog.confirm()
        // .title('Confirm Action')
        .textContent('Delete term?')
        .cancel('Cancel')
        .ok('Delete');

      $mdDialog
        .show(confirm)
        .then(() => {
          TaxonomyFactory.removeTerm({
            id: scope.$modelValue.id,
          })
            .catch(error => $q.reject($log.error(error)))
            .then(() => {
              scope.remove();
              vm.save();
            });
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

          TaxonomyFactory.editTerm({
            id: scope.$modelValue.id,
            title: scope.$modelValue.title,
            slug: Slug.slugify(scope.$modelValue.title),
          })
            .then(
              () => {
                scope.prevTitle = scope.$modelValue.title;

                scope.$handleScope.$editTitle = false;

                vm.save();

                scope.$saving = false;
              },
              (error) => {
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
        // return destNodes.$nodeScope;
        return true;
      },
      dropped() {
        if (!angular.equals(originalTerms, vm.taxonomy.terms)) {
          vm.save();
        }
      },
    };

    vm.collapseAll = () => {
      $scope.$broadcast('angular-ui-tree:collapse-all');
    };

    vm.expandAll = () => {
      $scope.$broadcast('angular-ui-tree:expand-all');
    };

    vm.save = () => {
      TaxonomyFactory.save(vm.taxonomy)
        .then(
          (result) => {
            vm.taxonomy = result[0];
            originalTerms = angular.copy(vm.taxonomy.terms);
          },
          (error) => {
            vm.taxonomy.terms = originalTerms;
          }
      );
    };

  }
}

export default TaxonomyController;
