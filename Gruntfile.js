const sassModule = require('node-sass');

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			options: { spawn: false },
			files: ['public/assets/scss/**/*.scss'],
			tasks: ['sass']
		},
		cssmin: {
			target: {
				files: {
					'public/assets/css/builds/editor.min.css': ['public/assets/css/libs/editor.css']
				}
			}
		},
		sass: {
			options: {
				implementation: sassModule
			},
			dist: {
				files: {
					'public/assets/css/libs/editor.style.css': 'public/assets/scss/editor.style.scss'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-sass');

	grunt.registerTask('sasswatch', ['watch', 'cssmin']);

	grunt.registerTask('default', ['sass', 'cssmin']);

	grunt.registerTask('sassTask', ['sass']);
};
