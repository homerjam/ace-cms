import ToolsModule from './tools';
import ToolsController from './tools.controller';
import ToolsComponent from './tools.component';
import ToolsTemplate from './tools.html';

describe('Tools', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(ToolsModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new ToolsController();
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
    //   expect(ToolsTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = ToolsComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(ToolsTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(ToolsController);
    });
  });
});
