package models

import scala.util.Random

import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.iteratee._
import play.api.libs.concurrent._
import collection.mutable.{Map => MMap}

// Bootstrapped ideas... now i'm focusing on client part and go back later

object Player {
  def fromJson (o: JsObject) = Player((o \ "name").as[String])
}
case class Player (name: String)

object Game {
  def createRandom: Game = {
    val random = new Random()
    val half = 5000
    val size = 2*half
    val split = 4
    val objects =
    Range(0, split).map { xi =>
      Range(0, split).map { yi =>
        val s = size.toDouble / split.toDouble
        val x = -half.toDouble+math.round(s*(xi+random.nextDouble));
        val y = -half.toDouble+math.round(s*(yi+random.nextDouble));
        var sizeRandom = random.nextDouble
        val w = 200.*math.ceil((1-sizeRandom)*8.);
        val h = 200.*math.ceil(sizeRandom*8.);
        RectObj(Vec3(x,y,0), w, h)
      }.toList
    }.toList.flatten
    Game( (Vec3(-half, -half, 0), Vec3(half, half, 0)), List(), objects, List() )
  }
}

case class Game (bounds: Tuple2[Vec3, Vec3], chars: List[Char], objects: List[GameObj], dynamics: List[GameDyn]) {

  lazy val json = Json.obj(
    "boundMin"->bounds._1.json,
    "boundMax"->bounds._2.json,
    "objects"->objects.map(_.json)
  )
    // FIXME , add more if need

  val players = MMap[Int, Char]()
  val hubEnum = Enumerator.imperative[JsValue]()
  val hub = Concurrent.hub[JsValue](hubEnum)

  private var counter = 0
  private var connections = 0
  
  // TODO: this is not the model!
  def createChar(): (Iteratee[JsValue, _], Enumerator[JsValue]) = {
    counter += 1
    connections += 1
    val pid = counter

    val out = 
      Enumerator(JsObject(Seq("type" -> JsString("youAre"), "pid" -> JsNumber(pid))).as[JsValue]) >>> 
      Enumerator(players.map { case (id, player) => 
          (player.toJson ++ JsObject(Seq("type" -> JsString("player"), "pid" -> JsNumber(id)))).as[JsValue]
      } toList : _*) >>> 
      hub.getPatchCord()

    // in: handle messages from the player
    val in = Iteratee.foreach[JsValue](_ match {

      case change: JsObject if (change \ "type") == JsString("change") => {
        val patchedJson = 
          players.get(pid)
            .map(_.toJson ++ change)
            .getOrElse(change);

        players += ((pid, Char.fromJson(patchedJson))) // update in the map

        hubEnum push (patchedJson ++ JsObject(Seq("pid" -> JsNumber(pid))))
      }

      case test: JsObject => {
        hubEnum push (test ++ JsObject(Seq("pid" -> JsNumber(pid))))
      }

    }) mapDone { _ => 
      // User has disconnected.
      players -= pid
      connections -= 1
      hubEnum push (JsObject(Seq("type" -> JsString("disconnect"), "pid" -> JsNumber(pid))))
      Logger.debug("(pid:"+pid+") disconnected.")
      Logger.info(connections+" players currently connected.");
    }
    Logger.debug("(pid:"+pid+") connected.")
    Logger.info(connections+" players(s) currently connected.");

    // Return the painter input and output
    (in, out)
  }
}

abstract class GameObj {
  def json: JsObject
}
case class SphereObj(center: Vec3, radius: Double) extends GameObj {
  lazy val json = Json.obj("center"->center.json, "radius"->radius)
}
case class RectObj(position: Vec3, w: Double, h: Double) extends GameObj {
  lazy val json = Json.obj("position"->position.json, "w"->w, "h"->h)
}

abstract class GameDyn
case class Bullet(position: Vec3, velocity: Vec3) extends GameDyn
case class Missile(position: Vec3, velocity: Vec3) extends GameDyn

object Char {
  def fromJson (o: JsObject) = Char(Player("test"), 100.0, 1, Vec3(0,0,0), Vec3(0,0,0))
}
case class Char (player: Player, life: Double, level: Long, position: Vec3, orientation: Vec3) { 
    def toJson = JsObject(Seq(
        "name"->JsString("test") 
  ))
}

case class Vec3 (x: Double, y: Double, z: Double) {
  lazy val json = Json.obj("x"-> x, "y" -> y, "z" -> z)
}
