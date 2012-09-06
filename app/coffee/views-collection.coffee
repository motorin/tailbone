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
  constructor: ->
    ##### collection
    #
    #---
    # Список View
    @_list = []

  # model: Inn.View

  add: (view) ->
    @_list.push view

    return @

  render: ->
    for view in @_list
      # Ожидаем завершения рендеринга View
      # @todo: проверить на утечки
      view.on 'ready', =>
        # Если все View в коллекции отрендеренны, генерирует событие **ready**
        if @isRendered()
          @trigger 'ready'

      # Запускает рендеринг View
      view.render()

  isRendered: ->
    return _.filter(@_list, (view) -> return not view.ready).length is 0

  get: (id, recursive = off) ->
    # @todo: implement recursive
    return _.find(@_list, (view) -> view.id is id)

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