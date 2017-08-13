import angular from 'angular';

export default angular.module('ace.sortable', [])
  .directive('aceSortable', () => ({
    restrict: 'A',

    // scope: {
    //   collection: '=',
    //   index: '=',
    //   axis: '=?',
    //   draggableSelector: '=?',
    //   handleSelector: '=?',
    // },

    // bindToController: true,
    // controllerAs: 'vm',

    controller ($document, $scope, $element, $timeout, $attrs, $parse) {
      const vm = this;

      vm.collection = $parse($attrs.collection)($scope);
      vm.index = $parse($attrs.index)($scope);
      vm.axis = $parse($attrs.axis)($scope);
      vm.draggableSelector = $parse($attrs.draggableSelector)($scope);
      vm.handleSelector = $parse($attrs.handleSelector)($scope);

      let $draggable;
      let $handle;
      const draggingClassName = 'dragging';
      const droppingClassName = 'dropping';
      const droppingBeforeClassName = 'dropping--before';
      const droppingAfterClassName = 'dropping--after';
      let dragging = false;
      let preventDrag = false;
      let dropPosition;
      let dropTimeout;

      const move = function (from, to) {
        this.splice(to, 0, this.splice(from, 1)[0]);
      };

      if (vm.draggableSelector) {
        $draggable = angular.element($element[0].closest(vm.draggableSelector));
      } else {
        $draggable = $element;
      }

      $draggable.attr('draggable', true);

      $draggable.on('mousedown', (event) => {
        if (vm.handleSelector) {
          $handle = angular.element($element[0].querySelectorAll(vm.handleSelector));
        } else {
          $handle = $element;
        }
        preventDrag = true;
        angular.forEach($handle, (el) => {
          if (event.target === el) {
            preventDrag = false;
          }
        });
      });

      $document.on('mouseup', () => {
        preventDrag = false;
      });

      $draggable.on('dragstart', (event) => {
        if (preventDrag) {
          event.preventDefault();

        } else {
          dragging = true;

          $draggable.addClass(draggingClassName);

          const dataTransfer = event.dataTransfer || event.originalEvent.dataTransfer;

          const index = angular.isFunction(vm.index) ? vm.index($scope) : $parse($attrs.index)($scope);

          dataTransfer.effectAllowed = 'copyMove';
          dataTransfer.dropEffect = 'move';
          dataTransfer.setData('text/plain', index);
        }
      });

      $draggable.on('dragend', () => {
        dragging = false;

        $draggable.removeClass(draggingClassName);
      });

      const dragOverHandler = (event) => {
        if (dragging) {
          return;
        }

        event.preventDefault();

        const bounds = $draggable[0].getBoundingClientRect();

        const props = {
          width: bounds.right - bounds.left,
          height: bounds.bottom - bounds.top,
          x: (event.originalEvent || event).clientX - bounds.left,
          y: (event.originalEvent || event).clientY - bounds.top,
        };

        const offset = vm.axis === 'y' ? props.y : props.x;
        const midPoint = (vm.axis === 'y' ? props.height : props.width) / 2;

        $draggable.addClass(droppingClassName);

        if (offset < midPoint) {
          dropPosition = 'before';
          $draggable.removeClass(droppingAfterClassName);
          $draggable.addClass(droppingBeforeClassName);

        } else {
          dropPosition = 'after';
          $draggable.removeClass(droppingBeforeClassName);
          $draggable.addClass(droppingAfterClassName);
        }
      };

      const dropHandler = (event) => {
        event.preventDefault();

        const droppedItemIndex = parseInt((event.dataTransfer || event.originalEvent.dataTransfer).getData('text/plain'), 10);
        const currentIndex = angular.isFunction(vm.index) ? vm.index($scope) : $parse($attrs.index)($scope);
        let newIndex = null;

        if (dropPosition === 'before') {
          if (droppedItemIndex < currentIndex) {
            newIndex = currentIndex - 1;
          } else {
            newIndex = currentIndex;
          }
        } else if (dropPosition === 'after') {
          if (droppedItemIndex < currentIndex) {
            newIndex = currentIndex;
          } else {
            newIndex = currentIndex + 1;
          }
        }

        // debounce (required for some browsers)
        $timeout.cancel(dropTimeout);
        dropTimeout = $timeout(() => {
          dropPosition = null;

          $scope.$apply(() => {
            const collection = angular.isFunction(vm.collection) ? vm.collection($scope) : vm.collection;

            const changeEvent = $scope.$emit('aceSortable:change', {
              collection,
              item: collection[droppedItemIndex],
              from: droppedItemIndex,
              to: newIndex,
            });

            if (changeEvent.defaultPrevented) {
              return;
            }

            move.apply(collection, [droppedItemIndex, newIndex]);
          });

          $draggable.removeClass(droppingClassName);
          $draggable.removeClass(droppingBeforeClassName);
          $draggable.removeClass(droppingAfterClassName);

          $draggable.off('drop', dropHandler);
        }, 1000 / 60);
      };

      $draggable.on('dragenter', () => {
        if (dragging) {
          return;
        }

        $draggable.off('dragover', dragOverHandler);
        $draggable.off('drop', dropHandler);

        $draggable.on('dragover', dragOverHandler);
        $draggable.on('drop', dropHandler);
      });

      $draggable.on('dragleave', (event) => {
        $draggable.removeClass(droppingClassName);
        $draggable.removeClass(droppingBeforeClassName);
        $draggable.removeClass(droppingAfterClassName);
      });

    },
  }));
