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
    @DefaultView = Inn.View.extend
        options:
          partialClassName: 'bPartial'
          templateFolder: 'app/templates'
          templateFormat: 'js'


    @canonicalView = new @DefaultView 
      id: 'frontpage'

    @partialInstanceView = new @DefaultView({id: 'tags'})
    @viewsTree = new @DefaultView  {id: 'frontpage'}, [@partialInstanceView]

    @nestedViewSecondLevel = new @DefaultView 
      id: 'frontpage',
      [{id: 'tags'}]
    
    @nestedViewThirdLevel = new @DefaultView 
      id: 'frontpage',
      [
        {
          id: 'frontPageMovies',
          partials: [{id: 'pagination'}]
        }
      ]

    @nestedViewWithHoles = new @DefaultView
      id: 'holyView'

    @translatedView = new @DefaultView
      id: 'translated'
      i18nRequire: ['i18n/Game-Panel']
    
    @viewWithAttribute = new @DefaultView 
      id: 'frontpage',
      'attributes': {foo: 'bar'}

    @canonicalFolderView = new Inn.View 
      id: 'movie'

    @folderView = new Inn.View
      id: 'movie',
      templateFolder: 'templates'

    @formatView = new Inn.View
      id: 'movie',
      templateFormat: 'jade'

    @overridenView = new Inn.View
      id: 'content',
      templateURL: 'bFrontpage'

    @overridenFolderView = new Inn.View
      id: 'content',
      templateURL: 'bFrontpage',
      templateFolder: 'templates'
    
    @overridenFormatAndFolderView = new Inn.View
      id: 'content',
      templateName: 'bFrontpage'
      templateFolder: 'templates'
      templateFormat: 'jade'
      
    @realView = new Inn.View
      id: 'someView',
      templateFolder: 'app/templates'
    
    @templateView = new Inn.View
      id: 'someView',
      templateName: 'bFrontpage'
      templateFolder: 'app/templates'
    
  teardown: ->
    delete @DefaultView

    delete @canonicalView
    delete @partialInstanceView
    delete @viewsTree
    delete @nestedViewSecondLevel
    delete @nestedViewThirdLevel
    delete @viewWithAttribute
    delete @nestedViewWithHoles
    delete @canonicalFolderView
    delete @folderView
    delete @formatView
    delete @overridenView
    delete @overridenFolderView
    delete @overridenFormatAndFolderView
    delete @realView
    delete @templateView
    delete @translatedView
    # delete @overriden_view


test 'extends Backbone.View', 1, ->
  ok @canonicalView instanceof Backbone.View, 'Inn.View должна наследоваться от Backbone.View'

asyncTest 'create Inn.View with children instances of Inn.View', 1, ->
  @viewsTree.render()

  @viewsTree.on 'ready', =>
      equal @viewsTree.children.get('tags'), @partialInstanceView, 'При передаче View в параметрах, не создавать новый инстанс'
      start()

asyncTest 'triggers ready event on render()', 1, ->
  @canonicalView.render()

  @canonicalView.on 'ready', ->
    ok on, 'View должна триггерить событие ready при своем рендеринге'
    start()

asyncTest 'triggers ready event on second level nested view.render()', 1, ->
  @nestedViewSecondLevel.render()

  @nestedViewSecondLevel.on 'ready', ->
    ok on, 'View второго уровня вложенности должна триггерить событие ready при своем рендеринге'
    start()

asyncTest 'triggers ready event on third level nested view.render()', 1, ->
  @nestedViewThirdLevel.render()

  @nestedViewThirdLevel.on 'ready', ->
    ok on, 'View третьего уровня вложенности должна триггерить событие ready при своем рендеринге'
    start()

asyncTest 'Repeated view rendering', 1, ->
  @nestedViewSecondLevel.render()
  count = 0

  @nestedViewSecondLevel.on 'ready', =>
    if ++count is 3
      equal @nestedViewSecondLevel.$el.html(), '===Content===<div id="tags">===Tags===</div><div id="sortings"></div><div id="promoMovie"></div><div id="frontPageMovies"></div>', 'Повторный рендеринг View и его детей'
      start()
    else
      @nestedViewSecondLevel.render()

asyncTest 'Translated view rendering', 1, ->
  @translatedView.render()

  @translatedView.on 'ready', =>
    equal @translatedView.$el.html(), '<div>Проверка существующих файлов</div>', 'Должна выводиться строка на русском'
    start()

asyncTest 'Ability to find holes in template', 1, ->
  @nestedViewWithHoles.render()

  @nestedViewWithHoles.on 'ready', =>
    equal @nestedViewWithHoles.$el.html(), '===Content===<div id="frontPageMovies" class="">===Frontpage movies===<div id="pagination" class="otherPlaceholder"></div></div>', 'Вытаскиваем partial из "дырки"'
    start()

asyncTest 'View may have attribute foo, with "bar" in value', 1, ->
  @viewWithAttribute.render()

  @viewWithAttribute.on 'ready', =>
    equal @viewWithAttribute.$el.attr('foo'), 'bar', 'Установка атрибута foo="bar"'
    start()

asyncTest 'First level View rendering', 1, ->
  @canonicalView.render()

  @canonicalView.on 'ready', =>
    equal @canonicalView.$el.html(), '===Content===<div id="tags"></div><div id="sortings"></div><div id="promoMovie"></div><div id="frontPageMovies"></div>', 'Рендеринг View первого уровня'
    start()

asyncTest 'Second level View rendering', 1, ->
  @nestedViewSecondLevel.render()

  @nestedViewSecondLevel.on 'ready', =>
    equal @nestedViewSecondLevel.$el.html(), '===Content===<div id="tags">===Tags===</div><div id="sortings"></div><div id="promoMovie"></div><div id="frontPageMovies"></div>', 'Рендеринг View второго уровня'
    start()

asyncTest 'isRoot()', 2, ->
  @nestedViewSecondLevel.render()

  @nestedViewSecondLevel.on 'ready', =>
    equal @nestedViewSecondLevel.isRoot(), on, 'Правильно ли определяется isRoot() для корневого View'
    equal @nestedViewSecondLevel.children.get('tags').isRoot(), off, 'Правильно ли определяется isRoot() для дочернего View'
    start()

asyncTest '_loadTemplate()', 1, ->
  @canonicalView.render()

  @canonicalView._loadTemplate (template) =>
    equal typeof template, 'function', 'Подгрузка шаблона'
    start()

test '_getTemplateURL()', 2, ->
  #по умолчанию путь к шаблону должен генерироваться на основе ID по схеме "b%ViewId%.js" Если жестко задан параметр "templateURL" то должен браться он
  equal @canonicalFolderView._getTemplateURL(), 'bMovie.js', 'Должно вернуть bMovie.js, а вернуло ' + @canonicalFolderView._getTemplateURL()
  equal @overridenView._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + @overridenView._getTemplateURL()


test '_getTemplateURL() with folder name', 2, ->
  #путь к шаблону должен генерироваться на основе ID по схеме "%templateFolder%/b%ViewId%.js"
  equal @folderView._getTemplateURL(), 'templates/bMovie.js', 'Должно вернуть templates/bMovie.js, а вернуло ' + @folderView._getTemplateURL()
  equal @overridenFolderView._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + @overridenFolderView._getTemplateURL()


test '_getTemplateURL() with folder name and template format', 2, ->
  #путь к шаблону должен генерироваться на основе ID по схеме "%templateFolder%/b%ViewId%.%templateFormat%"
  equal @formatView._getTemplateURL(), 'bMovie.jade', 'Должно вернуть templates/bMovie.jade, а вернуло ' + @folderView._getTemplateURL()
  equal @overridenFormatAndFolderView._getTemplateURL(), 'templates/bFrontpage.jade', 'Должно вернуть templates/bFrontpage.jade, а вернуло ' + @overridenFormatAndFolderView._getTemplateURL()

test '_getTemplateName()', 2, ->
  #путь к шаблону должен генерироваться на основе ID по схеме "b%ViewId%"
  equal @overridenFormatAndFolderView._getTemplateName(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + @overridenFormatAndFolderView._getTemplateName()
  equal @canonicalFolderView._getTemplateName(), 'bMovie', 'Должно вернуть bMovie, а вернуло ' + @canonicalFolderView._getTemplateName()

test '_getTemplateURL() with _getTemplateName()', 1, ->
  #путь к шаблону должен генерироваться на основе ID по схеме "%templateFolder%/b%ViewId%.%templateFormat%"
  equal @templateView._getTemplateURL(), 'app/templates/bFrontpage.js', 'Должно вернуть app/templates/bFrontpage.js, а вернуло ' + @templateView._getTemplateURL()

asyncTest 'triggers destroy event on remove()', 1, ->
  @canonicalView.render()

  @canonicalView.on 'ready', ->
    @destroy()

  @canonicalView.on 'destroyed', ->
    ok on
    start()

test 'children.add() unique views', 1, ->
  @canonicalView.children.add @partialInstanceView
  initialLength = _.keys(@canonicalView.children._list).length
  @canonicalView.children.add @partialInstanceView

  equal initialLength, _.keys(@canonicalView.children._list).length, 'Shouldn\'t add duplicates'