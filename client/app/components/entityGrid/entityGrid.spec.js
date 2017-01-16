import EntityGridModule from './entityGrid';
import EntityGridController from './entityGrid.controller';
import EntityGridComponent from './entityGrid.component';
import EntityGridTemplate from './entityGrid.html';

describe('EntityGrid', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(EntityGridModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new EntityGridController();
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
    //   expect(EntityGridTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = EntityGridComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(EntityGridTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(EntityGridController);
    });
  });
});
