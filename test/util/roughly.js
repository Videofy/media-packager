var util = require('util')

module.exports = rouglyEqual

function rouglyEqual(t, actual, expected, bound, userMsg) {
  var error = actual - expected
  var diff = Math.abs(error)
  userMsg = userMsg ? userMsg + ": " : ""
  var msg = util.format('%sactual %d ~= %d (±%d) within ±%d bound',
                        userMsg, actual, expected, diff, bound)
  t.ok(diff <= bound, msg)
}
