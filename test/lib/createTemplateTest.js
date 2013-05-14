var assert = require('assert')
var path = require('path')
var getTemplatedTestFile = require('../../lib/createTemplate')
describe('getTemplatedTestFile', function() {
  describe('when given a test files path that doesnt exist', function() {
    it('returns a promise fulfilled with an error', function(done) {
      var promise = getTemplatedTestFile('hurp', 'durp', 'foo', [])
      promise.fail(function(err) {
        assert(err)
        done()
      })
    })
  })

  describe('when there are no CS or JS files', function() {
    describe('when the path is a directory', function() {
      it('returns a promise fulfilled with an error', function(done) {
        var promise = getTemplatedTestFile(path.join(__dirname, '..', 'data'), "", [])

        promise.fail(function(err) {
          assert(err)
          assert(/No JS files found/.test(err.message))
          done()
        })
      })
    })

    describe('when the path is a non-JS or CS file', function() {
      it('returns a promise fulfilled with an error', function(done) {
        var promise = getTemplatedTestFile(path.join(__dirname, '..', 'data', 'hurp.txt'), "", [])
        promise.fail(function(err) {
          assert(err)
          assert(/No JS files found/.test(err.message))
          done()
        })
      })
    })
  })

  describe('when given a path to valid CS or JS files', function() {
    var pathToFiles = path.join(__dirname, '..', 'cs_and_js')
    var baseDir = path.join(__dirname, '..', '..')

    describe('when given a valid template path', function() {
      var templatePath = path.join(__dirname, '..', 'data', 'template.hbs')

      it('returns the template with the files names filled in relative to the base dir in requirejs module path syntax', function(done) {
        var promise = getTemplatedTestFile(pathToFiles, templatePath, baseDir, [])

        promise.then(function(template) {
          assert(template.indexOf("bar") > -1)
          assert(template.indexOf("foo") > -1)
          done()
        }).done()
      })
    })

    describe('when given an invalid template path', function() {
      it('returns a promise fulfilled with a meaningful error', function(done) {
        var promise = getTemplatedTestFile(pathToFiles, 'ashfkajsdfh', baseDir, [])
        promise.fail(function(err) {
          assert(err)
          done()
        })
      })
    })
  })
})
