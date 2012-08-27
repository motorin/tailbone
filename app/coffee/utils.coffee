window.Inn ?= {}

##### Inn.isNotEmptyString( *sString* )
#
#---
# Вернёт true если передана пустая строка
window.Inn.isNotEmptyString = (sString) ->
  $.type( sString ) is "string" and sString.length

#### *class* Inn.Error
#
#---
# Для того, чтобы внутри try/catch можно было определить, ручная это ошибка или общего характера
# 
# Соответственно, для ручных throw надо использовать его.
class window.Inn.Error extends window.Error
  constructor: (@message) ->
    @name = "InnError"
    @stack = (new Error.__super__.constructor).stack

##### Inn.catchCustomError( *e* )
#
#---
# Обработчик кастомных ошибок
window.Inn.catchCustomError = (e) ->
  console.log e.message, e.stack if window.console?