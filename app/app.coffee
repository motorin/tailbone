###
Is Inn namespace defined?
###
window.Inn ?= {}

###
Application Model
###
Inn.Model = Backbone.Model.extend({
  url: ->
    return 'app/models/'+@id+'.json'
});

###
Application Collection
###
Inn.Collection = Backbone.Collection.extend({
  url: ->
    return '#'
  model: Inn.Model
});

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
    
    #return this to chaining
    this
    
  render: ->
    #if view in rendering state return current render deferred object
    if @_renderDeferred and @_renderDeferred.state() == 'pending'
      return @_renderDeferred
    
    @options.layout._viewsUnrendered++ if @options.layout                 #TODO untested and WRONG -- can't easily extend!!
    
    @_renderDeferred = new $.Deferred()
    
    view = this

    @_getTemplate().done ->
      view.$el.html view._template()
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
      return

    view = this
    $.getScript @_getTemplateURL(), ()->
      #wrapping dust template in view method
      view._template = (data)->
        rendered_html = ''
        dust.render view._getTemplateName(), data, (err, text)-> 
          rendered_html = text
        return rendered_html

      view.templateDeferred.resolve()
        
    return @templateDeferred
    
  remove: ->
    @undelegateEvents()
    @$el.empty().remove()
    @trigger('remove')
});

###
Template Manager
###
class Inn.Layout
  constructor: (@options) ->
    
    throw new Inn.Error('dataManager should be in options') unless options && options.dataManager && options.dataManager instanceof Inn.DataManager
    
    @options = $.extend true
    , templateOptions:
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
      _.each layout.options.partials, (partial, name)->
        if layout.getView(name)
          layout.getView(name).remove()
        
      $('#'+layout.id).html layout._template()
      _.each layout.options.partials, (partial, name)->
        if layout.getView(name)
          layout.getView(name).render()
          
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
  
  
  processPartials: (partials)->
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

      layout.processPartials(partial.partials) if partial.partials
      
    return this
    
  _recheckSubViews: (view)->
    @_viewsUnrendered--
    
    unless view.el.parentNode
      $('#'+view.id).replaceWith view.$el
    
    layout = this
    
    if view.options._viewBranch.partials
      _.each view.options._viewBranch.partials, (partial, name)->
        layout.getView(name).render()

    if @_viewsUnrendered <= 0
      @_renderDeferred.resolve() 

  _clearSubViews: (view)->
    layout = this
    
    if view.options._viewBranch.partials
      _.each view.options._viewBranch.partials, (partial, name)->
        layout.getView(name).remove()
  
###
Data Manager
###
class Inn.DataManager
  constructor: () ->    
    @_dataSets = []
    
    _.extend(this, Backbone.Events)
    
  
  addDataAsset: (dataAsset, id) ->
    
    throw new Inn.Error('dataAsset shold be an instance of Inn.Model or Inn.Collection') unless dataAsset instanceof Inn.Model or dataAsset instanceof Inn.Collection
    throw new Inn.Error('dataAsset id is required') unless dataAsset.id or id
    
    dataAsset.id = id if id

    #do not add same data twice
    @_dataSets.push(dataAsset) if _.indexOf(@_dataSets, dataAsset) == -1
    
    @trigger('add:dataAsset', dataAsset);
    
    return this
  
  
  getDataAsset: (name) ->
    
    found = _.find @_dataSets, (dataSet) ->
      return dataSet.id == name
    
    return found if found?
    
    return null
    
    
  removeDataAsset: (name) ->
    
    survived = _.reject @_dataSets, (dataSet) ->
      return dataSet.id == name
    
    return null if @_dataSets.length == survived.length
    
    @_dataSets = survived
    
    @trigger('remove:dataAsset')

