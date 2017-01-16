import FieldNumberModule from './fieldNumber';
import FieldNumberController from './fieldNumber.controller';
import FieldNumberComponent from './fieldNumber.component';
import FieldNumberTemplate from './fieldNumber.html';

describe('FieldNumber', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldNumberModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldNumberController();
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
    //   expect(FieldNumberTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldNumberComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldNumberTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldNumberController);
    });
  });
});
