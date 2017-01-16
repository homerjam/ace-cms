import FieldImageModule from './fieldImage';
import FieldImageController from './fieldImage.controller';
import FieldImageComponent from './fieldImage.component';
import FieldImageTemplate from './fieldImage.html';

describe('FieldImage', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldImageModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldImageController();
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
    //   expect(FieldImageTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldImageComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldImageTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldImageController);
    });
  });
});
