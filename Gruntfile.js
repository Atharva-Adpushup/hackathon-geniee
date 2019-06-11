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
					'public/assets/css/builds/editor.min.css': ['public/assets/css/libs/editor.css'],
					'public/assets/css/builds/website.min.css': ['public/assets/css/libs/website.css'],
					'public/assets/css/builds/onboarding.min.css': ['public/assets/css/libs/onboarding.css'],
					'public/assets/css/builds/tagManager.min.css': ['public/assets/css/libs/tagManager.css'],
					'public/assets/css/builds/interactiveAdsManager.min.css': [
						'public/assets/css/libs/interactiveAdsManager.css'
					]
				}
			}
		},
		uglify: {
			baseLibsBuild: {
				src: ['public/assets/js/libs/custom/base-libs.js'],
				dest: 'public/assets/js/builds/base-libs.min.js'
			},
			onboardingBuild: {
				src: ['public/assets/js/libs/custom/adpushup-onboarding.js'],
				dest: 'public/assets/js/builds/adpushup-onboarding.min.js'
			},
			signupBuild: {
				src: ['public/assets/js/builds/signup.js'],
				dest: 'public/assets/js/builds/signup.min.js'
			},
			utmParamterCookieBuild: {
				src: ['public/assets/js/builds/utmParamCookie.js'],
				dest: 'public/assets/js/builds/utmParamCookie.min.js'
			}
		},
		concat: {
			baseLibsBuild: {
				src: [
					'public/assets/js/libs/third-party/bootstrap.js',
					'public/assets/js/libs/third-party/bootstrap-multiselect.js',
					'public/assets/js/libs/third-party/notifications.js',
					'public/assets/js/libs/custom/appEvent.js',
					'public/assets/js/libs/custom/adpushup.js'
				],
				dest: 'public/assets/js/libs/custom/base-libs.js'
			},
			signupBuild: {
				src: [
					'public/assets/js/libs/third-party/js.cookie.js',
					'public/assets/js/libs/third-party/jquery.validate.js',
					'public/assets/js/libs/custom/signup.js'
				],
				dest: 'public/assets/js/builds/signup.js'
			},
			utmParamterCookieBuild: {
				src: [
					'public/assets/js/libs/third-party/js.cookie.js',
					'public/assets/js/libs/custom/utm-parameters-cookie.js'
				],
				dest: 'public/assets/js/builds/utmParamCookie.js'
			}
		},
		sass: {
			dist: {
				files: {
					'public/assets/css/libs/editor.style.css': 'public/assets/scss/editor.style.scss',
					'public/assets/css/libs/website.style.css': 'public/assets/scss/website.style.scss',
					'public/assets/css/libs/tagManager.style.css': 'public/assets/scss/tagManager.style.scss',
					'public/assets/css/libs/interactiveAdsManager.style.css':
						'public/assets/scss/interactiveAdsManager.style.scss'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-sass');

	grunt.registerTask('sasswatch', ['watch', 'cssmin']);

	grunt.registerTask('default', ['sass', 'concat', 'uglify', 'cssmin']);

	grunt.registerTask('sassTask', ['sass']);
};
