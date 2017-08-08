import moment from 'moment';

class DashboardController {
  /* @ngInject */
  constructor($rootScope, $window, ConfigFactory, SettingsFactory, HelperFactory, AdminFactory) {
    const vm = this;

    const config = ConfigFactory.config();

    if (!config.client.baseUrl || config.client.baseUrl === '') {
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

    if (config.client.gaView) {
      // var now = moment();

      HelperFactory.analytics({
        ids: `ga:${config.client.gaView}`,
        // 'start-date': moment(now).subtract(1, 'day').day(0).subtract(1, 'week').format('YYYY-MM-DD'),
        // 'end-date': moment(now).format('YYYY-MM-DD'),
        'start-date': '7daysAgo',
        'end-date': 'today',
        dimensions: 'ga:date,ga:nthDay',
        metrics: 'ga:sessions',
        filters: `ga:hostname=~${siteHostname};${sourcesFilter}`,
      }).then((result) => {
        if (result.totalResults === 0) {
          return;
        }

        const sessionsData = result.rows.map(row => ({
          sessions: row[2],
          date: moment(row[0], 'YYYYMMDD').format('DD/MM'),
        }));

        vm.sessionsChart = {
          data: {
            x: 'x ',
            json: sessionsData,
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

      HelperFactory.analytics({
        ids: `ga:${config.client.gaView}`,
        // 'start-date': moment(now).subtract(1, 'day').day(0).subtract(1, 'week').format('YYYY-MM-DD'),
        // 'end-date': moment(now).format('YYYY-MM-DD'),
        'start-date': '7daysAgo',
        'end-date': 'today',
        dimensions: 'ga:source,ga:referralPath',
        metrics: 'ga:sessions',
        filters: `ga:medium==referral;ga:hostname=~${siteHostname};${sourcesFilter}`,
        sort: '-ga:sessions',
      }).then((result) => {
        if (result.totalResults === 0) {
          vm.referrals = [];
          return;
        }

        const data = result.rows.map(row => ({
          source: row[0],
          fullReferrer: row[0] + row[1],
          sessions: row[2],
        }));

        vm.referrals = data.slice(0, 10);
      });

    }
  }
}

export default DashboardController;
