var test = require('tape')
var feathers = require('feathers')
var hooks = require('feathers-hooks')
var memory = require('feathers-memory')
var each = require('async-each')

var validate

test('require module', function (t) {
  validate = require('../')
  t.ok(validate, 'module exports')
  t.equal(typeof validate, 'function', 'module exports function')
  t.end()
})

test('validates service', function (t) {
  var app = createThingsApp()

  var things = app.service('things')

  var ops = [
    ['create', { id: 'a', name: 'computer' }, null],
    ['update', { id: 'a', name: 'desk'}, null],
    ['create', { id: 'b', name: 'chair'}, true],
    ['patch', { id: 'a', name: 'chair'}, null]
  ]

  each(ops, function (op, next) {
    var fn = op[0]
    var input = op[1]
    var error = op[2]

    var cb = function (err, output) {
      if (error == null) {
        t.error(err, 'no error with ' + fn + '(' + input.id + ')')
        t.equal(output.id, input.id, 'returned object has same id')
      } else {
        t.ok(err, 'has error')
        t.equal(err.message, 'object is not valid', 'error has correct message')
      }
      next()
    }

    switch (fn) {
      case 'create':
        things[fn](input, cb)
        break
      case 'update':
      case 'patch':
        things[fn](input.id, input, cb)
        break
      default:
        throw new Error('unimplemented')
    }
  }, function (err) {
    t.error(err, "test doesn't error")
    t.end()
  })
})

function createThingsApp() {

  var app = feathers()
    .configure(hooks())

  app.use('things', memory())

  var schema = {
    required: true,
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'only-a'
      },
      name: {
        type: 'string'
      }
    },
    additionalProperties: false
  }
  var options = {
    formats: {
      'only-a': /^a+$/
    }
  }

  validate(app.service('things'), schema, options)

  return app
}

function thingsSchema () {
}
