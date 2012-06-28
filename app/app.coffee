###
Проверяем, если наш "неймспейс" и, если его нет, создаем
###
window.Inn ?= {}

###
Модель приложения
###
Inn.Model = Backbone.Model.extend({
  url: ->
    return '#'
});

###
Коллекция приложения
###
Inn.Collection = Backbone.Collection.extend({
  url: ->
    return '#'
  model: Inn.Model
});

###
Стандартная вьюшка приложения
###
Inn.View = Backbone.View.extend({
  initialize: (options)->
    @options.templateFolder = '' unless options.templateFolder
    @options.templateFormat = 'js' unless options.templateFormat
    
  render: ->
    view = this
    renderDeferred = new $.Deferred()
    
    if typeof @_template == 'function'
      @$el.htmll = @_template()
      @trigger('render', this)
      renderDeferred.resolve()
    else
      @_getTemplate().done ->
        view.$el.html view._template()
        view.trigger('render', view)
        renderDeferred.resolve()
      
    return renderDeferred

  _getTemplateURL: ->
    devider = if @options.templateFolder then '/' else ''
    return @options.templateFolder+devider+'b'+@id[0].toUpperCase()+@id.slice(1)+'.'+@options.templateFormat if not @options.templateURL?
    return @options.templateURL
  
  _getTemplate: ->
    templateDeferred = new $.Deferred()
    view = this
    view._template = ->
      return 'some code'
    templateDeferred.resolve()
        
    return templateDeferred
});

###
Менеджер шаблонов
###
class Inn.Layout
  constructor: (@options) ->
    
    throw new Inn.Error('dataManager should be in options') unless options && options.dataManager && options.dataManager instanceof Inn.DataManager
    
    @_dataManager = options.dataManager
    @_views = []
    
    _.extend(this, Backbone.Events)

  render: () ->
    return new $.Deferred()
    

  addView: (view) ->
    
    throw new Inn.Error('view shold be an instance of Inn.View') unless view instanceof Inn.View
    
    @_views.push(view) if _.indexOf(@_views, view) == -1
    
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
  
  
  processRoutes: ->
    layout = this
    
    _.each @options.routes, (route, name)->
      layout.addView new Inn.View
        id: name
        templateURL: if route.template then route.template else undefined
        
      layout._processPartials(route)


  _processPartials: (route)->
    if route.partials
      layout = this
      
      _.each route.partials, (partial, name)->
        layout.addView new Inn.View
          id: name
          templateURL: if partial.template then partial.template else undefined
          
        layout._processPartials(partial)
    
  _recheckSubViews: (view)->

  
###
Менеджер данных
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

