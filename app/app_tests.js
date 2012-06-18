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
  
  test('done', 1, function() {
    equal(typeof this.model.done, 'function', 'Модель должна иметь deferred-метод "done"');
  });


  module("Inn.Collection", {
    setup: function() {
      this.collection = new Inn.Collection({
        id: 'collection_id',
        name: 'model_name',
        model: Inn.Model
      });
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


  module("Inn.DataManager", {
    setup: function() {
      this.model = new InnModel({
        id: 'data_id'
      });
      this.model_2 = new InnModel({
        id: 'data_id2'
      });
      
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

  test('addDataAsset', 1, function() {
    strictEqual(this.dataManager.addDataAsset(this.model), this.dataManager, 'Функция Inn.DataManager.addDataAsset должна возвращать саму себя');
  });
  
  test('add:dataAsset event', 1, function() {
    var some_variable;
    this.dataManager.on('add:dataAsset', function(model){
      some_variable = model;
    });
    this.dataManager.addDataAsset(this.model);
    
    strictEqual(some_variable, this.model, 'Функция Inn.DataManager.addDataAsset должна вызывать событие "add:dataAsset" и передавать в колбек добавленный объект');
  });
  
  
  test('getDataAsset', 2, function() {
    this.dataManager.addDataAsset(this.model_2);
    equal(this.dataManager.getDataAsset('data_id2'), this.model_2, 'Функция Inn.DataManager.getDataAsset должна возвращать модель по id');
    strictEqual(this.dataManager.getDataAsset('other_data_id'), null, 'Функция Inn.DataManager.get должна возвращать null если модель не найдена');
  });
  
  test('removeDataAsset', 3, function() {
    this.dataManager.addDataAsset(this.model);
    equal(this.dataManager.removeDataAsset('data_id'), this.dataManager, 'Функция Inn.DataManager.removeDataAsset должна возвращать саму себя');
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
  

  test('массивные методы', 2, function() {
    this.dataManager.addDataAsset(this.model);
    this.dataManager.addDataAsset(this.model_2);
    equal(this.dataManager[1], this.model_2, 'Inn.DataManager должен брать данные по индексу, как массив');
    equal(this.dataManager.length, 2, 'Inn.DataManager.lenth должна возвращать длину массива данных');
  });


  module("Inn.View", {
    setup: function() {
      this.canonical_view = new Inn.View({
        id: 'movie'
      });

      this.overriden_view = new Inn.View({
        id: 'content',
        template: 'bFrontpage'
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
  
  test('_getTemplateURL()', 2, function() {
    //по умолчанию название шаблона должно генерироваться на основе ID по схеме "b%ViewId%". Если жестко задан параметр "template" то должен браться он
    equal(canonical_view._getTemplateURL(), 'bMovie', 'Должно вернуть bMovie, а вернуло ' + canonical_view._getTemplateURL());
    equal(overriden_view._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + overriden_view._getTemplateURL());
  });


  module("Inn.Layout", {
    setup: function(){
      this.layout_config = {
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
      };
      
      this.layout = new Inn.Layout(this.layout_config);
      
      this.dataManager = new Inn.DataManager();
      
      this.userModel = new Inn.Model({
        id: 'user',
        name: 'user'
      });
      
      this.tagsModel = new Inn.Model({
        id: 'tags'
      });
      
      this.dataManager.addDataAsset(userModel);
      this.dataManager.addDataAsset(tagsModel);
      
      this.tagsView = new Inn.View({
        id: 'tags'
      });
      
      this.userbarView = new Inn.View({
        id: 'userbar',
        model: userModel
      });
      
      this.otherUserView = new Inn.View({
        id: 'user',
        model: userModel
      });
      
      this.orphanView = new Inn.View({
        id: 'orphan'
      });
      
    },
    teardown: function(){
      
    }
  });
  
  test("Наличие", 1, function() {
    ok(this.template instanceof Inn.Layout, 'Ожидаем объект мастер-шаблона (лэйаута, страницы)');
  });
  
  test('render', 2, function() {
    equal(typeof this.layout.render, 'function', 'Нет функции, рендерящей мастер-шаблон');
    equal(typeof this.layout.render().done, 'function', 'Функция, рендерящая мастер-шаблон должна вернуть deferred-объект, у которого будет метод done');
  });
  
  test('addView', 1, function() {
    strictEqual(this.layout.addView(this.tagsView), this.layout, 'Функция Inn.Layout.addView должна возвращать саму себя');
  });
  
  test('add:view event', 1, function() {
    var some_variable;
    this.view.on('add:view', function(view){
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
  
  test('addView and model linking', 3, function() {
    this.layout.addView(this.tagsView);
    strictEqual(this.layout.getView('tags').model, this.tagsModel, 'При добавлении View в мастер-шаблон, к нему должны быть привязаны данные по его ID');
    
    this.layout.addView(this.userbarView);
    strictEqual(this.layout.getView('userbar').model, this.userModel, 'Если модель задана явно, то она остается');
    
    this.layout.addView(this.orphanView);
    strictEqual(this.layout.getView('orphan').model, undefined, 'Если модели нет в менеджере, она остается неопределенной');
    
  });
  
  
  
});
