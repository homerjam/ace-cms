import FieldVimeoModule from './fieldVimeo';
import FieldVimeoController from './fieldVimeo.controller';
import FieldVimeoComponent from './fieldVimeo.component';
import FieldVimeoTemplate from './fieldVimeo.html';

describe('FieldVimeo', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldVimeoModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldVimeoController();
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
    //   expect(FieldVimeoTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldVimeoComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldVimeoTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldVimeoController);
    });
  });
});
