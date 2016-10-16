module.exports = function (grunt) {
	const buildPath = '../public/assets/js/builds/';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			options: { spawn: false },
			files: [
				'./app/consts/**/*.js', './app/libs/**/*.js',
				'./app/scripts/**/*.js', './app/innner.js', './app/outer.js',
				'./app/components/**/*.jsx', './app/store/**/*.js', './app/containers/**/*.js',
				'./app/actions/**/*.js', './app/reducers/**/*.js', './app/selectors/**/*.js'
			],
			tasks: ['browserify']
		},
		cssmin: {
			target: {
				files: {
					'public/assets/css/master.min.css': ['public/assets/css/editor/master.css'],
					'public/assets/css/website.min.css': ['public/assets/css/website/website.css']
				}
			}
		},
		uglify: {
			oBuild: {
				src: `${buildPath}/outer.js`,
				dest: `${buildPath}outer-min.js`
			}/* ,
			iBuild: {
				src: 'public/assets/js/editor/build/inner-build.js',
				dest: 'public/assets/js/editor/build/inner-build.min.js'
			}*/
		},
		browserify: {
			options: {
				browserifyOptions: {
					basedir: './app',
					paths: ['./', './components/', './components/outer', './components/shared']
				},
				transform: [['babelify', {
					sourceMapsAbsolute: true,
					presets: ['es2015', 'react'],
					plugins: ['transform-object-rest-spread']
				}]],
				external: ['jquery', 'react', 'react-dom']
			},
			Outer: {
				src: ['./app/outer.js'],
				dest: `${buildPath}outer.js`
			},
			Inner: {
				src: ['./app/inner.js'],
				dest: `${buildPath}inner.js`
			}
		},
		sass: {
			options: {
				sourceMap: true
			},
			dist: {
				files: {
					'public/assets/css/editor.style.css': 'public/assets/scss/editor.style.scss',
					'public/assets/css/website.style.css': 'public/assets/scss/website.style.scss'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-babel');

	grunt.registerTask('default', [
		'browserify', 'uglify' /* 'sass', 'uglify', */
	]);
};
