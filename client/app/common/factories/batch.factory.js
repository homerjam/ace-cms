import angular from 'angular';

const BatchFactory = () => {
  const service = {};

  let entityIds = [];
  let recentEdits = [];
  let recentTrashed = [];

  service.setEntityIds = (ids) => {
    entityIds = ids;
  };

  service.getEntityIds = () => entityIds;

  service.consolidate = (entities) => {
    const entity = {
      fields: {},
    };

    const fields = {};

    entities.forEach((_entity) => {
      angular.forEach(_entity.fields, (field, key) => {
        if (!fields[key]) {
          fields[key] = [];
        }

        fields[key].push(field);
      });
    });

    angular.forEach(fields, (field, key) => {
      let matching = true;

      field.forEach((val) => {
        if (!angular.equals(entities[0].fields[key], val)) {
          matching = false;
        }
      });

      if (matching) {
        entity.fields[key] = field[0];
      }
    });

    return entity;
  };

  service.setRecentEdits = (entities) => {
    recentEdits = entities;
  };

  service.getRecentEdits = (clear) => {
    const tmp = recentEdits;

    if (clear) {
      recentEdits = [];
    }

    return tmp;
  };

  service.setRecentTrashed = (entities) => {
    recentTrashed = entities;
  };

  service.getRecentTrashed = (clear) => {
    const tmp = recentTrashed;

    if (clear) {
      recentTrashed = [];
    }

    return tmp;
  };

  return service;
};

export default BatchFactory;
