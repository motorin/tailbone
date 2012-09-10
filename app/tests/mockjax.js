
/*
Preparing Mockjax
*/


(function() {

  $.mockjax({
    url: 'app/models/model_id.json',
    contentType: 'json',
    responseTime: 150
  });

  $.mockjax({
    url: 'bMovie.js',
    contentType: 'script',
    responseTime: 150
  });

  $.mockjax({
    url: 'app/templates/bFooter.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write("<div>===Footer===</div>");
      };
      dust.register("bFooter", body_0);
      return body_0;
    }
  });

  $.mockjax({
    url: 'app/templates/bFrontpage.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write('===Content===<div id="tags"></div><div id="sortings"></div><div id="promoMovie"></div><div id="frontPageMovies"></div>');
      };
      dust.register("bFrontpage", body_0);
      return body_0;
    }
  });

  $.mockjax({
    url: 'app/templates/bContent.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write('===Content===<div id="tags" class="otherPlaceholder"></div><div id="sortings" class="otherPlaceholder"></div><div id="promoMovie" class="otherPlaceholder"></div><div id="frontPageMovies" class="otherPlaceholder"></div>');
      };
      dust.register("bContent", body_0);
      return body_0;
    }
  });

  $.mockjax({
    url: 'app/templates/bHolyView.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write('===Content===<div id="frontPageMovies" class="bPartial"></div>');
      };
      dust.register("bHolyView", body_0);
      return body_0;
    }
  });

  $.mockjax({
    url: 'app/templates/bFrontPageMovies.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write('===Frontpage movies===<div id="pagination" class="otherPlaceholder"></div>');
      };
      dust.register("bFrontPageMovies", body_0);
      return body_0;
    }
  });

  $.mockjax({
    url: 'app/templates/bHeader.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write('===Header===');
      };
      dust.register("bHeader", body_0);
      return body_0;
    }
  });

  $.mockjax({
    url: 'app/templates/bPagination.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write('===Pagination===');
      };
      dust.register("bPagination", body_0);
      return body_0;
    }
  });

  $.mockjax({
    url: 'app/templates/bPromoMovie.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write('===PromoMovie===');
      };
      dust.register("bPromoMovie", body_0);
      return body_0;
    }
  });

  $.mockjax({
    url: 'app/templates/bSomeView.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write("<div>Some content</div>");
      };
      dust.register("bSomeView", body_0);
      return body_0;
    }
  });

  $.mockjax({
    url: 'app/templates/bSortings.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write("===Sortings===");
      };
      dust.register("bSortings", body_0);
      return body_0;
    }
  });

  $.mockjax({
    url: 'app/templates/bTags.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write("===Tags===");
      };
      dust.register("bTags", body_0);
      return body_0;
    }
  });

  $.mockjax({
    url: 'app/templates/bLayout.js',
    contentType: 'script',
    responseTime: 150,
    response: function() {
      var body_0;
      body_0 = function(chk, ctx) {
        return chk.write('<div id="header" class="otherPlaceholder"></div><div id="content" class="otherPlaceholder"></div><div id="footer" class="otherPlaceholder"></div>');
      };
      dust.register("bLayout", body_0);
      return body_0;
    }
  });

}).call(this);
