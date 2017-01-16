import FieldRichTextModule from './fieldRichText';
import FieldRichTextController from './fieldRichText.controller';
import FieldRichTextComponent from './fieldRichText.component';
import FieldRichTextTemplate from './fieldRichText.html';

describe('FieldRichText', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldRichTextModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldRichTextController();
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
    //   expect(FieldRichTextTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldRichTextComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldRichTextTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldRichTextController);
    });
  });
});
