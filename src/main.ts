class Vector {
  x: number;
  y: number;
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(s: Vector) {
    this.x += s.x;
    this.y += s.y;
  }

  scale(m: number) {
    this.x *= m;
    this.y *= m;
  }
}

const canvas: any = document.getElementById("mainCanvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bgcolor = { r: 0, g: 0, b:  0, a: 0.2 }
const gravity = new Vector(0, 0.05);
const fireworks: Firework[] = [];

function init() {
  ctx.fillStyle = `rgba(${bgcolor.r},${bgcolor.g},${bgcolor.b},${bgcolor.a})`;
  ctx.fill();
  fireworks.push(new Firework());
}

function animate() {
  requestAnimationFrame(animate);
  // ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.rect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = `rgba(${bgcolor.r},${bgcolor.g},${bgcolor.b},${bgcolor.a})`;
  ctx.fill();
  if (Math.random() <= 0.05) {
    fireworks.push(new Firework());
  }
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].draw();
    if (fireworks[i].exploded && fireworks[i].particles.length==0) {
      fireworks.splice(i,1);
    }
  }
}

class Particle {
  pos: Vector;
  vel: Vector;
  acc: Vector;
  size: number;
  color: { r: number; g: number; b: number; a: number };

  constructor(
    pos: Vector = new Vector(
      Math.random() * window.innerWidth,
      window.innerHeight
    ),
    vel: Vector = new Vector(0, Math.random() * -2 - 7),
    acc: Vector = new Vector(),
    size: number = 10,
    color = { r: Math.random()*255, g:  Math.random()*255, b:  Math.random()*255, a: 1 },
  ) {
    this.pos = pos;
    this.vel = vel;
    this.acc = acc;
    this.size = size;
    this.color = color;

    this.draw();
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.a})`;
    ctx.fill();
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.scale(0);
  }

  fade(x: number){
    if(this.color.a > 0){
      this.color.a -= 0.0001 * x;
    }
  }

  applyForce(force: Vector) {
    this.acc.add(force);
  }
}

class Firework {
  rocket: Particle;
  particles: Particle[];
  exploded: boolean;

  constructor() {
    this.particles = [];
    this.exploded = false;
    this.rocket = new Particle();
  }

  update() {
    if (!this.exploded) {
      this.rocket.applyForce(gravity);
      this.rocket.update();
      if (this.rocket.vel.y >= 0) {
        this.explode();
      }
    } else {
      for (let i = this.particles.length-1; i >=0; i--) {
        this.particles[i].applyForce(gravity);
        this.particles[i].update();
        this.particles[i].fade(5);
        if (this.particles[i].color.a <=0) {
          this.particles.splice(i,1);
        }
      }
    }
  }

  draw() {
    if (!this.exploded) {
      this.rocket.draw();
    } else {
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].draw();
      }
    }
  }

  explode() {
    this.exploded = true;
    for (let i = 0; i < 25; i++) {
      const vx = (Math.random() - 0.5) * 3;
      const vy = (Math.random() - 0.5) * 5;
      this.particles.push(
        new Particle(
          new Vector(this.rocket.pos.x, this.rocket.pos.y),
          new Vector(vx, vy),
          new Vector(),
          5,
          this.rocket.color
        )
      );
    }
  }
}

init();
animate();
