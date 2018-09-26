import _ from 'lodash';

class FieldEntityTileController {
  /* @ngInject */
  constructor ($scope, $filter, $log, ConfigFactory, EntityFactory, HelperFactory) {
    const vm = this;

    if (!vm.fieldModel.value) {
      vm.fieldModel.value = [];
    }

    const schemas = _.get(vm.fieldOptions, 'settings.schemas', []);

    if (!schemas.length) {
      $log.error(`No schemas specified for '${vm.fieldOptions.name}' field`);
    }

    vm.schemas = schemas.map(schema => ({
      name: ConfigFactory.getSchema(schema).name,
      slug: schema,
    }));

    vm.selected = [];

    function getInsertPoint () {
      let insertPoint = -1;
      vm.fieldModel.value.forEach((item, i) => {
        if (insertPoint === -1 && item.$selected) {
          insertPoint = i;
        }
      });
      return insertPoint;
    }

    vm.newEntity = async (schemaSlug) => {
      const entity = await EntityFactory.newEntity(schemaSlug);

      if (!entity) {
        return;
      }

      const insertPoint = getInsertPoint();

      if (insertPoint > -1) {
        vm.fieldModel.value.splice(insertPoint, 0, entity);
      } else {
        vm.fieldModel.value.push(entity);
      }
    };

    vm.insertEntity = async (schemaSlug) => {
      let selected = await EntityFactory.selectEntity(schemaSlug);

      if (!selected) {
        return;
      }

      const insertPoint = getInsertPoint();

      selected = _.reverse(selected);

      $scope.$apply(() => {
        selected.forEach((entity) => {
          if (insertPoint > -1) {
            vm.fieldModel.value.splice(insertPoint, 0, entity);
          } else {
            vm.fieldModel.value.push(entity);
          }
        });
      });
    };

    vm.entityEdit = (event, entity, index) => {
      event.stopPropagation();

      EntityFactory.editEntities([entity])
        .then((updatedEntities) => {
          if (updatedEntities) {
            updatedEntities = updatedEntities.map((entity) => {
              entity.id = entity._id;
              delete entity._id;
              delete entity._rev;
              return entity;
            });
            vm.fieldModel.value.splice(index, 1, updatedEntities[0]);
          }
        });
    };

    vm.entityRemove = (event, entity, index) => {
      event.stopPropagation();

      vm.fieldModel.value.splice(index, 1);
    };

    vm.removeSelected = () => {
      vm.fieldModel.value = vm.fieldModel.value.filter(item => !item.$selected);

      vm.selected = [];
    };

    vm.getGridColumnFields = (item) => {
      const schema = ConfigFactory.getSchema(item.schema);

      if (!schema) {
        return [];
      }

      let fields = schema.fields.filter((fieldOptions) => {
        if (/(entityTile|entityGrid)/.test(fieldOptions.type) || fieldOptions.settings.multiple) {
          return false;
        }
        return fieldOptions.settings.gridColumn;
      });

      fields = fields.map((fieldOptions) => {
        fieldOptions.text = $filter('field2String')(item.fields[fieldOptions.slug], fieldOptions, 20);
        return fieldOptions;
      });

      return fields;
    };

    vm.hasPreview = (i) => {
      if (!vm.fieldModel.value[i]) {
        return false;
      }

      return ConfigFactory.getSchema(vm.fieldModel.value[i].schema).thumbnailFields[0];
    };

    vm.preview = (event, item, index) => {
      event.stopPropagation();

      const media = [];

      vm.fieldModel.value.forEach((item) => {
        const thumbnail = EntityFactory.getEntityThumbnail(item);

        if (!thumbnail) {
          media.push({
            type: 'none',
          });

          return;
        }

        if (thumbnail.thumbnailType === 'image') {
          media.push({
            type: thumbnail.thumbnailType,
            src: HelperFactory.thumbnailSrc(thumbnail, 'h:1000;q:80'),
          });
        }

        if (thumbnail.thumbnailType === 'video') {
          media.push({
            type: thumbnail.thumbnailType,
            src: HelperFactory.videoSrc(thumbnail, 'f:mp4;h:360;bv:1000'),
          });
        }
      });

      HelperFactory.mediaPreview(media, index);
    };

    const setGroupSize = (item) => {
      const index = vm.fieldModel.value.indexOf(item);
      let beforeCount = 0;
      let afterCount = 0;
      let i;

      for (i = index - 1; i > -1; i--) {
        if (vm.fieldModel.value[i].groupAfter) {
          beforeCount++;
        } else {
          break;
        }
      }

      for (i = index + 1; i < vm.fieldModel.value.length; i++) {
        if (vm.fieldModel.value[i].groupBefore) {
          afterCount++;
        } else {
          break;
        }
      }

      item.$groupSize = beforeCount + afterCount + 1;
    };

    const testGroupSize = (item) => {
      const limit = vm.fieldOptions.settings.groupSizeLimit || Infinity;
      const index = vm.fieldModel.value.indexOf(item);
      let prevItem;
      let nextItem;

      if (index > 0) {
        prevItem = vm.fieldModel.value[index - 1];
      }
      if (index < vm.fieldModel.value.length - 1) {
        nextItem = vm.fieldModel.value[index + 1];
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
      vm.fieldModel.value[vm.fieldModel.value.indexOf(item) - 1].groupAfter = item.groupBefore;
    };

    vm.toggleGroupAfter = (event, item) => {
      event.stopPropagation();

      item.groupAfter = !item.groupAfter;
      vm.fieldModel.value[vm.fieldModel.value.indexOf(item) + 1].groupBefore = item.groupAfter;
    };

    $scope.$watch(() => vm.fieldModel.value, (newValue) => {
      vm.fieldModel.value.forEach(setGroupSize);
      vm.fieldModel.value.forEach(testGroupSize);
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
          HelperFactory.move.apply(vm.fieldModel.value, [index, reverse ? obj.to - i : obj.to + i]);
        });
      }
    });

    vm.clickItem = (event, item) => {
      if (!(event.metaKey || event.ctrlKey) && !event.shiftKey) {
        const wasSelected = item.$selected;
        vm.fieldModel.value.forEach((item, i) => {
          item.$selected = false;
        });
        item.$selected = !wasSelected;
        vm.selected = vm.fieldModel.value.filter(item => item.$selected);
        return;
      }

      if (!event.shiftKey) {
        item.$selected = !item.$selected;
        return;
      }

      vm.selected = vm.fieldModel.value.filter(item => item.$selected);

      let i;
      const index = vm.fieldModel.value.indexOf(item);
      const selectedIndexes = [];

      vm.fieldModel.value.forEach((item, i) => {
        if (item.$selected) {
          selectedIndexes.push(i);
        }
      });

      if (index < selectedIndexes[0]) {
        for (i = index; i < selectedIndexes[0]; i++) {
          vm.fieldModel.value[i].$selected = true;
        }
      } else if (index > selectedIndexes[selectedIndexes.length - 1]) {
        for (i = selectedIndexes[0]; i <= index; i++) {
          vm.fieldModel.value[i].$selected = true;
        }
      }
    };
  }
}

export default FieldEntityTileController;
