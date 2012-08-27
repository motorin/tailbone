/*global module:false*/
/* To install PhantomJS on Mac OS X just run `brew install phantomjs` */
module.exports = function(grunt) {

  // CoffeeScript plugin
  grunt.loadNpmTasks('grunt-coffee');

  // Docco plugin
  grunt.loadNpmTasks('grunt-docco');

  // Clean plugin
  grunt.loadNpmTasks('grunt-clean');

  var task = grunt.task;
  var registerTask = grunt.registerTask;
  var file = grunt.file;
  var utils = grunt.utils;
  var log = grunt.log;
  var verbose = grunt.verbose;
  var fail = grunt.fail;
  var option = grunt.option;
  var config = grunt.config;
  var template = grunt.template;

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',

    // @todo: write own clean task
    clean: {
      folder: 'app/js/'
    },

    meta: {


      banner: [
        '/*',
        '   <%= pkg.title || pkg.name %> - v<%= pkg.version %>',
        // '   <%= grunt.template.today("yyyy-mm-dd") %>',
        '*/'
      ].join('\n')


    },


    docco: {
      app: {
        src: [
          'app/coffee/*.coffee'
        ]
      }

      // 'app/tests/*.coffee'
    },


    coffee: {


      app: {
        src: ['app/coffee/*.coffee'],
        dest: 'app/js/',
        options: {
            bare: false
        }
      },

      tests: {
        src: ['app/tests/*.coffee'],
        dest: 'app/tests/',
        options: {
            bare: false
        }
      }


    },

    concat: {


      app: {
        src: [
          '<banner:meta.banner>',
          'app/js/model.js',
          'app/js/collection.js',
          'app/js/template-mixin.js',
          'app/js/view.js',
          'app/js/layout.js',
          'app/js/data-manager.js'
        ],
        dest: 'app/app.js'
      },

      utils: {
        src: [
          '<banner:meta.banner>',
          'app/js/utils.js'
        ],
        dest: 'app/utils.js'
      }


    },

    min: {


      app: {
        src: [
            '<banner:meta.banner>',
            '<config:concat.app.dest>'
          ],
          dest: 'app/app.min.js'
      },

      utils: {
        src: [
            '<banner:meta.banner>',
            '<config:concat.utils.dest>'
          ],
          dest: 'app/utils.min.js'
      }


    },


    lint: {
      files: [
        'app/js/*.js',
        'app/app.js.bak'
        // 'app/tests/*.js' // Из-за хитрости тестов было много хинтов, решили отключить
      ]
    },


    jshint: file.readJSON( '.jshintrc' ),


    watch: {
      files: [
        '<config:coffee.app.src>',
        '<config:coffee.tests.src>'
      ],
      tasks: 'rebuild'
    },


    qunit: {
      files: [
        "app_tests.html",
        "utils_tests.html"
      ]
    },


    server: {
      port: 3000,
      base: './'
    }

  });

  // Default task.
  registerTask('default', 'coffee lint concat min docco');
  registerTask('rebuild', 'coffee lint concat docco')
  registerTask('test', 'qunit')

};
