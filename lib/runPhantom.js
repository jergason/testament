var q = require('q')
var childProcess = require('child_process')
var path = require('path')

/*
 * Check if PhantomJS is in the path. This will break on Windows, but who runs
 * CI stuff on windows?
 *
 * Returns a promise that will be true of false depending on whether phantom is
 * in the path or not.
 */
function checkForPhantom() {
  var deferred = q.defer()
  childProcess.exec('which phantomjs', function(err, stdout, stderr) {
    if (err && err.code !== 0) {
      deferred.resolve(false)
    }
    else if (!err) {
      deferred.resolve(true)
    }
    else {
      deferred.reject(new Error('Something went wrong with finding phantom: ' + stdout + stderr))
    }
  })
  return deferred.promise
}

function runPhantom(testFile) {
  return function(PORT) {
    var phantomExists = checkForPhantom()
    var deferred = q.defer()
    phantomExists.then(function(exists) {
      if (!exists) {
        deferred.reject(new Error('Could not find PhantomJS in your PATH.'))
      }
      else {
        var mochaPhantomBinary = path.join(__dirname, '..', 'node_modules', '.bin', 'mocha-phantomjs')
        var testRunnerUrl = 'http://localhost:'+ PORT + '/' + testFile
        childProcess.exec(mochaPhantomBinary+ ' ' + testRunnerUrl, function(err, stdout, stderr) {
          deferred.resolve([err, stdout, stderr])
        })
      }
    })
    return deferred.promise
  }
}

module.exports = runPhantom
