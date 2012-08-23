
/*
Is Inn namespace defined?
*/


(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

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
        placeholderClassName: 'layoutPlaceholder',
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
      view.on('remove', _.bind(this._onViewRemovedFromDOM, this, view));
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

    Layout.prototype._processPartials = function(partials) {
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
        if (layout.options.templateOptions && layout.options.templateOptions.templateFolder) {
          view.options.templateFolder = layout.options.templateOptions.templateFolder;
        }
        if (layout.options.templateOptions && layout.options.templateOptions.templateFormat) {
          view.options.templateFormat = layout.options.templateOptions.templateFormat;
        }
        view.attributes = partial.attributes;
        if (partial.partials) {
          return layout._processPartials(partial.partials);
        }
      });
      return this;
    };

    Layout.prototype._parsePartials = function(partialContent) {
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
    };

    Layout.prototype._recheckSubViews = function(view) {
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
    };

    Layout.prototype._clearSubViews = function(view) {
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
    };

    Layout.prototype._onViewRemovedFromDOM = function(view) {};

    Layout.prototype.destroy = function() {
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
    };

    return Layout;

  })();

}).call(this);
