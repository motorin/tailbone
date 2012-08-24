
/*
Is Inn namespace defined?
*/


(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

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
