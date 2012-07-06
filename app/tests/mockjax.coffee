###
Preparing Mockjax
###

$.mockjax
  url: 'app/models/model_id.json'
  contentType: 'json'
  responseTime: 150


$.mockjax
  url: 'bMovie.js'
  contentType: 'script'
  responseTime: 150

$.mockjax
  url: 'app/templates/bFooter.js'
  contentType: 'script'
  responseTime: 150
  response: ->
    body_0 = (chk, ctx)->
      return chk.write "<div>===Footer===</div>"
    dust.register "bFooter", body_0
    return body_0

$.mockjax
  url: 'app/templates/bFrontpage.js'
  contentType: 'script'
  responseTime: 150
  response: ->
    body_0 = (chk, ctx)->
      return chk.write '===Content===<div id="tags"></div><div id="sortings"></div><div id="promoMovie"></div><div id="frontPageMovies"></div>'
    dust.register "bFrontpage", body_0
    return body_0

$.mockjax
  url: 'app/templates/bFrontPageMovies.js'
  contentType: 'script'
  responseTime: 150
  response: ->
    body_0 = (chk, ctx)->
      return chk.write '===Frontpage movies===<div id="pagination"></div>'
    dust.register "bFrontPageMovies", body_0
    return body_0

$.mockjax
  url: 'app/templates/bHeader.js'
  contentType: 'script'
  responseTime: 150
  response: ->
    body_0 = (chk, ctx)->
      return chk.write '===Header==='
    dust.register "bHeader", body_0
    return body_0

$.mockjax
  url: 'app/templates/bPagination.js'
  contentType: 'script'
  responseTime: 150
  response: ->
    body_0 = (chk, ctx)->
      return chk.write '===Pagination==='
    dust.register "bPagination", body_0
    return body_0

$.mockjax
  url: 'app/templates/bPromoMovie.js'
  contentType: 'script'
  responseTime: 150
  response: ->
    body_0 = (chk, ctx)->
      return chk.write '===PromoMovie==='
    dust.register "bPromoMovie", body_0
    return body_0

$.mockjax
  url: 'app/templates/bSomeView.js'
  contentType: 'script'
  responseTime: 150
  response: ->
    body_0 = (chk, ctx)->
      return chk.write "<div>Some content</div>"
    dust.register "bSomeView", body_0
    return body_0

$.mockjax
  url: 'app/templates/bSortings.js'
  contentType: 'script'
  responseTime: 150
  response: ->
    body_0 = (chk, ctx)->
      return chk.write "===Sortings==="
    dust.register "bSortings", body_0
    return body_0

$.mockjax
  url: 'app/templates/bTags.js'
  contentType: 'script'
  responseTime: 150
  response: ->
    body_0 = (chk, ctx)->
      return chk.write "===Tags==="
    dust.register "bTags", body_0
    return body_0

$.mockjax
  url: 'app/templates/bLayout.js'
  contentType: 'script'
  responseTime: 150
  response: ->
    body_0 = (chk, ctx)->
      return chk.write '<div id="header"></div><div id="content"></div><div id="footer"></div>'
    dust.register "bLayout", body_0
    return body_0
