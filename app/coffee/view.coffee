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
  # Генерирует событие **destroyed**
  destroy: ->
    # Уничтожаем ссылку на родителя
    @parent = null
    # Удаляем корневой элемент из DOM
    # @remove()
    # Вычищаем детей
    @children.destroy()
    # Генерируем событие destroyed
    @trigger 'destroyed', @

    return @


  ##### render()
  #
  #---
  # Рендерит View и всех его детей
  render: ->
    @stopRender() if @_rendering

    @_rendering = on

    # Переопределяем имя шаблона, если оно задано в data-view-template
    @options.templateName = this.$el.data('view-template') if this.$el.data('view-template')?

    @_loadTemplate (template) =>
      require @options.i18nRequire ? [], =>
        # Получаем данные для рендеринга шаблона
        # @todo: написать тесты!
        @$el.html template @options.model?.toJSON() ? @options.dataManager?.getDataAsset() ? {}

        # Унаследованные опции с очищенным полем partials
        patchedOptions = _.clone(@options)
        patchedOptions.partials = []

        # Добавляем partials в очередь рендеринга
        for partial, idx in @partials
          foundPartial = @children.get partial.id ? partial.cid
          $ctx = @$el.find("##{partial.id}")

          if foundPartial?
            foundPartial.setElement $ctx
          else
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
          @initPartial child, patchedOptions, off

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

  ##### initPartial(*el*, *config*, *silent*)
  #
  #---
  # Создаёт дочерний View из DOM-элемента
  initPartial: (el, config = {}, silent = off) ->
    $ctx = $(el)
    $ctx.removeClass @options.partialClassName
    view = new Inn.View _.extend {}, config, { el: $ctx.get(0), id: $ctx.attr('id') }, $ctx.data('view-options')
    view._parent = @
    @children.add view unless silent
    return view


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
    template = =>
        try
          return jade.templates[@_getTemplateName()]()
        catch e
          if typeof window.console isnt 'undefined' and typeof window.console.debug is 'function'
            console.debug 'tailbone view error:', e

          return ''

    if jade.templates[@_getTemplateName()]?
      setTimeout ->
        callback.call @, template
    else
      $.getScript @_getTemplateURL(), ->
        callback.call @, template

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

  ##### reInitPartial()
  #
  #---
  # Повторно инициализирует View
  #
  reInitPartial: (view) ->
    options = view.options
    @children.remove(view)
    @children.add @initPartial(view.$el, options).render()
    view.destroy()

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