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
	
}