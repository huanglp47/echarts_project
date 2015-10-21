var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var concat = require('gulp-concat');

var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var utf8Convert = require('gulp-utf8-convert');

var clean = require('gulp-clean');

var paths = {
    'css': 'public/css/**/*.css',
    'js': 'public/js/**/*.js',
    'images': 'public/images/*'
};
var _cdnPrefix = ''; // CDN配置

//合并js
//gulp.task('concatScript', function(){
//    return gulp.src(['public/js/jquery.js','public/js/jquery-ui.js','public/echarts/echarts-all.js'])
//        .pipe(concat('all_common.js'))
//        .pipe(gulp.dest('public/js'));
//});

// 先合并再压缩 js
//gulp.task('compressJs', ['concatScript'],  function(){
gulp.task('compressJs',  function(){
    return gulp.src(paths.js)
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('dist/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'));
});

//合并css
gulp.task('concatCss', function(){
    return gulp.src(['public/css/bootstrap.css','public/css/date-pick-ui.css','public/css/date-select.css'])
        .pipe(concat('all_common.css'))
        .pipe(gulp.dest('public/css'));
});

// 先合并,在压缩css
gulp.task('compressCss',['concatCss'], function(){
//gulp.task('compressCss', function(){
    return gulp.src(paths.css)
        .pipe(minifyCss())
        .pipe(rev())
        .pipe(gulp.dest('dist/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'));
});

gulp.task('imagemin', function(){
    return gulp.src(paths.images)
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(rev())
        .pipe(gulp.dest('dist/images'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/images'));
});
gulp.task('rev', ['compressJs', 'compressCss', 'imagemin'],  function(){
   return gulp.src(['rev/**/*.json', 'index_dist.html'])
       .pipe( revCollector({
            replaceReved: true,
            dirReplacements: {
                '/css/':_cdnPrefix + '/css/',
                '/js/': _cdnPrefix+'/js/',
                '/style/': '/style/',
                '/images/': function(manifest_value) {
                    return _cdnPrefix+'/images/'+ manifest_value;
                }
            }
        }) )
       .pipe(utf8Convert({  // 防止乱码
           encNotMatchHandle:function (file) {
               console.log(file + " 编码不正确，请修改！");
           }
       }))
       .pipe( gulp.dest('./') );
});
//自动监控js.css，images变化
//gulp.task('auto', function(event){
//    console.log('type:' +event.type + 'path:'+event.path);
//    gulp.watch(paths.js, ['compressJs','rev']);
//    gulp.watch(paths.css, ['compressCss','rev']);
//    gulp.watch(paths.images, ['imagemin','rev']);
//});
// 清除
gulp.task('clean', function(){
   return  gulp.src(['dist/', 'rev/' ,'public/js/all_common.js','public/css/all_common.css'], {read: false})
        .pipe(clean());
});
gulp.task('default',['clean'], function(){
    //gulp.start('compressJs',  'compressCss', 'imagemin', 'rev','auto');
    gulp.start('compressJs',  'compressCss', 'imagemin', 'rev');
});