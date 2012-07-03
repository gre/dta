package controllers

import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.concurrent._

import models._

object Application extends Controller {
  
  val env = Game.createRandom

  def index = Action {
    Ok(views.html.index(env))
  }

  def stream = WebSocket.async[JsValue] { request =>
    Promise.pure( env.createChar() )
  }
  
}
