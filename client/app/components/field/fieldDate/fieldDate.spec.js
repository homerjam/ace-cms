import FieldDateModule from './fieldDate';
import FieldDateController from './fieldDate.controller';
import FieldDateComponent from './fieldDate.component';
import FieldDateTemplate from './fieldDate.html';

describe('FieldDate', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldDateModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldDateController();
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
    //   expect(FieldDateTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldDateComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldDateTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldDateController);
    });
  });
});
