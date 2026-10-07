(function () {
  const P = window.Pulse;
  P.Physics = {
    createBall({
      x,
      y,
      radius = 17,
      speed = 180,
      color = "#50e7f4",
      type = "target",
      phase = 0,
    } = {}) {
      const angle = Math.random() * Math.PI * 2;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        color,
        type,
        phase,
        active: true,
        trail: [],
        trailClock: 0,
      };
    },
    step(ball, dt, width, height, speedFactor = 1) {
      if (!ball.active) return;
      const wallInset = ball.radius + 18;
      if (width <= wallInset * 2) {
        ball.x = width / 2;
        ball.vx = 0;
      } else {
        ball.x += ball.vx * dt * speedFactor;
        if (ball.x < wallInset) {
          ball.x = wallInset;
          ball.vx = Math.abs(ball.vx);
        } else if (ball.x > width - wallInset) {
          ball.x = width - wallInset;
          ball.vx = -Math.abs(ball.vx);
        }
      }
      if (height <= wallInset * 2) {
        ball.y = height / 2;
        ball.vy = 0;
      } else {
        ball.y += ball.vy * dt * speedFactor;
        if (ball.y < wallInset) {
          ball.y = wallInset;
          ball.vy = Math.abs(ball.vy);
        } else if (ball.y > height - wallInset) {
          ball.y = height - wallInset;
          ball.vy = -Math.abs(ball.vy);
        }
      }
      ball.phase += dt * 3;
      ball.trailClock += dt;
      if (ball.trailClock > 0.025) {
        ball.trailClock = 0;
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > (P.Skills.has("trail") ? 22 : 12))
          ball.trail.shift();
      }
    },
    resolveCollisions(balls, width, height) {
      const movementRoom = (ball, directionX, directionY) => {
        const wallInset = ball.radius + 18;
        let room = Infinity;
        if (directionX > 0)
          room = Math.min(room, (width - wallInset - ball.x) / directionX);
        else if (directionX < 0)
          room = Math.min(room, (wallInset - ball.x) / directionX);
        if (directionY > 0)
          room = Math.min(room, (height - wallInset - ball.y) / directionY);
        else if (directionY < 0)
          room = Math.min(room, (wallInset - ball.y) / directionY);
        return Math.max(0, room);
      };

      for (let pass = 0; pass < 10; pass++) {
        for (let firstIndex = 0; firstIndex < balls.length; firstIndex++) {
          const first = balls[firstIndex];
          if (!first.active) continue;
          for (
            let secondIndex = firstIndex + 1;
            secondIndex < balls.length;
            secondIndex++
          ) {
            const second = balls[secondIndex];
            if (!second.active) continue;
            let dx = second.x - first.x;
            let dy = second.y - first.y;
            let distance = Math.hypot(dx, dy);
            const minimumDistance = first.radius + second.radius + 20;
            if (distance >= minimumDistance) continue;
            if (distance === 0) {
              dx = 1;
              dy = 0;
              distance = 1;
            }
            const normalX = dx / distance;
            const normalY = dy / distance;
            const overlap = minimumDistance - distance;
            const firstRoom = movementRoom(first, -normalX, -normalY);
            const secondRoom = movementRoom(second, normalX, normalY);
            let firstMove = Math.min(overlap * 0.5, firstRoom);
            let secondMove = Math.min(overlap - firstMove, secondRoom);
            let unresolved = overlap - firstMove - secondMove;
            if (unresolved > 0) {
              const firstExtra = Math.min(unresolved, firstRoom - firstMove);
              firstMove += firstExtra;
              unresolved -= firstExtra;
            }
            if (unresolved > 0) {
              secondMove += Math.min(unresolved, secondRoom - secondMove);
            }
            first.x -= normalX * firstMove;
            first.y -= normalY * firstMove;
            second.x += normalX * secondMove;
            second.y += normalY * secondMove;

            const relativeNormalVelocity =
              (second.vx - first.vx) * normalX +
              (second.vy - first.vy) * normalY;
            if (relativeNormalVelocity < 0) {
              const impulse = -relativeNormalVelocity;
              first.vx -= impulse * normalX;
              first.vy -= impulse * normalY;
              second.vx += impulse * normalX;
              second.vy += impulse * normalY;
            }
            this.reflect(first, width, height);
            this.reflect(second, width, height);
          }
        }
      }
    },
    contains(ball, x, y, bonus = 0) {
      return (
        ball.active && Math.hypot(ball.x - x, ball.y - y) <= ball.radius + bonus
      );
    },
    reflect(ball, width, height) {
      const wallInset = ball.radius + 18;
      if (width <= wallInset * 2) {
        ball.x = width / 2;
        ball.vx = 0;
      } else {
        if (ball.x < wallInset) {
          if (ball.vx < 0) ball.vx = -ball.vx;
          ball.x = wallInset;
        } else if (ball.x > width - wallInset) {
          if (ball.vx > 0) ball.vx = -ball.vx;
          ball.x = width - wallInset;
        }
      }
      if (height <= wallInset * 2) {
        ball.y = height / 2;
        ball.vy = 0;
      } else {
        if (ball.y < wallInset) {
          if (ball.vy < 0) ball.vy = -ball.vy;
          ball.y = wallInset;
        } else if (ball.y > height - wallInset) {
          if (ball.vy > 0) ball.vy = -ball.vy;
          ball.y = height - wallInset;
        }
      }
    },
  };
})();
