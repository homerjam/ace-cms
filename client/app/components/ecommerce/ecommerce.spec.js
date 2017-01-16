import EcommerceModule from './ecommerce';
import EcommerceController from './ecommerce.controller';
import EcommerceComponent from './ecommerce.component';
// import EcommerceTemplate from './ecommerce.html';

describe('Ecommerce', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(EcommerceModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new EcommerceController();
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
    //   expect(EcommerceTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = EcommerceComponent();

    // it('includes the intended template', () => {
    //   expect(component.template).to.equal(EcommerceTemplate);
    // });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(EcommerceController);
    });
  });
});
