/*
   app-dust-backbone - v0.0.0
*/

(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.Model = Backbone.Model.extend({
    url: function() {
      return "app/models/" + this.id + ".json";
    }
  });

}).call(this);

(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.Collection = Backbone.Collection.extend({
    url: function() {
      return '#';
    },
    model: Inn.Model
  });

}).call(this);

(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.TemplateMixin = {
    _getTemplateURL: function() {
      var divider;
      divider = this.options.templateFolder ? '/' : '';
      if (this.options.templateURL == null) {
        return this.options.templateFolder + divider + this._getTemplateName() + '.' + this.options.templateFormat;
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
      var view, _ref1;
      if (((_ref1 = this.templateDeferred) != null ? _ref1.state() : void 0) === 'pending') {
        return this.templateDeferred;
      }
      this.templateDeferred = new $.Deferred();
      if (typeof this._template === 'function') {
        this.templateDeferred.resolve();
        return this.templateDeferred;
      }
      view = this;
      $.getScript(this._getTemplateURL(), function() {
        view._template = function(data) {
          var rendered_html;
          rendered_html = '';
          dust.render(this._getTemplateName(), data, function(err, text) {
            return rendered_html = text;
          });
          return rendered_html;
        };
        return view.templateDeferred.resolve();
      });
      return this.templateDeferred;
    },
    render: function() {
      var _this = this;
      if (this._renderDeferred && this._renderDeferred.state() === 'pending') {
        return this._renderDeferred;
      }
      if (this.options.layout) {
        this.options.layout._viewsUnrendered++;
      }
      this._renderDeferred = new $.Deferred();
      this._getTemplate().done(function() {
        var name, partial, _ref1, _results;
        if (_this.$el != null) {
          if (_this.attributes) {
            if (typeof _this.attributes === 'function') {
              _this.$el.attr(_this.attributes());
            } else {
              _this.$el.attr(_this.attributes);
            }
          }
          _this.$el.html(_this._template(_this.getDataForView()));
          _this.trigger('render', _this);
          return _this._renderDeferred.resolve();
        } else {
          $("#" + _this.id).html(_this._template());
          _this._processPartials();
          _this._parsePartials();
          _ref1 = _this.options.partials;
          _results = [];
          for (name in _ref1) {
            partial = _ref1[name];
            if (_this.getView(name)) {
              _results.push(_this.getView(name).render());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      });
      return this._renderDeferred;
    }
  };

}).call(this);

(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.View = Backbone.View.extend({
    initialize: function(options) {
      this.options = $.extend({}, {
        templateFolder: '',
        templateFormat: 'js'
      }, options);
      return this;
    },
    getDataForView: function() {
      if (this.model) {
        return this.model.toJSON();
      }
    },
    remove: function() {
      this.undelegateEvents();
      this.$el.empty().remove();
      this.trigger('remove');
      this.options.isInDOM = false;
      return this;
    }
  });

  _.extend(Inn.View.prototype, Inn.TemplateMixin);

}).call(this);

(function() {
  var _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.Layout = (function() {

    function Layout(options) {
      if (!(options && options.dataManager && options.dataManager instanceof Inn.DataManager)) {
        throw new Inn.Error('dataManager should be in options');
      }
      this.options = $.extend(true, {}, Inn.Layout.defaults, options);
      this._dataManager = options.dataManager;
      this._views = [];
      this._viewsUnrendered = 0;
      this.id = this.options.id ? this.options.id : 'layout';
      _.extend(this, Backbone.Events);
    }

    Layout.prototype.addView = function(view) {
      var data, viewInLayout;
      if (!(view instanceof Inn.View)) {
        throw new Inn.Error('view shold be an instance of Inn.View');
      }
      viewInLayout = _.find(this._views, function(existingView) {
        return existingView.id === view.id;
      });
      if (!(__indexOf.call(this._views, view) >= 0 || viewInLayout)) {
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
      view.on('remove', _.bind(this._onViewRemovedFromDOM, this, view));
      this.trigger('add:view', view);
      return this;
    };

    Layout.prototype.getView = function(name) {
      var _ref1;
      return (_ref1 = _.find(this._views, function(view) {
        return view.id === name;
      })) != null ? _ref1 : null;
    };

    Layout.prototype.removeView = function(name) {
      var survived;
      if ((survived = _.reject(this._views, function(view) {
        return view.id === name;
      })).length === this._views.length) {
        return null;
      }
      this._views = survived;
      return this.trigger('remove:view');
    };

    Layout.prototype._processPartials = function(partials) {
      var name, partial, view, viewOverriddenOptions, _ref1, _ref2;
      if (!partials) {
        partials = this.options.partials;
      }
      for (name in partials) {
        partial = partials[name];
        viewOverriddenOptions = _.extend({
          id: name,
          templateFolder: (_ref1 = this.options.templateFolder) != null ? _ref1 : void 0,
          templateFormat: (_ref2 = this.options.templateFormat) != null ? _ref2 : void 0
        }, this.options.viewOptions);
        this.addView(new Inn.View(viewOverriddenOptions));
        view = this.getView(name);
        view.options._viewBranch = partial;
        if (partial.templateName) {
          view.options.templateName = partial.templateName;
        }
        if (partial.templateURL) {
          view.options.templateURL = partial.templateURL;
        }
        view.attributes = partial.attributes;
        if (partial.partials) {
          this._processPartials(partial.partials);
        }
      }
      return this;
    };

    Layout.prototype._parsePartials = function(partialContent) {
      var element, idx, layout, name, partial, partialId, partialsObject, _i, _len, _ref1, _ref2, _results;
      layout = this;
      if (!partialContent) {
        partialContent = $("#" + this.id);
      }
      partialId = partialContent.attr('id');
      partialsObject = {
        partials: {}
      };
      _ref1 = $(partialContent).children("." + this.options.placeholderClassName);
      for (idx = _i = 0, _len = _ref1.length; _i < _len; idx = ++_i) {
        element = _ref1[idx];
        partialsObject.partials[$(element).attr('id')] = {};
      }
      if (this.options.partials == null) {
        this._processPartials(partialsObject.partials);
        if (this.getView(partialId)) {
          this.getView(partialId).options._viewBranch = partialsObject;
        }
        _ref2 = partialsObject.partials;
        _results = [];
        for (name in _ref2) {
          partial = _ref2[name];
          if (this.getView(name)) {
            _results.push(this.getView(name).render());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    Layout.prototype._recheckSubViews = function(view) {
      var name, partial, _ref1;
      this._viewsUnrendered--;
      if (view.el.parentNode === null && $("#" + view.id).length) {
        $("#" + view.id).replaceWith(view.$el);
        view.options.isInDOM = true;
      }
      if (!view.options._viewBranch.partials) {
        this._parsePartials(view.$el);
      }
      if (view.options._viewBranch.partials) {
        _ref1 = view.options._viewBranch.partials;
        for (name in _ref1) {
          partial = _ref1[name];
          this.getView(name).render();
        }
      }
      if (this._viewsUnrendered <= 0) {
        this._renderDeferred.resolve();
      }
      return this;
    };

    Layout.prototype._clearSubViews = function(view) {
      var name, partial, _ref1, _results;
      if (this._destroyDeferred) {
        this._destroyDeferred.notify();
      }
      if (view.options._viewBranch.partials) {
        _ref1 = view.options._viewBranch.partials;
        _results = [];
        for (name in _ref1) {
          partial = _ref1[name];
          if (this.getView(name)) {
            _results.push(this.getView(name).remove());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    Layout.prototype._onViewRemovedFromDOM = function(view) {};

    Layout.prototype.destroy = function() {
      var layout, name, partial, _ref1,
        _this = this;
      $("#" + this.id).empty();
      layout = this;
      this._destroyDeferred = new $.Deferred();
      this._destroyDeferred.progress(function() {
        var viewsInDOM;
        viewsInDOM = _.filter(layout._views, function(view) {
          return view.options.isInDOM;
        });
        if (viewsInDOM.length === 0) {
          return this.resolve();
        }
      });
      this._destroyDeferred.done(function() {
        var view, _i, _len, _ref1, _results;
        _ref1 = layout._views;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          view = _ref1[_i];
          _results.push(_this.removeView(view.id));
        }
        return _results;
      });
      _ref1 = this.options.partials;
      for (name in _ref1) {
        partial = _ref1[name];
        if (this.getView(name)) {
          this.getView(name).remove();
        }
      }
      return this._destroyDeferred;
    };

    Layout.defaults = {
      placeholderClassName: 'layoutPlaceholder',
      templateFolder: '',
      templateFormat: 'js',
      viewOptions: {}
    };

    _.extend(Layout.prototype, Inn.TemplateMixin);

    return Layout;

  })();

}).call(this);

(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

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

    DataManager.prototype.destroy = function() {
      var dataManager;
      dataManager = this;
      return _.each(this._dataSets, function(dataAsset) {
        return dataManager.removeDataAsset(dataAsset.id);
      });
    };

    return DataManager;

  })();

}).call(this);
