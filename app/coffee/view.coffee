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
  initialize: (options, @partials = null) ->
    @partials = (@partials ? @options.partials) ? []

    ##### children
    #
    #---
    # Коллекция с дочерними View
    @children = new Inn.ViewsCollection
   
    ##### _parent
    #
    #---
    # Родительский View
    @_parent = null

    ##### ready
    #
    #---
    # Отражает состояние View
    @ready = off

    ##### _rendering
    #
    #---
    # Отражает состояние рендеринга View
    @_rendering = off


  ##### destroy()
  #
  #---
  # Уничтожает View и всех его детей
  #
  # Генерирует событие **destroy**
  destroy: ->
    # Уничтожаем ссылку на родителя
    @parent = null
    # Удаляем корневой элемент из DOM
    @remove()
    # Вычищаем детей
    @children.destroy()
    # Генерируем событие destroy
    @trigger 'destroy', @

    return @


  ##### render()
  #
  #---
  # Рендерит View и всех его детей
  render: ->
    @stopRender() if @_rendering

    @_rendering = on

    @_loadTemplate (template) =>
      # Получаем данные для рендеринга шаблона
      # @todo: написать тесты!
      @$el.html template @options.dataManager?.getDataAsset() ? {}

      # Унаследованные опции с очищенным полем partials
      patchedOptions = _.clone(@options)
      patchedOptions.partials = []

      # Добавляем partials в очередь рендеринга
      for partial, idx in @partials
        $ctx = @$el.find("##{partial.id}")

        # Если View передана в виде экземпляра Backbone.View,
        # просто устанавливаем ему корневой элемент
        if partial instanceof Inn.View
          view = partial
          view.options = _.extend {}, patchedOptions, view.options
          view.setElement $ctx.get(0)
        # Если передан конфиг-хеш, создаём новый объект Inn.View
        else
          view = new Inn.View _.extend {}, patchedOptions, { el: $ctx.get(0) }, partial

        # Устанавливаем родителя
        view._parent = @

        # Добавляем в очередь на рендеринг
        @children.add view

      # Вытаскиваем детей
      for child, idx in @pullChildren()
        $ctx = $(child)
        $ctx.removeClass @options.partialClassName
        view = new Inn.View _.extend {}, patchedOptions, { el: $ctx.get(0), id: $ctx.attr('id') }, $ctx.data('view-options')
        view._parent = @
        # Переопределяем имя шаблона, если оно задано в data-view-template
        view.options.templateName = $ctx.data('view-template') if $ctx.data('view-template')?
        @children.add view

      # Если нет partial-ов, генериуем событие **ready**
      if @children.isEmpty()
        # Устанавливаем флажок ready в true, если элемент не корневой
        unless @isRoot()
          @ready = on

        @_rendering = off
        @trigger 'ready'
      else
        # Ожидаем завершения рендеринга **partial**-ов
        @children.on 'ready', @_readyHandler, @

      @children.render()


    return @

  ##### _readyHandler()
  #
  #---
  # Обработчик завершения рендеринга
  # 
  _readyHandler: -> 
    # Устанавливаем флажок ready в true, если элемент не корневой
    unless @isRoot()
      @ready = on

    # Сбрасываем статус рендеринга дочерних View
    @children.reset()
    # Снимаем блокировку рендеринга
    @_rendering = off
    @trigger 'ready'

  ##### stopRender()
  #
  #---
  # Прекращает рендеринг шаблонов
  # 
  stopRender: ->
    @_rendering = off
    # Отписываемся от события завершения рендеринга
    @off 'ready', @_readyHandler, @

    # Отписываемся от события завершения 
    # рендеринга у всех детей
    @children.stopRender()

    return @


  ##### _loadTemplate( *callback* )
  #
  #---
  # Загружает шаблон View
  # 
  # **callback** - Колбэк
  _loadTemplate: (callback) ->
    process = =>
      # Оборачивает загруженный шаблон во внутреннюю функцию
      template = (data) =>
        renderedHTML = ''
        dust.render @_getTemplateName(), data ? {}, (err, text)->
          renderedHTML = text
        return renderedHTML

      # По завершении загрузки вызывает **callback**, передавая ему функцию-шаблон
      callback.call @, template

    if dust.cache[@_getTemplateName()]?
      setTimeout -> process()
    else
      $.getScript @_getTemplateURL(), process

    return @

  ##### _getTemplateURL()
  #
  #---
  # Определяет URL шаблона
  _getTemplateURL: ->
    divider = if @options.templateFolder then '/' else ''
    return @options.templateFolder + divider + @_getTemplateName() + '.' + @options.templateFormat unless @options.templateURL?
    return @options.templateURL
  
  ##### _getTemplateName()
  #
  #---
  # Определяет название шаблона
  _getTemplateName: ->
    return 'b'+ @id[0].toUpperCase() + @id.slice(1) unless @options.templateName
    return @options.templateName


  ##### pullChildren()
  #
  #---
  # Вытаскивает pratials из отрендеренного шаблона
  pullChildren: ->
    # Для создания вью по "дырке" используем класс options.partialClassName
    # 
    # Для оверрайдинга опций используем data-атрибут (data-view-options)
    # 
    # Для оверрайдинга имени шаблона используем data-атрибут (data-view-template)
    # 
    # ID берём из атрибута id
    return @$el.find ".#{@options.partialClassName}"
    


  ##### isRoot()
  #
  #---
  # Устанавливает, является ли этот View корневым
  isRoot: ->
    return @_parent is null


  ##### options
  #
  #---
  # Хеш настроек по умолчанию
  options:
    partialClassName: 'bPartial'
    templateFolder: ''
    templateFormat: 'js'


})