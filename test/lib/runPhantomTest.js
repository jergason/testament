var assert = require('assert')
var child_process = require('child_process')
var oldExec = child_process.exec
var runPhantom = require('../../lib/runPhantom')

describe('runPhantom', function() {
  it('returns a promise for the output of phantom with the path to the given file', function(done) {
    var p = runPhantom('hurp')(1000)
    p.then(function(res) {
      // stdout should have a phantomjs error, but phantom should still run
      assert(/Failed to load the page\./.test(res[1]))
      done()
    }).done()
  })

  it('returns a promise with an error when phantomjs is not installed', function(done) {
    // gotta mock out exec so we return doesn't exist
    child_process.exec = function(data, cb) {
      cb({message: "Doesn't exist", code: 1}, "", "")
    }

    var p = runPhantom('hurp')(1000)
    p.fail(function(err) {
      assert(err)
      assert.equal(err.message, 'Could not find PhantomJS in your PATH.')
      child_process.exec = oldExec
      done()
    }).done()
  })
})
