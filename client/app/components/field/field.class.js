class Field {
  constructor(config = {}) {
    this.name = 'Field Name';
    // this.dataType = null; // string|number|boolean|array
    this.thumbnailField = false;
    this.gridOptions = {
      style: 'string', // string|thumbnail
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
