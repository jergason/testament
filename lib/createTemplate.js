var fs = require('fs')
var path = require('path')
var findit = require('findit')
var q = require('q')
var Handlebars = require('Handlebars')

function isCsOrJsFile(file) {
  return /.*\.(js)|(cs)$/.test(file)
}

function isJsFile(file) {
  return /.*\.(js)$/.test(file)
}

function recursivelyFindJsFiles(path) {
  var deferred = q.defer()
  var files = []
  var finder = findit.find(path)
  finder.on('file', function(file, stat) {
    if (isCsOrJsFile(file)) {
      files.push(file)
    }
  })

  finder.on('end', function() {
    deferred.resolve(files)
  })

  return deferred.promise
}


function checkIfFileExists(pathToTest) {
  var deferred = q.defer()
  fs.exists(pathToTest, function(exists) {
    if (!exists) {
      return deferred.reject(new Error('Looks like ' + pathToTest + ' does not exist.'))
    }

    deferred.resolve(pathToTest)
  })
  return deferred.promise
}

function getFileNames(pathToTest) {
  var promise = q.nfcall(fs.stat, pathToTest)
  return promise.then(function(stats) {
    if (stats.isDirectory()) {
      // we recursively read in all test files
      return recursivelyFindJsFiles(pathToTest)
    }
    else {
      return [pathToTest]
    }
  })
}

/*
 * Takes a path to a template file and a test file or files, and returns
 * the template filled out with the test file or files.
 **/
function getTemplatedTestFile(pathToTestFiles, pathToTemplateFile) {
  return checkIfFileExists(pathToTestFiles)
    .then(getFileNames)
    .then(createTemplate(pathToTemplateFile)).done()
}

function createTemplate(pathToTemplateFile) {
  return function(files) {
    return q.nfcall(fs.readFile, pathToTemplateFile, 'utf8').then(function(file) {
      console.log('getting here!')
      var template = Handlebars.compile(file)
      // TODO: transform paths better
      files = files.map(function(f) {
        return {fileName: relativePathFromBaseDir(__dirname, f)}
      })
      return template({files: files})
    })
  }
}

/*
 * Resolve the paths from the baseUrl to the path the tests are in
 */
function relativePathFromBaseDir(baseDir, filePath) {
  return path.relative(baseDir, filePath)
}

module.exports = getTemplatedTestFile
