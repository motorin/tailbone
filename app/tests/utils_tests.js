(function() {

  module("Utils: Inn.isNonEmptyString", {
    setup: function() {
      return this.isNotEmptyString = window.Inn.isNotEmptyString;
    }
  });

  test("try different cases", 8, function() {
    ok(this.isNotEmptyString("test string"), '"test string"');
    ok(this.isNotEmptyString(new String("test string")), 'new String("test string")');
    ok(!this.isNotEmptyString(""), '""');
    ok(!this.isNotEmptyString(new String()), 'new String');
    ok(!this.isNotEmptyString({}), '{}');
    ok(!this.isNotEmptyString(123), '123');
    ok(!this.isNotEmptyString([]), '[]');
    return ok(!this.isNotEmptyString(new Object()), 'new Object');
  });

  module("Utils: Inn.Error", {
    setup: function() {
      return this.InnError = window.Inn.Error;
    }
  });

  test("throw new Inn.Error: exception throwed and it is instanceof Inn.Error", 1, function() {
    var oError;
    oError = new this.InnError("Test error");
    return raises(function() {
      throw oError;
    }, this.InnError);
  });

  test("Common Error is not instanceof Inn.Error", 1, function() {
    try {
      throw new Error("Common Error");
    } catch (err) {
      return ok(!(err instanceof this.InnError));
    }
  });

}).call(this);
