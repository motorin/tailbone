$(document).ready(function() {

  module("Inn");
  test("Наличие", 1, function() {
    ok(Inn, 'Ожидаем наличия нашего неймспейса');
  });


  module("Inn.Model", {
    setup: function() {
      this.model = new Inn.Model({
        id: 'model_id',
        name: 'model_name'
      });
    },
    teardown: function() {
      delete this.model;
    }
  });
  
  test('extends Backbone.Model', 1, function() {
    ok(this.model instanceof Backbone.Model, 'Модель должна наследоваться от Backbone.Model');
  });
  
  test('fetch.done', 1, function() {
    equal(typeof this.model.fetch().done, 'function', 'Модель должна иметь возвращать deferred-метод "done" при запросе к серверу');
  });


  module("Inn.Collection", {
    setup: function() {
      this.collection = new Inn.Collection();
      this.collection.add([{
        id: 'model_1',
        name: "Model number 1"
      }, {
        id: 'model_2',
        name: "Model number 2"
      }]);
    },
    teardown: function() {
      delete this.collection;
    }
  });
  
  test('extends Backbone.Collection', 1, function() {
    ok(this.collection instanceof Backbone.Collection, 'Модель должна наследоваться от Backbone.Collection');
  });

  test('contains Inn.Models', 1, function() {
    ok(this.collection.models[0] instanceof Inn.Model, 'Коолекция должно состоят из Inn.Model');
  });


  module("Inn.DataManager", {
    setup: function() {
      this.model = new Inn.Model({
        id: 'data_id'
      });
      this.model_2 = new Inn.Model({
        id: 'data_id2'
      });
      this.collectionModel = new Inn.Collection();
      
      this.dataManager = new Inn.DataManager();
    },
    teardown: function() {
      delete this.model;
      delete this.model_2;
      delete this.dataManager;
    }
  });
  test("Наличие", 1, function() {
    ok(this.dataManager instanceof Inn.DataManager, 'Ожидаем объект менеджера данных');
  });

  test('addDataAsset', 7, function() {
    this.dataManager.addDataAsset(this.model);
    strictEqual(this.dataManager._dataSets[0], this.model, 'Внутри dataManager данные должны храниться внутри массива _dataSets');

    this.dataManager.addDataAsset(this.model_2);
    strictEqual(this.dataManager._dataSets[0], this.model, 'Добавление данных не должно перетирать старые');
    strictEqual(this.dataManager._dataSets[1], this.model_2, 'Добавление данных не должно перетирать старые');
    
    this.dataManager.addDataAsset(this.model_2);
    strictEqual(this.dataManager._dataSets[2], undefined, 'Если данные уже добавлены, они не должны быть добавлены повторно');
    
    this.dataManager.addDataAsset(this.model);
    strictEqual(this.dataManager._dataSets[2], undefined, 'Если данные уже добавлены, они не должны быть добавлены повторно');
    
    this.dataManager.addDataAsset(this.collectionModel, 'collection');
    strictEqual(this.dataManager._dataSets[2], this.collectionModel, 'Добавление коллекции');
    
    delete this.collectionModel.id
    
    this.dataManager.addDataAsset(this.collectionModel, 'collection');
    strictEqual(this.dataManager._dataSets[3], undefined, 'Если колллекция добавлена, до повторно она добавляться не должна');
    
  });

  test('addDataAsset: return self', 1, function() {
    strictEqual(this.dataManager.addDataAsset(this.model), this.dataManager, 'Функция Inn.DataManager.addDataAsset должна возвращать саму себя');
  });
  
  test('addDataAsset: asset types', 5, function() {
    raises(function(){this.dataManager.addDataAsset({})}, Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка');
    raises(function(){this.dataManager.addDataAsset()}, Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка');
    raises(function(){this.dataManager.addDataAsset("")}, Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка');
    raises(function(){this.dataManager.addDataAsset(new Backbone.Model())}, Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка');
    raises(function(){this.dataManager.addDataAsset(new Backbone.Collection())}, Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка');
  });
  
  
  test('add:dataAsset event', 1, function() {
    var some_variable;
    this.dataManager.on('add:dataAsset', function(model){
      some_variable = model;
    });
    this.dataManager.addDataAsset(this.model);
    
    strictEqual(some_variable, this.model, 'Функция Inn.DataManager.addDataAsset должна вызывать событие "add:dataAsset" и передавать в колбек добавленный объект');
  });
  
  
  test('getDataAsset', 3, function() {
    this.dataManager.addDataAsset(this.model_2);
    equal(this.dataManager.getDataAsset('data_id2'), this.model_2, 'Функция Inn.DataManager.getDataAsset должна возвращать модель по id');
    
    this.dataManager.addDataAsset(this.collectionModel, 'collection');
    strictEqual(this.dataManager.getDataAsset('collection'), this.collectionModel, 'Функция Inn.DataManager.getDataAsset должна возвращать коллекцию по id');
    
    strictEqual(this.dataManager.getDataAsset('other_data_id'), null, 'Функция Inn.DataManager.get должна возвращать null если модель не найдена');
  });
  
  test('removeDataAsset', 2, function() {
    this.dataManager.addDataAsset(this.model);
    this.dataManager.removeDataAsset('data_id');
    strictEqual(this.dataManager.getDataAsset('data_id'), null, 'Функция Inn.DataManager.removeDataAsset не удалила данные');
    strictEqual(this.dataManager.removeDataAsset('data_id'), null, 'Функция Inn.DataManager.removeDataAsset должна возвращать null если модель не найдена');
  });
  
  test('remove:dataAsset event', 1, function() {
    var some_variable;
    this.dataManager.on('remove:dataAsset', function(model){
      some_variable = true;
    });
    this.dataManager.addDataAsset(this.model);
    this.dataManager.removeDataAsset('data_id');
    
    strictEqual(some_variable, true, 'Функция Inn.DataManager.removeDataAsset должна вызывать событие "remove:dataAsset"');
  });


  module("Inn.View", {
    setup: function() {
      this.canonical_view = new Inn.View({
        id: 'movie'
      });

      this.overriden_view = new Inn.View({
        id: 'content',
        templateURL: 'bFrontpage'
      });

    },
    teardown: function() {
      delete this.canonical_view;
      delete this.overriden_view;
    }
  });
  
  test('extends Backbone.View', 1, function() {
    ok(this.canonical_view instanceof Backbone.View, 'Модель должна наследоваться от Backbone.View');
  });
  
  test('triggers render event on render()', 1, function() {
    var some_variable;
    some_variable = false;
    this.canonical_view.on('render', function(){
      some_variable = true;
    });
    this.canonical_view.render();
    
    ok(some_variable, 'View должна триггерить событие render при своем рендеринге');
  });
  
  test('_getTemplateURL()', 2, function() {
    //по умолчанию название шаблона должно генерироваться на основе ID по схеме "b%ViewId%". Если жестко задан параметр "template" то должен браться он
    equal(this.canonical_view._getTemplateURL(), 'bMovie', 'Должно вернуть bMovie, а вернуло ' + this.canonical_view._getTemplateURL());
    equal(this.overriden_view._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + this.overriden_view._getTemplateURL());
  });


  module("Inn.Layout", {
    setup: function(){
      this.dataManager = new Inn.DataManager();
      
      this.layout_config = {
        routes: {
          'header': {},
          'footer': {
            template: 'bFooter'
          },
          'content': {
            template: 'bFrontpage',
            partials: [{
              'tags': {}
            }, {
              'sortings': {}
            }, {
              'promoMovie': {}
            }, {
              'frontPageMovies': {
                template: 'bFrontPageMovies',
                partials: [{
                  'pagination': {}
                }]
              }
            }]
          }
        },
        dataManager: this.dataManager
      };
      
      this.layout = new Inn.Layout(this.layout_config);
      
      
      
      this.userModel = new Inn.Model({
        id: 'user',
        name: 'user'
      });
      
      this.collectionModel = new Inn.Collection();
      
      this.otherCollectionModel = new Inn.Collection();
      
      
      this.tagsModel = new Inn.Model({
        id: 'tags'
      });
      
      this.dataManager.addDataAsset(this.userModel);
      this.dataManager.addDataAsset(this.tagsModel);
      this.dataManager.addDataAsset(this.collectionModel, 'collection');
      this.dataManager.addDataAsset(this.otherCollectionModel, 'otherCollection');
      
      this.tagsView = new Inn.View({
        id: 'tags'
      });
      
      this.userbarView = new Inn.View({
        id: 'userbar',
        model: this.userModel
      });
      
      this.otherUserView = new Inn.View({
        id: 'user',
        model: this.userModel
      });
      
      this.collectionView = new Inn.View({
        id: 'collection'
      });
      
      this.collectionSetView = new Inn.View({
        id: 'collectionSet',
        collection: this.otherCollectionModel
      });
      
      this.orphanView = new Inn.View({
        id: 'orphan'
      });
      
    },
    teardown: function(){
      
    }
  });
  
  test("Наличие", 1, function() {
    ok(this.layout instanceof Inn.Layout, 'Ожидаем объект мастер-шаблона (лэйаута, страницы)');
  });
  
  test("_dataManager link require", 2, function() {
    raises(function(){new Inn.Layout()}, Inn.Error, 'Если не передан экземпляр менеджера данных то должна вызываться ошибка');
    raises(function(){new Inn.Layout({dataManager: {}})}, Inn.Error, 'Если не передан экземпляр менеджера данных неверного типа то должна вызываться ошибка');
  });
  
  test("_dataManager link", 1, function() {
    ok(this.layout._dataManager instanceof Inn.DataManager, 'При создании layout у нему должна крепиться ссылка на менеджер данных');
  });
  
  test('render', 2, function() {
    equal(typeof this.layout.render, 'function', 'Нет функции, рендерящей мастер-шаблон');
    equal(typeof this.layout.render().done, 'function', 'Функция, рендерящая мастер-шаблон должна вернуть deferred-объект, у которого будет метод done');
  });
  
  test('addView', 5, function() {
    this.layout.addView(this.tagsView);
    strictEqual(this.layout._views[0], this.tagsView, 'Внутри layout view должны храниться внутри массива _views');

    this.layout.addView(this.userbarView);
    strictEqual(this.layout._views[0], this.tagsView, 'Внутри layout view должны храниться внутри массива');
    strictEqual(this.layout._views[1], this.userbarView, 'Добавление view не должно перетирать старые view');
    
    this.layout.addView(this.userbarView);
    strictEqual(this.layout._views[2], undefined, 'Если view уже добавлена, она не должна быть добавлена повторно');
    
    this.layout.addView(this.tagsView);
    strictEqual(this.layout._views[2], undefined, 'Если view уже добавлена, она не должна быть добавлена повторно');
    
  });
  
  test('addView: return self', 1, function() {
    strictEqual(this.layout.addView(this.tagsView), this.layout, 'Функция Inn.Layout.addView должна возвращать саму себя');
  });
  
  test('addView: type', 4, function() {
    raises(function(){this.layout.addView({})}, Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка');
    raises(function(){this.layout.addView()}, Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка');
    raises(function(){this.layout.addView("")}, Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка');
    raises(function(){this.layout.addView(new Backbone.View())}, Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка');
  });
  
  
  test('add:view event', 1, function() {
    var some_variable;
    this.layout.on('add:view', function(view){
      some_variable = view;
    });
    this.layout.addView(this.tagsView);
    
    strictEqual(some_variable, this.tagsView, 'Функция Inn.Layout.addView должна вызывать событие "add:view" и передавать в колбек добавленный объект');
  });
  
  test('getView', 2, function() {
    this.layout.addView(this.tagsView);
    equal(this.layout.getView('tags'), this.tagsView, 'Функция Inn.Layout.getView должна возвращать View по id');
    strictEqual(this.layout.getView('other_id'), null, 'Функция Inn.Layout.getView должна возвращать null если View не найдена');
  });
  
  test('removeView', 3, function() {
    this.layout.addView(this.tagsView);
    equal(this.layout.removeView('tags'), this.layout, 'Функция Inn.Layout.removeView должна возвращать саму себя');
    strictEqual(this.layout.getView('tags'), null, 'Функция Inn.Layout.removeView не удалила View');
    strictEqual(this.layout.removeView('tags'), null, 'Функция Inn.Layout.removeView должна возвращать null если View не найдена');
  });
  
  test('remove:view event', 1, function() {
    var some_variable;
    this.layout.on('remove:view', function(model){
      some_variable = true;
    });
    this.layout.addView(this.tagsView);
    this.layout.removeView('tags');
    
    strictEqual(some_variable, true, 'Функция Inn.Layout.removeView должна вызывать событие "remove:view"');
  });
  
  test('addView and data linking', 5, function() {
    this.layout.addView(this.tagsView);
    strictEqual(this.layout.getView('tags').model, this.tagsModel, 'При добавлении View в мастер-шаблон, к нему должны быть привязаны данные по его ID');
    
    this.layout.addView(this.userbarView);
    strictEqual(this.layout.getView('userbar').model, this.userModel, 'Если модель задана явно, то она остается');
    
    this.layout.addView(this.orphanView);
    strictEqual(this.layout.getView('orphan').model, undefined, 'Если модели нет в менеджере, она остается неопределенной');
    
    this.layout.addView(this.collectionView);
    strictEqual(this.layout.getView('collection').collection, this.collectionModel, 'Если данные являются коллекцией, то они идут в атрибут collection');
    
    this.layout.addView(this.collectionSetView);
    strictEqual(this.layout.getView('collectionSet').collection, this.otherCollectionModel, 'Если коллекция задана явно, то она остается');
    
    
  });
  
  test('addView: bind layout', 1, function() {
    this.layout.addView(this.tagsView);
    strictEqual(this.layout.getView('tags').options.layout, this.layout, 'Добавляя себе view Layout прописывает себя в его options');
  });
  
  test('digView', 1, function() {
    var some_variable;
    some_variable = false;
    this.layout.digView = function(view){
      some_variable = view;
    }

    this.layout.addView(this.tagsView);
    this.tagsView.render();
    
    strictEqual(some_variable, this.tagsView, 'Layout должен слушать событие render у своих вьющек и просканировать их на предмет появления плейсхолдеров');
  });
  
});
