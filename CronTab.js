function CronTab(){


  var regex       = {
        digit     : /^[0-9]+$/,
        willcard  : /^\*$/,
        array     : /^[0-9,]+$/,
        interval  : /^\*\/[0-9]+$/ 
      },
      logs        = {
        _logs : [],
        push  : function(log){
          _logs.push(log);
          if( listeners['error-log'] && 'function' == typeof listeners['error-log'] ){
            listeners['error-log'](log);
          }
        }
      },
      listeners   = {},
      suscribers  = {},
      cronProcess = function(){
        var date        = new Date(),
            currentTime = date.getHours() + ':' + date.getMinutes() + ':' + (('' + date.getSeconds()).length < 2 ? '0' + date.getSeconds() : date.getSeconds() );

        if(suscribers[currentTime]){
          for(var action in suscribers[currentTime]){
            if('function' == typeof suscribers[currentTime][action]){
              try{
                suscribers[currentTime][action]();
              }
              catch(e){
                logs.push({
                  time    : currentTime,
                  message : e
                });
              }
            }
          }
        }
      },
      clock       = setInterval(cronProcess, 1000);

  function extractTimeValue(rawValue, type){
    var tempArray = [],
        durations = {
          'hours'   : 24,
          'minutes' : 60,
          'secondes': 60
        };

    switch(true){

      case regex.digit.test(rawValue) :
        tempArray.push(rawValue);
        break;

      case regex.willcard.test(rawValue) :
        for(var i = 0; i < durations[type]; i++){
          tempArray.push((i < 10 ? '0' : '') + i);
        }
        break;

      case regex.interval.test(rawValue) :
        var interval = rawValue.replace('*/', '');
        for(var i = 0; i < durations[type]; i++){
          if(0 === i % interval){
            tempArray.push((i < 10 ? '0' : '') + i);
          }
        }
        break;

      case regex.array.test(rawValue) :
        tempArray = JSON.parse(rawValue);
        break;
    }

    return tempArray;
  }


  return {
    suscribe: function(time, action){

      var hours       = extractTimeValue(time[0], 'hours'),
          minutes     = extractTimeValue(time[1], 'minutes'),
          secondes    = extractTimeValue(time[2], 'secondes');

      for(var i = 0; i < hours.length; i++){
        for(var j = 0; j < minutes.length; j++){
          for(var k = 0; k < secondes.length; k++){  
            var agregedTime = [hours[i], minutes[j], secondes[k]].join(':');
            
            suscribers[agregedTime] = suscribers[agregedTime] || [];
            suscribers[agregedTime].push(action);
          }
        }
      }

      return this;
    },
    unsuscribe: function(time, action){
      // @TODO
      return this;
    },
    on: function(eventName, action){
      listeners[eventName] = listeners[eventName] || [];
      listeners[eventName].push(action);

      return this;
    },
    kill: function(){
      removeInterval(clock);
    }
  }
}

Cron = new CronTab();

Cron
  .on('error-log', function(log){
    console.log('new error log: ', log);
  })
  .suscribe(['19', '*', '*/5'], function(){
    console.log('Go ! ');
  })
  .suscribe(['10,12,14,16,18', '*', '*/5'], function(){
    console.log('Go ! ');
  });