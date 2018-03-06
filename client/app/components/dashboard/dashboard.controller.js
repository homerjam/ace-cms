import _ from 'lodash';
import moment from 'moment';

class DashboardController {
  /* @ngInject */
  constructor($rootScope, $window, $http, ConfigFactory) {
    const vm = this;

    let config = ConfigFactory.getConfig();

    vm.gaAuthorised = !!_.get(config, 'provider.google.access_token') && !!_.get(config, 'provider.google.refresh_token');
    vm.gaView = config.client.gaView;

    if (!vm.gaAuthorised || !vm.gaView) {
      return;
    }

    const init = async () => {
      try {
        if (config.provider.google.expires < Math.floor(+new Date() / 1000)) {
          config = await ConfigFactory.refreshProvider('google');
        }
      } catch (error) {
        console.error(error.data.message);
        return;
      }

      const siteUrl = new $window.URL(config.client.baseUrl || '');
      let siteHostname = siteUrl.hostname.split('.');
      siteHostname = siteHostname.length >= 3 ? siteHostname.splice(1).join('.') : siteHostname.join('.');

      let currentHostname = $window.location.hostname.split('.');
      currentHostname = currentHostname.length >= 3 ? currentHostname.splice(1).join('.') : currentHostname.join('.');

      const excludedSources = [
        currentHostname,
        'localhost',
      ];

      const sourcesFilter = excludedSources.map(str => `ga:source!~${str}`).join(';');

      $http.get(`https://www.googleapis.com/analytics/v3/data/ga?access_token=${config.provider.google.access_token}`, {
        cache: true,
        params: {
          ids: `ga:${config.client.gaView}`,
          'start-date': '7daysAgo',
          'end-date': 'today',
          dimensions: 'ga:date,ga:nthDay',
          metrics: 'ga:sessions',
          // filters: `ga:hostname=~${siteHostname};${sourcesFilter}`,
          filters: sourcesFilter,
        },
      })
        .then(({ data }) => {
          if (data.totalResults === 0) {
            return;
          }

          const results = data.rows.map(row => ({
            sessions: row[2],
            date: moment(row[0], 'YYYYMMDD').format('DD/MM'),
          }));

          vm.sessionsChart = {
            data: {
              x: 'x ',
              json: results,
              keys: {
                x: 'date',
                value: ['sessions'],
              },
              names: {
                sessions: 'Sessions',
              },
            },
            axis: {
              x: {
                type: 'category',
              },
            },
          };
        });

      $http.get(`https://www.googleapis.com/analytics/v3/data/ga?access_token=${config.provider.google.access_token}`, {
        cache: true,
        params: {
          ids: `ga:${config.client.gaView}`,
          'start-date': '7daysAgo',
          'end-date': 'today',
          dimensions: 'ga:source,ga:referralPath',
          metrics: 'ga:sessions',
          // filters: `ga:medium==referral;ga:hostname=~${siteHostname};${sourcesFilter}`,
          filters: `ga:medium==referral;${sourcesFilter}`,
          sort: '-ga:sessions',
        },
      })
        .then(({ data }) => {
          if (data.totalResults === 0) {
            vm.referrals = [];
            return;
          }

          const results = data.rows.map(row => ({
            source: row[0],
            fullReferrer: row[0] + row[1],
            sessions: row[2],
          }));

          vm.referrals = results.slice(0, 5);
        });
    };

    init();
  }
}

export default DashboardController;
