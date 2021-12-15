class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    add(s) {
        this.x += s.x;
        this.y += s.y;
    }
    scale(m) {
        this.x *= m;
        this.y *= m;
    }
}
const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
window.addEventListener("resize", init, false);
const bgcolor = { r: 0, g: 0, b: 0, a: 0.2 };
const gravity = new Vector(0, 0.05);
const fireworks = [];
let settings;
function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = `rgba(${bgcolor.r},${bgcolor.g},${bgcolor.b},${bgcolor.a})`;
    ctx.fill();
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
        if (fireworks[i].exploded && fireworks[i].particles.length == 0) {
            fireworks.splice(i, 1);
        }
    }
}
class Particle {
    constructor(pos = new Vector(window.innerWidth / 2 + ((Math.random() - 0.5) * window.innerWidth / 6), window.innerHeight), vel = new Vector((Math.random() - 0.5) * 3, Math.random() * -2 - 7), acc = new Vector(), size = 10, color = {
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255,
        a: 1,
    }) {
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
    fade(x) {
        if (this.color.a > 0) {
            this.color.a -= 0.0001 * x;
        }
    }
    applyForce(force) {
        this.acc.add(force);
    }
}
class Firework {
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
        }
        else {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                // this.particles[i].applyForce(gravity);
                this.particles[i].update();
                this.particles[i].fade(3);
                if (this.particles[i].color.a <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }
    }
    draw() {
        if (!this.exploded) {
            this.rocket.draw();
        }
        else {
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].draw();
            }
        }
    }
    explode() {
        this.exploded = true;
        for (let i = 0; i < 50; i++) {
            const vx = (Math.random() - 0.5) * 7;
            const vy = (Math.random() - 0.5) * 7;
            this.particles.push(new Particle(new Vector(this.rocket.pos.x, this.rocket.pos.y), new Vector(vx, vy), new Vector(), 3, this.rocket.color));
        }
    }
}
init();
animate();
//# sourceMappingURL=main.js.map