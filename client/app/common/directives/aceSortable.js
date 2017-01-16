import angular from 'angular';

export default angular.module('ace.sortable', [])
  .directive('aceSortable', () => ({
    restrict: 'A',

    scope: {
      collectionFn: '=',
      indexFn: '=',
      axis: '=?',
      draggableSelector: '=?',
      handleSelector: '=?',
    },

    bindToController: true,
    controllerAs: 'vm',

    controller: ['$document', '$scope', '$element', '$timeout',
    function ($document, $scope, $element, $timeout) {
      const vm = this;

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
          $handle = angular.element($element[0].querySelector(vm.handleSelector));
        } else {
          $handle = $element;
        }

        if (event.target !== $handle[0]) {
          preventDrag = true;
        }
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

          const index = vm.indexFn($scope);

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
        const currentIndex = vm.indexFn($scope);
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
            const changeEvent = $scope.$emit('aceSortable:change', {
              collection: vm.collectionFn($scope),
              item: vm.collectionFn($scope)[droppedItemIndex],
              from: droppedItemIndex,
              to: newIndex,
            });

            if (changeEvent.defaultPrevented) {
              return;
            }

            move.apply(vm.collectionFn($scope), [droppedItemIndex, newIndex]);
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

    }],
  }));
