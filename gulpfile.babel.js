import gulp from 'gulp';
import path from 'path';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import rename from 'gulp-rename';
import template from 'gulp-template';
import bump from 'gulp-bump';
import jscs from 'gulp-jscs';
import plumber from 'gulp-plumber';
import yargs from 'yargs';
import env from 'node-env-file';
import _ from 'lodash';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfigDev from './webpack.dev';
import webpackConfigBuild from './webpack.build';

if (!process.env.ENVIRONMENT) {
  env('.env');
}

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

gulp.task('jscs:fix', () => {
  return gulp.src(['**/*.js'])
    .pipe(plumber())
    .pipe(jscs({
      fix: true,
    }))
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'))
    .pipe(gulp.dest('./'));
});

gulp.task('build', () => {
  return gulp.src(webpackConfigBuild.entry)
    .pipe(webpackStream(webpackConfigBuild))
    .pipe(gulp.dest(webpackConfigBuild.output.path));
});

gulp.task('bump', () => {
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({
      type: 'patch',
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('release', (done) => {
  runSequence('build', 'bump', done);
});

gulp.task('default', (done) => {
  runSequence('serve', 'watch', done);
});
