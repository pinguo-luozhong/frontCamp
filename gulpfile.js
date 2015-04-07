/*global -$ */
'use strict';
// generated on 2015-04-07 using generator-pg-cloud 0.0.6
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('styles', function () {
  return gulp.src('app/**/*.css')
    .pipe($.sourcemaps.init())
    .pipe($.postcss([
      require('autoprefixer-core')({browsers: ['last 1 version']})
    ]))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

/*JS语法检查*/
gulp.task('jshint', function () {
  return gulp.src('app/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

/*解析html文件并进行标签build*/
gulp.task('html', ['styles'], function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('app/**/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

/*压缩图片*/
gulp.task('images', function () {
  return gulp.src('app/resource/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/resource/images'));
});

// gulp.task('fonts', function () {
//   return gulp.src(require('main-bower-files')({
//     filter: '**/*.{eot,svg,ttf,woff,woff2}'
//   }).concat('app/fonts/**/*'))
//     .pipe(gulp.dest('.tmp/fonts'))
//     .pipe(gulp.dest('dist/fonts'));
// });

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

/*启动开发环境服务*/
gulp.task('serve', ['styles'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  /*监听文件改变*/
  gulp.watch([
    'app/**/*.html',
    'app/**/*.js',
    'app/resource/**/*'
  ]).on('change', reload);

  gulp.watch('app/**/*.css', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});

/*启动构建环境服务*/
gulp.task('dist', ['styles'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
});

/*注入bower依赖*/
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;
  gulp.src('app/**/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

/*构建备用方法*/
gulp.task('build', ['jshint', 'html', 'images', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

/*构建建议方法*/
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
