module.exports = function (grunt) {
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
                    'public/assets/css/builds/website.min.css': ['public/assets/css/libs/website.css']
                }
            }
        },
        uglify: {
            baseLibsBuild: {
                src: ['public/assets/js/builds/base-libs-build.js'],
                dest: 'public/assets/js/builds/base-libs-build.min.js'
            },
            onboardingBuild: {
                src: ['public/assets/js/libs/custom/adpushup-onboarding.js'],
                dest: 'public/assets/js/builds/adpushup-onboarding.min.js'
            },
            signupBuild: {
                src: ['public/assets/js/build/signup-build.js'],
                dest: 'public/assets/js/build/signup-build.min.js'
            },
        },
        browserify: {
            options: {
                browserifyOptions: {
                    basedir: "."
                },
            },
            Signup: {
                src: ['public/assets/js/libs/custom/signup.js'],
                dest: 'public/assets/js/build/signup-build.js'
            },
            BaseLibs: {
                src: [
                    'public/assets/js/libs/third-party/bootstrap.js',
                    'public/assets/js/libs/third-party/bootstrap-multiselect.js',
                    'public/assets/js/libs/third-party/notifications.js',
                    'public/assets/js/appEvent.js',
                    'Editor/app/libs/adpushup.js'
                ],
                dest: 'public/assets/js/builds/base-libs-build.js'
            }
        },
        concat: {
            websiteCSSBuild: {
                src: ['public/assets/css/third-party/bootstrap.css', 
                    'public/assets/css/third-party/bootstrap-multiselect.css', 
                    'public/assets/css/third-party/fontAwesome.css',
                    'public/assets/css/libs/website.style.css',
                    'public/assets/css/libs/notifications.css'],
                dest: 'public/assets/css/libs/website.css',
            },
            editorCSSBuild: {
                src: ['public/assets/css/third-party/bootstrap.css', 
                    'public/assets/css/third-party/bootflat.css', 
                    'public/assets/css/third-party/fontAwesome.css',
                    'public/assets/css/libs/editor.style.css',
                    'public/assets/css/third-party/colorpicker.css',
                    'public/assets/css/third-party/introjs.min.css',
                    'public/assets/css/third-party/bootstrap.icons.css',
                    'public/assets/css/third-party/codemirror.min.css',
                    'public/assets/css/third-party/solarized.min.css'],
                dest: 'public/assets/css/libs/editor.css',
            },
        },
        sass: {
            dist: {
                files: {
                    'public/assets/css/libs/editor.style.css': 'public/assets/scss/editor.style.scss',
                    'public/assets/css/libs/website.style.css': 'public/assets/scss/website.style.scss'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('sasswatch', ['watch', 'cssmin']);

    grunt.registerTask('default', [
        'browserify', 'sass', 'concat', 'uglify', 'cssmin'
    ]);
};