import FieldKeyValueModule from './fieldKeyValue';
import FieldKeyValueController from './fieldKeyValue.controller';
import FieldKeyValueComponent from './fieldKeyValue.component';
import FieldKeyValueTemplate from './fieldKeyValue.html';

describe('FieldKeyValue', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldKeyValueModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldKeyValueController();
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
    //   expect(FieldKeyValueTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldKeyValueComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldKeyValueTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldKeyValueController);
    });
  });
});
