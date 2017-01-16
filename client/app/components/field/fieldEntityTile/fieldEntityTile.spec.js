import FieldEntityTileModule from './fieldEntityTile';
import FieldEntityTileController from './fieldEntityTile.controller';
import FieldEntityTileComponent from './fieldEntityTile.component';
import FieldEntityTileTemplate from './fieldEntityTile.html';

describe('FieldEntityTile', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldEntityTileModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldEntityTileController();
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
    //   expect(FieldEntityTileTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldEntityTileComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldEntityTileTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldEntityTileController);
    });
  });
});
