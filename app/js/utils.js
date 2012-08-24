(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  window.Inn.isNotEmptyString = function(sString) {
    return $.type(sString) === "string" && sString.length;
  };

  window.Inn.Error = (function(_super) {

    __extends(Error, _super);

    function Error(message) {
      this.message = message;
      this.name = "InnError";
      this.stack = (new Error.__super__.constructor).stack;
    }

    return Error;

  })(window.Error);

  window.Inn.catchCustomError = function(e) {
    if (window.console != null) {
      return console.log(e.message, e.stack);
    }
  };

}).call(this);
