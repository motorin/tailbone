###
Is Inn namespace defined?
###
window.Inn ?= {}

###
Application standart View
###
Inn.View = Backbone.View.extend({
  initialize: (options)->
    #extending defaults
    @options = $.extend {}, 
      templateFolder: ''
      templateFormat: 'js'
    , options
    
    #return this for chaining
    this
    
  render: ->
    #if view in rendering state return current render deferred object
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

  _getTemplateURL: ->
    devider = if @options.templateFolder then '/' else ''
    return @options.templateFolder+devider+@_getTemplateName()+'.'+@options.templateFormat if not @options.templateURL?
    return @options.templateURL
  
  _getTemplateName: ->
    return 'b'+@id[0].toUpperCase()+@id.slice(1) unless @options.templateName
    return @options.templateName
    
  _getTemplate: ->
    #if template is currently getting template return current template deferred object
    if @templateDeferred and @templateDeferred.state() == 'pending'
      return @templateDeferred
    
    @templateDeferred = new $.Deferred()

    if typeof @_template == 'function'
      @templateDeferred.resolve()
      return @templateDeferred

    view = this
    $.getScript @_getTemplateURL(), ()->
      #wrapping dust template in view method
      view._template = (data)->
        rendered_html = ''
        dust.render this._getTemplateName(), data, (err, text)-> 
          rendered_html = text
        return rendered_html

      view.templateDeferred.resolve()
        
    return @templateDeferred
  
  getDataForView: ->
    return this.model.toJSON() if this.model
  
  remove: ->
    @undelegateEvents()
    @$el.empty().remove()
    @trigger('remove')
    @options.isInDOM = false
});