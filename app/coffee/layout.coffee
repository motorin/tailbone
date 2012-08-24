window.Inn ?= {}

#### *class* Inn.Layout
#
#---
# Менеджер представлений
# 
Inn.Layout = Inn.View.extend


  ##### initialize( *options* )
  #
  #---
  # Создаёт экземпляр менеджера представлений
  initialize: (options) ->
    
    throw new Inn.Error('dataManager should be in options') unless options && options.dataManager && options.dataManager instanceof Inn.DataManager
    
    @options = $.extend true, {}, Inn.Layout.defaults, options
    @_dataManager = options.dataManager
    @_views = []
    @_viewsUnrendered = 0
    
    @id = if @options.id then @options.id else 'layout'
    
    # Умееть генерировать события (Backbone.Events)
    _.extend(this, Backbone.Events)

  ##### render()
  #
  #---
  # Рендерит шаблон, возврашает deferred object
  render: ->
    # Если представления уже рендерятся, вернёт deferred object с текущим состоянием
    if @_renderDeferred and @_renderDeferred.state() == 'pending'
      return @_renderDeferred
    
    @_renderDeferred = new $.Deferred()
    
    @_getTemplate().done =>
      $("##{@id}").html @_template()
      
      @_processPartials()
      @_parsePartials()
      
      _.each @options.partials, (partial, name) =>
        @getView(name).render() if @getView(name)
          
    @_renderDeferred

  ##### addView( *view* )
  #
  #---
  # Добавляет вью в список
  addView: (view) ->
    
    throw new Inn.Error('view shold be an instance of Inn.View') unless view instanceof Inn.View
    
    viewInLayout = _.find @_views, (existingView)-> existingView.id == view.id
    # _.indexOf(@_views, view) == -1
    @_views.push(view) unless view in @_views or viewInLayout
    
    view.options.layout = @
    
    unless view.model or view.collection
      data = @_dataManager.getDataAsset view.id

      if data
        if data instanceof Inn.Model
          view.model = data
        if data instanceof Inn.Collection
          view.collection = data
      else
        delete view.model
        delete view.collection
    
    # Вешает обработчики на системные события
    view.on 'render', _.bind @_recheckSubViews, this, view
    view.on 'remove', _.bind @_clearSubViews, this, view
    view.on 'remove', _.bind @_onViewRemovedFromDOM, this, view
    
    # Генерирует событие **"add:view"**
    @trigger 'add:view', view
    
    @
    
  ##### getView( *name* )
  #
  #---
  # Возвращает вью с именем **name**
  getView: (name) -> (_.find @_views, (view) -> view.id is name) ? null
        
  ##### removeView( *name* )
  #
  #---
  # Удаляет вью с именем **name**
  removeView: (name) ->
    return null if (survived = _.reject @_views, (view) -> view.id is name).length is @_views.length
    
    @_views = survived
    
    # Генерирует событие **"remove:view"**
    @trigger('remove:view')
  
  ##### _processPartials( *partials* )
  #
  #---
  # Обрабатывает partials и превращает их во вью
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
      view.options.templateFolder = layout.options.templateFolder if layout.options and layout.options.templateFolder
      view.options.templateFormat = layout.options.templateFormat if layout.options and layout.options.templateFormat
      
      view.attributes = partial.attributes

      layout._processPartials(partial.partials) if partial.partials
      
    return this
    
  ##### Генерирует( *partialContent* )
  #
  #---
  # Генерирует список partial-ов текущего layout-а
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
      
  ##### _recheckSubViews( *view* )
  #
  #---
  # 
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

  ##### _clearSubViews( *view* )
  #
  #---
  # Вызывает метод .remove() у дочерних вью
  _clearSubViews: (view)->
    layout = this
    
    @_destroyDeferred.notify() if @_destroyDeferred
    
    if view.options._viewBranch.partials
      _.each view.options._viewBranch.partials, (partial, name)->
        layout.getView(name).remove() if layout.getView(name)

  ##### _onViewRemovedFromDOM( *view* )
  #
  #---
  # Обработчик события удаления вью
  _onViewRemovedFromDOM: (view)->

  ##### destroy()
  #
  #---
  # Уничтожает layout
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

##### @defaults
#
#---
# Опции layout-а по умолчанию
Inn.Layout.defaults = 
  placeholderClassName: 'layoutPlaceholder'
  templateFolder: ''
  templateFormat: 'js'