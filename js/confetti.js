/**
 * Aegis Confetti Particle Engine
 * Lightweight, zero-dependency celebration effects
 */
(function() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let animationId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const colors = [
    '#6366f1', '#ec4899', '#10b981', '#f59e0b',
    '#06b6d4', '#a855f7', '#3b82f6', '#f43f5e'
  ];

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = Math.random() * 6 + 4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.angle = Math.random() * Math.PI * 2;
      this.velocity = Math.random() * 7 + 3;
      this.vx = Math.cos(this.angle) * this.velocity;
      this.vy = Math.sin(this.angle) * this.velocity - 4;
      this.gravity = 0.22;
      this.friction = 0.985;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 12;
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.01;
      this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.alpha -= this.decay;
    }

    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate((this.rotation * Math.PI) / 180);
      context.globalAlpha = Math.max(0, this.alpha);
      context.fillStyle = this.color;

      if (this.shape === 'rect') {
        context.fillRect(-this.radius, -this.radius / 2, this.radius * 2, this.radius);
      } else {
        context.beginPath();
        context.arc(0, 0, this.radius / 1.5, 0, Math.PI * 2);
        context.fill();
      }

      context.restore();
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);

      if (p.alpha <= 0 || p.y > canvas.height + 20) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animationId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  window.triggerConfetti = function(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
    const count = 90;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(originX, originY));
    }

    if (!animationId) {
      render();
    }
  };
})();
