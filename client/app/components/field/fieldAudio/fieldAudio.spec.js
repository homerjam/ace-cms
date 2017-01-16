import FieldAudioModule from './fieldAudio';
import FieldAudioController from './fieldAudio.controller';
import FieldAudioComponent from './fieldAudio.component';
import FieldAudioTemplate from './fieldAudio.html';

describe('FieldAudio', () => {
  let $rootScope;
  let makeController;

  beforeEach(window.module(FieldAudioModule.name));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FieldAudioController();
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
    //   expect(FieldAudioTemplate).to.match(/{{\s?vm\.name\s?}}/g);
    // });
  });

  describe('Component', () => {
    // component/directive specs
    const component = FieldAudioComponent();

    it('includes the intended template', () => {
      expect(component.template).to.equal(FieldAudioTemplate);
    });

    it('uses `controllerAs` syntax', () => {
      expect(component).to.have.property('controllerAs');
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FieldAudioController);
    });
  });
});
