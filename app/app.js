// Generated by CoffeeScript 1.3.3

/*
Is Inn namespace defined?
*/


(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  /*
  Application Model
  */


  Inn.Model = Backbone.Model.extend({
    url: function() {
      return 'app/models/' + this.id + '.json';
    }
  });

  /*
  Application Collection
  */


  Inn.Collection = Backbone.Collection.extend({
    url: function() {
      return '#';
    },
    model: Inn.Model
  });

  /*
  Application standart View
  */


  Inn.View = Backbone.View.extend({
    initialize: function(options) {
      this.options = $.extend({}, {
        templateFolder: '',
        templateFormat: 'js'
      }, options);
      return this;
    },
    render: function() {
      var view;
      if (this._renderDeferred && this._renderDeferred.state() === 'pending') {
        return this._renderDeferred;
      }
      if (this.options.layout) {
        this.options.layout._viewsUnrendered++;
      }
      this._renderDeferred = new $.Deferred();
      view = this;
      this._getTemplate().done(function() {
        view.$el.html(view._template());
        view.trigger('render', view);
        return view._renderDeferred.resolve();
      });
      return this._renderDeferred;
    },
    _getTemplateURL: function() {
      var devider;
      devider = this.options.templateFolder ? '/' : '';
      if (!(this.options.templateURL != null)) {
        return this.options.templateFolder + devider + this._getTemplateName() + '.' + this.options.templateFormat;
      }
      return this.options.templateURL;
    },
    _getTemplateName: function() {
      if (!this.options.templateName) {
        return 'b' + this.id[0].toUpperCase() + this.id.slice(1);
      }
      return this.options.templateName;
    },
    _getTemplate: function() {
      var view;
      if (this.templateDeferred && this.templateDeferred.state() === 'pending') {
        return this.templateDeferred;
      }
      this.templateDeferred = new $.Deferred();
      if (typeof this._template === 'function') {
        this.templateDeferred.resolve();
        return;
      }
      view = this;
      $.getScript(this._getTemplateURL(), function() {
        view._template = function(data) {
          var rendered_html;
          rendered_html = '';
          dust.render(view._getTemplateName(), data, function(err, text) {
            return rendered_html = text;
          });
          return rendered_html;
        };
        return view.templateDeferred.resolve();
      });
      return this.templateDeferred;
    },
    remove: function() {
      this.undelegateEvents();
      this.$el.empty().remove();
      return this.trigger('remove');
    }
  });

  /*
  Template Manager
  */


  Inn.Layout = (function() {

    function Layout(options) {
      this.options = options;
      if (!(options && options.dataManager && options.dataManager instanceof Inn.DataManager)) {
        throw new Inn.Error('dataManager should be in options');
      }
      this.options = $.extend(true, {
        templateOptions: {
          templateFolder: '',
          templateFormat: 'js'
        }
      }, options);
      this._dataManager = options.dataManager;
      this._views = [];
      this._viewsUnrendered = 0;
      this.id = this.options.id ? this.options.id : 'layout';
      _.extend(this, Backbone.Events);
    }

    Layout.prototype.render = function() {
      var layout;
      if (this._renderDeferred && this._renderDeferred.state() === 'pending') {
        return this._renderDeferred;
      }
      this._renderDeferred = new $.Deferred();
      layout = this;
      this._getTemplate().done(function() {
        _.each(layout.options.routes, function(route, name) {
          if (layout.getView(name)) {
            return layout.getView(name).remove();
          }
        });
        $('#' + layout.id).html(layout._template());
        return _.each(layout.options.routes, function(route, name) {
          if (layout.getView(name)) {
            return layout.getView(name).render();
          }
        });
      });
      return this._renderDeferred;
    };

    Layout.prototype._getTemplateURL = function() {
      var devider;
      devider = this.options.templateOptions.templateFolder ? '/' : '';
      if (!(this.options.templateURL != null)) {
        return this.options.templateOptions.templateFolder + devider + this._getTemplateName() + '.' + this.options.templateOptions.templateFormat;
      }
      return this.options.templateURL;
    };

    Layout.prototype._getTemplateName = function() {
      if (!this.options.templateName) {
        return 'b' + this.id[0].toUpperCase() + this.id.slice(1);
      }
      return this.options.templateName;
    };

    Layout.prototype._getTemplate = function() {
      var layout;
      if (this.templateDeferred && this.templateDeferred.state() === 'pending') {
        return this.templateDeferred;
      }
      this.templateDeferred = new $.Deferred();
      if (typeof this._template === 'function') {
        this.templateDeferred.resolve();
        return;
      }
      layout = this;
      $.getScript(this._getTemplateURL(), function() {
        layout._template = function(data) {
          var rendered_html;
          rendered_html = '';
          dust.render(layout._getTemplateName(), data, function(err, text) {
            return rendered_html = text;
          });
          return rendered_html;
        };
        return layout.templateDeferred.resolve();
      });
      return this.templateDeferred;
    };

    Layout.prototype.addView = function(view) {
      var data, viewInLayout;
      if (!(view instanceof Inn.View)) {
        throw new Inn.Error('view shold be an instance of Inn.View');
      }
      viewInLayout = _.find(this._views, function(existingView) {
        return existingView.id === view.id;
      });
      if (_.indexOf(this._views, view) === -1 && !viewInLayout) {
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
      view.on('remove', _.bind(this._clearSubViews, this, view));
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
      _.each(this.options.routes, function(route, name) {
        var view;
        layout.addView(new Inn.View({
          id: name
        }));
        view = layout.getView(name);
        view.options._routeBranch = route;
        view.options.templateName = route.templateName ? route.templateName : void 0;
        view.options.templateURL = route.templateURL ? route.templateURL : void 0;
        view.options.templateFolder = layout.options.templateOptions && layout.options.templateOptions.templateFolder ? layout.options.templateOptions.templateFolder : void 0;
        view.options.templateFormat = layout.options.templateOptions && layout.options.templateOptions.templateFormat ? layout.options.templateOptions.templateFormat : void 0;
        return layout._processPartials(route);
      });
      return this;
    };

    Layout.prototype._processPartials = function(route) {
      var layout;
      if (route.partials) {
        layout = this;
        return _.each(route.partials, function(partial, name) {
          var view;
          layout.addView(new Inn.View({
            id: name
          }));
          view = layout.getView(name);
          view.options._routeBranch = partial;
          view.options.templateName = partial.templateName ? partial.templateName : void 0;
          view.options.templateURL = partial.templateURL ? partial.templateURL : void 0;
          view.options.templateFolder = layout.options.templateOptions && layout.options.templateOptions.templateFolder ? layout.options.templateOptions.templateFolder : void 0;
          view.options.templateFormat = layout.options.templateOptions && layout.options.templateOptions.templateFormat ? layout.options.templateOptions.templateFormat : void 0;
          return layout._processPartials(partial);
        });
      }
    };

    Layout.prototype._recheckSubViews = function(view) {
      var layout;
      this._viewsUnrendered--;
      if (!view.el.parentNode) {
        $('#' + view.id).replaceWith(view.$el);
      }
      layout = this;
      if (view.options._routeBranch.partials) {
        _.each(view.options._routeBranch.partials, function(partial, name) {
          return layout.getView(name).render();
        });
      }
      if (this._viewsUnrendered <= 0) {
        this._routesRendered = 0;
        return this._renderDeferred.resolve();
      }
    };

    Layout.prototype._clearSubViews = function(view) {
      var layout;
      layout = this;
      if (view.options._routeBranch.partials) {
        return _.each(view.options._routeBranch.partials, function(partial, name) {
          return layout.getView(name).remove();
        });
      }
    };

    return Layout;

  })();

  /*
  Data Manager
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
