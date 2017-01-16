import BatchUploadModule from './batchUpload';
import BatchUploadController from './batchUpload.controller';
import BatchUploadComponent from './batchUpload.component';
import BatchUploadTemplate from './batchUpload.html';

describe('BatchUpload', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(BatchUploadModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new BatchUploadController();
    };
  }));

  describe('Module', () => {
    // top-level specs: i.e., routes, injection, naming
  });

  describe('Controller', () => {
    // controller specs
    // it('has a name property [REMOVE]', () => { // erase if removing this.name from the controller
    //   let controller = makeController();
    //   expect(controller).to.have.property('name');
    // });
  });

  describe('Template', () => {
    // template specs
    // tip: use regex to ensure correct bindings are used e.g., {{  }}
    // it('has name in template [REMOVE]', () => {
    //   expect(BatchUploadTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = BatchUploadComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(BatchUploadTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(BatchUploadController);
    });
  });
});
