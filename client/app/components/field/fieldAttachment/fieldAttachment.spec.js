import FieldAttachmentModule from './fieldAttachment';
import FieldAttachmentController from './fieldAttachment.controller';
import FieldAttachmentComponent from './fieldAttachment.component';
import FieldAttachmentTemplate from './fieldAttachment.html';

describe('FieldAttachment', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldAttachmentModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldAttachmentController();
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
    //   expect(FieldAttachmentTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldAttachmentComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldAttachmentTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldAttachmentController);
    });
  });
});
