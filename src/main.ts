interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}
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

  sub(s: Vector) {
    this.x -= s.x;
    this.y -= s.y;
  }

  scale(m: number) {
    this.x *= m;
    this.y *= m;
  }

  div(m: number) {
    this.x /= m;
    this.y /= m;
  }

  norm() {
    const m = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= m;
    this.y /= m;
  }
}

const gui = new dat.GUI({ name: "My GUI" });
const rocketFolder = gui.addFolder("Rocket");
const explosionFolder = gui.addFolder("Explosion");
const wordFolder = gui.addFolder("Word");
const generalFolder = gui.addFolder("General");

let generalSettings = { bgAlpha: 0.2 };
generalFolder.add(generalSettings, "bgAlpha", 0, 1);

let rocketSettings = { size: 10, spawnRate: 3 };
rocketFolder.add(rocketSettings, "size", 0, 50);
rocketFolder.add(rocketSettings, "spawnRate", 0, 100);

let explosionSettings = { size: 3, fadeSpeed: 3, applyGravity: false };
explosionFolder.add(explosionSettings, "size", 1, 50);
explosionFolder.add(explosionSettings, "fadeSpeed", 1, 25);
explosionFolder.add(explosionSettings, "applyGravity");

let wordSettings = { particleSize: 1, fadeSpeed: 0.3 };
wordFolder.add(wordSettings, "particleSize", 1, 50);
wordFolder.add(wordSettings, "fadeSpeed", 0, 25);

const canvas: any = document.getElementById("mainCanvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
window.addEventListener("resize", init, false);

const textCanvas: any = document.getElementById("letterCanvas");
const textCtx: CanvasRenderingContext2D = textCanvas.getContext("2d");

const btn: any = document.getElementById("shootBtn");
const textInput: HTMLInputElement = document.getElementById(
  "messageInput"
) as HTMLInputElement;
btn.addEventListener("click", (e: Event) =>
  fireworks.push(new Firework(textInput.value))
);

const bgcolor = { r: 0, g: 0, b: 0, a: generalSettings.bgAlpha };
const gravity = new Vector(0, 0.05);
const fireworks: Firework[] = [];

let letterImageData;

function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.background = "black";
  ctx.fillStyle = `rgba(${bgcolor.r},${bgcolor.g},${bgcolor.b},${bgcolor.a})`;
  ctx.fill();

  textCanvas.style.background = "white";
  textCanvas.width = window.innerWidth;
  textCanvas.height = 150;
  // fireworks.push(new Firework("hello"));
}

function generateTextParticles(text: string, offset: Vector, color: Color) {
  textCtx.fillStyle = "black";
  textCtx.font = "24px Verdana";
  textCtx.clearRect(0, 0, window.innerWidth, 150);
  textCtx.fillText(text, 0, 30);
  letterImageData = textCtx.getImageData(0, 0, window.innerWidth, 100);
  const letterParticles = [];
  for (let y = 0, y2 = letterImageData.height; y < y2; y++) {
    for (let x = 0, x2 = letterImageData.width; x < x2; x++) {
      if (
        letterImageData.data[y * 4 * letterImageData.width + x * 4 + 3] > 128
      ) {
        const ptemp = new Particle(
          new Vector(),
          new Vector(),
          new Vector(),
          wordSettings.particleSize,
          color,
          new Vector(
            x * 3 + offset.x - text.length * 18,
            y * 3 + offset.y - 100
          )
        );
        ptemp.pos = new Vector(offset.x, offset.y);
        letterParticles.push(ptemp);
      }
    }
  }
  return letterParticles;
}

function animate() {
  requestAnimationFrame(animate);
  ctx.rect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = `rgba(${bgcolor.r},${bgcolor.g},${bgcolor.b},${generalSettings.bgAlpha})`;
  ctx.fill();
  if (Math.random() <= rocketSettings.spawnRate / 100) {
    fireworks.push(new Firework());
  }
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].draw();
    if (fireworks[i].exploded && fireworks[i].particles.length == 0) {
      fireworks.splice(i, 1);
    }
  }
}
class Particle {
  pos: Vector;
  vel: Vector;
  acc: Vector;
  size: number;
  color: Color;
  homePos: Vector;

  constructor(
    pos: Vector = new Vector(
      window.innerWidth / 2 + ((Math.random() - 0.5) * window.innerWidth) / 6,
      window.innerHeight
    ),
    vel: Vector = new Vector((Math.random() - 0.5) * 3, Math.random() * -2 - 7),
    acc: Vector = new Vector(),
    size: number = rocketSettings.size,
    color = {
      r: Math.random() * 255,
      g: Math.random() * 255,
      b: Math.random() * 255,
      a: 1,
    },
    homePos: Vector = pos
  ) {
    this.pos = pos;
    this.vel = vel;
    this.acc = acc;
    this.size = size;
    this.color = color;
    this.homePos = homePos;

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

  fade(x: number) {
    if (this.color.a > 0) {
      this.color.a -= 0.0001 * x;
    }
  }

  applyForce(force: Vector) {
    this.acc.add(force);
  }

  steerToHome() {
    const dvec = new Vector(
      this.homePos.x - this.pos.x,
      this.homePos.y - this.pos.y
    );
    const distanceFromHome = Math.sqrt(dvec.x * dvec.x + dvec.y * dvec.y);
    if (distanceFromHome > 0) {
      dvec.norm();
      dvec.scale(Math.random()*4);
      this.vel = dvec;
    }
  }
}

class Firework {
  rocket: Particle;
  particles: Particle[];
  exploded: boolean;
  text: string;

  constructor(text?: string) {
    this.particles = [];
    this.exploded = false;
    this.rocket = new Particle();
    this.text = text;
  }

  update() {
    if (!this.exploded) {
      this.rocket.applyForce(gravity);
      this.rocket.update();
      if (this.rocket.vel.y >= 0) {
        this.explode();
      }
    } else {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        let fader = explosionSettings.fadeSpeed;
        if (this.text) {
          fader = (1-this.text.length/50)/2 * wordSettings.fadeSpeed;        
          this.particles[i].steerToHome();
        }
        if (explosionSettings.applyGravity) {
          this.particles[i].applyForce(gravity);
        }
        this.particles[i].update();
        this.particles[i].fade(fader);
        if (this.particles[i].color.a <= 0) {
          this.particles.splice(i, 1);
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
    if (this.text) {
      const letter = generateTextParticles(
        this.text,
        new Vector(this.rocket.pos.x, this.rocket.pos.y),
        this.rocket.color
      );
      this.particles = letter;
    } else {
      for (let i = 0; i < 50; i++) {
        const vx = (Math.random() - 0.5) * 7;
        const vy = (Math.random() - 0.5) * 7;
        this.particles.push(
          new Particle(
            new Vector(this.rocket.pos.x, this.rocket.pos.y),
            new Vector(vx, vy),
            new Vector(),
            explosionSettings.size,
            this.rocket.color
          )
        );
      }
    }
  }
}

init();
animate();
