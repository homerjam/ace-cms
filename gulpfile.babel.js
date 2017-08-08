require('dotenv').config();

const gulp = require('gulp');
const path = require('path');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync');
const rename = require('gulp-rename');
const template = require('gulp-template');
const bump = require('gulp-bump');
const yargs = require('yargs');
const _ = require('lodash');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfigDev = require('./webpack.dev');

const resolveToApp = (glob) => {
  glob = glob || '';
  return path.join('client', 'app', glob); // app/{glob}
};

const resolveToComponents = (glob) => {
  glob = glob || '';
  return path.join('client', 'app', 'components', glob); // app/components/{glob}
};

gulp.task('serve', () => {
  const bundler = webpack(webpackConfigDev);

  browserSync({
    open: true,
    port: process.env.DEV_PORT || 3000,
    proxy: {
      target: `localhost:${(process.env.PORT || 5000)}`,
      middleware: [
        webpackDevMiddleware(bundler, {
          path: webpackConfigDev.output.path,
          publicPath: webpackConfigDev.output.publicPath,
          noInfo: true,
          stats: {
            colors: true,
          },
        }),
        webpackHotMiddleware(bundler),
      ],
    },
  });
});

let reloadTimeout;

gulp.task('watch', () => {
  const allPaths = [].concat([resolveToApp('**/*.js'), resolveToApp('**/*.html'), resolveToApp('**/*.jade')]);
  gulp.watch(allPaths, () => {
    if (reloadTimeout) {
      clearTimeout(reloadTimeout);
    }
    reloadTimeout = setTimeout(browserSync.reload, 1000);
  });
});

// $ gulp component --name ComponentName [--parent parentfolder]
gulp.task('component', () => {
  const name = yargs.argv.name;
  const parentPath = yargs.argv.parent || '';
  const destPath = path.join(resolveToComponents(), parentPath, name);

  return gulp.src(path.join(__dirname, 'generator', 'component/**/*.**'))
    .pipe(template({
      name,
      upCaseName: _.upperFirst(name),
      kebabCaseName: _.kebabCase(name),
    }))
    .pipe(rename((path) => {
      path.basename = path.basename.replace('temp', name);
    }))
    .pipe(gulp.dest(destPath));
});

gulp.task('bump', () => {
  return gulp.src(['./package.json'])
    .pipe(bump({
      type: 'patch',
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('default', (done) => {
  runSequence('serve', 'watch', done);
});
