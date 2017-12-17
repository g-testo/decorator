const gulp = require('gulp'),
	pug = require('gulp-pug'),
	del = require('del'),

	rollup = require('rollup'),
	babel = require('rollup-plugin-babel'),
	commonjs = require('rollup-plugin-commonjs'),
	resolve = require('rollup-plugin-node-resolve'),
	uglify = require('rollup-plugin-uglify');
	connect = require('gulp-connect');
	open = require('gulp-open');

const babelConfig = {
	presets: [
		['env', {
			modules: false,
			useBuiltIns: 'usage',
			targets: {
				chrome: '40'
			}
		}]
	],
	plugins: ['external-helpers', 'transform-runtime'],
	runtimeHelpers: true,
	externalHelpers: true,
	exclude: 'node_modules/**'
};

gulp.task('clean', function(){
	return del(['index.html']);
});

gulp.task('js-dev', async function()
{
	const bundle = await rollup.rollup({
		input: 'src/js/index.js',
		plugins: [babel(babelConfig), commonjs(), resolve()]
	});

	await bundle.write({
		format: 'iife',
		file: 'build/bundle.js'
	});
});

gulp.task('html-dev', ['clean'], function(){
	console.log("reload")
	return gulp.src('src/index.pug')
		.pipe(pug({
			locals: {
				production: false
			}
		}))
		.pipe(gulp.dest('.'))
		.pipe(connect.reload());
});

gulp.task('js-prod', async function()
{
	const bundle = await rollup.rollup({
		input: 'src/js/index.js',
		plugins: [babel(babelConfig), commonjs(), resolve(), uglify()]
	});

	await bundle.write({
		format: 'iife',
		file: 'build/bundle.min.js'
	});
});

gulp.task('html-prod', ['clean'], function(){
	return gulp.src('src/index.pug')
		.pipe(pug({
			locals: {
				production: true
			}
		}))
		.pipe(gulp.dest('.'));
});

gulp.task('connect', function () {
    connect.server({
        root: './',
        port: 8001,
        livereload: true
    });
});

gulp.task('open', function(){
    gulp.src('index.html')
        .pipe(open({uri: 'http://localhost:8001/'}));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.{pug,js}', ['js-dev', 'html-dev'])
});

gulp.task('start-dev', ['js-dev', 'html-dev', 'connect', 'open', 'watch']);
gulp.task('build-dev', ['js-dev', 'html-dev']);
gulp.task('build', ['js-prod', 'html-prod']);
gulp.task('default', ['build']);
