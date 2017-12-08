require('dotenv').config();

const gulp = require('gulp');
const path = require('path');
const runSequence = require('run-sequence');
const rename = require('gulp-rename');
const template = require('gulp-template');
const yargs = require('yargs');
const _ = require('lodash');

const resolveToComponents = (glob) => {
  glob = glob || '';
  return path.join('client', 'app', 'components', glob); // app/components/{glob}
};

// $ gulp component --name componentName [--parent parentfolder]
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

gulp.task('default', (done) => {
  runSequence('serve', 'watch', done);
});
