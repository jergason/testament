var fs = require('fs')
var path = require('path')
var findit = require('findit')
var q = require('q')
var Handlebars = require('handlebars')

function isCsOrJsFile(file) {
  return isCsFile(file) || isJsFile(file)
}

function isCsFile(file) {
  return /.*\.(coffee)$/.test(file)
}

function isJsFile(file) {
  return /.*\.js$/.test(file)
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
    if (files.length == 0) {
      deferred.reject(noTestFilesError(path))
    }
    else {
      deferred.resolve(files)
    }
  })

  return deferred.promise
}

function noTestFilesError(path) {
  return new Error('No JS files found at ' + path + '.');
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
      return recursivelyFindJsFiles(pathToTest)
    }
    else {
      if (isCsOrJsFile(pathToTest)) {
        return [pathToTest]
      }
      else {
        throw noTestFilesError(pathToTest)
      }
    }
  })
}

/*
 * Takes a path to a template file and a test file or files, and returns
 * the template filled out with the test file or files.
 **/
function getTemplatedTestFile(pathToTestFiles, pathToTemplateFile, baseDir) {
  return checkIfFileExists(pathToTestFiles)
    .then(getFileNames)
    .then(createTemplate(pathToTemplateFile, baseDir))
}

function createTemplate(pathToTemplateFile, baseDir) {
  return function(files) {
    return q.nfcall(fs.readFile, pathToTemplateFile, 'utf8').then(function(file) {
      var template = Handlebars.compile(file)

      files = files.map(function(f) {
        var name = relativePathFromBaseDir(baseDir, f)
        // mark if it is a CS file
        if (isCsFile(name)) {
          name = 'cs!' + name
        }
        // strip off the .js or .cs ending
        name = name.replace(/\.(coffee|js)$/, '')
        return {fileName: name}
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
