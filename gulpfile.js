const gulp = require("gulp");

const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const mqpacker = require("css-mqpacker");
const rename = require("gulp-rename");

const pug = require("gulp-pug");

const browserSync = require('browser-sync');
const del = require('del');


const imagemin = require('gulp-imagemin');
const spritesmith = require('gulp.spritesmith');
const mergeStream = require('merge-stream');
const vinylBuffer = require('vinyl-buffer');




gulp.task("scss", done => {
    gulp.src("src/scss/style.scss")
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer({browsers: [
                "last 5 version",
                "last 5 Chrome versions",
                "last 5 Firefox versions",
                "last 5 Opera versions",
                "last 5 Edge versions"
            ]}),
            mqpacker({
                sort: true
            })
        ]))
        .pipe(csso({
            comments: false
        }))
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest("build/assets/css"));
    done();
});


gulp.task('pug', () => {
    return gulp.src('src/index.pug')
        .pipe(pug({}))
        .pipe(gulp.dest("build/"));

});

gulp.task('clean', done => {
    del(['build']);
    done();
});

gulp.task('images', () => {
    return gulp.src('src/images/*.*')
        .pipe(plumber())
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true,
            }),
            imagemin.jpegtran({
                progressive: true,
            }),
            imagemin.optipng({
                optimizationLevel: 3,
            }),
        ]))
        .pipe(gulp.dest('build/images'));
});

gulp.task('pngSprites', () => {
    const spritesData = gulp.src('src/images/_sprites/*.png')
        .pipe(plumber())
        .pipe(spritesmith({
            cssName: '_sprites.scss',
            imgName: 'sprites.png',
            padding: 2,
        }));

    return mergeStream(
        spritesData.img
            .pipe(plumber())
            .pipe(vinylBuffer())
            .pipe(imagemin())
            .pipe(gulp.dest('build/images')),
        spritesData.css
            .pipe(gulp.dest('src/scss'))
    );
});


gulp.task("watch", () => {
    gulp.watch("src/scss/**/*.scss", gulp.series("scss"));
    gulp.watch("src/**/*.pug", gulp.series("pug"));
});

gulp.task('copy', () => {
    return gulp.src([
        'src/resources/**/*.*',
        'src/resources/**/.*',
    ], {
        base: 'src/resources',
        dot: true,
    })
        .pipe(gulp.dest('build/assets'));
});

gulp.task('serve', () => {
    browserSync
        .create()
        .init({
            notify: false,
            open: true,
            port: 3456,
            files: [
                './build/**/*',
            ],
            server: './build/',
            ui: false
        });
});

gulp.task('build', gulp.series(
    'clean',
    'pngSprites',
    'images',
    'pug',
    'scss',
    'copy'
));

gulp.task('default', gulp.series(
    'build',
    gulp.parallel(
        'serve',
        'watch'
    )
));



