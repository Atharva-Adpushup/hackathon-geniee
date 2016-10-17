module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            options: {spawn: false},
            files: ['public/assets/js/**/*.js', 'public/assets/js/mcmConnect/**/*.js', 'public/assets/js/editor/**/*.js', 'public/assets/js/libs/**/*.js', 'public/assets/js/react_components/**/*.jsx', 'public/assets/scss/**/*.scss'],
            tasks: ['browserify'/*, 'uglify'*/, 'sass']
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
                src: 'public/assets/js/editor/build/outer-build.js',
                dest: 'public/assets/js/editor/build/outer-build.min.js'
            },
            iBuild: {
                src: 'public/assets/js/editor/build/inner-build.js',
                dest: 'public/assets/js/editor/build/inner-build.min.js'
            },
            mcmConnectBuild: {
                src: ['public/assets/js/mcmConnect/mcmConnect.js'],
                dest: 'public/assets/js/mcmConnect/mcmConnect.min.js'
            },
            signupBuild: {
                src: ['public/assets/js/build/signup-build.js'],
                dest: 'public/assets/js/build/signup-build.min.js'
            },
            baseLibsBuild: {
                src: ['public/assets/js/build/base-libs-build.js'],
                dest: 'public/assets/js/build/base-libs-build.min.js'
            }
        },
        browserify: {
            options: {
                browserifyOptions: {
                    basedir: ".",
                    paths:['./public/assets/js/', './public/assets/js/react_components/','./public/assets/js/react_components/EditorComponents/OuterComponents']
                },
                transform: [[require('grunt-react').browserify, {harmony: true}]]
            },
            Outer: {
                src: ['public/assets/js/editor/outer.js'],
                dest: 'public/assets/js/editor/build/outer-build.js'
            },
            Inner: {
                src: ['public/assets/js/editor/inject.js'],
                dest: 'public/assets/js/editor/build/inner-build.js'
            },
            Signup: {
                src: ['public/assets/js/signup.js'],
                dest: 'public/assets/js/build/signup-build.js'
            },
            BaseLibs: {
                src: [
                    'public/assets/js/libs/third-party/bootstrap.js',
                    'public/assets/js/libs/third-party/bootstrap-multiselect.js',
                    'public/assets/js/libs/third-party/notifications.js',
                    'public/assets/js/libs/custom/adpushup.js',
                    'public/assets/js/appEvent.js'
                ],
                dest: 'public/assets/js/build/base-libs-build.js'
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

    grunt.registerTask('default', [
        'browserify', 'sass', 'uglify', 'cssmin'
    ]);
};