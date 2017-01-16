class ToolsController {
  /* @ngInject */
  constructor (HelperFactory, apiPrefix) {
    const vm = this;

    vm.importDbSelected = (event, files) => {
      // const fileReader = new FileReader();
      // fileReader.onload = (event) => {
      //   HelperFactory.postPayload(`${apiPrefix}/tools/import-db`, event.target.result);
      // };
      // fileReader.readAsText(files[0]);

      event.target.form.submit();
    };
  }
}

export default ToolsController;
