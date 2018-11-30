const canvasX = 350
const canvasY = 500
class People{
  constructor(x, isMe){
    this.x = x
    this.y = canvasY
    this.isMe = isMe||true
  }
  movePeople(x){
    this.x += x
    if(x >= canvasX){
      x = 0
    }
    else if(x < 0){
      x = canvasX-30
    }
  }
  movePeopleLeft(){
    movePeople(-7)
  }
  movePeopleRight(){
    movePeople(7)
  }
  getX(){
    return this.x
  }
  getY(){
    return this.y
  }
}
class Shit{
  constructor(t,seed){
    this.seed = seed||"seed"
    this.x = Math.floor(Math.random() * canvasX)
    this.y = 0
    this.t = t
    this.seed = seed
  }
  moveShit(t){
    // 사라질 똥이면 false를 return한다.
    this.y += t-(this.t)
    if(this.y >= canvasY){
      return false
    }
    return true
  }
  getX(){
    return this.x
  }
  getY(){
    return this.y
  }
}