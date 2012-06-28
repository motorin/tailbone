module "Inn"
test "Наличие", 1, ->
  ok Inn, 'Ожидаем наличия нашего неймспейса'



module "Inn.Model", 
  setup: ->
    @model = new Inn.Model
      id: 'model_id',
      name: 'model_name'

  teardown: ->
    delete @model
  
test 'extends Backbone.Model', 1, ->
  ok @model instanceof Backbone.Model, 'Модель должна наследоваться от Backbone.Model'

test 'fetch.done', 1, ->
  equal typeof @model.fetch().done, 'function', 'Модель должна иметь возвращать deferred-метод "done" при запросе к серверу'



module "Inn.Collection",
  setup: ->
    @collection = new Inn.Collection
    @collection.add [
      id: 'model_1',
      name: "Model number 1"
    ,
      id: 'model_2',
      name: "Model number 2"
    ]

  teardown: ->
    delete @collection


test 'extends Backbone.Collection', 1, ->
  ok @collection instanceof Backbone.Collection, 'Модель должна наследоваться от Backbone.Collection'


test 'contains Inn.Models', 1, ->
  ok @collection.models[0] instanceof Inn.Model, 'Коолекция должно состоят из Inn.Model'



module "Inn.DataManager",
  setup: ->
    @model = new Inn.Model
      id: 'data_id'
    
    @model_2 = new Inn.Model
      id: 'data_id2'
    
    @collectionModel = new Inn.Collection
      
    @dataManager = new Inn.DataManager

  teardown: ->
    delete @model
    delete @model_2
    delete @dataManager

test "Наличие", 1, ->
  ok @dataManager instanceof Inn.DataManager, 'Ожидаем объект менеджера данных'


test 'addDataAsset', 7, ->
  @dataManager.addDataAsset @model
  strictEqual @dataManager._dataSets[0], @model, 'Внутри dataManager данные должны храниться внутри массива _dataSets'

  @dataManager.addDataAsset @model_2
  strictEqual @dataManager._dataSets[0], @model, 'Добавление данных не должно перетирать старые'
  strictEqual @dataManager._dataSets[1], @model_2, 'Добавление данных не должно перетирать старые'
    
  @dataManager.addDataAsset @model_2
  strictEqual @dataManager._dataSets[2], undefined, 'Если данные уже добавлены, они не должны быть добавлены повторно'
    
  @dataManager.addDataAsset @model
  strictEqual @dataManager._dataSets[2], undefined, 'Если данные уже добавлены, они не должны быть добавлены повторно'
    
  @dataManager.addDataAsset @collectionModel, 'collection'
  strictEqual @dataManager._dataSets[2], @collectionModel, 'Добавление коллекции'
    
  delete @collectionModel.id
    
  @dataManager.addDataAsset @collectionModel, 'collection'
  strictEqual @dataManager._dataSets[3], undefined, 'Если колллекция добавлена, до повторно она добавляться не должна'


test 'addDataAsset: return self', 1, ->
  strictEqual @dataManager.addDataAsset(@model), @dataManager, 'Функция Inn.DataManager.addDataAsset должна возвращать саму себя'

  
test 'addDataAsset: asset types', 5, ->
  raises ->
    @dataManager.addDataAsset {}
  , Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка'
  
  raises ->
    @dataManager.addDataAsset()
  , Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка'
  
  raises ->
    @dataManager.addDataAsset ""
  , Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка'
  
  raises ->
    @dataManager.addDataAsset new Backbone.Model
  , Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка'

  raises ->
    @dataManager.addDataAsset new Backbone.Collection
  , Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка'


test 'add:dataAsset event', 1, ->
  some_variable = false
  @dataManager.on 'add:dataAsset', (model)->
    some_variable = model
  
  @dataManager.addDataAsset @model
    
  strictEqual some_variable, @model, 'Функция Inn.DataManager.addDataAsset должна вызывать событие "add:dataAsset" и передавать в колбек добавленный объект'


test 'getDataAsset', 3, ->
  @dataManager.addDataAsset @model_2
  equal @dataManager.getDataAsset('data_id2'), @model_2, 'Функция Inn.DataManager.getDataAsset должна возвращать модель по id'
    
  @dataManager.addDataAsset @collectionModel, 'collection'
  strictEqual @dataManager.getDataAsset('collection'), @collectionModel, 'Функция Inn.DataManager.getDataAsset должна возвращать коллекцию по id'
    
  strictEqual @dataManager.getDataAsset('other_data_id'), null, 'Функция Inn.DataManager.get должна возвращать null если модель не найдена'


test 'removeDataAsset', 2, ->
  @dataManager.addDataAsset @model
  @dataManager.removeDataAsset 'data_id'
  
  strictEqual @dataManager.getDataAsset('data_id'), null, 'Функция Inn.DataManager.removeDataAsset не удалила данные'
  
  strictEqual @dataManager.removeDataAsset('data_id'), null, 'Функция Inn.DataManager.removeDataAsset должна возвращать null если модель не найдена'


test 'remove:dataAsset event', 1, ->
  some_variable = false
  @dataManager.on 'remove:dataAsset', (model)->
    some_variable = true
  
  @dataManager.addDataAsset @model
  @dataManager.removeDataAsset 'data_id'
    
  strictEqual some_variable, true, 'Функция Inn.DataManager.removeDataAsset должна вызывать событие "remove:dataAsset"'



module "Inn.View",
  setup: ->
    @canonical_view = new Inn.View
      id: 'movie'
    
    @folder_view = new Inn.View
      id: 'movie',
      templateFolder: 'templates'

    @format_view = new Inn.View
      id: 'movie',
      templateFormat: 'jade'

    @overriden_view = new Inn.View
      id: 'content',
      templateURL: 'bFrontpage'
      
    @overriden_folder_view = new Inn.View
      id: 'content',
      templateURL: 'bFrontpage',
      templateFolder: 'templates'
    
    @overriden_format_and_folder_view = new Inn.View
      id: 'content',
      templateFolder: 'templates'
      templateFormat: 'jade'
      
    @real_view = new Inn.View
      id: 'someView',
      templateFolder: 'app/templates'
    
    
  teardown: ->
    delete @canonical_view
    delete @overriden_view


test 'extends Backbone.View', 1, ->
  ok @canonical_view instanceof Backbone.View, 'Модель должна наследоваться от Backbone.View'


test 'renders deferred style', 1, ->
  equal typeof @canonical_view.render().done, 'function', 'Функция, рендерящая шаблон должна вернуть deferred-объект, у которого будет метод done'
  
  
test 'triggers render event on render()', 1, ->
  some_variable = false;
  @real_view.on 'render', ->
    some_variable = true
  
  @real_view.render()
    
  ok some_variable, 'View должна триггерить событие render при своем рендеринге'


test '_getTemplateURL()', 2, ->
  #по умолчанию название шаблона должно генерироваться на основе ID по схеме "b%ViewId%.js" Если жестко задан параметр "template" то должен браться он
  equal @canonical_view._getTemplateURL(), 'bMovie.js', 'Должно вернуть bMovie.js, а вернуло ' + @canonical_view._getTemplateURL()
  equal @overriden_view._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + @overriden_view._getTemplateURL()


test '_getTemplateURL() with folder name', 2, ->
  #название шаблона должно генерироваться на основе ID по схеме "%templateFolder%/b%ViewId%.js"
  equal @folder_view._getTemplateURL(), 'templates/bMovie.js', 'Должно вернуть templates/bMovie.js, а вернуло ' + @folder_view._getTemplateURL()
  equal @overriden_folder_view._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + @overriden_folder_view._getTemplateURL()


test '_getTemplateURL() with folder name and template format', 2, ->
  #название шаблона должно генерироваться на основе ID по схеме "%templateFolder%/b%ViewId%.%templateFormat%"
  equal @format_view._getTemplateURL(), 'bMovie.jade', 'Должно вернуть templates/bMovie.jade, а вернуло ' + @folder_view._getTemplateURL()
  equal @overriden_format_and_folder_view._getTemplateURL(), 'templates/bContent.jade', 'Должно вернуть templates/bContent.jade, а вернуло ' + @overriden_folder_view._getTemplateURL()


asyncTest 'render should define _template', 1, ->
  render = @canonical_view.render()
  
  test = this
  
  render.done ->
    ok test.canonical_view._template, 'При рендеренге должна создаваться функция-шаблон'
    start()
    
  render.resolve()


asyncTest 'render should render _template', 1, ->
  render = @canonical_view.render()
  
  test = this
  
  render.done ->
    equal test.canonical_view.$el.text(), 'some code', 'Должнен отрендериться временный элемент'
    start()

  render.resolve()
  
  

module "Inn.Layout",
  setup: ->
    @dataManager = new Inn.DataManager
      
    @layout_config =
      routes:
        'header': {}
        'footer':
          template: 'bFooter'
        'content':
          template: 'bFrontpage'
          partials:
            'tags': {}
            'sortings': {}
            'promoMovie': {}
            'frontPageMovies':
              template: 'bFrontPageMoviesList',
              partials: 
                'pagination': {}

      dataManager: @dataManager
      
    @layout = new Inn.Layout @layout_config

    @userModel = new Inn.Model
      id: 'user',
      name: 'user'
      
    @collectionModel = new Inn.Collection()
      
    @otherCollectionModel = new Inn.Collection()
      
    @tagsModel = new Inn.Model
      id: 'tags'
      
    @dataManager.addDataAsset @userModel
    @dataManager.addDataAsset @tagsModel
    @dataManager.addDataAsset @collectionModel, 'collection'
    @dataManager.addDataAsset @otherCollectionModel, 'otherCollection'
      
    @tagsView = new Inn.View
      id: 'tags'
      
    @userbarView = new Inn.View
      id: 'userbar',
      model: @userModel
      
    @otherUserView = new Inn.View
      id: 'user',
      model: @userModel
    
    @collectionView = new Inn.View
      id: 'collection'
    
      
    @collectionSetView = new Inn.View
      id: 'collectionSet',
      collection: @otherCollectionModel
      
    @orphanView = new Inn.View
      id: 'orphan'

  teardown: ->
    delete @dataManager
    delete @layout_config
    delete @layout
    delete @userModel
    delete @collectionModel
    delete @otherCollectionModel
    delete @tagsModel
    delete @tagsView
    delete @userbarView
    delete @otherUserView
    delete @collectionView
    delete @collectionSetView
    delete @orphanView

  

test "Наличие", 1, ->
  ok @layout instanceof Inn.Layout, 'Ожидаем объект мастер-шаблона (лэйаута, страницы)'

  
test "_dataManager link require", 2, ->
  raises ->
    new Inn.Layout()
  , Inn.Error, 'Если не передан экземпляр менеджера данных то должна вызываться ошибка'
  
  raises -> 
    new Inn.Layout
      dataManager: {}
  , Inn.Error, 'Если не передан экземпляр менеджера данных неверного типа то должна вызываться ошибка'


test "_dataManager link", 1, ->
  ok @layout._dataManager instanceof Inn.DataManager, 'При создании layout у нему должна крепиться ссылка на менеджер данных'


test 'render', 2, ->
  equal typeof @layout.render, 'function', 'Нет функции, рендерящей мастер-шаблон'
  equal typeof @layout.render().done, 'function', 'Функция, рендерящая мастер-шаблон должна вернуть deferred-объект, у которого будет метод done'


test 'addView', 5, ->
  @layout.addView @tagsView
  strictEqual @layout._views[0], @tagsView, 'Внутри layout view должны храниться внутри массива _views'

  @layout.addView @userbarView
  strictEqual @layout._views[0], @tagsView, 'Внутри layout view должны храниться внутри массива'
  strictEqual @layout._views[1], @userbarView, 'Добавление view не должно перетирать старые view'
    
  @layout.addView @userbarView
  strictEqual @layout._views[2], undefined, 'Если view уже добавлена, она не должна быть добавлена повторно'
    
  @layout.addView @tagsView
  strictEqual @layout._views[2], undefined, 'Если view уже добавлена, она не должна быть добавлена повторно'


test 'addView: return self', 1, ->
  strictEqual @layout.addView(@tagsView), @layout, 'Функция Inn.Layout.addView должна возвращать саму себя'


test 'addView: type', 4, ->
  raises ->
    @layout.addView {}
  , Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка'
  raises ->
    @layout.addView()
  , Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка'
  raises ->
    @layout.addView ""
  , Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка'
  raises ->
    @layout.addView new Backbone.View()
  , Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка'


test 'add:view event', 1, ->
  some_variable = false
  @layout.on 'add:view', (view)->
    some_variable = view;
  
  @layout.addView @tagsView
    
  strictEqual some_variable, @tagsView, 'Функция Inn.Layout.addView должна вызывать событие "add:view" и передавать в колбек добавленный объект'


test 'getView', 2, ->
  @layout.addView @tagsView
  
  equal @layout.getView('tags'), @tagsView, 'Функция Inn.Layout.getView должна возвращать View по id'
  strictEqual @layout.getView('other_id'), null, 'Функция Inn.Layout.getView должна возвращать null если View не найдена'
  
test 'removeView', 3, ->
  @layout.addView @tagsView
  
  equal @layout.removeView('tags'), @layout, 'Функция Inn.Layout.removeView должна возвращать саму себя'
  strictEqual @layout.getView('tags'), null, 'Функция Inn.Layout.removeView не удалила View'
  strictEqual @layout.removeView('tags'), null, 'Функция Inn.Layout.removeView должна возвращать null если View не найдена'

  
test 'remove:view event', 1, ->
  some_variable = false
  @layout.on 'remove:view', (model)->
    some_variable = true
  
  @layout.addView @tagsView
  @layout.removeView 'tags'
    
  strictEqual some_variable, true, 'Функция Inn.Layout.removeView должна вызывать событие "remove:view"'


test 'addView and data linking', 5, ->
  @layout.addView @tagsView
  strictEqual @layout.getView('tags').model, @tagsModel, 'При добавлении View в мастер-шаблон, к нему должны быть привязаны данные по его ID'
    
  @layout.addView @userbarView
  strictEqual @layout.getView('userbar').model, @userModel, 'Если модель задана явно, то она остается'
    
  @layout.addView @orphanView
  strictEqual @layout.getView('orphan').model, undefined, 'Если модели нет в менеджере, она остается неопределенной'
    
  @layout.addView @collectionView
  strictEqual @layout.getView('collection').collection, @collectionModel, 'Если данные являются коллекцией, то они идут в атрибут collection'
    
  @layout.addView @collectionSetView
  strictEqual @layout.getView('collectionSet').collection, @otherCollectionModel, 'Если коллекция задана явно, то она остается'

#возможно это не нужно и неправильно TODO
test 'addView: bind layout', 1, ->
  @layout.addView @tagsView
  strictEqual @layout.getView('tags').options.layout, @layout, 'Добавляя себе view Layout прописывает себя в его options'


test 'listen to views render event and call recheckSubViews method', 1, ->
  some_variable = false
  
  @layout._recheckSubViews = (view)->
    some_variable = view

  @layout.addView @tagsView
  
  @tagsView.render();
  strictEqual some_variable, @tagsView, 'Layout должен отслеживать события рендера и вызывать свой метод _recheckSubViews с передачей view в параметре'

test 'recheckSubViews method', 1, ->
  strictEqual typeof @layout._recheckSubViews, 'function', 'Layout должен сожержать метод проверки подвьюшек'


test 'processRoutes: create top views', 3, ->
  @layout.processRoutes();
  
  ok @layout.getView('header') instanceof Inn.View, 'Layout должен автоматически создать view верхнего уровня на основе переданных настроек'
  ok @layout.getView('footer') instanceof Inn.View, 'Layout должен автоматически создать view верхнего уровня на основе переданных настроек'
  ok @layout.getView('content') instanceof Inn.View, 'Layout должен автоматически создать view верхнего уровня на основе переданных настроек'


test 'processRoutes: create partial views', 5, ->
  @layout.processRoutes();
  
  ok @layout.getView('tags') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек'
  ok @layout.getView('sortings') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек'
  ok @layout.getView('promoMovie') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек'
  ok @layout.getView('frontPageMovies') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек'
  ok @layout.getView('pagination') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек'
  
  
test 'processRoutes: set template names', 4, ->
  @layout.processRoutes();
  
  strictEqual @layout.getView('header')._getTemplateURL(), 'bHeader.js', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках'
  strictEqual @layout.getView('content')._getTemplateURL(), 'bFrontpage', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках'
  strictEqual @layout.getView('frontPageMovies')._getTemplateURL(), 'bFrontPageMoviesList', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках'
  strictEqual @layout.getView('pagination')._getTemplateURL(), 'bPagination.js', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках'




