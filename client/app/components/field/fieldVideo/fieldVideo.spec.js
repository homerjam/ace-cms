import FieldVideoModule from './fieldVideo';
import FieldVideoController from './fieldVideo.controller';
import FieldVideoComponent from './fieldVideo.component';
import FieldVideoTemplate from './fieldVideo.html';

describe('FieldVideo', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldVideoModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldVideoController();
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
    //   expect(FieldVideoTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldVideoComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldVideoTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldVideoController);
    });
  });
});
