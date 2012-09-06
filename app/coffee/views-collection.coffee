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

  ##### add()
  #
  #---
  # Добавляет View в список
  # 
  add: (view) ->
    @_list.push view

    return @

  ##### render()
  #
  #---
  # Рендерит дочерние View
  # 
  render: ->
    for view in @_list
      # Ожидаем завершения рендеринга View
      view.on 'ready', @viewReadyHandler, @

      # Запускает рендеринг View
      view.render()

  ##### viewReadyHandler()
  #
  #---
  # Обработчик завершения рендеринга конкретной View
  # 
  viewReadyHandler: ->
    # Если все View в коллекции отрендеренны, генерирует событие **ready**
    if @isRendered()
      @trigger 'ready'

      # Отписываемся от событий
      @off 'ready'

  ##### isRendered()
  #
  #---
  # Отрендеренны ли View
  # 
  isRendered: ->
    return _.filter(@_list, (view) -> return not view.ready).length is 0

  ##### get( *recursive* )
  #
  #---
  # Достаёт вью из списка
  # *recursive* - пока не реализована
  # 
  get: (id, recursive = off) ->
    # @todo: implement recursive
    return _.find(@_list, (view) -> view.id is id)

  ##### reset()
  #
  #---
  # Сбрасывает состояние всех View в списке
  # 
  reset: ->
    for view in @_list
      view.ready = off


  ##### destroy()
  #
  #---
  # Вешает обработчики событий
  # 
  destroy: () ->
    for view in @_list
      # Вычищаем View
      view.destroy()

    return @

  ##### isEmpty()
  #
  #---
  # Содержит ли список элементы
  # 
  isEmpty: -> not @_list.length


  _.extend @prototype, Backbone.Events