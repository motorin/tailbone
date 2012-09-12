
/*
Preparing Mockjax
*/


(function() {

  $.mockjax({
    url: 'app/models/model_id.json',
    contentType: 'json',
    responseTime: 150
  });

}).call(this);
