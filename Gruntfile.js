/*
 * grunt-dps
 * https://github.com/SixDimensions/grunt-dps
 *
 * Copyright (c) 2015 Charlie Wagner
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    globalConfig: {
      collectionArray: function() {
        return [',',''];
      }
    },
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    dps: {
      options: {
        config: grunt.file.readJSON('credentials.json')
      },
      main: {
        options: {
          putArticle: {
            entityName: 'completelynew',
            title: 'New Article'
          },
          putArticleImage: {
            entityName: 'completelynew',
            imagePath: 'creativecloud_small.png'
          },
          uploadArticle: {
            entityName: 'completelynew',
            articlePath: 'test.article'
          },
          addArticleToCollection: {
            articleName: 'completelynew',
            // collectionName: ['Itineraries', 'topLevelPhoneContent']
            collectionName: '<%= globalConfig.collectionArray() %>'
          },
          publish: {
            entities: [
              "collection/",
              "article/completelynew",
              "collection/Itineraries",
              "",
              "article/"
            ]
          }
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'dps', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
