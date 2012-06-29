// Generated by CoffeeScript 1.3.3

/*
Проверяем, если наш "неймспейс" и, если его нет, создаем
*/


(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  /*
  Модель приложения
  */


  Inn.Model = Backbone.Model.extend({
    url: function() {
      return '#';
    }
  });

  /*
  Коллекция приложения
  */


  Inn.Collection = Backbone.Collection.extend({
    url: function() {
      return '#';
    },
    model: Inn.Model
  });

  /*
  Стандартная вьюшка приложения
  */


  Inn.View = Backbone.View.extend({
    initialize: function(options) {
      if (!options.templateFolder) {
        this.options.templateFolder = '';
      }
      if (!options.templateFormat) {
        return this.options.templateFormat = 'js';
      }
    },
    render: function() {
      var view;
      if (this.renderDeferred && this.renderDeferred.state() === 'pending') {
        return this.renderDeferred;
      }
      this.renderDeferred = new $.Deferred();
      view = this;
      if (typeof this._template === 'function') {
        this.$el.html(this._template());
        this.trigger('render', this);
        view.renderDeferred.resolve();
      } else {
        this._getTemplate().done(function() {
          view.$el.html(view._template());
          view.trigger('render', view);
          return view.renderDeferred.resolve();
        });
      }
      return this.renderDeferred;
    },
    _getTemplateURL: function() {
      var devider;
      devider = this.options.templateFolder ? '/' : '';
      if (!(this.options.templateURL != null)) {
        return this.options.templateFolder + devider + 'b' + this.id[0].toUpperCase() + this.id.slice(1) + '.' + this.options.templateFormat;
      }
      return this.options.templateURL;
    },
    _getTemplate: function() {
      var view;
      if (this.templateDeferred && this.templateDeferred.state() === 'pending') {
        return this.templateDeferred;
      }
      this.templateDeferred = new $.Deferred();
      view = this;
      $.getScript(this._getTemplateURL(), function() {
        view._template = function(data) {
          var rendered_html;
          rendered_html = '';
          dust.render('bSomeView', data, function(err, text) {
            return rendered_html = text;
          });
          return rendered_html;
        };
        return view.templateDeferred.resolve();
      });
      return this.templateDeferred;
    }
  });

  /*
  Менеджер шаблонов
  */


  Inn.Layout = (function() {

    function Layout(options) {
      this.options = options;
      if (!(options && options.dataManager && options.dataManager instanceof Inn.DataManager)) {
        throw new Inn.Error('dataManager should be in options');
      }
      this._dataManager = options.dataManager;
      this._views = [];
      _.extend(this, Backbone.Events);
    }

    Layout.prototype.render = function() {
      return new $.Deferred();
    };

    Layout.prototype.addView = function(view) {
      var data;
      if (!(view instanceof Inn.View)) {
        throw new Inn.Error('view shold be an instance of Inn.View');
      }
      if (_.indexOf(this._views, view) === -1) {
        this._views.push(view);
      }
      view.options.layout = this;
      if (!(view.model || view.collection)) {
        data = this._dataManager.getDataAsset(view.id);
        if (data) {
          if (data instanceof Inn.Model) {
            view.model = data;
          }
          if (data instanceof Inn.Collection) {
            view.collection = data;
          }
        } else {
          delete view.model;
          delete view.collection;
        }
      }
      view.on('render', _.bind(this._recheckSubViews, this, view));
      this.trigger('add:view', view);
      return this;
    };

    Layout.prototype.getView = function(name) {
      var found;
      found = _.find(this._views, function(view) {
        return view.id === name;
      });
      if (found != null) {
        return found;
      }
      return null;
    };

    Layout.prototype.removeView = function(name) {
      var survived;
      survived = _.reject(this._views, function(view) {
        return view.id === name;
      });
      if (this._views.length === survived.length) {
        return null;
      }
      this._views = survived;
      return this.trigger('remove:view');
    };

    Layout.prototype.processRoutes = function() {
      var layout;
      layout = this;
      return _.each(this.options.routes, function(route, name) {
        layout.addView(new Inn.View({
          id: name,
          templateURL: route.template ? route.template : void 0
        }));
        return layout._processPartials(route);
      });
    };

    Layout.prototype._processPartials = function(route) {
      var layout;
      if (route.partials) {
        layout = this;
        return _.each(route.partials, function(partial, name) {
          layout.addView(new Inn.View({
            id: name,
            templateURL: partial.template ? partial.template : void 0
          }));
          return layout._processPartials(partial);
        });
      }
    };

    Layout.prototype._recheckSubViews = function(view) {};

    return Layout;

  })();

  /*
  Менеджер данных
  */


  Inn.DataManager = (function() {

    function DataManager() {
      this._dataSets = [];
      _.extend(this, Backbone.Events);
    }

    DataManager.prototype.addDataAsset = function(dataAsset, id) {
      if (!(dataAsset instanceof Inn.Model || dataAsset instanceof Inn.Collection)) {
        throw new Inn.Error('dataAsset shold be an instance of Inn.Model or Inn.Collection');
      }
      if (!(dataAsset.id || id)) {
        throw new Inn.Error('dataAsset id is required');
      }
      if (id) {
        dataAsset.id = id;
      }
      if (_.indexOf(this._dataSets, dataAsset) === -1) {
        this._dataSets.push(dataAsset);
      }
      this.trigger('add:dataAsset', dataAsset);
      return this;
    };

    DataManager.prototype.getDataAsset = function(name) {
      var found;
      found = _.find(this._dataSets, function(dataSet) {
        return dataSet.id === name;
      });
      if (found != null) {
        return found;
      }
      return null;
    };

    DataManager.prototype.removeDataAsset = function(name) {
      var survived;
      survived = _.reject(this._dataSets, function(dataSet) {
        return dataSet.id === name;
      });
      if (this._dataSets.length === survived.length) {
        return null;
      }
      this._dataSets = survived;
      return this.trigger('remove:dataAsset');
    };

    return DataManager;

  })();

}).call(this);
