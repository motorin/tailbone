module "Inn"
test "Existance", 1, ->
  ok Inn, 'Check existance of Inn namespace'



module "Inn.Model", 
  setup: ->
    @model = new Inn.Model
      id: 'model_id',
      name: 'model_name'

  teardown: ->
    delete @model
  
test 'extends Backbone.Model', 1, ->
  ok @model instanceof Backbone.Model, 'Model should extend Backbone.Model'

test 'fetch.done', 1, ->
  equal typeof @model.fetch().done, 'function', 'Model should perform fetch in deferred manner'


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


test 'destroy', 3, ->
  
  @dataManager.addDataAsset @model
  @dataManager.addDataAsset @model_2
  @dataManager.addDataAsset @collectionModel, 'collection'
  
  @dataManager.destroy()
  
  strictEqual @dataManager.getDataAsset('data_id'), null, 'Destroy should remove links for all dataAssets"'
  strictEqual @dataManager.getDataAsset('data_id2'), null, 'Destroy should remove links for all dataAssets"'
  strictEqual @dataManager.getDataAsset('collection'), null, 'Destroy should remove links for all dataAssets"'


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
      templateName: 'bFrontpage'
      templateFolder: 'templates'
      templateFormat: 'jade'
      
    @real_view = new Inn.View
      id: 'someView',
      templateFolder: 'app/templates'
    
    @template_view = new Inn.View
      id: 'someView',
      templateName: 'bFrontpage'
      templateFolder: 'app/templates'
    
  teardown: ->
    delete @canonical_view
    delete @overriden_view


test 'extends Backbone.View', 1, ->
  ok @canonical_view instanceof Backbone.View, 'Модель должна наследоваться от Backbone.View'


test 'renders deferred style', 1, ->
  equal typeof @canonical_view.render().done, 'function', 'Функция, рендерящая шаблон должна вернуть deferred-объект, у которого будет метод done'
  
  
asyncTest 'triggers render event on render()', 1, ->
  some_variable = false;
  @real_view.on 'render', ->
    some_variable = true
  
  @real_view.render().done ->
    ok some_variable, 'View должна триггерить событие render при своем рендеринге'
    start()

test '_getTemplateURL()', 2, ->
  #по умолчанию путь к шаблону должен генерироваться на основе ID по схеме "b%ViewId%.js" Если жестко задан параметр "templateURL" то должен браться он
  equal @canonical_view._getTemplateURL(), 'bMovie.js', 'Должно вернуть bMovie.js, а вернуло ' + @canonical_view._getTemplateURL()
  equal @overriden_view._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + @overriden_view._getTemplateURL()


test '_getTemplateURL() with folder name', 2, ->
  #путь к шаблону должен генерироваться на основе ID по схеме "%templateFolder%/b%ViewId%.js"
  equal @folder_view._getTemplateURL(), 'templates/bMovie.js', 'Должно вернуть templates/bMovie.js, а вернуло ' + @folder_view._getTemplateURL()
  equal @overriden_folder_view._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + @overriden_folder_view._getTemplateURL()


test '_getTemplateURL() with folder name and template format', 2, ->
  #путь к шаблону должен генерироваться на основе ID по схеме "%templateFolder%/b%ViewId%.%templateFormat%"
  equal @format_view._getTemplateURL(), 'bMovie.jade', 'Должно вернуть templates/bMovie.jade, а вернуло ' + @folder_view._getTemplateURL()
  equal @overriden_format_and_folder_view._getTemplateURL(), 'templates/bFrontpage.jade', 'Должно вернуть templates/bFrontpage.jade, а вернуло ' + @overriden_folder_view._getTemplateURL()

test '_getTemplateName()', 2, ->
  #путь к шаблону должен генерироваться на основе ID по схеме "b%ViewId%"
  equal @overriden_format_and_folder_view._getTemplateName(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + @overriden_format_and_folder_view._getTemplateName()
  equal @canonical_view._getTemplateName(), 'bMovie', 'Должно вернуть bMovie, а вернуло ' + @canonical_view._getTemplateName()

test '_getTemplateURL() with _getTemplateName()', 1, ->
  #путь к шаблону должен генерироваться на основе ID по схеме "%templateFolder%/b%ViewId%.%templateFormat%"
  equal @template_view._getTemplateURL(), 'app/templates/bFrontpage.js', 'Должно вернуть app/templates/bFrontpage.js, а вернуло ' + @template_view._getTemplateURL()


asyncTest 'render should define _template', 1, ->
  render = @real_view.render()
  
  test = this
  
  render.done ->
    ok test.real_view._template, 'При рендеренге должна создаваться функция-шаблон'
    start()


asyncTest 'render should render _template', 1, ->
  render = @real_view.render()
  
  test = this
  
  render.done ->
    equal test.real_view.$el.text(), 'Some content', 'Должнен отрендериться временный элемент'
    start()
  

test 'triggers remove event on remove()', 1, ->
  some_variable = false;
  @real_view.on 'remove', ->
    some_variable = true
  
  @real_view.remove()
  ok some_variable, 'View должна триггерить событие remove при уничтожении DOM-елемента'


test 'getDataForView', 1, ->
  @real_view.remove()
  strictEqual typeof @real_view.getDataForView, 'function', 'View should have getDataForView method'



module "Inn.Layout",
  setup: ->
    @dataManager = new Inn.DataManager
      
    @layout_config =
      partials:
        'header': {}
        'footer':
          templateURL: 'bFooter'
        'content':
          templateURL: 'bFrontpage'
          partials:
            'tags': {}
            'sortings': {}
            'promoMovie': {}
            'frontPageMovies':
              templateURL: 'bFrontPageMoviesList',
              partials: 
                'pagination': {}
        'someView': {}
      dataManager: @dataManager
      templateOptions:
        templateFolder: 'app/templates'
      
      
    @layout = new Inn.Layout @layout_config
    
    @layout_with_id = new Inn.Layout
      dataManager: @dataManager
      id: 'secondLayout'
    
    @layout_with_templateFolder = new Inn.Layout
      dataManager: @dataManager
      templateOptions:
        templateFolder: 'app/templates'
     
    @layout_with_templateFormat = new Inn.Layout
      dataManager: @dataManager
      templateOptions:
        templateFormat: 'jade'

    @layout_with_templateFormat_and_templateFolder = new Inn.Layout
      dataManager: @dataManager
      templateOptions:
        templateFolder: 'app/templates'
        templateFormat: 'jade'
      
    @layout_with_overriden_templateName = new Inn.Layout
      dataManager: @dataManager
      templateName: 'other_layout'    
      
    @layout_with_overriden_templateName_and_templateFolder = new Inn.Layout
      dataManager: @dataManager
      templateOptions:
        templateFolder: 'app/templates'
      templateName: 'other_layout'  
      
    @layout_with_overriden_templateName_and_templateFolder_and_templateFormat = new Inn.Layout
      dataManager: @dataManager
      templateOptions:
        templateFormat: 'jade'
        templateFolder: 'app/templates'
      templateName: 'other_layout'

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
      
    @userbarCloneView = new Inn.View
      id: 'userbar'
      
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
      
    @realView = new Inn.View
      id: 'someView',
      templateFolder: 'app/templates'
    
    @contentView = new Inn.View
      id: 'content',
      templateFolder: 'app/templates'
      
    @frontpageView = new Inn.View
      id: 'frontPageMovies',
      templateFolder: 'app/templates'
    
    

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
    delete @realView
    delete @contentView
    delete @frontapageView
  

test "Наличие", 1, ->
  ok @layout instanceof Inn.Layout, 'Ожидаем объект мастер-шаблона (лэйаута, страницы)'

test "id", 2, ->
  strictEqual @layout.id, 'layout', 'Должен автоматически присвоиться id главного элемента мастер-шаблона'
  strictEqual @layout_with_id.id, 'secondLayout', 'Должен автоматически присвоиться id главного элемента мастер-шаблона'

test '_getTemplateName()', 2, ->
  #путь к шаблону должен генерироваться на основе ID по схеме "b%LayoutId%"
  equal @layout._getTemplateName(), 'bLayout', 'Должно вернуть bLayou, а вернуло ' + @layout._getTemplateName()
  equal @layout_with_id._getTemplateName(), 'bSecondLayout', 'Должно вернуть bSecondLayout, а вернуло ' + @layout_with_id._getTemplateName()

test '_getTemplateURL()', 7, ->
  strictEqual @layout._getTemplateURL(), 'app/templates/bLayout.js', 'Должно вернуться bLayout.js'
  strictEqual @layout_with_id._getTemplateURL(), 'bSecondLayout.js', 'Должно вернуться bSecondLayout.js'
  strictEqual @layout_with_templateFormat._getTemplateURL(), 'bLayout.jade', 'кастомный путь к шаблону, если он есть в настройках'
  strictEqual @layout_with_templateFormat_and_templateFolder._getTemplateURL(), 'app/templates/bLayout.jade', 'кастомный путь к шаблону, если он есть в настройках'
  strictEqual @layout_with_overriden_templateName._getTemplateURL(), 'other_layout.js', 'кастомный путь к шаблону, если он есть в настройках'
  strictEqual @layout_with_overriden_templateName_and_templateFolder._getTemplateURL(), 'app/templates/other_layout.js', 'кастомный путь к шаблону, если он есть в настройках'
  strictEqual @layout_with_overriden_templateName_and_templateFolder_and_templateFormat._getTemplateURL(), 'app/templates/other_layout.jade', 'кастомный путь к шаблону, если он есть в настройках'
  
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


test 'render should not create several deferreds until resolve', 1, ->
  first_deferred = @layout.render()
  second_deferred = @layout.render()
  strictEqual first_deferred, second_deferred, 'Если неразрешен первый рендер, то должен возвращаться текущий'

test 'addView', 6, ->
  @layout.addView @tagsView
  strictEqual @layout._views[0], @tagsView, 'Внутри layout view должны храниться внутри массива _views'

  @layout.addView @userbarView
  strictEqual @layout._views[0], @tagsView, 'Внутри layout view должны храниться внутри массива'
  strictEqual @layout._views[1], @userbarView, 'Добавление view не должно перетирать старые view'
    
  @layout.addView @userbarView
  strictEqual @layout._views[2], undefined, 'Если view уже добавлена, она не должна быть добавлена повторно'
    
  @layout.addView @tagsView
  strictEqual @layout._views[2], undefined, 'Если view уже добавлена, она не должна быть добавлена повторно'
  
  @layout.addView @userbarCloneView
  strictEqual @layout._views[2], undefined, 'Если view уже добавлена, она не должна быть добавлена повторно если имеет тот же ID'
  


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


asyncTest 'listen to views render event and call recheckSubViews method', 1, ->
  some_variable = false
  
  test = this
  
  @layout._recheckSubViews = (view)->
    some_variable = view

  @layout.addView @realView
  
  @realView.render().done ->
    strictEqual some_variable, test.realView, 'Layout должен отслеживать события рендера и вызывать свой метод _recheckSubViews с передачей view в параметре'
    start()
    

test 'recheckSubViews method', 1, ->
  strictEqual typeof @layout._recheckSubViews, 'function', 'Layout должен сожержать метод проверки подвьюшек'
  

test 'processPartials: should return self', 1, ->
  strictEqual @layout.processPartials(), @layout, 'processPartials должен возвращать себя'

test 'processPartials: create top views', 3, ->
  @layout.processPartials();
  
  ok @layout.getView('header') instanceof Inn.View, 'Layout должен автоматически создать view верхнего уровня на основе переданных настроек'
  ok @layout.getView('footer') instanceof Inn.View, 'Layout должен автоматически создать view верхнего уровня на основе переданных настроек'
  ok @layout.getView('content') instanceof Inn.View, 'Layout должен автоматически создать view верхнего уровня на основе переданных настроек'


test 'processPartials: create partial views', 5, ->
  @layout.processPartials();
  
  ok @layout.getView('tags') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек'
  ok @layout.getView('sortings') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек'
  ok @layout.getView('promoMovie') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек'
  ok @layout.getView('frontPageMovies') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек'
  ok @layout.getView('pagination') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек'
  
  
test 'processPartials: set template names', 4, ->
  @layout.processPartials();
  
  strictEqual @layout.getView('header')._getTemplateURL(), 'app/templates/bHeader.js', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках'
  strictEqual @layout.getView('content')._getTemplateURL(), 'bFrontpage', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках'
  strictEqual @layout.getView('frontPageMovies')._getTemplateURL(), 'bFrontPageMoviesList', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках'
  strictEqual @layout.getView('pagination')._getTemplateURL(), 'app/templates/bPagination.js', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках'


test 'processPartials should attach _viewBranch', 3, ->
  @layout.addView @realView
  @layout.addView @contentView
  @layout.addView @frontpageView
  
  @layout.processPartials()
  
  strictEqual @layout.getView('content').options._viewBranch, @layout.options.partials.content, 'При создании view layout должен сохранить в ней ветвь роутинга для последующей очистки памяти и перерендеринге детей этой view'
  strictEqual @layout.getView('someView').options._viewBranch, @layout.options.partials.someView, 'При создании view layout сохранить в ней ветвь роутинга для последующей очистки памяти и перерендеринге детей этой view'
  strictEqual @layout.getView('frontPageMovies').options._viewBranch, @layout.options.partials.content.partials.frontPageMovies, 'При создании view layout сохранить в ней ветвь роутинга для последующей очистки памяти и перерендеринге детей этой view'


module "Inn.Layout Render remove and so on",
  setup: ->
    
    $('#header').remove()
    $('#content').remove()
    $('#footer').remove()
    
    @dataManager = new Inn.DataManager
      
    @layout_config =
      partials:
        'header': {}
        'footer': {}
        'content':
          templateName: 'bFrontpage'
          templateURL: 'app/templates/bFrontpage.js'
          partials:
            'tags': {}
            'sortings': {}
            'promoMovie': {}
            'frontPageMovies':
              partials: 
                'pagination': {}
        'someView': {}
      dataManager: @dataManager,
      templateOptions:
        templateFolder: 'app/templates'
        templateFormat: 'js'
      
    @layout = new Inn.Layout @layout_config
    
    @layout_config_jade =
      partials:
        'header': {}
        'footer': {}
        'content':
          partials:
            'tags': {}
            'sortings': {}
            'promoMovie': {}
            'frontPageMovies':
              partials: 
                'pagination': {}
        'someView': {}
      dataManager: @dataManager,
      templateOptions:
        templateFolder: 'app/templates'
        templateFormat: 'jade'
      
    @layout_jade = new Inn.Layout @layout_config_jade
    

  teardown: ->
    delete @dataManager
    delete @layout_config
    delete @layout
    
    $('#header').remove()
    $('#content').remove()
    $('#footer').remove()


test 'layout should create views with default options', 4, ->
  @layout.processPartials()
  
  strictEqual @layout.getView('header')._getTemplateURL(), 'app/templates/bHeader.js', 'При создании view layout должен передавать кастомный путь к шаблонам в конструктор'
  strictEqual @layout.getView('frontPageMovies')._getTemplateURL(), 'app/templates/bFrontPageMovies.js', 'При создании view layout должен передавать кастомный путь к шаблонам в конструктор'
  
  @layout_jade.processPartials()
  strictEqual @layout_jade.getView('header')._getTemplateURL(), 'app/templates/bHeader.jade', 'При создании view layout должен передавать кастомный путь к шаблонам в конструктор'
  strictEqual @layout_jade.getView('frontPageMovies')._getTemplateURL(), 'app/templates/bFrontPageMovies.jade', 'При создании view layout должен передавать кастомный путь к шаблонам в конструктор'

asyncTest 'layout render should attach views to DOM', 3, ->
  deferred = @layout.processPartials().render()
  
  deferred.done ->
    strictEqual $('#header').text(), '===Header===', 'Layout должен отрендерить вьюшки верхнего уровня при вызове его метода render'
    strictEqual $('#content').html(), '===Content===<div id="tags">===Tags===</div><div id="sortings">===Sortings===</div><div id="promoMovie">===PromoMovie===</div><div id="frontPageMovies">===Frontpage movies===<div id="pagination">===Pagination===</div></div>', 'Layout должен отрендерить вьюшки верхнего уровня при вызове его метода render'
    strictEqual $('#footer').text(), '===Footer===', 'Layout должен отрендерить вьюшки верхнего уровня при вызове его метода render'
    start()


asyncTest 'layout should cleanup nested views references for removed DOM elements', 5, ->
  test = this
  deferred = @layout.processPartials().render()
  
  deferred.done ->
    test.layout.getView('content').remove()
    strictEqual test.layout.getView('tags').el.parentNode, null, 'layout should cleanup nested views references for removed DOM elements'
    strictEqual test.layout.getView('sortings').el.parentNode, null, 'layout should cleanup nested views references for removed DOM elements'
    strictEqual test.layout.getView('promoMovie').el.parentNode, null, 'layout should cleanup nested views references for removed DOM elements'
    strictEqual test.layout.getView('frontPageMovies').el.parentNode, null, 'layout should cleanup nested views references for removed DOM elements'
    strictEqual test.layout.getView('pagination').el.parentNode, null, 'layout should cleanup nested views references for removed DOM elements'
    start()



module "Inn.Layout Destroy",
  setup: ->
    $('#layout').empty()
    
    @dataManager = new Inn.DataManager
      
    @layout_config =
      partials:
        'header': {}
        'footer': {}
        'content':
          templateName: 'bFrontpage'
          templateURL: 'app/templates/bFrontpage.js'
          partials:
            'tags': {}
            'sortings': {}
            'promoMovie': {}
            'frontPageMovies':
              partials: 
                'pagination': {}
        'someView': {}
      dataManager: @dataManager,
      templateOptions:
        templateFolder: 'app/templates'
        templateFormat: 'js'
      
    @layout = new Inn.Layout @layout_config
    
  teardown: ->
    delete @dataManager
    delete @layout_config
    delete @layout
    
    $('#layout').empty()


asyncTest 'layout should remove all views from self', 6, ->
  test = this
  deferred = @layout.processPartials().render()

  
  deferred.done ->
    test.layout.destroy().done ->
      strictEqual test.layout.getView('tags'), null, 'layout should remove all views from self'
      strictEqual test.layout.getView('sortings'), null, 'layout should remove all views from self'
      strictEqual test.layout.getView('promoMovie'), null, 'layout should remove all views from self'
      strictEqual test.layout.getView('frontPageMovies'), null, 'layout should remove all views from self'
      strictEqual test.layout.getView('pagination'), null, 'layout should remove all views from self'
      strictEqual test.layout.getView('someView'), null, 'layout should remove all views from self'
    
      start()


module "Inn.Layout View attributes",
  setup: ->
    $('#layout').empty()
    
    @dataManager = new Inn.DataManager
      
    @layout_config =
      partials:
        'header':
          attributes:
            'class': 'bHeader'
            'data-some': 'some_data'
        'footer': {}
        'content':
          templateName: 'bFrontpage'
          templateURL: 'app/templates/bFrontpage.js'
          partials:
            'tags': {}
            'sortings': {}
            'promoMovie': {}
            'frontPageMovies':
              partials: 
                'pagination': {}
        'someView': {}
      dataManager: @dataManager,
      templateOptions:
        templateFolder: 'app/templates'
        templateFormat: 'js'
      
    @layout = new Inn.Layout @layout_config
    
  teardown: ->
    delete @dataManager
    delete @layout_config
    delete @layout
    
    $('#layout').empty()


asyncTest 'layout should pass view attributes to View constructor', 2, ->
  test = this
  deferred = @layout.processPartials().render()
  
  deferred.done ->
    console.log(test.layout.getView('header'))
    strictEqual test.layout.getView('header').$el.attr('class'), 'bHeader', 'layout should pass view attributes to View constructor'
    strictEqual test.layout.getView('header').$el.data('some'), 'some_data', 'layout should pass view attributes to View constructor'
      
    start()

