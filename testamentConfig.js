var _ = require("underscore")

var config = {
  testamentMount: '/testament',
  testTemplate: 'testRunnerTemplate.hbs',
  testHtml: 'testament/TestRunner.html',
  testJs: 'allTests.js',
  // these are all the testament files we need path relative to us
  testamentFiles: {
    "/mocha.js" : "node_modules/mocha/mocha.js",
    "/mocha.css" : "node_modules/mocha/mocha.css",
    "/chai.js" : "node_modules/chai/chai.js",
    "/require.js" : "node_modules/requirejs/require.js",
    "/TestRunner.html" : "TestRunner.html",
    "/Squire.js" : "Squire.js"
  },
  // these are additional modules we want to inject into the require.js config (mostly just squire)
  additionalRequire: {
    "Squire" : "testament/Squire"
  }
}

resolvedConfig = null

module.exports = function(userConfig) {
  if (resolvedConfig) {
    return resolvedConfig
  } else {
    userConfig = userConfig || {}
    for (var rName in config.additionalRequire) {
      var rPath = config.additionalRequire[rName]
      userConfig.requireModules = userConfig.requireModules || {}
      userConfig.requireModules[rName] = rPath
    }
    var requireModules = []
    for (var reqName in userConfig.requireModules) {
      userConfig.requireModules = userConfig.requireModules || {}
      var reqPath = userConfig.requireModules[reqName]
      requireModules.push({reqName: reqName, reqPath: reqPath})
    }
    userConfig.requireModules = requireModules
    resolvedConfig =  _.defaults(userConfig, config)
    return resolvedConfig
  }
}
