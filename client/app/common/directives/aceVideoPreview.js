import angular from 'angular';

export default angular.module('ace.videoPreview', [])
  .directive('aceVideoPreview', ['$rootScope', '$http', '$timeout', 'appConfig',
    ($rootScope, $http, $timeout, appConfig) => ({
      restrict: 'EA',
      replace: true,

      template: '<div class="ace-video-preview">' +
        '<div class="ace-video-preview--message" ng-show="encoding">Encoding in progress</div>' +
        '<img class="ace-video-preview--thumbnail" ng-show="!encoding" ng-src={{thumbnail}}>' +
        '</div>',

      scope: {
        video: '=',
      },

      link($scope) {
        $scope.$watch('video', (video) => {
          if (!video) {
            return;
          }

          if (video.metadata) {
            if (video.metadata.job.status !== 'Complete') {
              checkJob(video.metadata.job.id);
            } else {
              showVideo(video);
            }
          }
        });

        let showVideo = (video) => {
          $scope.encoding = false;

          $scope.thumbnail = `https://${video.bucket}.s3.amazonaws.com/${$rootScope.assetSlug}/${video.mediaType}/${video.thumbnail}`;
        };

        let checkJob = (jobId) => {
          $scope.encoding = true;

          $http({
            url: `${appConfig.apiUrl}/transcode/job/${jobId}`,
            method: 'GET',
          }).success((data) => {
            if (data.Status !== 'Complete') {
              $timeout(() => {
                checkJob(jobId);
              }, 5000);
            } else {
              $scope.video.metadata.job.status = data.Status;

              $scope.video.variants = $scope.video.variants.map((variant, i) => {
                variant.duration = data.Outputs[i].Duration;
                variant.width = data.Outputs[i].Width;
                variant.height = data.Outputs[i].Height;

                return variant;
              });

              showVideo($scope.video);
            }
          });
        };
      },
    }),
  ]);
