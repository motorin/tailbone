window.Inn ?= {}

#### *class* Inn.View
#
#---
# Класс представления
# 
Inn.View = Backbone.View.extend({


  ##### initialize( *options*, *partials* )
  #
  #---
  # Конструктор
  # 
  # **options** - Хеш с настройками
  # 
  # **partials** - Хеш с конфигурацией partial-ов
  initialize: (options, @partials = []) ->
    @_load()


  ##### destroy()
  #
  #---
  # Уничтожает View и всех его детей
  #
  # Генерирует событие **destroy**
  destroy: ->
    # Уничтожаем ссылку на родителя
    @parent = null

    return @


  ##### render()
  #
  #---
  # Рендерит View и всех его детей
  render: ->
    #  ... тут будем рендерить себя ...

    # Добавляем partials в очередь рендеринга
    for partial, idx in @partials
      @children.add partial

    # Вытаскиваем детей
    for child, idx in @pullChildren()
      @children.add child

    # Если нет partial-ов, генериуем событие **ready**
    if @children.isEmpty()
      setTimeout =>
        # Устанавливаем флажок ready в true
        @ready = on
        @trigger 'ready'
    else
      # Ожидаем завершения рендеринга **partial**-ов
      @children.on 'ready', => 
        @trigger 'ready'

    return @


  ##### load()
  #
  #---
  # Загружает шаблоны View и всех его детей
  _load: ->

    setTimeout =>
      # По завершении загрузки генерирует событие **loaded**
      @trigger 'loaded'

    return @


  ##### pullChildren()
  #
  #---
  # Вытаскивает pratials из отрендеренного шаблона
  pullChildren: ->
    return []


  ##### isRoot()
  #
  #---
  # Устанавливает, является ли этот View корневым
  isRoot: ->
    return @_parent is null


  ##### ready
  #
  #---
  # Отражает состояние View
  ready: off


  ##### _parent
  #
  #---
  # Родительский View
  _parent: null


  ##### children
  #
  #---
  # Коллекция с дочерними View
  children: new Inn.ViewsCollection


  ##### options
  #
  #---
  # Хеш настроек по умолчанию
  options:
    placeholderClassName: 'layoutPlaceholder'
    templateFolder: ''
    templateFormat: 'js'


});