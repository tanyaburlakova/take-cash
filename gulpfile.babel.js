import gulp from 'gulp';
import less from 'gulp-less';
import sourcemaps from 'gulp-sourcemaps';
import watch from 'gulp-watch';
import browserSync from 'browser-sync';
import cleanCSS from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import handlebars from 'gulp-compile-handlebars';
import rename from 'gulp-rename';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import babel from 'gulp-babel';
import templateData from './app/data/data.json';
import mainBowerFiles from 'main-bower-files';
import svgstore from 'gulp-svgstore';
import cheerio from 'gulp-cheerio';
let bowerFiles = mainBowerFiles();

console.info(`
********** Bower Files **********
${bowerFiles}
`);

/******************************
 * Default task
 ******************************/
gulp.task('default', [
    'copyAssets',
    'browser-sync',
    'handlebars',
    'pluginsConcat',
    'jsConcat',
    'less',
    'svgstore',
    'imagemin',
    'watch'
]);

/******************************
 * Build task
 ******************************/
gulp.task('build', [
    'copyAssets',
    'handlebars',
    'pluginsConcatBuild',
    'jsConcatBuild',
    'lessBuild',
    'svgstore',
    'imagemin'
]);

/******************************
 * Copy assets to public
 ******************************/
gulp.task('copyAssets', () => {
    return gulp.src([
            'assets/**/*.*',
            '!assets/**/*.less'
        ])
        .pipe(gulp.dest('public'));
});

/******************************
 * Handlebars
 ******************************/
gulp.task('handlebars', () => {
    templateData.timestamp = +new Date();
    return gulp.src('app/templates/*.handlebars')
        .pipe(handlebars(templateData, {
            ignorePartials: true, //ignores the unknown partials
            partials: {
                footer: '<footer>the end</footer>'
            },
            batch: ['./app/templates/partials'],
            helpers: {
                capitals: function(str) {
                    return str.fn(this).toUpperCase();
                }
            }
        }))
        .pipe(rename({
            extname: '.html'
        }))
        .pipe(gulp.dest('./public'));
});

/******************************
 * JS plugins
 ******************************/
gulp.task('pluginsConcat', () => {
    return gulp.src(bowerFiles)
        .pipe(concat('plugins.min.js'))
        .pipe(gulp.dest('public/js'));
});

/******************************
 * JS plugins build
 ******************************/
gulp.task('pluginsConcatBuild', () => {
    return gulp.src(bowerFiles)
        .pipe(concat('plugins.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

/******************************
 * JS concat
 ******************************/
gulp.task('jsConcat', () => {
    return gulp.src(['app/js/**/*.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('app.js'))
        .on('error', notify.onError(function(error) {
            return '\nAn error occurred while uglifying js.\nLook in the console for details.\n' + error;
        }))
        .pipe(sourcemaps.write('../js'))
        .pipe(gulp.dest('public/js'));
});

/******************************
 * JS concat build
 ******************************/
gulp.task('jsConcatBuild', () => {
    return gulp.src(['app/js/**/*.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('app.js'))
        .pipe(uglify())
        .on('error', notify.onError(function(error) {
            return '\nAn error occurred while uglifying js.\nLook in the console for details.\n' + error;
        }))
        .pipe(sourcemaps.write('../js'))
        .pipe(gulp.dest('public/js'));
});

/******************************
 * Browser sync
 ******************************/
gulp.task('browser-sync', () => {
    let files = [
        'public/**/*.html',
        'public/js/**/*.js',
        'public/css/**/*.css'
    ];

    browserSync.init(files, {
        server: {
            baseDir: './public'
        },
        open: false,
        ghostMode: false
    });
});

/******************************
 * Watch
 ******************************/
gulp.task('watch', () => {
    gulp.watch('app/less/*.less', ['less']);
    gulp.watch('app/js/**/*.js', ['jsConcat']);
    gulp.watch('app/templates/**/*.handlebars', ['handlebars']);
});

/******************************
 * Less
 ******************************/
gulp.task('less', () => {
    return gulp.src('app/less/app.less')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less())
        .on('error', notify.onError(function(error) {
            return '\nAn error occurred while compiling css.\nLook in the console for details.\n' + error;
        }))
        .pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write('../css'))
        .pipe(gulp.dest('public/css'));
});

/******************************
 * Less build
 ******************************/
gulp.task('lessBuild', () => {
    return gulp.src('app/less/app.less')
        .pipe(plumber())
        .pipe(less())
        .on('error', notify.onError(function(error) {
            return '\nAn error occurred while compiling css.\nLook in the console for details.\n' + error;
        }))
        .pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({
            debug: true
        }, (details) => {
            let stats = details.stats;
            let input = stats.originalSize / 1000;
            let output = stats.minifiedSize / 1000;
            let efficiency = stats.efficiency * 100
            console.log(`
File name:  ${details.name}
Before:     ${input} kB
After:      ${output} kB
Time spent: ${stats.timeSpent} ms
Efficiency: ${efficiency}%
			`);
        }))
        .pipe(gulp.dest('public/css'));
});

/******************************
 * Images Optimization
 ******************************/
gulp.task('imagemin', function() {
    return gulp.src('assets/img/**/*.*')
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            plugins: [
                pngquant(),
                imageminMozjpeg()
            ]
        }))
        .pipe(gulp.dest('assets/img'));
});

/******************************
 * Sprite
 ******************************/
gulp.task('sprite', function() {
    var spriteData =
        gulp.src('assets/img/sprite/*.*')
        .pipe(spritesmith({
            retinaSrcFilter: ['assets/img/sprite/*@2x.png'],
            imgName: 'sprite.png',
            retinaImgName: 'sprite@2x.png',
            cssName: 'sprite.less',
            cssFormat: 'less_retina',
            algorithm: 'binary-tree',
            imgPath: '../img/sprite.png',
            retinaImgPath: '../img/sprite@2x.png',
        }));

    spriteData.img.pipe(gulp.dest('assets/img'));
    spriteData.css.pipe(gulp.dest('app/less'));
});


/******************************
 * SVG stuff
 ******************************/
gulp.task('svgstore', function() {
    return gulp.src('assets/img/svg/*.svg')
        .pipe(svgstore())
        .pipe(gulp.dest('public/icons'));
});