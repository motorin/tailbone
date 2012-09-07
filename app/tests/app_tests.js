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
      this.DefaultView = Inn.View.extend({
        options: {
          partialClassName: 'bPartial',
          templateFolder: 'app/templates',
          templateFormat: 'js'
        }
      });
      this.canonicalView = new this.DefaultView({
        id: 'frontpage'
      });
      this.partialInstanceView = new this.DefaultView({
        id: 'tags'
      });
      this.viewsTree = new this.DefaultView({
        id: 'frontpage'
      }, [this.partialInstanceView]);
      this.nestedViewSecondLevel = new this.DefaultView({
        id: 'frontpage'
      }, [
        {
          id: 'tags'
        }
      ]);
      this.nestedViewThirdLevel = new this.DefaultView({
        id: 'frontpage'
      }, [
        {
          id: 'frontPageMovies',
          partials: [
            {
              id: 'pagination'
            }
          ]
        }
      ]);
      this.nestedViewWithHoles = new this.DefaultView({
        id: 'holyView'
      });
      this.viewWithAttribute = new this.DefaultView({
        id: 'frontpage',
        'attributes': {
          foo: 'bar'
        }
      });
      this.canonicalFolderView = new Inn.View({
        id: 'movie'
      });
      this.folderView = new Inn.View({
        id: 'movie',
        templateFolder: 'templates'
      });
      this.formatView = new Inn.View({
        id: 'movie',
        templateFormat: 'jade'
      });
      this.overridenView = new Inn.View({
        id: 'content',
        templateURL: 'bFrontpage'
      });
      this.overridenFolderView = new Inn.View({
        id: 'content',
        templateURL: 'bFrontpage',
        templateFolder: 'templates'
      });
      this.overridenFormatAndFolderView = new Inn.View({
        id: 'content',
        templateName: 'bFrontpage',
        templateFolder: 'templates',
        templateFormat: 'jade'
      });
      this.realView = new Inn.View({
        id: 'someView',
        templateFolder: 'app/templates'
      });
      return this.templateView = new Inn.View({
        id: 'someView',
        templateName: 'bFrontpage',
        templateFolder: 'app/templates'
      });
    },
    teardown: function() {
      delete this.DefaultView;
      delete this.canonicalView;
      delete this.partialInstanceView;
      delete this.viewsTree;
      delete this.nestedViewSecondLevel;
      delete this.nestedViewThirdLevel;
      delete this.viewWithAttribute;
      delete this.nestedViewWithHoles;
      delete this.canonicalFolderView;
      delete this.folderView;
      delete this.formatView;
      delete this.overridenView;
      delete this.overridenFolderView;
      delete this.overridenFormatAndFolderView;
      delete this.realView;
      return delete this.templateView;
    }
  });

  test('extends Backbone.View', 1, function() {
    return ok(this.canonicalView instanceof Backbone.View, 'Inn.View должна наследоваться от Backbone.View');
  });

  asyncTest('create Inn.View with children instances of Inn.View', 1, function() {
    var _this = this;
    this.viewsTree.render();
    return this.viewsTree.on('ready', function() {
      equal(_this.viewsTree.children.get('tags'), _this.partialInstanceView, 'При передаче View в параметрах, не создавать новый инстанс');
      return start();
    });
  });

  asyncTest('triggers ready event on render()', 1, function() {
    this.canonicalView.render();
    return this.canonicalView.on('ready', function() {
      ok(true, 'View должна триггерить событие ready при своем рендеринге');
      return start();
    });
  });

  asyncTest('triggers ready event on second level nested view.render()', 1, function() {
    this.nestedViewSecondLevel.render();
    return this.nestedViewSecondLevel.on('ready', function() {
      ok(true, 'View второго уровня вложенности должна триггерить событие ready при своем рендеринге');
      return start();
    });
  });

  asyncTest('triggers ready event on third level nested view.render()', 1, function() {
    this.nestedViewThirdLevel.render();
    return this.nestedViewThirdLevel.on('ready', function() {
      ok(true, 'View третьего уровня вложенности должна триггерить событие ready при своем рендеринге');
      return start();
    });
  });

  asyncTest('Repeated view rendering', 1, function() {
    var count,
      _this = this;
    this.nestedViewSecondLevel.render();
    count = 0;
    return this.nestedViewSecondLevel.on('ready', function() {
      if (++count === 3) {
        equal(_this.nestedViewSecondLevel.$el.html(), '===Content===<div id="tags">===Tags===</div><div id="sortings"></div><div id="promoMovie"></div><div id="frontPageMovies"></div>', 'Повторный рендеринг View и его детей');
        return start();
      } else {
        return _this.nestedViewSecondLevel.render();
      }
    });
  });

  asyncTest('Ability to find holes in template', 1, function() {
    var _this = this;
    this.nestedViewWithHoles.render();
    return this.nestedViewWithHoles.on('ready', function() {
      equal(_this.nestedViewWithHoles.$el.html(), '===Content===<div id="frontPageMovies" class="">===Frontpage movies===<div id="pagination" class="otherPlaceholder"></div></div>', 'Вытаскиваем partial из "дырки"');
      return start();
    });
  });

  asyncTest('View may have attribute foo, with "bar" in value', 1, function() {
    var _this = this;
    this.viewWithAttribute.render();
    return this.viewWithAttribute.on('ready', function() {
      equal(_this.viewWithAttribute.$el.attr('foo'), 'bar', 'Установка атрибута foo="bar"');
      return start();
    });
  });

  asyncTest('First level View rendering', 1, function() {
    var _this = this;
    this.canonicalView.render();
    return this.canonicalView.on('ready', function() {
      equal(_this.canonicalView.$el.html(), '===Content===<div id="tags"></div><div id="sortings"></div><div id="promoMovie"></div><div id="frontPageMovies"></div>', 'Рендеринг View первого уровня');
      return start();
    });
  });

  asyncTest('Second level View rendering', 1, function() {
    var _this = this;
    this.nestedViewSecondLevel.render();
    return this.nestedViewSecondLevel.on('ready', function() {
      equal(_this.nestedViewSecondLevel.$el.html(), '===Content===<div id="tags">===Tags===</div><div id="sortings"></div><div id="promoMovie"></div><div id="frontPageMovies"></div>', 'Рендеринг View второго уровня');
      return start();
    });
  });

  asyncTest('isRoot()', 2, function() {
    var _this = this;
    this.nestedViewSecondLevel.render();
    return this.nestedViewSecondLevel.on('ready', function() {
      equal(_this.nestedViewSecondLevel.isRoot(), true, 'Правильно ли определяется isRoot() для корневого View');
      equal(_this.nestedViewSecondLevel.children.get('tags').isRoot(), false, 'Правильно ли определяется isRoot() для дочернего View');
      return start();
    });
  });

  asyncTest('_loadTemplate()', 1, function() {
    var _this = this;
    this.canonicalView.render();
    return this.canonicalView._loadTemplate(function(template) {
      equal(typeof template, 'function', 'Подгрузка шаблона');
      return start();
    });
  });

  test('_getTemplateURL()', 2, function() {
    equal(this.canonicalFolderView._getTemplateURL(), 'bMovie.js', 'Должно вернуть bMovie.js, а вернуло ' + this.canonicalFolderView._getTemplateURL());
    return equal(this.overridenView._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + this.overridenView._getTemplateURL());
  });

  test('_getTemplateURL() with folder name', 2, function() {
    equal(this.folderView._getTemplateURL(), 'templates/bMovie.js', 'Должно вернуть templates/bMovie.js, а вернуло ' + this.folderView._getTemplateURL());
    return equal(this.overridenFolderView._getTemplateURL(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + this.overridenFolderView._getTemplateURL());
  });

  test('_getTemplateURL() with folder name and template format', 2, function() {
    equal(this.formatView._getTemplateURL(), 'bMovie.jade', 'Должно вернуть templates/bMovie.jade, а вернуло ' + this.folderView._getTemplateURL());
    return equal(this.overridenFormatAndFolderView._getTemplateURL(), 'templates/bFrontpage.jade', 'Должно вернуть templates/bFrontpage.jade, а вернуло ' + this.overridenFormatAndFolderView._getTemplateURL());
  });

  test('_getTemplateName()', 2, function() {
    equal(this.overridenFormatAndFolderView._getTemplateName(), 'bFrontpage', 'Должно вернуть bFrontpage, а вернуло ' + this.overridenFormatAndFolderView._getTemplateName());
    return equal(this.canonicalFolderView._getTemplateName(), 'bMovie', 'Должно вернуть bMovie, а вернуло ' + this.canonicalFolderView._getTemplateName());
  });

  test('_getTemplateURL() with _getTemplateName()', 1, function() {
    return equal(this.templateView._getTemplateURL(), 'app/templates/bFrontpage.js', 'Должно вернуть app/templates/bFrontpage.js, а вернуло ' + this.templateView._getTemplateURL());
  });

  asyncTest('triggers destroy event on remove()', 1, function() {
    this.canonicalView.render();
    this.canonicalView.on('ready', function() {
      return this.destroy();
    });
    return this.canonicalView.on('destroy', function() {
      ok(true);
      return start();
    });
  });

  test('children.add() unique views', 1, function() {
    var initialLength;
    this.canonicalView.children.add(this.partialInstanceView);
    initialLength = _.keys(this.canonicalView.children._list).length;
    this.canonicalView.children.add(this.partialInstanceView);
    return equal(initialLength, _.keys(this.canonicalView.children._list).length, 'Shouldn\'t add duplicates');
  });

}).call(this);
