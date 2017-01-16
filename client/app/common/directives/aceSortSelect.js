import angular from 'angular';

export default angular.module('ace.sortSelect', []).directive('aceSortSelect', ['$rootScope', '$timeout',
  ($rootScope, $timeout) => ({
    restrict: 'EA',
    replace: true,

    template($element, $attr) {
      const defaults = {
        itemName: 'item',
        markupStyle: 'list',
      };

      angular.extend(defaults, $rootScope.$eval($attr.options));

      let itemTemplate = '';

      if (defaults.markupStyle === 'table') {
        angular.forEach($element.children(), (child) => {
          itemTemplate += child.innerHTML;
        });

        return `<tbody class="ace-sort-select-container" data-collection-length="{{collection.length}}"><tr class="ace-sort-select-item" ng-repeat="${defaults.itemName} in collection track by $index">${itemTemplate}</tr></tbody>`;
      }

      angular.forEach($element.children(), (child) => {
        itemTemplate += child.outerHTML;
      });

      return `<ul class="ace-sort-select-container" data-collection-length="{{collection.length}}"><li class="ace-sort-select-item" ng-repeat="${defaults.itemName} in collection track by $index">${itemTemplate}</li></ul>`;
    },

    link($scope, $element, $attr) {

      const defaults = {
        sortHandle: '.handle',
        selectCancel: '.cancel',
        markupStyle: 'list',
      };

      angular.extend(defaults, $scope.options);

      angular.extend($scope, defaults);

      const container = $element;

      $element.prepend('<!-- aceSortSelect -->');

      const move = function (from, to) {
        this.splice(to, 0, this.splice(from, 1)[0]);
      };

      $scope.$sortSelect = {};

      let hasInit = false;
      let startPos;
      let endPos;
      let selected;
      let helper;
      let origIndexes;

      $scope.$sortSelect.removeItem = function ($event, i) {
        selected = angular.element(container[0].querySelectorAll('.ui-selected:not(.ui-sortable-placeholder)'));

        const removeIndexes = [];

        if (selected.length > 0) {
          if (!this.selected) {
            removeIndexes.push(i);

          } else {
            angular.forEach(selected, (item) => {
              removeIndexes.unshift(angular.element(item).index());
            });
          }

        } else {
          removeIndexes.push(i);
        }

        selected.removeClass('ui-selected');

        removeIndexes.forEach((idx) => {
          $scope.collection.splice(idx, 1);
        });
      };

      $scope.$watch(() => $scope.$eval($attr.collection), (n) => {
        $scope.collection = n;

        if (hasInit) {
          container.sortable('refresh');

        } else if (n.length) {
          hasInit = true;

          container.sortable({
            containment: 'parent',
            items: '.ace-sort-select-item',
            distance: 5,
            tolerance: 'pointer',
            handle: defaults.sortHandle,
            helper(e, el) {
              if (defaults.markupStyle === 'table') {
                helper = el;

              } else {
                helper = angular.element('<div/>').addClass('ace-sort-select-helper');
                container.append(helper);
              }

              return helper;
            },
            start(e, ui) {
              selected = angular.element(container[0].querySelectorAll('.ui-selected:not(.ui-sortable-placeholder)'));

              if (selected.length > 0 && !ui.item.hasClass('ui-selected')) {
                selected.removeClass('ui-selected');
                selected = ui.item;

              } else if (selected.length === 0) {
                selected = ui.item;
              }

              startPos = angular.element(selected[0]).index();

              const items = angular.element(container[0].querySelectorAll('.ace-sort-select-item:not(.ui-sortable-placeholder)'));

              origIndexes = [];
              angular.forEach(items, (item, i) => {
                if (angular.element(item).hasClass('ui-selected')) {
                  origIndexes.push(i);
                }
              });
              if (origIndexes.length === 0) {
                origIndexes.push(startPos);
              }

              if (defaults.markupStyle === 'list') {
                helper.append(selected.clone());

                selected.css('display', 'none');
              }
            },
            stop() {
              selected.css('display', defaults.markupStyle === 'table' ? 'table-row' : 'list-item');
            },
            update(e, ui) {
              endPos = ui.item.index();

              container.sortable('cancel');

              const movedIndexes = [];

              if (endPos < startPos) {
                origIndexes.forEach((idx, i) => {
                  movedIndexes.push(endPos + i);
                  move.apply($scope.collection, [idx, endPos + i]);
                });

              } else {
                origIndexes.reverse();
                origIndexes.forEach((idx, i) => {
                  movedIndexes.push(endPos - i);
                  move.apply($scope.collection, [idx, endPos - i]);
                });
              }

              if (!$scope.$$phase) {
                $scope.$apply();
              }

              $timeout(() => {
                const isSelected = angular.element(container[0].querySelectorAll('.ui-selected')).length;

                if (isSelected) {
                  selected.removeClass('ui-selected');

                  const items = angular.element(container[0].querySelectorAll('.ace-sort-select-item:not(.ui-sortable-placeholder)'));
                  angular.forEach(items, (item, i) => {
                    if (movedIndexes.indexOf(i) !== -1) {
                      angular.element(item).addClass('ui-selected');
                    }
                  });
                }

                $scope.$emit('aceSortSelect:change', $scope.collection, startPos, endPos);
              });
            },
          });

          container.selectable({
            filter: '.ace-sort-select-item',
            cancel: defaults.selectCancel,
            selected(e, ui) {
              angular.element(ui.selected).scope().selected = true;
            },
            unselected(e, ui) {
              angular.element(ui.unselected).scope().selected = false;
            },
          });
        }
      }, true);

    },
  }),
]);

