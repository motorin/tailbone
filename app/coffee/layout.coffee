###
Is Inn namespace defined?
###
window.Inn ?= {}

###
Template Manager
###
class Inn.Layout
  constructor: (@options) ->
    
    throw new Inn.Error('dataManager should be in options') unless options && options.dataManager && options.dataManager instanceof Inn.DataManager
    
    @options = $.extend true
    ,
      placeholderClassName: 'layoutPlaceholder'
      templateOptions:
        templateFolder: ''
        templateFormat: 'js'
    , options
    
    @_dataManager = options.dataManager
    @_views = []
    @_viewsUnrendered = 0
    
    @id = if @options.id then @options.id else 'layout'
    
    #now Layout can fire Backbone events
    _.extend(this, Backbone.Events)

  render: () ->
    #if view in rendering state return current render deferred object
    if @_renderDeferred and @_renderDeferred.state() == 'pending'
      return @_renderDeferred
    
    @_renderDeferred = new $.Deferred()
    
    layout = this
    
    @_getTemplate().done ->
      $('#'+layout.id).html layout._template()
      
      layout._processPartials()
      
      layout._parsePartials()
      
      _.each layout.options.partials, (partial, name)->
        layout.getView(name).render() if layout.getView(name)
          
    #@_renderDeferred would not be resolved until all of the views rendered
    return @_renderDeferred
  
  _getTemplateURL: ->
    devider = if @options.templateOptions.templateFolder then '/' else ''
    return @options.templateOptions.templateFolder+devider+@_getTemplateName()+'.'+@options.templateOptions.templateFormat if not @options.templateURL?
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
      return
    
    layout = this
    $.getScript @_getTemplateURL(), ()->
      #wrapping dust template in view method
      layout._template = (data)->
        rendered_html = ''
        dust.render layout._getTemplateName(), data, (err, text)-> 
          rendered_html = text
        return rendered_html

      layout.templateDeferred.resolve()
        
    return @templateDeferred
    
  addView: (view) ->
    
    throw new Inn.Error('view shold be an instance of Inn.View') unless view instanceof Inn.View
    
    viewInLayout = _.find @_views, (existingView)->
      return existingView.id == view.id
    
    @_views.push(view) if _.indexOf(@_views, view) == -1 and not viewInLayout
    
    view.options.layout = this
    
    unless view.model or view.collection
      data = @_dataManager.getDataAsset(view.id)
      if data
        if data instanceof Inn.Model
          view.model = data
        if data instanceof Inn.Collection
          view.collection = data
      else
        delete view.model
        delete view.collection
    
    view.on 'render', _.bind(@_recheckSubViews, this, view)
    view.on 'remove', _.bind(@_clearSubViews, this, view)
    view.on 'remove', _.bind(@_onViewRemovedFromDOM, this, view)
    
    @trigger('add:view', view);
    
    return this
    
  getView: (name) ->
    found = _.find @_views, (view) ->
      return view.id == name
    
    return found if found?
    
    return null
    
  removeView: (name) ->
    
    survived = _.reject @_views, (view) ->
      return view.id == name
    
    return null if @_views.length == survived.length
    
    @_views = survived
    
    @trigger('remove:view')
  
  
  _processPartials: (partials)->
    layout = this
    
    partials = @options.partials unless partials
    
    _.each partials, (partial, name)->
      layout.addView new Inn.View
        id: name

      view = layout.getView(name)
      view.options._viewBranch = partial
      view.options.templateName = partial.templateName if partial.templateName
      view.options.templateURL = partial.templateURL if partial.templateURL
      view.options.templateFolder = layout.options.templateOptions.templateFolder if layout.options.templateOptions and layout.options.templateOptions.templateFolder
      view.options.templateFormat = layout.options.templateOptions.templateFormat if layout.options.templateOptions and layout.options.templateOptions.templateFormat
      
      view.attributes = partial.attributes

      layout._processPartials(partial.partials) if partial.partials
      
    return this
    
  _parsePartials: (partialContent)->
    layout = this
    
    partialContent = $('#'+layout.id) unless partialContent
    partialId = partialContent.attr('id')
    
    partialsObject = {partials: {}}
      
    $(partialContent).children('.'+@options.placeholderClassName).each ->
      partialsObject.partials[$(this).attr('id')] = {}
    
    if not @options.partials
      @_processPartials partialsObject.partials
      @getView(partialId).options._viewBranch = partialsObject if @getView(partialId)
      _.each partialsObject.partials, (partial, name)->
        layout.getView(name).render() if layout.getView(name)
      
  
  _recheckSubViews: (view)->
    @_viewsUnrendered--
    
    if view.el.parentNode == null and $('#'+view.id).length
      $('#'+view.id).replaceWith view.$el
      view.options.isInDOM = true
    
    layout = this
    
    @_parsePartials view.$el unless view.options._viewBranch.partials
    
    if view.options._viewBranch.partials
      _.each view.options._viewBranch.partials, (partial, name)->
        layout.getView(name).render()

    if @_viewsUnrendered <= 0
      @_renderDeferred.resolve() 

  _clearSubViews: (view)->
    layout = this
    
    @_destroyDeferred.notify() if @_destroyDeferred
    
    if view.options._viewBranch.partials
      _.each view.options._viewBranch.partials, (partial, name)->
        layout.getView(name).remove() if layout.getView(name)

  _onViewRemovedFromDOM: (view)->


  
  destroy: ->
    $('#'+@id).empty()
    
    layout = this
    
    @_destroyDeferred = new $.Deferred()

    @_destroyDeferred.progress ->

      viewsInDOM = _.filter layout._views, (view)->
        return view.options.isInDOM
      
      this.resolve() if viewsInDOM.length == 0

    @_destroyDeferred.done ->
      _.each layout._views, (view)->
        layout.removeView(view.id)
    
    _.each layout.options.partials, (partial, name)->
      layout.getView(name).remove() if layout.getView(name)
    
    return @_destroyDeferred
  