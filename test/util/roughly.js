var util = require('util')

module.exports = rouglyEqual

function rouglyEqual(t, actual, expected, bound, userMsg) {
  var error = actual - expected
  userMsg = userMsg ? userMsg + ": " : ""
  var msg = util.format('%sactual %d ~= %d (%d) within %s bound',
                        userMsg, actual, expected, error, bound)
  t.ok(Math.abs(error) <= bound, msg)
}
