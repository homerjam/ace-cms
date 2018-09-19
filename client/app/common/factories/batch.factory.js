import angular from 'angular';

const BatchFactory = () => {
  const service = {};

  let entityIds = [];

  service.setEntityIds = (ids) => {
    entityIds = ids;
  };

  service.getEntityIds = () => entityIds;

  service.consolidate = (entities) => {
    const entity = {
      published: true,
      fields: {},
    };

    const fields = {};

    entities.forEach((_entity) => {
      if (!_entity.published) {
        entity.published = false;
      }

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

  return service;
};

export default BatchFactory;
