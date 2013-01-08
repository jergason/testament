var exec = require('child_process').exec
var q = require('q')

function runPhantom(testFile) {
  console.log('calling runPhantom')
  var deferred = q.defer()
  var phantom = exec('mocha-phantomjs ' + testFile, function(err, stdout, stderr) {
    console.log('args are', arguments)
    deferred.resolve([err, stdout, stderr])
  })
  return deferred.promise
}

module.exports = runPhantom
