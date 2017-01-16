import FieldCheckboxModule from './fieldCheckbox';
import FieldCheckboxController from './fieldCheckbox.controller';
import FieldCheckboxComponent from './fieldCheckbox.component';
import FieldCheckboxTemplate from './fieldCheckbox.html';

describe('FieldCheckbox', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldCheckboxModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldCheckboxController();
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
    //   expect(FieldCheckboxTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldCheckboxComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldCheckboxTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldCheckboxController);
    });
  });
});
