/*
 * grunt-dps
 * https://github.com/SixDimensions/grunt-dps
 *
 * Copyright (c) 2015 Charlie Wagner
 * Licensed under the MIT license.
 */

'use strict';

var dpsUtils;
var Q = require('q');
var _ = require('lodash');
var path = require('path');
var AdobeDPSAPI = require('AdobeDPSAPI-js');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('dps', 'Grunt automation for Adobe DPS 2015 api tasks.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options();
    var done = this.async();

    var deferred = Q.defer();
    var promise = deferred.promise;

    var dpsUtils = new AdobeDPSAPI(options.config);
    // retrieve access token
    promise.then(function() {
      var deferred = Q.defer();
      if (typeof options.config.access_token === 'undefined') {
        dpsUtils.getAccessToken(function(data) {
          dpsUtils.credentials.access_token = data.access_token;
          deferred.resolve();
        });
      }
      else {
        console.log('Using provided access_token');
        deferred.resolve();
      }
      return deferred.promise;
    })
    // get publications/applications
    .then(function() {
      var deferred = Q.defer();
      if (typeof options.getPublications === 'undefined') {
        deferred.resolve();
      }
      else {
        dpsUtils.getPublications(function(publications) {
          console.log(publications);
        });
      }
      return deferred.promise;
    })
    // PUT article
    .then(function() {
      var deferred = Q.defer();
      if (typeof options.putArticle === 'undefined') {
        deferred.resolve();
      }
      else {
        dpsUtils.getArticle(options.putArticle.entityName, function(article) {
          if (article.code === 'EntityNotFoundException') {
            article = options.putArticle;
          }
          else {
            article = _.merge(article, options.putArticle);
          }
          dpsUtils.putArticle(article, function(response) {
            console.log('Article '+article.entityName+' was updated.');
            deferred.resolve();
          });
        });
      }
      return deferred.promise;
    })
    // PUT article image
    .then(function() {
      var deferred = Q.defer();
      if (typeof options.putArticleImage === 'undefined') {
        deferred.resolve();
      }
      else {
        dpsUtils.getArticle(options.putArticleImage.entityName, function(article) {
          if (article.code === 'EntityNotFoundException') {
            deferred.reject(new Error('Entity was not found'));
            return;
          }
          dpsUtils.putArticleImage(article, path.resolve(options.putArticleImage.imagePath), function(result) {
            console.log('Article Image for '+result.entityName+' was uploaded and sealed.');
            deferred.resolve();
          });
        });
      }
      return deferred.promise;
    })
    // PUT article file
    .then(function() {
      var deferred = Q.defer();
      if (typeof options.uploadArticle === 'undefined') {
        deferred.resolve();
      }
      else {
        dpsUtils.uploadArticle(options.uploadArticle.entityName, options.uploadArticle.articlePath, function(result) {
          console.log('Article file for '+options.uploadArticle.entityName+' uploaded.');
          deferred.resolve();
        });
      }
      return deferred.promise;
    })
    // PUT article into collection
    .then(function() {
      var deferred = Q.defer();
      if (typeof options.addArticleToCollection === 'undefined') {
        deferred.resolve();
      }
      else {
        var outstandingRequests = 0;
        var __performAddArticleToCollection = function(collectionName) {
          dpsUtils.addArticleToCollection(options.addArticleToCollection.articleName, collectionName, function(result) {
            if (result.code === 'EntityNotFoundException') {
              deferred.reject(new Error('Entity was not found'));
              return;
            }
            console.log('Article '+options.addArticleToCollection.articleName+' added to the '+collectionName+' collection.');
            outstandingRequests--;
            if (outstandingRequests <= 0) {
              deferred.resolve();
            }
          });
        };
        if (Array.isArray(options.addArticleToCollection.collectionName)) {
          outstandingRequests = options.addArticleToCollection.collectionName.length;
          for(var i = 0; i < options.addArticleToCollection.collectionName.length; i++) {
            __performAddArticleToCollection(options.addArticleToCollection.collectionName[i]);
          }
        }
        else {
          __performAddArticleToCollection(options.addArticleToCollection.collectionName);
        }
      }
      return deferred.promise;
    })
    // publish
    .then(function() {
      var deferred = Q.defer();
      if (typeof options.publish === 'undefined') {
        deferred.resolve();
      }
      else {
        dpsUtils.publish(options.publish.entities, function(result) {
          if (result.code === 'EntityNotFoundException') {
            deferred.reject(new Error('Entity was not found'));
            return;
          }
          console.log('Entities '+options.publish.entities+' were published.');
          deferred.resolve();
        });
      }
      return deferred.promise;
    })
    .then(function() {
      done();
    }).catch(function (error) {
      console.log('Error: ' + error);
      done(false);
    });
    deferred.resolve(options.config);
  });

};
