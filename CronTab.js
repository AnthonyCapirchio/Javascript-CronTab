function CronTab(){

  return {
    suscribe: function(time, action){},
    unsuscribe: function(time, action){},
    on: function(eventName, action){},
    kill: function(){}
  }
}

Cron = new CronTab();

Cron
  .suscribe('19:30:00', function(){
    console.log('Go ! ');
  });

