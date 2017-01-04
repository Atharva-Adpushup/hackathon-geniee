module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            options: {spawn: false},
            files: ['public/assets/scss/**/*.scss'],
            tasks: ['sass']
        },
        cssmin: {
            target: {
                files: {
                    'public/assets/css/builds/editor/editor.min.css': ['public/assets/css/libs/editor/editor.css'],
                    'public/assets/css/builds/website/website.min.css': ['public/assets/css/libs/website/website.css']
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
        sass: {
            dist: {
                files: {
                    'public/assets/css/libs/editor/editor.style.css': 'public/assets/scss/editor.style.scss',
                    'public/assets/css/libs/website/website.style.css': 'public/assets/scss/website.style.scss'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');
    
    grunt.registerTask('sasswatch', ['watch', 'cssmin']);

    grunt.registerTask('default', [
        'browserify', 'sass', 'uglify', 'cssmin'
    ]);
};