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
    # @todo: написать тесты!
    # Уничтожаем ссылку на родителя
    @parent = null
    # Удаляем корневой элемент из DOM
    @remove()
    # Вычищаем детей
    @children.destroy()

    return @


  ##### render()
  #
  #---
  # Рендерит View и всех его детей
  render: ->
    return @ if @_rendering

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
        view = new Inn.View _.extend {}, patchedOptions, { el: $ctx.get(0) }, partial
        view._parent = @
        @children.add view

      # Вытаскиваем детей
      for child, idx in @pullChildren()
        $ctx = $(child)
        $ctx.removeClass @options.partialClassName
        view = new Inn.View _.extend {}, patchedOptions, { el: $ctx.get(0), id: $ctx.attr('id') }, $ctx.data('view-options')
        view._parent = @
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
        @children.on 'ready', => 
          # Устанавливаем флажок ready в true, если элемент не корневой
          unless @isRoot()
            @ready = on

          # Сбрасываем статус рендеринга дочерних View
          @children.reset()
          # Снимаем блокировку рендеринга
          @_rendering = off
          @trigger 'ready'

      @children.render()


    return @


  ##### _loadTemplate( *cb* )
  #
  #---
  # Загружает шаблон View
  # 
  # **cb** - Колбэк
  _loadTemplate: (cb) ->
    process = =>
      # Оборачивает загруженный шаблон во внутреннюю функцию
      template = (data) =>
        renderedHTML = ''
        dust.render @_getTemplateName(), data ? {}, (err, text)->
          renderedHTML = text
        return renderedHTML

      # По завершении загрузки вызывает **cb**, передавая ему функцию-шаблон
      cb.call @, template

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