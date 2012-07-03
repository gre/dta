(function(){

  // make it on : http://www.egonelbre.com/js/jsfx/


  // functions allow to generate different random sounds
  
  var audioLibParams = {
    bullet: function (i) {
      return ["noise",7.0000,0.1800,0.0000,0.0820,0.0000,0.2220,20.0000,700+200*Math.random(),2400.0000,-0.4280,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.9920,0.0000,0.0000,0.2200,0.0000];
    },
    missile: function (i) {
      return ["noise",0.0000,0.1200,0.0000,0.5460,0.0000,0.8560,64.0000,150+300*Math.random(),1063.0000,0.2800,0.0860,0.0240,5.4329,0.3565,0.4660,-0.6380,0.0580,0.0080,0.0000,0.0000,-0.1140,0.2160,0.9800,-0.9840,1.0000,0.3070,0.9880];
    },
    explosion: function (i) {
      return ["noise",1.0000,0.4,0.02,0.6820,1.7460,1.9700,100.0000,378.0000,2242.0000,-0.5500,-0.3720,0.0240,0.4899,-0.1622,0.2620,0.3400,0.7240,0.0205,-0.1020,0.0416,-0.0980,Math.random()*0.3-0.1,0.8050,0.0940,0.4280,0.0000,-0.2620]
    },
    collideWall: function (i) {
      return ["noise",0.0000,0.4000,0.0000,0.0560,0.0000,0.2960,20.0000,560.0000,2400.0000,-0.4820,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000];
    }
  };

  var RANDOMS = 5;
  var BUFFERS = 20;
  
  var differentSounds = {};

  for (var s in audioLibParams) {
      var buffers = [];
      for (var n=0; n<RANDOMS; ++n) {
        var param = audioLibParams[s](n);
        var sound = jsfxlib.createWave(param);
        buffers.push(sound);
      }
      differentSounds[s]=buffers;
  }

  var sounds = {};

  sounds.enabled = true;

  for (var s in differentSounds) { (function (s) {
      var buffers = [];
      for (var n=0; n<BUFFERS; ++n) {
        var param = audioLibParams[s](n);
        var sound = differentSounds[s][n%RANDOMS];
        var audio = document.createElement("audio");
        audio.src = sound.src;
        buffers.push(audio);
      }
      var i = 0;
      sounds[s] = function (volume) {
        if (!sounds.enabled) return;
        if (volume===undefined) volume=1;
        i = i<buffers.length-1 ? i+1 : 0;
        buffers[i].pause();
        buffers[i].volume=volume;
        buffers[i].play();
      }
    }(s));
  }

  window.SOUNDS = sounds;
}());
