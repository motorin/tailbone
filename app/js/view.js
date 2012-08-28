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
    renderSelf: function() {
      var _this = this;
      if (this.options.layout) {
        this.options.layout._viewsUnrendered.push(this);
      }
      this._getTemplate().done(function() {
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
      });
      return this;
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
