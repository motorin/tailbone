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
  
  ##### getDataForView()
  #
  #---
  # Достаёт данные из модели
  getDataForView: ->
    return this.model.toJSON() if this.model
  
  ##### render()
  #
  #---
  # Рендерит шаблон, возвращает deferred object
  renderSelf: ->
    @options.layout._viewsUnrendered.push(@) if @options.layout                 #TODO untested and WRONG -- can't easily extend!!
    
    @_getTemplate().done =>
      if @attributes
        if typeof @attributes == 'function'
           @$el.attr @attributes()
         else
           @$el.attr @attributes

      @$el.html @_template @getDataForView()
      @trigger 'render', @
      @_renderDeferred.resolve()

    return @

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