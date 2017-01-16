class Field {
  /* @ngInject */
  constructor(config = {}) {
    this.name = 'Field Name';
    this.settingsTemplate = '';
    this.thumbnailField = false;
    this.gridOptions = {
      style: 'string', // string|thumbnail
      cellFilter: 'field2String',
      enableSorting: true,
    };
    this.modeDisabled = {
      new: false,
      batchEdit: false,
      batchUpload: false,
    };

    Object.assign(this, config);
  }

  toString(value) {
    return value || '';
  }

  toDb(value, settings) {
    return value;
  }

  fromDb(value, settings) {
    return value;
  }

  thumbnail(value) {
    return null;
  }
}
export default Field;
