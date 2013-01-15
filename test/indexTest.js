var assert = require('assert')
var path = require('path')
var runTests = require('../index')

describe('testament', function() {
  it('is a function', function() {
    assert(typeof runTests == 'function')
  })
})
