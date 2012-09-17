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
    @_list = {}

  ##### add()
  #
  #---
  # Добавляет View в список
  # 
  add: (view) ->
    unless @_list[view.id ? view.cid]?
      @_list[view.id ? view.cid] = view

    return @

  ##### remove()
  #
  #---
  # Удаляет View из списка
  #
  remove: (view) ->
    @_list[view.id ? view.cid] = undefined

    return @

  ##### render()
  #
  #---
  # Рендерит дочерние View
  # 
  render: ->
    for idx, view of @_list
      # Ожидаем завершения рендеринга View
      view.on 'ready', @viewReadyHandler, @
      # Запускает рендеринг View
      view.render()

    return @

  ##### stopRender()
  #
  #---
  # Прекращает рендеринг шаблонов
  # 
  stopRender: ->
    for idx, view of @_list
      view.off 'ready'
      # Останавливает ренеринг текущего View
      view.stopRender()

    return @

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

    return @

  ##### isRendered()
  #
  #---
  # Отрендеренны ли View
  # 
  isRendered: ->
    for idx, view of @_list
      return off unless view.ready

    on

  ##### get( *recursive* )
  #
  #---
  # Достаёт вью из списка
  # *recursive* - пока не реализована
  # 
  get: (id, recursive = off) ->
    # @todo: implement recursive
    @_list[id]

  ##### reset()
  #
  #---
  # Сбрасывает состояние всех View в списке
  # 
  reset: ->
    for idx, view of @_list
      view.ready = off

    return @


  ##### destroy()
  #
  #---
  # Вешает обработчики событий
  # 
  destroy: () ->
    for idx, view of @_list
      # Вычищаем View
      view.destroy()

    return @

  ##### isEmpty()
  #
  #---
  # Содержит ли список элементы
  # 
  isEmpty: ->
    for idx of @_list
      return off

    on


  _.extend @prototype, Backbone.Events