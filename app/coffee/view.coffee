window.Inn ?= {}

#### *class* Inn.View
#
#---
# Класс представления
# 
Inn.View = Backbone.View.extend({

  ##### initialize( *options* )
  #
  #---
  # Конструктор
  initialize: (options)->
    # наследует настройки по умолчанию
    @options = $.extend {}, 
      templateFolder: ''
      templateFormat: 'js'
    , options
    
    # поддерживает "чейнинг"
    this

  ##### render()
  #
  #---
  # Рендерит шаблон, возвращает deferred object
  render: ->
    # Если в данный момент шаблон уже рендерится, вернёт deferred object с текущим состоянием
    if @_renderDeferred and @_renderDeferred.state() == 'pending'
      return @_renderDeferred
    
    @options.layout._viewsUnrendered++ if @options.layout                 #TODO untested and WRONG -- can't easily extend!!
    
    @_renderDeferred = new $.Deferred()
    
    view = this

    @_getTemplate().done ->
      if view.attributes
        if typeof view.attributes == 'function'
          view.$el.attr(view.attributes())
        else
          view.$el.attr(view.attributes)
      view.$el.html view._template(view.getDataForView())
      view.trigger('render', view)
      view._renderDeferred.resolve()
      
    return @_renderDeferred

  ##### _getTemplateURL()
  #
  #---
  # Определяет URL шаблона
  _getTemplateURL: ->
    devider = if @options.templateFolder then '/' else ''
    return @options.templateFolder+devider+@_getTemplateName()+'.'+@options.templateFormat unless @options.templateURL?
    return @options.templateURL
  
  ##### _getTemplateName()
  #
  #---
  # Определяет название шаблона
  _getTemplateName: ->
    return 'b'+@id[0].toUpperCase()+@id.slice(1) unless @options.templateName
    return @options.templateName
    
  ##### _getTemplate()
  #
  #---
  # Загружает шаблон, возвращает deferred object
  _getTemplate: ->
    # Если в данный момент шаблон уже грузится, вернёт deferred object с текущим состоянием
    if @templateDeferred and @templateDeferred.state() == 'pending'
      return @templateDeferred
    
    @templateDeferred = new $.Deferred()

    if typeof @_template == 'function'
      @templateDeferred.resolve()
      return @templateDeferred

    view = this
    $.getScript @_getTemplateURL(), ()->
      # Оборачивает загруженный шаблон во внутреннюю функцию
      view._template = (data)->
        rendered_html = ''
        dust.render this._getTemplateName(), data, (err, text)->
          rendered_html = text
        return rendered_html

      view.templateDeferred.resolve()
        
    return @templateDeferred
  
  ##### getDataForView()
  #
  #---
  # Достаёт данные из модели
  getDataForView: ->
    return this.model.toJSON() if this.model
  
  ##### remove()
  #
  #---
  # Удаляет вью из DOM верева
  remove: ->
    # Отписывается от событий
    @undelegateEvents()
    @$el.empty().remove()
    # Генерирует событие **"remove"**
    @trigger('remove')
    # Устанавливает заначение опции isInDom в false
    @options.isInDOM = false
});