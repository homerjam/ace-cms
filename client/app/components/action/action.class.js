class Action {
  /* @ngInject */
  constructor(options = {}) {
    this.name = 'Action Name';
    this.settingsTemplate = '';

    Object.assign(this, options);
  }
}
export default Action;
