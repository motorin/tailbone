window.Inn ?= {}

#### *mixin* Inn.TemplateMixin
#
#---
# Миксин с логикой взаимодействия Layout/View с шаблоном
# 
Inn.TemplateMixin = {

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
    return 'b'+@id[0].toUpperCase()+@id.slice(1) unless @options.templateName
    return @options.templateName
    
  ##### _getTemplate()
  #
  #---
  # Загружает шаблон, возвращает deferred object
  _getTemplate: ->
    # Если в данный момент шаблон уже грузится, вернёт deferred object с текущим состоянием
    return @templateDeferred if @templateDeferred?.state() == 'pending'
    
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

  ##### render()
  #
  #---
  # Рендерит шаблон, возвращает deferred object
  render: ->
    # Если в данный момент шаблон уже рендерится, вернёт deferred object с текущим состоянием
    if @_renderDeferred and @_renderDeferred.state() == 'pending'
      return @_renderDeferred
    
    @options.layout._viewsUnrendered.push(@) if @options.layout                 #TODO untested and WRONG -- can't easily extend!!
    
    @_renderDeferred = new $.Deferred()
    
    @_getTemplate().done =>
      if @$el? # логика view
        if @attributes
          if typeof @attributes == 'function'
            @$el.attr @attributes()
          else
            @$el.attr @attributes

        @$el.html @_template @getDataForView()
        @trigger 'render', @
        @_renderDeferred.resolve()
      else # логика layout-а
        $("##{@id}").html @_template()
      
        @_processPartials()
        @_parsePartials()
        
        for name, partial of @options.partials
          @getView(name).render() if @getView(name)
      
    return @_renderDeferred
	
}