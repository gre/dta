(function(){


  var GameConnection = Backbone.Model.extend({

  });

  window.GameConnection = GameConnection;
  /*
  var players = [];

  var connected = false;
  function connect () {
    try {
      socket = new WebSocket("ws://"+location.host+"/stream");
      socket.onmessage = function(e){
        var m = JSON.parse(e.data);
        console.log(m);
        var player = players[m.pid];
        if (player === undefined) {
          player = players[m.pid] = m;
        }
        if (m.type=="youAre") pid = m.pid;
        if (m.type=="change") {};
      };
      socket.onopen = function(evt) {
        connected = true;
        send({ type: 'change' });
      }
      socket.onclose = function(evt) { 
        connected = false;
      };
      socket.onerror = function(evt) { console.error("error", evt); };
    }
    catch (e) {
      console.log("WebSocket connection failed.", e);
    }
  }

  function send (o) {
    if (!connected) return;
    socket.send(JSON.stringify(o));
  }

  connect();
  */

}());
