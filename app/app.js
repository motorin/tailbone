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
        if (view.attributes) {
          if (typeof view.attributes === 'function') {
            view.$el.attr(view.attributes());
          } else {
            view.$el.attr(view.attributes);
          }
        }
        view.$el.html(view._template(view.getDataForView()));
        view.trigger('render', view);
        return view._renderDeferred.resolve();
      });
      return this._renderDeferred;
    },
    _getTemplateURL: function() {
      var devider;
      devider = this.options.templateFolder ? '/' : '';
      if (this.options.templateURL == null) {
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
    getDataForView: function() {
      if (this.model) {
        return this.model.toJSON();
      }
    },
    remove: function() {
      this.undelegateEvents();
      this.$el.empty().remove();
      this.trigger('remove');
      return this.options.isInDOM = false;
    }
  });

}).call(this);

(function() {
  var _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.Layout = Inn.View.extend({
    initialize: function(options) {
      if (!(options && options.dataManager && options.dataManager instanceof Inn.DataManager)) {
        throw new Inn.Error('dataManager should be in options');
      }
      this.options = $.extend(true, {}, Inn.Layout.defaults, options);
      this._dataManager = options.dataManager;
      this._views = [];
      this._viewsUnrendered = 0;
      this.id = this.options.id ? this.options.id : 'layout';
      return _.extend(this, Backbone.Events);
    },
    render: function() {
      var _this = this;
      if (this._renderDeferred && this._renderDeferred.state() === 'pending') {
        return this._renderDeferred;
      }
      this._renderDeferred = new $.Deferred();
      this._getTemplate().done(function() {
        $("#" + _this.id).html(_this._template());
        _this._processPartials();
        _this._parsePartials();
        return _.each(_this.options.partials, function(partial, name) {
          if (_this.getView(name)) {
            return _this.getView(name).render();
          }
        });
      });
      return this._renderDeferred;
    },
    addView: function(view) {
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
    },
    getView: function(name) {
      var _ref1;
      return (_ref1 = _.find(this._views, function(view) {
        return view.id === name;
      })) != null ? _ref1 : null;
    },
    removeView: function(name) {
      var survived;
      if ((survived = _.reject(this._views, function(view) {
        return view.id === name;
      })).length === this._views.length) {
        return null;
      }
      this._views = survived;
      return this.trigger('remove:view');
    },
    _processPartials: function(partials) {
      var layout;
      layout = this;
      if (!partials) {
        partials = this.options.partials;
      }
      _.each(partials, function(partial, name) {
        var view;
        layout.addView(new Inn.View({
          id: name
        }));
        view = layout.getView(name);
        view.options._viewBranch = partial;
        if (partial.templateName) {
          view.options.templateName = partial.templateName;
        }
        if (partial.templateURL) {
          view.options.templateURL = partial.templateURL;
        }
        if (layout.options && layout.options.templateFolder) {
          view.options.templateFolder = layout.options.templateFolder;
        }
        if (layout.options && layout.options.templateFormat) {
          view.options.templateFormat = layout.options.templateFormat;
        }
        view.attributes = partial.attributes;
        if (partial.partials) {
          return layout._processPartials(partial.partials);
        }
      });
      return this;
    },
    _parsePartials: function(partialContent) {
      var layout, partialId, partialsObject;
      layout = this;
      if (!partialContent) {
        partialContent = $('#' + layout.id);
      }
      partialId = partialContent.attr('id');
      partialsObject = {
        partials: {}
      };
      $(partialContent).children('.' + this.options.placeholderClassName).each(function() {
        return partialsObject.partials[$(this).attr('id')] = {};
      });
      if (!this.options.partials) {
        this._processPartials(partialsObject.partials);
        if (this.getView(partialId)) {
          this.getView(partialId).options._viewBranch = partialsObject;
        }
        return _.each(partialsObject.partials, function(partial, name) {
          if (layout.getView(name)) {
            return layout.getView(name).render();
          }
        });
      }
    },
    _recheckSubViews: function(view) {
      var layout;
      this._viewsUnrendered--;
      if (view.el.parentNode === null && $('#' + view.id).length) {
        $('#' + view.id).replaceWith(view.$el);
        view.options.isInDOM = true;
      }
      layout = this;
      if (!view.options._viewBranch.partials) {
        this._parsePartials(view.$el);
      }
      if (view.options._viewBranch.partials) {
        _.each(view.options._viewBranch.partials, function(partial, name) {
          return layout.getView(name).render();
        });
      }
      if (this._viewsUnrendered <= 0) {
        return this._renderDeferred.resolve();
      }
    },
    _clearSubViews: function(view) {
      var layout;
      layout = this;
      if (this._destroyDeferred) {
        this._destroyDeferred.notify();
      }
      if (view.options._viewBranch.partials) {
        return _.each(view.options._viewBranch.partials, function(partial, name) {
          if (layout.getView(name)) {
            return layout.getView(name).remove();
          }
        });
      }
    },
    _onViewRemovedFromDOM: function(view) {},
    destroy: function() {
      var layout;
      $('#' + this.id).empty();
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
        return _.each(layout._views, function(view) {
          return layout.removeView(view.id);
        });
      });
      _.each(layout.options.partials, function(partial, name) {
        if (layout.getView(name)) {
          return layout.getView(name).remove();
        }
      });
      return this._destroyDeferred;
    }
  });

  Inn.Layout.defaults = {
    placeholderClassName: 'layoutPlaceholder',
    templateFolder: '',
    templateFormat: 'js'
  };

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
