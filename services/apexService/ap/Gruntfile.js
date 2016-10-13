module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			options: { spawn: false },
			files: ['./*.js', './libs/custom/*.js', './config/config.js'],
			tasks: ['browserify']
		},
		uglify: {
			oBuild: {
				src: './build/apex.js',
				dest: './build/apex-min.js'
			}
		},
		browserify: {
			options: {
				browserifyOptions: {
					basedir: '.'
				}
			},
			apex: {
				src: ['main.js'],
				dest: './build/apex.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', [
		'browserify', 'uglify'
	]);
};
