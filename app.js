const canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    cw = window.innerWidth * 2,
    ch = window.innerHeight * 2,
    bubbleCount = 30,
    fireworks = [],
    particles = [],
    bubbles = [],
    textMessages = [],
    celebrateMessages = [
        "생신축하합니다",
        "민영쌤 사랑해요♡",
        "민영쌤이 담임선생님이여서 행복합니다",
        "1년동안 잘 지도 해 주셔서 감사합니다!!",
        "선생님 반이어서 너무 행복해요♡",
        "생신축하드립니다!!",
        "정말로 축하드려요",
        "선생님! 생신축하드려요!!",
        "정말 감사합니다!",
        "선생님, 오늘 하루 행복하세요!"
    ],
    lineSize = 4;

let mousedown = false,
    // this will time the auto launches of fireworks, one launch per 60 loop ticks
    timerTotal = 150,
    timerTick = 0;

canvas.width = cw;
canvas.height = ch;

ctx.lineWidth = lineSize;
ctx.lineCap = "round";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class FireWork {
    constructor(startPoint, targetPoint) {
        // 시작 지점
        this.startPoint = startPoint;

        // 실제 지점
        this.currentPoint = new Point(startPoint.x, startPoint.y);

        // 목표 지점
        this.targetPoint = targetPoint;

        // 남은 거리
        this.distanceToTarget = calculateDistance(startPoint, targetPoint);

        // 간 거리
        this.distanceTraveled = 0;

        // 잔상을 위해 이전 위치를 저장. 큐
        this.coordinates = [];
        this.coordinateCount = 4;

        // 위치 저장
        while (this.coordinateCount--) {
            this.coordinates.push(new Point(this.currentPoint.x, this.currentPoint.y));
        }

        // 속도
        this.speed = 0.01;
        // 속도 바꾸기
        this.friction = 1.025;
        // 밝기
        this.brightness = random(50, 70);

        this.hue = random(0, 360);
    }

    // 상태 갱신
    update(index) {
        // coordinates의 마지막 요소를 삭제하고 처음에 현재 위치를 추가
        this.coordinates.pop();
        this.coordinates.unshift(new Point(this.currentPoint.x, this.currentPoint.y));

        // 속도 변화
        this.speed *= this.friction;

        // 간 거리를 갱신
        this.distanceTraveled = calculateDistance(this.startPoint, this.currentPoint);

        // 만약 다 왔다면
        if (this.distanceTraveled <= this.distanceToTarget) {
            createParticles(this.targetPoint, this.hue);
            textMessages.push(new TextMessage(this.targetPoint, this.hue));
            // remove the firework, use the index passed into the update function to determine which to remove
            fireworks.splice(index, 1);
        } else {
            // 계속 이동
            this.currentPoint.y -= this.speed;
        }
    }

    draw() {
        ctx.beginPath();

        // 마지막 위치로 이동 후 현재 위치로 선을 그림
        const lastPoint = this.coordinates[this.coordinates.length - 1];
        ctx.lineWidth = lineSize + 3;
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(this.currentPoint.x, this.currentPoint.y);
        ctx.strokeStyle = "hsl(" + this.hue + ", 100%, " + this.brightness + "%)";
        ctx.stroke();
        ctx.lineWidth = lineSize;
    }
}

class Particle {
    constructor(point, hue) {
        this.point = point;

        // 잔상을 위해 이전 위치를 저장. 큐
        this.coordinates = [];
        this.coordinateCount = 20;

        while (this.coordinateCount--) {
            this.coordinates.push(new Point(point.x, point.y));
        }

        // set a random angle in all possible directions, in radians
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 30);

        // 속도 바꾸기
        this.friction = 0.95;

        // 중력 적용
        this.gravity = 1.25;

        // set the hue to a random number +-50 of the overall hue variable
        this.hue = random(hue - 20, hue + 20);
        this.brightness = random(50, 80);
        this.alpha = 1;
        // set how fast the particle fades out
        this.decay = random(0.005, 0.01);
    }

    update(index) {
        // coordinates의 마지막 요소를 삭제하고 처음에 현재 위치를 추가
        this.coordinates.pop();
        this.coordinates.unshift(new Point(this.point.x, this.point.y));

        // 속도 변화
        this.speed *= this.friction;

        // 속도 적용
        this.point.x += Math.cos(this.angle) * this.speed;
        this.point.y += Math.sin(this.angle) * this.speed + this.gravity;

        // fade out
        this.alpha -= this.decay;

        // 알파가 충분히 낮으면 삭제
        if (this.alpha <= 0.00000000000001) {
            particles.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();

        // 마지막 위치로 이동 후 현재 위치로 선을 그림
        const lastPoint = this.coordinates[this.coordinates.length - 1];
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(this.point.x, this.point.y);
        ctx.strokeStyle =
            "hsla(" + this.hue + ", 100%, " + this.brightness + "%, " + this.alpha + ")";
        ctx.stroke();
    }
}

let message = 0;
class TextMessage {
    constructor(point, hue) {
        // 밝기
        this.brightness = 70;
        this.point = point;
        this.hue = hue;
        this.sizeup = true;
        this.size = 30;
        this.adf = 0;
        this.speed = 0.1;
        this.index = message++;
        if (message == celebrateMessages.length) {
            message = 0;
        }
    }

    update(index) {
        if (this.brightness <= 90 && this.sizeup) {
            this.brightness++;
            this.size += 1;
            this.adf += 0.05;
        } else if (!this.sizeup) {
            this.brightness -= 0.4;
            this.point.y += this.speed;
            this.speed += 0.01;
        } else {
            this.sizeup = false;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.textAlign = "center";
        ctx.strokeStyle = "hsl(" + this.hue + ", 100%, " + this.brightness + "%)";
        ctx.font = "100 " + this.size + "px system-ui";
        ctx.setLineDash([1, 3]);
        ctx.lineWidth = this.adf;
        ctx.strokeText(celebrateMessages[this.index], this.point.x, this.point.y);
        ctx.setLineDash([0, 0]);
        ctx.lineWidth = lineSize;
    }
}

// 파티클 만들기
function createParticles(point, hue) {
    let particleCount = 150;
    while (particleCount--) {
        particles.push(new Particle(new Point(point.x, point.y), hue));
    }
}

// min부터 max까지의 랜덤한 값을 반환
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Point 2개를 받아 그 사이의 거리를 반환
function calculateDistance(startPoint, endPoint) {
    return endPoint.y - startPoint.y;
}

function loop() {
    // this function will run endlessly with requestAnimationFrame
    requestAnimationFrame(loop);

    // normally, clearRect() would be used to clear the canvas
    // we want to create a trailing effect though
    // setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
    ctx.globalCompositeOperation = "destination-out";
    // decrease the alpha property to create more prominent trails
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, cw, ch);
    // change the composite operation back to our main mode
    // lighter creates bright highlight points as the fireworks and particles overlap each other
    ctx.globalCompositeOperation = "screen";

    for (const i in bubbles) {
        bubbles[i].draw();
        bubbles[i].update();
    }

    ctx.globalCompositeOperation = "lighter";

    for (const i in fireworks) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }

    for (const i in particles) {
        particles[i].draw();
        particles[i].update(i);
    }

    for (const i in textMessages) {
        textMessages[i].draw();
        textMessages[i].update(i);
    }

    if (timerTick >= timerTotal) {
        const x = random(150, cw - 150);
        fireworks.push(new FireWork(new Point(x, ch), new Point(x, random(60, ch / 2))));
        timerTick = 0;
    } else {
        timerTick++;
    }
}

class Bubble {
    constructor(point) {
        this.point = point;
        this.radius = random(50, 150);
        this.alpha = 0.01;
        this.change = 0.0025;
        this.angle = random(0, Math.PI * 2);
        this.speed = random(0.1, 0.5);
    }

    update() {
        if (this.alpha >= 0.5 || this.alpha <= 0) {
            this.change *= -1;
        }
        this.alpha += this.change;
        this.point.x += Math.cos(this.angle) * this.speed;
        this.point.y += Math.sin(this.angle) * this.speed;
        this.angle += random(-0.05, 0.05);
        if (
            this.point.x <= -this.radius ||
            this.point.x >= cw + this.radius ||
            this.point.y >= ch + this.radius ||
            this.point.y <= -this.radius
        ) {
            this.point.x = random(0, cw);
            this.point.y = random(ch - 250, ch);
            this.alpha = 0.01;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.filter = "blur(15px)";
        ctx.fillStyle = `rgba(100, 80, 50, ${this.alpha})`;
        ctx.arc(this.point.x, this.point.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.filter = "none";
    }
}

function handleMouseClick(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    fireworks.push(
        new FireWork(new Point(mouseX * 2, ch), new Point(mouseX * 2, mouseY * 2))
    );
}

function handleWindowResize() {
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
}

while (bubbles.length <= bubbleCount) {
    bubbles.push(new Bubble(new Point(random(0, cw), random(ch - 250, ch))));
}

window.onload = loop;
window.addEventListener("click", handleMouseClick);
window.addEventListener("resize", handleWindowResize);
