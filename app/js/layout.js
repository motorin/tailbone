(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.Layout = Inn.View.extend({
    initialize: function(options) {
      if (!(options && options.dataManager && options.dataManager instanceof Inn.DataManager)) {
        throw new Inn.Error('dataManager should be in options');
      }
      this.options = $.extend(true, {
        placeholderClassName: 'layoutPlaceholder',
        templateFolder: '',
        templateFormat: 'js'
      }, options);
      this._dataManager = options.dataManager;
      this._views = [];
      this._viewsUnrendered = 0;
      this.id = this.options.id ? this.options.id : 'layout';
      return _.extend(this, Backbone.Events);
    },
    render: function() {
      var layout;
      if (this._renderDeferred && this._renderDeferred.state() === 'pending') {
        return this._renderDeferred;
      }
      this._renderDeferred = new $.Deferred();
      layout = this;
      this._getTemplate().done(function() {
        $('#' + layout.id).html(layout._template());
        layout._processPartials();
        layout._parsePartials();
        return _.each(layout.options.partials, function(partial, name) {
          if (layout.getView(name)) {
            return layout.getView(name).render();
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
      view.on('remove', _.bind(this._onViewRemovedFromDOM, this, view));
      this.trigger('add:view', view);
      return this;
    },
    getView: function(name) {
      var found;
      found = _.find(this._views, function(view) {
        return view.id === name;
      });
      if (found != null) {
        return found;
      }
      return null;
    },
    removeView: function(name) {
      var survived;
      survived = _.reject(this._views, function(view) {
        return view.id === name;
      });
      if (this._views.length === survived.length) {
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

}).call(this);
