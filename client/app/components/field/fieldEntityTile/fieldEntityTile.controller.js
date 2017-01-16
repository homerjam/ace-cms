import _ from 'lodash';

class FieldEntityTileController {
  /* @ngInject */
  constructor ($rootScope, $scope, AdminFactory, EntityFactory, HelperFactory) {
    const vm = this;

    if (!vm.fieldModel) {
      vm.fieldModel = [];
    }

    const schemas = AdminFactory.getByKey('schema');

    vm.schemas = vm.fieldOptions.settings.schemas.map(schema => ({
      name: schemas[schema.slug].name,
      slug: schema.slug,
    }));

    function getInsertPoint () {
      let insertPoint = -1;
      vm.fieldModel.forEach((item, i) => {
        if (insertPoint === -1 && item.$selected) {
          insertPoint = i;
        }
      });
      return insertPoint;
    }

    vm.newEntity = (schemaSlug) => {
      EntityFactory.newEntity(schemaSlug)
        .then((entity) => {
          const insertPoint = getInsertPoint();

          if (insertPoint > -1) {
            vm.fieldModel.splice(insertPoint, 0, entity);
          } else {
            vm.fieldModel.push(entity);
          }
        });
    };

    vm.insertEntity = (schemaSlug) => {
      EntityFactory.selectEntity(schemaSlug)
        .then((selected) => {
          const insertPoint = getInsertPoint();

          selected = _.reverse(selected);

          selected.forEach((entity) => {
            if (insertPoint > -1) {
              vm.fieldModel.splice(insertPoint, 0, entity);
            } else {
              vm.fieldModel.push(entity);
            }
          });
        });
    };

    vm.entityEdit = (event, entity) => {
      event.stopPropagation();

      EntityFactory.editEntity(entity).then((updatedEntity) => {
        vm.fieldModel.splice(vm.fieldModel.indexOf(entity), 1, updatedEntity);
      });
    };

    vm.entityRemove = (event, entity) => {
      event.stopPropagation();

      vm.fieldModel.splice(vm.fieldModel.indexOf(entity), 1);
    };

    vm.getSortFields = schema => AdminFactory.getByKey('schema')[schema].sortFields;

    vm.hasPreview = (i) => {
      if (!vm.fieldModel[i]) {
        return false;
      }

      return AdminFactory.getByKey('schema')[vm.fieldModel[i].schema].thumbnailField;
    };

    vm.preview = (event, item) => {
      event.stopPropagation();

      const media = [];
      const index = vm.fieldModel.indexOf(item);

      vm.fieldModel.forEach((item) => {
        const thumbnail = EntityFactory.getEntityThumbnail(item);

        if (!thumbnail) {
          media.push({
            type: 'none',
          });

          return;
        }

        media.push({
          type: 'image',
          src: EntityFactory.getEntityThumbnailUrl(item, 'h:1000;q:80'),
        });
      });

      HelperFactory.mediaPreview(media, index);
    };

    const setGroupSize = (item) => {
      const index = vm.fieldModel.indexOf(item);
      let beforeCount = 0;
      let afterCount = 0;
      let i;

      for (i = index - 1; i > -1; i--) {
        if (vm.fieldModel[i].groupAfter) {
          beforeCount++;
        } else {
          break;
        }
      }

      for (i = index + 1; i < vm.fieldModel.length; i++) {
        if (vm.fieldModel[i].groupBefore) {
          afterCount++;
        } else {
          break;
        }
      }

      item.$groupSize = beforeCount + afterCount + 1;
    };

    const testGroupSize = (item) => {
      const limit = vm.fieldOptions.settings.groupSizeLimit || Infinity;
      const index = vm.fieldModel.indexOf(item);
      let prevItem;
      let nextItem;

      if (index > 0) {
        prevItem = vm.fieldModel[index - 1];
      }
      if (index < vm.fieldModel.length - 1) {
        nextItem = vm.fieldModel[index + 1];
      }

      if (prevItem && item.$groupSize + prevItem.$groupSize > limit && !item.groupBefore) {
        item.$groupBeforeDisabled = true;
        item.groupBefore = false;
        prevItem.$groupAfterDisabled = true;
        prevItem.groupAfter = false;
      } else if (nextItem && item.$groupSize + nextItem.$groupSize > limit && !item.groupAfter) {
        item.$groupAfterDisabled = true;
        item.groupAfter = false;
        nextItem.$groupBeforeDisabled = true;
        nextItem.groupBefore = false;
      } else {
        item.$groupBeforeDisabled = false;
        item.$groupAfterDisabled = false;
      }

      if (prevItem) {
        if ((item.groupBefore && !prevItem.groupAfter) || (!item.groupBefore && prevItem.groupAfter)) {
          item.groupBefore = false;
          prevItem.groupAfter = false;
        }
      }
    };

    vm.toggleGroupBefore = (event, item) => {
      event.stopPropagation();

      item.groupBefore = !item.groupBefore;
      vm.fieldModel[vm.fieldModel.indexOf(item) - 1].groupAfter = item.groupBefore;
    };

    vm.toggleGroupAfter = (event, item) => {
      event.stopPropagation();

      item.groupAfter = !item.groupAfter;
      vm.fieldModel[vm.fieldModel.indexOf(item) + 1].groupBefore = item.groupAfter;
    };

    $scope.$watch(() => {
      return vm.fieldModel;
    }, (newValue) => {
      vm.fieldModel.forEach(setGroupSize);
      vm.fieldModel.forEach(testGroupSize);
    }, true);

    $scope.$on('aceSortable:change', (event, obj) => {
      const selected = [];

      obj.collection.forEach((item, i) => {
        if (item.$selected) {
          selected.push(i);
        }
      });

      if (selected.length) {
        event.preventDefault();

        let reverse = false;

        if (selected[0] < obj.to) {
          reverse = true;
          selected.reverse();
        }

        selected.forEach((index, i) => {
          HelperFactory.move.apply(vm.fieldModel, [index, reverse ? obj.to - i : obj.to + i]);
        });
      }
    });

    vm.clickItem = (event, item) => {
      if (!(event.metaKey || event.ctrlKey) && !event.shiftKey) {
        const wasSelected = item.$selected;
        vm.fieldModel.forEach((item, i) => {
          item.$selected = false;
        });
        item.$selected = !wasSelected;
        return;
      }

      if (!event.shiftKey) {
        item.$selected = !item.$selected;
        return;
      }

      let i;
      const index = vm.fieldModel.indexOf(item);
      const selected = [];

      vm.fieldModel.forEach((item, i) => {
        if (item.$selected) {
          selected.push(i);
        }
      });

      if (index < selected[0]) {
        for (i = index; i < selected[0]; i++) {
          vm.fieldModel[i].$selected = true;
        }
      } else if (index > selected[selected.length - 1]) {
        for (i = selected[0]; i <= index; i++) {
          vm.fieldModel[i].$selected = true;
        }
      }
    };

    vm.getIndex = (scope) => {
      return scope.$parent.$index;
    };

    vm.getCollection = (scope) => {
      return vm.fieldModel;
    };
  }
}

export default FieldEntityTileController;
