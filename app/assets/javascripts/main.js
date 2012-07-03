(function(){

  var Vector3 = THREE.Vector3;

  var game = window.GAME;

  $('#audio').change(function(){
    SOUNDS.enabled = $(this).is(":checked");
  }).change();
  $('#effects').change(function(){
    game.effectsEnabled = $(this).is(":checked");
  }).change();

  var NB_TANKS = 4;

  var myChar;
  var chars = new Backbone.Collection();

  var lifeIndicator = new LifeIndicator("life_indicator");
  var radar = new Radar("radar");

  var message = $('#message');
  function death () {
    message.show().text("Game Over");
    setTimeout(function() {
      message.hide();
      startSelfTank();
    }, 1000);
  }

  function startSelfTank () {
    myChar = new Tank();
    myChar.setControls(new TankKeyboardControls(document));

    var maxlife = myChar.life;
    lifeIndicator.setLife(myChar.life/maxlife);
    myChar.on("hurt", function (bullet) {
      lifeIndicator.setLife(myChar.life/maxlife);
    });

    var node = $('#level');
    node.text(myChar.level);
    myChar.on("kill", function (force, tank) {
      node.text(myChar.level);
      //SOUNDS.level(myChar.level);
    });

    myChar.on("update", function () {
      var objs = game.tanks.map(function (t) {
        var d = t.mesh.position.clone();
        var m = myChar.mesh.matrixWorld.clone();
        m.getInverse(m);
        m.multiplyVector3(d);

        d.multiplyScalar(0.0001);
        return {
          position: { x: -d.x, y: d.y },
          radius: t===myChar ? 2 : 1
        }
      });
      radar.setObjects(objs);
    });

    myChar.on("fire", function (bullet) {
      if (bullet.get("type")=="missile") {
        SOUNDS.missile();
      }
      else {
        SOUNDS.bullet();
      }
    });

    myChar.on("collideWall", function () {
      SOUNDS.collideWall();
    });

    myChar.mesh.position.copy(game.findFreePosition(1000));
    game.addTank(myChar);
    game.focusCameraOn(myChar);

    myChar.on("destroy", function () {
      death();
      SOUNDS.explosion();
    });
  }


  function addTank () {
    var tank = new Tank();
    tank.on("bullet", function (bullet) {
      if (bullet.get("type")=="missile")
        SOUNDS.explosion(0.5);
    });
    tank.on("death", function () {
      SOUNDS.explosion();
    });
    tank.on("fire", function (bullet) {
      var d = tank.mesh.position.clone().subSelf(myChar.mesh.position).length();
      var volume = 1-smoothstep(0, 4000, d);
      if (volume <= 0) return;
      if (bullet.get("type")=="missile") {
        SOUNDS.missile(volume);
      }
      else {
        SOUNDS.bullet(volume);
      }
    });
    tank.mesh.position.copy(game.findFreePosition(1000));
    if (Math.random()<0.8)
      tank.setControls(new TankAIControls(tank, game));
    else
      tank.setControls(new TankRandomControls(tank));
    game.addTank(tank);

  }

  startSelfTank();
  setInterval(function () {
    if (game.tanks.size()<NB_TANKS) addTank();
  }, 2000);
  game.animate();

}())
