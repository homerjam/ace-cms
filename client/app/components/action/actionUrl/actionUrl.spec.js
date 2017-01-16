import ActionUrlModule from './actionUrl';
import ActionUrlController from './actionUrl.controller';
import ActionUrlComponent from './actionUrl.component';
import ActionUrlTemplate from './actionUrl.html';

describe('ActionUrl', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(ActionUrlModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new ActionUrlController();
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
    //   expect(ActionUrlTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = ActionUrlComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(ActionUrlTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(ActionUrlController);
    });
  });
});
