(function() {

  module("Inn");

  test("Existance", 1, function() {
    return ok(Inn, 'Check existance of Inn namespace');
  });

  module("Inn.Model", {
    setup: function() {
      return this.model = new Inn.Model({
        id: 'model_id',
        name: 'model_name'
      });
    },
    teardown: function() {
      return delete this.model;
    }
  });

  test('extends Backbone.Model', 1, function() {
    return ok(this.model instanceof Backbone.Model, 'Model should extend Backbone.Model');
  });

  test('fetch.done', 1, function() {
    return equal(typeof this.model.fetch().done, 'function', 'Model should perform fetch in deferred manner');
  });

  module("Inn.Collection", {
    setup: function() {
      this.collection = new Inn.Collection;
      return this.collection.add([
        {
          id: 'model_1',
          name: "Model number 1"
        }, {
          id: 'model_2',
          name: "Model number 2"
        }
      ]);
    },
    teardown: function() {
      return delete this.collection;
    }
  });

  test('extends Backbone.Collection', 1, function() {
    return ok(this.collection instanceof Backbone.Collection, 'Модель должна наследоваться от Backbone.Collection');
  });

  test('contains Inn.Models', 1, function() {
    return ok(this.collection.models[0] instanceof Inn.Model, 'Коолекция должно состоят из Inn.Model');
  });

  module("Inn.DataManager", {
    setup: function() {
      this.model = new Inn.Model({
        id: 'data_id'
      });
      this.model_2 = new Inn.Model({
        id: 'data_id2'
      });
      this.collectionModel = new Inn.Collection;
      return this.dataManager = new Inn.DataManager;
    },
    teardown: function() {
      delete this.model;
      delete this.model_2;
      return delete this.dataManager;
    }
  });

  test("Наличие", 1, function() {
    return ok(this.dataManager instanceof Inn.DataManager, 'Ожидаем объект менеджера данных');
  });

  test('addDataAsset', 7, function() {
    this.dataManager.addDataAsset(this.model);
    strictEqual(this.dataManager._dataSets[0], this.model, 'Внутри dataManager данные должны храниться внутри массива _dataSets');
    this.dataManager.addDataAsset(this.model_2);
    strictEqual(this.dataManager._dataSets[0], this.model, 'Добавление данных не должно перетирать старые');
    strictEqual(this.dataManager._dataSets[1], this.model_2, 'Добавление данных не должно перетирать старые');
    this.dataManager.addDataAsset(this.model_2);
    strictEqual(this.dataManager._dataSets[2], void 0, 'Если данные уже добавлены, они не должны быть добавлены повторно');
    this.dataManager.addDataAsset(this.model);
    strictEqual(this.dataManager._dataSets[2], void 0, 'Если данные уже добавлены, они не должны быть добавлены повторно');
    this.dataManager.addDataAsset(this.collectionModel, 'collection');
    strictEqual(this.dataManager._dataSets[2], this.collectionModel, 'Добавление коллекции');
    delete this.collectionModel.id;
    this.dataManager.addDataAsset(this.collectionModel, 'collection');
    return strictEqual(this.dataManager._dataSets[3], void 0, 'Если колллекция добавлена, до повторно она добавляться не должна');
  });

  test('addDataAsset: return self', 1, function() {
    return strictEqual(this.dataManager.addDataAsset(this.model), this.dataManager, 'Функция Inn.DataManager.addDataAsset должна возвращать саму себя');
  });

  test('addDataAsset: asset types', 5, function() {
    raises(function() {
      return this.dataManager.addDataAsset({});
    }, Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка');
    raises(function() {
      return this.dataManager.addDataAsset();
    }, Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка');
    raises(function() {
      return this.dataManager.addDataAsset("");
    }, Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка');
    raises(function() {
      return this.dataManager.addDataAsset(new Backbone.Model);
    }, Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка');
    return raises(function() {
      return this.dataManager.addDataAsset(new Backbone.Collection);
    }, Inn.Error, 'Если тип данных не Inn.Model и не Inn.Collection то должна вызываться ошибка');
  });

  test('add:dataAsset event', 1, function() {
    var some_variable;
    some_variable = false;
    this.dataManager.on('add:dataAsset', function(model) {
      return some_variable = model;
    });
    this.dataManager.addDataAsset(this.model);
    return strictEqual(some_variable, this.model, 'Функция Inn.DataManager.addDataAsset должна вызывать событие "add:dataAsset" и передавать в колбек добавленный объект');
  });

  test('getDataAsset', 3, function() {
    this.dataManager.addDataAsset(this.model_2);
    equal(this.dataManager.getDataAsset('data_id2'), this.model_2, 'Функция Inn.DataManager.getDataAsset должна возвращать модель по id');
    this.dataManager.addDataAsset(this.collectionModel, 'collection');
    strictEqual(this.dataManager.getDataAsset('collection'), this.collectionModel, 'Функция Inn.DataManager.getDataAsset должна возвращать коллекцию по id');
    return strictEqual(this.dataManager.getDataAsset('other_data_id'), null, 'Функция Inn.DataManager.get должна возвращать null если модель не найдена');
  });

  test('removeDataAsset', 2, function() {
    this.dataManager.addDataAsset(this.model);
    this.dataManager.removeDataAsset('data_id');
    strictEqual(this.dataManager.getDataAsset('data_id'), null, 'Функция Inn.DataManager.removeDataAsset не удалила данные');
    return strictEqual(this.dataManager.removeDataAsset('data_id'), null, 'Функция Inn.DataManager.removeDataAsset должна возвращать null если модель не найдена');
  });

  test('remove:dataAsset event', 1, function() {
    var some_variable;
    some_variable = false;
    this.dataManager.on('remove:dataAsset', function(model) {
      return some_variable = true;
    });
    this.dataManager.addDataAsset(this.model);
    this.dataManager.removeDataAsset('data_id');
    return strictEqual(some_variable, true, 'Функция Inn.DataManager.removeDataAsset должна вызывать событие "remove:dataAsset"');
  });

  test('destroy', 3, function() {
    this.dataManager.addDataAsset(this.model);
    this.dataManager.addDataAsset(this.model_2);
    this.dataManager.addDataAsset(this.collectionModel, 'collection');
    this.dataManager.destroy();
    strictEqual(this.dataManager.getDataAsset('data_id'), null, 'Destroy should remove links for all dataAssets"');
    strictEqual(this.dataManager.getDataAsset('data_id2'), null, 'Destroy should remove links for all dataAssets"');
    return strictEqual(this.dataManager.getDataAsset('collection'), null, 'Destroy should remove links for all dataAssets"');
  });

  module("Inn.View", {
    setup: function() {
      this.canonical_view = new Inn.View({
        id: 'movie'
      });
      this.folder_view = new Inn.View({
        id: 'movie',
        templateFolder: 'templates'
      });
      this.format_view = new Inn.View({
        id: 'movie',
        templateFormat: 'jade'
      });
      this.overriden_view = new Inn.View({
        id: 'content',
        templateURL: 'bFrontpage'
      });
      this.overriden_folder_view = new Inn.View({
        id: 'content',
        templateURL: 'bFrontpage',
        templateFolder: 'templates'
      });
      this.overriden_format_and_folder_view = new Inn.View({
        id: 'content',
        templateName: 'bFrontpage',
        templateFolder: 'templates',
        templateFormat: 'jade'
      });
      this.real_view = new Inn.View({
        id: 'someView',
        templateFolder: 'app/templates'
      });
      return this.template_view = new Inn.View({
        id: 'someView',
        templateName: 'bFrontpage',
        templateFolder: 'app/templates'
      });
    },
    teardown: function() {
      delete this.canonical_view;
      return delete this.overriden_view;
    }
  });

  test('extends Backbone.View', 1, function() {
    return ok(this.canonical_view instanceof Backbone.View, 'Модель должна наследоваться от Backbone.View');
  });

  test('renders deferred style', 1, function() {
    return equal(typeof this.canonical_view.render().done, 'function', 'Функция, рендерящая шаблон должна вернуть deferred-объект, у которого будет метод done');
  });

  asyncTest('triggers render event on render()', 1, function() {
    var some_variable;
    some_variable = false;
    this.real_view.on('render', function() {
      return some_variable = true;
    });
    return this.real_view.render().done(function() {
      ok(some_variable, 'View должна триггерить событие render при своем рендеринге');
      return start();
    });
  });

  test('_getTemplateURL()', 2, function() {
    equal(this.canonical_view._getTemplateURL(), 'bMovie.js', 'Должно вернуть bMovie.js, а вернуло ' + this.canonical_view._getTemplateURL());
    return equal(this.overriden_view._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + this.overriden_view._getTemplateURL());
  });

  test('_getTemplateURL() with folder name', 2, function() {
    equal(this.folder_view._getTemplateURL(), 'templates/bMovie.js', 'Должно вернуть templates/bMovie.js, а вернуло ' + this.folder_view._getTemplateURL());
    return equal(this.overriden_folder_view._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + this.overriden_folder_view._getTemplateURL());
  });

  test('_getTemplateURL() with folder name and template format', 2, function() {
    equal(this.format_view._getTemplateURL(), 'bMovie.jade', 'Должно вернуть templates/bMovie.jade, а вернуло ' + this.folder_view._getTemplateURL());
    return equal(this.overriden_format_and_folder_view._getTemplateURL(), 'templates/bFrontpage.jade', 'Должно вернуть templates/bFrontpage.jade, а вернуло ' + this.overriden_folder_view._getTemplateURL());
  });

  test('_getTemplateName()', 2, function() {
    equal(this.overriden_format_and_folder_view._getTemplateName(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + this.overriden_format_and_folder_view._getTemplateName());
    return equal(this.canonical_view._getTemplateName(), 'bMovie', 'Должно вернуть bMovie, а вернуло ' + this.canonical_view._getTemplateName());
  });

  test('_getTemplateURL() with _getTemplateName()', 1, function() {
    return equal(this.template_view._getTemplateURL(), 'app/templates/bFrontpage.js', 'Должно вернуть app/templates/bFrontpage.js, а вернуло ' + this.template_view._getTemplateURL());
  });

  asyncTest('render should define _template', 1, function() {
    var render, test;
    render = this.real_view.render();
    test = this;
    return render.done(function() {
      ok(test.real_view._template, 'При рендеренге должна создаваться функция-шаблон');
      return start();
    });
  });

  asyncTest('render should render _template', 1, function() {
    var render, test;
    render = this.real_view.render();
    test = this;
    return render.done(function() {
      equal(test.real_view.$el.text(), 'Some content', 'Должнен отрендериться временный элемент');
      return start();
    });
  });

  test('triggers remove event on remove()', 1, function() {
    var some_variable;
    some_variable = false;
    this.real_view.on('remove', function() {
      return some_variable = true;
    });
    this.real_view.remove();
    return ok(some_variable, 'View должна триггерить событие remove при уничтожении DOM-елемента');
  });

  test('getDataForView', 1, function() {
    this.real_view.remove();
    return strictEqual(typeof this.real_view.getDataForView, 'function', 'View should have getDataForView method');
  });

  module("Inn.Layout", {
    setup: function() {
      this.dataManager = new Inn.DataManager;
      this.layout_config = {
        partials: {
          'header': {},
          'footer': {
            templateURL: 'bFooter'
          },
          'content': {
            templateURL: 'bFrontpage',
            partials: {
              'tags': {},
              'sortings': {},
              'promoMovie': {},
              'frontPageMovies': {
                templateURL: 'bFrontPageMoviesList',
                partials: {
                  'pagination': {}
                }
              }
            }
          },
          'someView': {}
        },
        dataManager: this.dataManager,
        templateFolder: 'app/templates'
      };
      this.layout = new Inn.Layout(this.layout_config);
      this.layout_with_id = new Inn.Layout({
        dataManager: this.dataManager,
        id: 'secondLayout'
      });
      this.layout_with_templateFolder = new Inn.Layout({
        dataManager: this.dataManager,
        viewOptions: {
          templateFolder: 'app/templates'
        }
      });
      this.layout_with_templateFormat = new Inn.Layout({
        dataManager: this.dataManager,
        templateFormat: 'jade'
      });
      this.layout_with_templateFormat_and_templateFolder = new Inn.Layout({
        dataManager: this.dataManager,
        templateFolder: 'app/templates',
        templateFormat: 'jade'
      });
      this.layout_with_overriden_templateName = new Inn.Layout({
        dataManager: this.dataManager,
        templateName: 'other_layout'
      });
      this.layout_with_overriden_templateName_and_templateFolder = new Inn.Layout({
        dataManager: this.dataManager,
        templateFolder: 'app/templates',
        templateName: 'other_layout'
      });
      this.layout_with_overriden_templateName_and_templateFolder_and_templateFormat = new Inn.Layout({
        dataManager: this.dataManager,
        templateFormat: 'jade',
        templateFolder: 'app/templates',
        templateName: 'other_layout'
      });
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
      this.userbarCloneView = new Inn.View({
        id: 'userbar'
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
      this.realView = new Inn.View({
        id: 'someView',
        templateFolder: 'app/templates'
      });
      this.contentView = new Inn.View({
        id: 'content',
        templateFolder: 'app/templates'
      });
      return this.frontpageView = new Inn.View({
        id: 'frontPageMovies',
        templateFolder: 'app/templates'
      });
    },
    teardown: function() {
      delete this.dataManager;
      delete this.layout_config;
      delete this.layout;
      delete this.userModel;
      delete this.collectionModel;
      delete this.otherCollectionModel;
      delete this.tagsModel;
      delete this.tagsView;
      delete this.userbarView;
      delete this.otherUserView;
      delete this.collectionView;
      delete this.collectionSetView;
      delete this.orphanView;
      delete this.realView;
      delete this.contentView;
      return delete this.frontapageView;
    }
  });

  test("Наличие", 1, function() {
    return ok(this.layout instanceof Inn.Layout, 'Ожидаем объект мастер-шаблона (лэйаута, страницы)');
  });

  test("id", 2, function() {
    strictEqual(this.layout.id, 'layout', 'Должен автоматически присвоиться id главного элемента мастер-шаблона');
    return strictEqual(this.layout_with_id.id, 'secondLayout', 'Должен автоматически присвоиться id главного элемента мастер-шаблона');
  });

  test('_getTemplateName()', 2, function() {
    equal(this.layout._getTemplateName(), 'bLayout', 'Должно вернуть bLayou, а вернуло ' + this.layout._getTemplateName());
    return equal(this.layout_with_id._getTemplateName(), 'bSecondLayout', 'Должно вернуть bSecondLayout, а вернуло ' + this.layout_with_id._getTemplateName());
  });

  test('_getTemplateURL()', 7, function() {
    strictEqual(this.layout._getTemplateURL(), 'app/templates/bLayout.js', 'Должно вернуться bLayout.js');
    strictEqual(this.layout_with_id._getTemplateURL(), 'bSecondLayout.js', 'Должно вернуться bSecondLayout.js');
    strictEqual(this.layout_with_templateFormat._getTemplateURL(), 'bLayout.jade', 'кастомный путь к шаблону, если он есть в настройках');
    strictEqual(this.layout_with_templateFormat_and_templateFolder._getTemplateURL(), 'app/templates/bLayout.jade', 'кастомный путь к шаблону, если он есть в настройках');
    strictEqual(this.layout_with_overriden_templateName._getTemplateURL(), 'other_layout.js', 'кастомный путь к шаблону, если он есть в настройках');
    strictEqual(this.layout_with_overriden_templateName_and_templateFolder._getTemplateURL(), 'app/templates/other_layout.js', 'кастомный путь к шаблону, если он есть в настройках');
    return strictEqual(this.layout_with_overriden_templateName_and_templateFolder_and_templateFormat._getTemplateURL(), 'app/templates/other_layout.jade', 'кастомный путь к шаблону, если он есть в настройках');
  });

  test("_dataManager link require", 2, function() {
    raises(function() {
      return new Inn.Layout();
    }, Inn.Error, 'Если не передан экземпляр менеджера данных то должна вызываться ошибка');
    return raises(function() {
      return new Inn.Layout({
        dataManager: {}
      });
    }, Inn.Error, 'Если не передан экземпляр менеджера данных неверного типа то должна вызываться ошибка');
  });

  test("_dataManager link", 1, function() {
    return ok(this.layout._dataManager instanceof Inn.DataManager, 'При создании layout у нему должна крепиться ссылка на менеджер данных');
  });

  test('render', 2, function() {
    equal(typeof this.layout.render, 'function', 'Нет функции, рендерящей мастер-шаблон');
    return equal(typeof this.layout.render().done, 'function', 'Функция, рендерящая мастер-шаблон должна вернуть deferred-объект, у которого будет метод done');
  });

  test('render should not create several deferreds until resolve', 1, function() {
    var first_deferred, second_deferred;
    first_deferred = this.layout.render();
    second_deferred = this.layout.render();
    return strictEqual(first_deferred, second_deferred, 'Если неразрешен первый рендер, то должен возвращаться текущий');
  });

  test('addView', 6, function() {
    this.layout.addView(this.tagsView);
    strictEqual(this.layout._views[0], this.tagsView, 'Внутри layout view должны храниться внутри массива _views');
    this.layout.addView(this.userbarView);
    strictEqual(this.layout._views[0], this.tagsView, 'Внутри layout view должны храниться внутри массива');
    strictEqual(this.layout._views[1], this.userbarView, 'Добавление view не должно перетирать старые view');
    this.layout.addView(this.userbarView);
    strictEqual(this.layout._views[2], void 0, 'Если view уже добавлена, она не должна быть добавлена повторно');
    this.layout.addView(this.tagsView);
    strictEqual(this.layout._views[2], void 0, 'Если view уже добавлена, она не должна быть добавлена повторно');
    this.layout.addView(this.userbarCloneView);
    return strictEqual(this.layout._views[2], void 0, 'Если view уже добавлена, она не должна быть добавлена повторно если имеет тот же ID');
  });

  test('addView: return self', 1, function() {
    return strictEqual(this.layout.addView(this.tagsView), this.layout, 'Функция Inn.Layout.addView должна возвращать саму себя');
  });

  test('addView: type', 4, function() {
    raises(function() {
      return this.layout.addView({});
    }, Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка');
    raises(function() {
      return this.layout.addView();
    }, Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка');
    raises(function() {
      return this.layout.addView("");
    }, Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка');
    return raises(function() {
      return this.layout.addView(new Backbone.View());
    }, Inn.Error, 'Если тип данных не Inn.View то должна вызываться ошибка');
  });

  test('add:view event', 1, function() {
    var some_variable;
    some_variable = false;
    this.layout.on('add:view', function(view) {
      return some_variable = view;
    });
    this.layout.addView(this.tagsView);
    return strictEqual(some_variable, this.tagsView, 'Функция Inn.Layout.addView должна вызывать событие "add:view" и передавать в колбек добавленный объект');
  });

  test('getView', 2, function() {
    this.layout.addView(this.tagsView);
    equal(this.layout.getView('tags'), this.tagsView, 'Функция Inn.Layout.getView должна возвращать View по id');
    return strictEqual(this.layout.getView('other_id'), null, 'Функция Inn.Layout.getView должна возвращать null если View не найдена');
  });

  test('removeView', 3, function() {
    this.layout.addView(this.tagsView);
    equal(this.layout.removeView('tags'), this.layout, 'Функция Inn.Layout.removeView должна возвращать саму себя');
    strictEqual(this.layout.getView('tags'), null, 'Функция Inn.Layout.removeView не удалила View');
    return strictEqual(this.layout.removeView('tags'), null, 'Функция Inn.Layout.removeView должна возвращать null если View не найдена');
  });

  test('remove:view event', 1, function() {
    var some_variable;
    some_variable = false;
    this.layout.on('remove:view', function(model) {
      return some_variable = true;
    });
    this.layout.addView(this.tagsView);
    this.layout.removeView('tags');
    return strictEqual(some_variable, true, 'Функция Inn.Layout.removeView должна вызывать событие "remove:view"');
  });

  test('addView and data linking', 5, function() {
    this.layout.addView(this.tagsView);
    strictEqual(this.layout.getView('tags').model, this.tagsModel, 'При добавлении View в мастер-шаблон, к нему должны быть привязаны данные по его ID');
    this.layout.addView(this.userbarView);
    strictEqual(this.layout.getView('userbar').model, this.userModel, 'Если модель задана явно, то она остается');
    this.layout.addView(this.orphanView);
    strictEqual(this.layout.getView('orphan').model, void 0, 'Если модели нет в менеджере, она остается неопределенной');
    this.layout.addView(this.collectionView);
    strictEqual(this.layout.getView('collection').collection, this.collectionModel, 'Если данные являются коллекцией, то они идут в атрибут collection');
    this.layout.addView(this.collectionSetView);
    return strictEqual(this.layout.getView('collectionSet').collection, this.otherCollectionModel, 'Если коллекция задана явно, то она остается');
  });

  test('addView: bind layout', 1, function() {
    this.layout.addView(this.tagsView);
    return strictEqual(this.layout.getView('tags').options.layout, this.layout, 'Добавляя себе view Layout прописывает себя в его options');
  });

  asyncTest('listen to views render event and call recheckSubViews method', 1, function() {
    var some_variable, test;
    some_variable = false;
    test = this;
    this.layout._recheckSubViews = function(view) {
      return some_variable = view;
    };
    this.layout.addView(this.realView);
    return this.realView.render().done(function() {
      strictEqual(some_variable, test.realView, 'Layout должен отслеживать события рендера и вызывать свой метод _recheckSubViews с передачей view в параметре');
      return start();
    });
  });

  test('recheckSubViews method', 1, function() {
    return strictEqual(typeof this.layout._recheckSubViews, 'function', 'Layout должен сожержать метод проверки подвьюшек');
  });

  test('_processPartials: should return self', 1, function() {
    return strictEqual(this.layout._processPartials(), this.layout, '_processPartials должен возвращать себя');
  });

  test('_processPartials: create top views', 3, function() {
    this.layout._processPartials();
    ok(this.layout.getView('header') instanceof Inn.View, 'Layout должен автоматически создать view верхнего уровня на основе переданных настроек');
    ok(this.layout.getView('footer') instanceof Inn.View, 'Layout должен автоматически создать view верхнего уровня на основе переданных настроек');
    return ok(this.layout.getView('content') instanceof Inn.View, 'Layout должен автоматически создать view верхнего уровня на основе переданных настроек');
  });

  test('_processPartials: create partial views', 5, function() {
    this.layout._processPartials();
    ok(this.layout.getView('tags') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек');
    ok(this.layout.getView('sortings') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек');
    ok(this.layout.getView('promoMovie') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек');
    ok(this.layout.getView('frontPageMovies') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек');
    return ok(this.layout.getView('pagination') instanceof Inn.View, 'Layout должен автоматически создать партиалы на основе переданных настроек');
  });

  test('_processPartials: set template names', 4, function() {
    this.layout._processPartials();
    strictEqual(this.layout.getView('header')._getTemplateURL(), 'app/templates/bHeader.js', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках');
    strictEqual(this.layout.getView('content')._getTemplateURL(), 'bFrontpage', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках');
    strictEqual(this.layout.getView('frontPageMovies')._getTemplateURL(), 'bFrontPageMoviesList', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках');
    return strictEqual(this.layout.getView('pagination')._getTemplateURL(), 'app/templates/bPagination.js', 'При создании view layout должен передавать кастомное название шаблона в конструктор, если он есть в настройках');
  });

  test('_processPartials should attach _viewBranch', 3, function() {
    this.layout.addView(this.realView);
    this.layout.addView(this.contentView);
    this.layout.addView(this.frontpageView);
    this.layout._processPartials();
    strictEqual(this.layout.getView('content').options._viewBranch, this.layout.options.partials.content, 'При создании view layout должен сохранить в ней ветвь роутинга для последующей очистки памяти и перерендеринге детей этой view');
    strictEqual(this.layout.getView('someView').options._viewBranch, this.layout.options.partials.someView, 'При создании view layout сохранить в ней ветвь роутинга для последующей очистки памяти и перерендеринге детей этой view');
    return strictEqual(this.layout.getView('frontPageMovies').options._viewBranch, this.layout.options.partials.content.partials.frontPageMovies, 'При создании view layout сохранить в ней ветвь роутинга для последующей очистки памяти и перерендеринге детей этой view');
  });

  module("Inn.Layout Render remove and so on", {
    setup: function() {
      $('#header').remove();
      $('#content').remove();
      $('#footer').remove();
      this.dataManager = new Inn.DataManager;
      this.layout_config = {
        partials: {
          'header': {},
          'footer': {},
          'content': {
            templateName: 'bFrontpage',
            templateURL: 'app/templates/bFrontpage.js',
            partials: {
              'tags': {},
              'sortings': {},
              'promoMovie': {},
              'frontPageMovies': {
                partials: {
                  'pagination': {}
                }
              }
            }
          },
          'someView': {}
        },
        dataManager: this.dataManager,
        templateFolder: 'app/templates',
        templateFormat: 'js'
      };
      this.layout = new Inn.Layout(this.layout_config);
      this.layout_config_jade = {
        partials: {
          'header': {},
          'footer': {},
          'content': {
            partials: {
              'tags': {},
              'sortings': {},
              'promoMovie': {},
              'frontPageMovies': {
                partials: {
                  'pagination': {}
                }
              }
            }
          },
          'someView': {}
        },
        dataManager: this.dataManager,
        templateFolder: 'app/templates',
        templateFormat: 'jade'
      };
      return this.layout_jade = new Inn.Layout(this.layout_config_jade);
    },
    teardown: function() {
      delete this.dataManager;
      delete this.layout_config;
      delete this.layout;
      $('#header').remove();
      $('#content').remove();
      return $('#footer').remove();
    }
  });

  test('layout should create views with default options', 4, function() {
    this.layout._processPartials();
    strictEqual(this.layout.getView('header')._getTemplateURL(), 'app/templates/bHeader.js', 'При создании view layout должен передавать кастомный путь к шаблонам в конструктор');
    strictEqual(this.layout.getView('frontPageMovies')._getTemplateURL(), 'app/templates/bFrontPageMovies.js', 'При создании view layout должен передавать кастомный путь к шаблонам в конструктор');
    this.layout_jade._processPartials();
    strictEqual(this.layout_jade.getView('header')._getTemplateURL(), 'app/templates/bHeader.jade', 'При создании view layout должен передавать кастомный путь к шаблонам в конструктор');
    return strictEqual(this.layout_jade.getView('frontPageMovies')._getTemplateURL(), 'app/templates/bFrontPageMovies.jade', 'При создании view layout должен передавать кастомный путь к шаблонам в конструктор');
  });

  asyncTest('layout render should attach views to DOM', 3, function() {
    var deferred;
    deferred = this.layout.render();
    return deferred.done(function() {
      strictEqual($('#header').text(), '===Header===', 'Layout должен отрендерить вьюшки верхнего уровня при вызове его метода render');
      strictEqual($('#content').html(), '===Content===<div id="tags">===Tags===</div><div id="sortings">===Sortings===</div><div id="promoMovie">===PromoMovie===</div><div id="frontPageMovies">===Frontpage movies===<div id="pagination">===Pagination===</div></div>', 'Layout должен отрендерить вьюшки верхнего уровня при вызове его метода render');
      strictEqual($('#footer').text(), '===Footer===', 'Layout должен отрендерить вьюшки верхнего уровня при вызове его метода render');
      return start();
    });
  });

  asyncTest('layout should cleanup nested views references for removed DOM elements', 5, function() {
    var deferred, test;
    test = this;
    deferred = this.layout.render();
    return deferred.done(function() {
      test.layout.getView('content').remove();
      strictEqual(test.layout.getView('tags').el.parentNode, null, 'layout should cleanup nested views references for removed DOM elements');
      strictEqual(test.layout.getView('sortings').el.parentNode, null, 'layout should cleanup nested views references for removed DOM elements');
      strictEqual(test.layout.getView('promoMovie').el.parentNode, null, 'layout should cleanup nested views references for removed DOM elements');
      strictEqual(test.layout.getView('frontPageMovies').el.parentNode, null, 'layout should cleanup nested views references for removed DOM elements');
      strictEqual(test.layout.getView('pagination').el.parentNode, null, 'layout should cleanup nested views references for removed DOM elements');
      return start();
    });
  });

  module("Inn.Layout Destroy", {
    setup: function() {
      $('#layout').empty();
      this.dataManager = new Inn.DataManager;
      this.layout_config = {
        partials: {
          'header': {},
          'footer': {},
          'content': {
            templateName: 'bFrontpage',
            templateURL: 'app/templates/bFrontpage.js',
            partials: {
              'tags': {},
              'sortings': {},
              'promoMovie': {},
              'frontPageMovies': {
                partials: {
                  'pagination': {}
                }
              }
            }
          },
          'someView': {}
        },
        dataManager: this.dataManager,
        templateFolder: 'app/templates',
        templateFormat: 'js'
      };
      return this.layout = new Inn.Layout(this.layout_config);
    },
    teardown: function() {
      delete this.dataManager;
      delete this.layout_config;
      delete this.layout;
      return $('#layout').empty();
    }
  });

  asyncTest('layout should remove all views from self', 6, function() {
    var deferred, test;
    test = this;
    deferred = this.layout.render();
    return deferred.done(function() {
      return test.layout.destroy().done(function() {
        strictEqual(test.layout.getView('tags'), null, 'layout should remove all views from self');
        strictEqual(test.layout.getView('sortings'), null, 'layout should remove all views from self');
        strictEqual(test.layout.getView('promoMovie'), null, 'layout should remove all views from self');
        strictEqual(test.layout.getView('frontPageMovies'), null, 'layout should remove all views from self');
        strictEqual(test.layout.getView('pagination'), null, 'layout should remove all views from self');
        strictEqual(test.layout.getView('someView'), null, 'layout should remove all views from self');
        return start();
      });
    });
  });

  module("Inn.Layout View attributes", {
    setup: function() {
      $('#layout').empty();
      this.dataManager = new Inn.DataManager;
      this.layout_config = {
        partials: {
          'header': {
            attributes: {
              'class': 'bHeader',
              'data-some': 'some_data'
            }
          },
          'footer': {},
          'content': {
            templateName: 'bFrontpage',
            templateURL: 'app/templates/bFrontpage.js',
            partials: {
              'tags': {},
              'sortings': {},
              'promoMovie': {},
              'frontPageMovies': {
                partials: {
                  'pagination': {}
                }
              }
            }
          },
          'someView': {}
        },
        dataManager: this.dataManager,
        templateFolder: 'app/templates',
        templateFormat: 'js'
      };
      return this.layout = new Inn.Layout(this.layout_config);
    },
    teardown: function() {
      delete this.dataManager;
      delete this.layout_config;
      delete this.layout;
      return $('#layout').empty();
    }
  });

  asyncTest('layout should pass view attributes to View constructor', 2, function() {
    var deferred, test;
    test = this;
    deferred = this.layout.render();
    return deferred.done(function() {
      strictEqual(test.layout.getView('header').$el.attr('class'), 'bHeader', 'layout should pass view attributes to View constructor');
      strictEqual(test.layout.getView('header').$el.data('some'), 'some_data', 'layout should pass view attributes to View constructor');
      return start();
    });
  });

  module("Inn.Layout automatic partials processing", {
    setup: function() {
      $('#layout').empty();
      this.dataManager = new Inn.DataManager;
      this.layout_config = {
        partials: {
          'header': {
            attributes: {
              'class': 'bHeader',
              'data-some': 'some_data'
            }
          },
          'footer': {},
          'content': {
            templateName: 'bFrontpage',
            templateURL: 'app/templates/bFrontpage.js',
            partials: {
              'tags': {},
              'sortings': {},
              'promoMovie': {},
              'frontPageMovies': {
                partials: {
                  'pagination': {}
                }
              }
            }
          },
          'someView': {}
        },
        dataManager: this.dataManager,
        viewOptions: {
          templateFolder: 'app/templates',
          templateFormat: 'js'
        }
      };
      this.layout = new Inn.Layout(this.layout_config);
      this.layout_config2 = {
        dataManager: this.dataManager,
        placeholderClassName: 'otherPlaceholder',
        templateFolder: 'app/templates',
        templateFormat: 'js'
      };
      return this.layout2 = new Inn.Layout(this.layout_config2);
    },
    teardown: function() {
      delete this.dataManager;
      delete this.layout_config;
      delete this.layout;
      return $('#layout').empty();
    }
  });

  test('Layout should have placeholderClassName option', 2, function() {
    strictEqual(this.layout.options.placeholderClassName, 'layoutPlaceholder', 'Layout should have default placeholderClassName option');
    return strictEqual(this.layout2.options.placeholderClassName, 'otherPlaceholder', 'Layout should have placeholderClassName option');
  });

  asyncTest('layout should automatically parse for placeholder and subviews', 5, function() {
    var deferred, test;
    test = this;
    deferred = this.layout2.render();
    return deferred.done(function() {
      notStrictEqual(test.layout2.getView('footer'), null, 'layout should automatically create top-level views');
      notStrictEqual(test.layout2.getView('tags'), null, 'layout should automatically create subviews');
      notStrictEqual(test.layout2.getView('pagination'), null, 'layout should automatically create subviews');
      deepEqual(test.layout2.getView('content').options._viewBranch, {
        "partials": {
          "frontPageMovies": {},
          "promoMovie": {},
          "sortings": {},
          "tags": {}
        }
      }, 'layout should automatically create subviews');
      deepEqual(test.layout2.getView('frontPageMovies').options._viewBranch, {
        "partials": {
          "pagination": {}
        }
      }, 'layout should automatically create subviews');
      return start();
    });
  });

}).call(this);
