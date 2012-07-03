(function(){

  var Radar = function (nodeId) {
    this.canvas = document.getElementById(nodeId);
    this.ctx = this.canvas.getContext("2d");
    this.objects = [];
    var self = this;
    requestAnimationFrame(function loop() {
      requestAnimationFrame(loop, self.canvas);
      self.render();
    }, this.canvas);
  }

  /*
   * objs: array of object
   * an object has :
   *   - position: { x, y } where x and y are scaled in [ -1, 1 ]
   *     (the [0, 0] is the center of the radar)
   */
  Radar.prototype.setObjects = function (objs) {
    this.objects = objs;
  }

  Radar.prototype.render = function () {
    var c = this.ctx;
    var w = c.canvas.width, h = c.canvas.height;
    var r = Math.min(w, h)/2;
    c.save();
    c.clearRect(0, 0, w, h);

    c.beginPath();
    c.arc(w/2, h/2, r, 0, Math.PI*2);
    c.clip();
    c.fillStyle = '#000';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#0F0';
    _.each(this.objects, function (o) {
      if (!o || o.position.x*o.position.x+o.position.y*o.position.y >= 1)
        return;
      c.beginPath();
      c.arc(w*(o.position.x+1)/2, h*(o.position.y+1)/2, o.radius||1, 0, 2*Math.PI);
      c.fill();
    });
    c.restore();
  }

  window.Radar = Radar;

}());
