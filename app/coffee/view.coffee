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