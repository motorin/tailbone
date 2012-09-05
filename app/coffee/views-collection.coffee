window.Inn ?= {}

#### *class* Inn.ViewsCollection
#
#---
# Коллекция View
# 
class Inn.ViewsCollection


  ##### constructor()
  #
  #---
  # Конструктор
  # 
  # constructor: ->

  ##### collection
  #
  #---
  # Список View
  _list: _([])

  # model: Inn.View

  add: (view) ->
    @_list.push view

    # Ожидаем завершения рендеринга View
    view.on 'ready', =>
      # Если все View в коллекции отрендеренны, генерирует событие **ready**
      unless @_list.filter((view) -> return not view.ready).length
        @trigger 'ready'

    # Запускает рендеринг View
    view.render()

    return @


  ##### attachEvents()
  #
  #---
  # Вешает обработчики событий
  # 
  remove: (view) ->
    # Вычищаем View
    view.destroy()

    return @


  isEmpty: -> not @_list.length


  _.extend @prototype, Backbone.Events