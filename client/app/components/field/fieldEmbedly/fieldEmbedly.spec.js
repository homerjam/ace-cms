import FieldEmbedlyModule from './fieldEmbedly';
import FieldEmbedlyController from './fieldEmbedly.controller';
import FieldEmbedlyComponent from './fieldEmbedly.component';
import FieldEmbedlyTemplate from './fieldEmbedly.html';

describe('FieldEmbedly', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldEmbedlyModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldEmbedlyController();
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
    //   expect(FieldEmbedlyTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldEmbedlyComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldEmbedlyTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldEmbedlyController);
    });
  });
});
