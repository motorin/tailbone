(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.View = Backbone.View.extend({
    initialize: function(options) {
      _.extend(this, Inn.TemplateMixin);
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
