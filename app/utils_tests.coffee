#
# Utilities
#
module "Utils: Inn.isNonEmptyString",
  setup: ->
    @isNotEmptyString = window.Inn.isNotEmptyString

test "try different cases", 8, ->
  ok @isNotEmptyString("test string"), '"test string"'
  ok @isNotEmptyString( new String("test string") ),  'new String("test string")'
  ok not @isNotEmptyString(""), '""'
  ok not @isNotEmptyString(new String()), 'new String'
  ok not @isNotEmptyString({}), '{}'
  ok not @isNotEmptyString(123), '123'
  ok not @isNotEmptyString([]), '[]'
  ok not @isNotEmptyString( new Object() ), 'new Object'

#
#
#
module "Utils: Inn.Error",
  setup: ->
    @InnError = window.Inn.Error

test "throw new Inn.Error: exception throwed and it is instanceof Inn.Error", 1, ->
  oError = new @InnError "Test error"
  raises ->
    throw oError
  , @InnError

test "Common Error is not instanceof Inn.Error", 1, ->
  try
    throw new Error "Common Error"
  catch err
    ok err not instanceof @InnError