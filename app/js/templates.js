(function() {
  dust.register("bFooter", body_0);

  function body_0(chk, ctx) {
    return chk.write("===Footer===");
  }
  return body_0;
})();

(function() {
  dust.register("bFrontpage", body_0);

  function body_0(chk, ctx) {
    return chk.write('===Content===<div id="tags"></div><div id="sortings"></div><div id="promoMovie"></div><div id="frontPageMovies"></div>');
  }
  return body_0;
})();

(function() {
  dust.register("bFrontPageMovies", body_0);

  function body_0(chk, ctx) {
    return chk.write('===Frontpage movies===<div id="pagination" class="otherPlaceholder"></div>');
  }
  return body_0;
})();

(function() {
  dust.register("bHeader", body_0);

  function body_0(chk, ctx) {
    return chk.write("===Header===");
  }
  return body_0;
})();

(function() {
  dust.register("bHolyView", body_0);

  function body_0(chk, ctx) {
    return chk.write('===Content===<div id="frontPageMovies" class="bPartial"></div>');
  }
  return body_0;
})();

(function() {
  dust.register("bPagination", body_0);

  function body_0(chk, ctx) {
    return chk.write("===Pagination===");
  }
  return body_0;
})();

(function() {
  dust.register("bPromoMovie", body_0);

  function body_0(chk, ctx) {
    return chk.write("===PromoMovie===");
  }
  return body_0;
})();

(function() {
  dust.register("bSomeView", body_0);

  function body_0(chk, ctx) {
    return chk.write("<div>Some content</div>");
  }
  return body_0;
})();

(function() {
  dust.register("bSortings", body_0);

  function body_0(chk, ctx) {
    return chk.write("===Sortings===");
  }
  return body_0;
})();

(function() {
  dust.register("bTags", body_0);

  function body_0(chk, ctx) {
    return chk.write("===Tags===");
  }
  return body_0;
})();
