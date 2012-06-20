window.Inn = {} if not window.Inn?

#
# Частая проверка
#
window.Inn.isNotEmptyString = (sString) ->
  $.type( sString ) is "string" and sString.length

#
# Class CustomError, чтобы внутри try/catch можно было определить, ручная это ошибка или общего характера
# Соответственно, для ручных throw надо использовать его.
#
class window.Inn.Error extends window.Error
  constructor: (@message) ->
    @name = "InnError"
    @stack = (new Error.__super__.constructor).stack

window.Inn.catchCustomError = (e) ->
  console.log e.message, e.stack if window.console?