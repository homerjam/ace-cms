class FieldEmbedlyController {
  /* @ngInject */
  constructor ($timeout, HelperFactory) {
    const vm = this;

    // http://embed.ly/tools/generator
    vm.embedlyRegex = /((http:\/\/(.*youtube\.com\/watch.*|.*\.youtube\.com\/v\/.*|youtu\.be\/.*|.*\.youtube\.com\/user\/.*|.*\.youtube\.com\/.*#.*\/.*|m\.youtube\.com\/watch.*|m\.youtube\.com\/index.*|.*\.youtube\.com\/profile.*|.*\.youtube\.com\/view_play_list.*|.*\.youtube\.com\/playlist.*|www\.youtube\.com\/embed\/.*|www\.vimeo\.com\/groups\/.*\/videos\/.*|www\.vimeo\.com\/.*|vimeo\.com\/groups\/.*\/videos\/.*|vimeo\.com\/.*|vimeo\.com\/m\/#\/.*|player\.vimeo\.com\/.*))|(https:\/\/(.*youtube\.com\/watch.*|.*\.youtube\.com\/v\/.*|www\.youtube\.com\/embed\/.*|www\.vimeo\.com\/.*|vimeo\.com\/.*|player\.vimeo\.com\/.*)))/i;

    const youtubeRegex = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
    const vimeoRegex = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;

    vm.submitUrl = () => {
      $timeout(() => {
        HelperFactory.oembed(vm.fieldModel.value.url).then((result) => {
          result.url = result.url || vm.fieldModel.value.url;

          if (/youtube/i.test(result.provider_name)) {
            result.id = result.url.match(youtubeRegex)[1];
          }
          if (/vimeo/i.test(result.provider_name)) {
            result.id = result.url.match(vimeoRegex)[3];
          }

          vm.fieldModel.value.oembed = result;
          vm.fieldModel.value.url = result.url;
        });
      });
    };
  }
}

export default FieldEmbedlyController;
