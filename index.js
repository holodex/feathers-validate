var validator = require('is-my-json-valid')

module.exports = validate

// assumes service is already configured with 'feathers-hooks'
function validate (service, schema, options) {

  var validateHook = createValidateHook(schema, options)

  service.before({
    create: validateHook,
    update: validateHook,
    patch: validateHook
  })
}

function createValidateHook (schema, options) {
  var validate = validator(schema, options)

  return function validateHook (hook, next) {
    validate(hook.data)

    var err
    if (validate.errors) {
      err = createValidationError(validate.errors, hook.data)
    }
    next(err)
  }
}

function createValidationError (errors, data) {
  var err = new Error('object is not valid')

  err.errors = errors
  err.data = data

  return err
}
