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
    return @

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
  
  ##### getDataForView()
  #
  #---
  # Достаёт данные из модели
  getDataForView: ->
    return this.model.toJSON() if this.model
  
  ##### remove()
  #
  #---
  # Удаляет View из DOM верева
  remove: ->
    # Отписывается от событий
    @undelegateEvents()
    @$el.empty().remove()
    # Генерирует событие **"remove"**
    @trigger('remove')
    # Устанавливает заначение опции isInDom в false
    @options.isInDOM = off

    return @
    
})

# Добавляем методы из TemplateMixin
_.extend(Inn.View.prototype, Inn.TemplateMixin)