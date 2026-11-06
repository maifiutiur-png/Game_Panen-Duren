// ==========================================
// GAME PANEN BUAH DURIAN
// ==========================================

// KONFIGURASI PERMAINAN

const GAME_DURATION = 300;
const WIN_SCORE = 30;
const LOSE_SCORE = -30;
const MAX_DISTANCE = 3000;
const ENEMY_INTERVAL = 500;
const MARKET_DURATION = 20;

let score = 0;
let health = 0;
let timeLeft = GAME_DURATION;

let distance = 0;
let cartCount = 0;

let gameRunning = false;
let gamePaused = false;
let gameFinished = false;
let reachedMarket = false;

let marketTime = 0;
let marketFlyHits = 0;
let fliesTouching = 0;

let playerPosition = 40;
let playerSpeed = 1.5;

let fruits = [];
let enemies = [];
let flies = [];

let lastTime = 0;
let gameFrame = null;

let lastFruitSpawn = 0;
let lastEnemyDistance = 0;
let lastFlySpawn = 0;

let fruitId = 0;
let enemyId = 0;
let flyId = 0;

let keys = {
    left: false,
    right: false
};

const world = document.getElementById("game-world");

const player = document.getElementById("player");
const fruitContainer = document.getElementById("fruit-container");
const enemyContainer = document.getElementById("enemy-container");
const flyContainer = document.getElementById("fly-container");
const treesContainer = document.getElementById("trees-container");

const scoreElement = document.getElementById("score");
const healthElement = document.getElementById("health");
const timerElement = document.getElementById("timer");
const cartElement = document.getElementById("cart-count");
const flyCountElement = document.getElementById("fly-count");

const notification = document.getElementById("notification");

const distanceProgress = document.getElementById("distance-progress");
const distanceElement = document.getElementById("distance");

const market = document.getElementById("market");
const marketPanel = document.getElementById("market-panel");

const marketProgress = document.getElementById("market-progress-bar");
const marketTimerElement = document.getElementById("market-timer");

const marketMessage = document.getElementById("market-message");

const startScreen = document.getElementById("start-screen");
const resultScreen = document.getElementById("result-screen");


// ==========================================
// MEMBUAT POHON
// ==========================================

function createTrees() {

    treesContainer.innerHTML = "";

    for (let i = 0; i < 16; i++) {

        const tree = document.createElement("div");

        tree.className = "tree";
        tree.innerHTML = "🌳";

        tree.style.left = (i * 150 - 50) + "px";

        tree.dataset.position = i;

        treesContainer.appendChild(tree);
    }
}

createTrees();


// ==========================================
// TAMPILAN STATUS
// ==========================================

function updateStatus() {

    scoreElement.textContent = score;
    healthElement.textContent = health;
    cartElement.textContent = cartCount;

    flyCountElement.textContent =
        marketFlyHits + "/5";

    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);

    timerElement.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

    distanceProgress.style.width =
        Math.min(distance / MAX_DISTANCE * 100, 100) + "%";

    distanceElement.textContent =
        Math.floor(distance) + " / " + MAX_DISTANCE + " cm";

    updateCart();
}


// ==========================================
// NOTIFIKASI
// ==========================================

let notificationTimeout;

function showNotification(message) {

    notification.textContent = message;
    notification.style.display = "block";

    clearTimeout(notificationTimeout);

    notificationTimeout = setTimeout(() => {

        notification.style.display = "none";

    }, 1800);
}


// ==========================================
// MEMULAI GAME
// ==========================================

document.getElementById("start-button")
    .addEventListener("click", startGame);

function startGame() {

    startScreen.classList.add("hidden");

    score = 0;
    health = 0;
    timeLeft = GAME_DURATION;

    distance = 0;
    cartCount = 0;

    marketTime = 0;
    marketFlyHits = 0;

    playerPosition = 40;

    reachedMarket = false;
    gameRunning = true;
    gamePaused = false;
    gameFinished = false;

    fruits = [];
    enemies = [];
    flies = [];

    fruitContainer.innerHTML = "";
    enemyContainer.innerHTML = "";
    flyContainer.innerHTML = "";

    lastFruitSpawn = 0;
    lastEnemyDistance = 0;
    lastFlySpawn = 0;

    player.style.left = playerPosition + "%";

    market.classList.add("hidden");
    marketPanel.classList.add("hidden");

    marketProgress.style.width = "0%";

    updateStatus();

    lastTime = performance.now();

    gameFrame = requestAnimationFrame(gameLoop);

    showNotification("Petualangan dimulai! Ayo panen durian!");
}


// ==========================================
// LOOP UTAMA
// ==========================================

function gameLoop(timestamp) {

    if (!gameRunning || gamePaused) return;

    const delta = Math.min((timestamp - lastTime) / 1000, 0.05);

    lastTime = timestamp;

    updateTimer(delta);

    if (gameFinished) return;

    if (!reachedMarket) {

        updateDistance(delta);

        updatePlayer(delta);

        updateFruitSpawning(timestamp);

        updateFruits(delta);

        updateEnemies(delta);

        updateTrees();

        checkEnemySpawn();

        if (distance >= MAX_DISTANCE) {

            arriveAtMarket();

        }

    } else {

        updateMarket(delta);

        updateFlies(delta);

    }

    updateStatus();

    gameFrame = requestAnimationFrame(gameLoop);
}


// ==========================================
// WAKTU PERMAINAN
// ==========================================

function updateTimer(delta) {

    timeLeft -= delta;

    if (timeLeft <= 0) {

        timeLeft = 0;

        updateStatus();

        endGame(false, "Waktu permainan habis!");

    }
}


// ==========================================
// PERJALANAN
// ==========================================

function updateDistance(delta) {

    distance += 100 * delta;

    if (distance > MAX_DISTANCE) {
        distance = MAX_DISTANCE;
    }
}


// ==========================================
// GERAKAN PEMAIN
// ==========================================

function updatePlayer(delta) {

    if (keys.left) {
        playerPosition -= playerSpeed * delta * 30;
    }

    if (keys.right) {
        playerPosition += playerSpeed * delta * 30;
    }

    playerPosition = Math.max(3, Math.min(78, playerPosition));

    player.style.left = playerPosition + "%";
}


// ==========================================
// KONTROL KEYBOARD
// ==========================================

document.addEventListener("keydown", function(event) {

    if (!gameRunning || gamePaused) return;

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {

        keys.left = true;
        event.preventDefault();

    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {

        keys.right = true;
        event.preventDefault();

    }
});

document.addEventListener("keyup", function(event) {

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keys.left = false;
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keys.right = false;
    }

});


// ==========================================
// KONTROL TOMBOL
// ==========================================

function setupHoldButton(buttonId, direction) {

    const button = document.getElementById(buttonId);

    button.addEventListener("pointerdown", function(event) {

        event.preventDefault();

        if (direction === "left") {
            keys.left = true;
        }

        if (direction === "right") {
            keys.right = true;
        }

    });

    button.addEventListener("pointerup", function() {

        keys[direction] = false;

    });

    button.addEventListener("pointerleave", function() {

        keys[direction] = false;

    });

    button.addEventListener("pointercancel", function() {

        keys[direction] = false;

    });
}

setupHoldButton("left-button", "left");
setupHoldButton("right-button", "right");


// ==========================================
// MENGHASILKAN DURIAN
// ==========================================

function updateFruitSpawning(timestamp) {

    if (timestamp - lastFruitSpawn > 1100) {

        spawnFruit();

        lastFruitSpawn = timestamp;

    }
}


function spawnFruit() {

    if (reachedMarket) return;

    const fruit = document.createElement("div");

    fruit.className = "durian";

    fruit.innerHTML = "🌰";

    const x = 5 + Math.random() * 85;

    fruit.style.left = x + "%";
    fruit.style.top = "-45px";

    fruitContainer.appendChild(fruit);

    const fruitObject = {

        id: ++fruitId,

        element: fruit,

        x: x,

        y: -45,

        speed: 100 + Math.random() * 80,

        wind: (Math.random() - 0.5) * 45,

        phase: Math.random() * Math.PI * 2,

        wobble: 15 + Math.random() * 25,

        active: true

    };

    fruits.push(fruitObject);

}


// ==========================================
// GERAKAN DURIAN
// ==========================================

function updateFruits(delta) {

    const worldHeight = world.clientHeight;

    fruits.forEach(fruit => {

        if (!fruit.active) return;

        fruit.y += fruit.speed * delta;

        fruit.phase += delta * 3;

        fruit.x += Math.sin(fruit.phase) *
            fruit.wobble * delta / 10;

        fruit.x += fruit.wind * delta / 100;

        fruit.x = Math.max(1, Math.min(96, fruit.x));

        fruit.element.style.left = fruit.x + "%";

        fruit.element.style.top = fruit.y + "px";

        // Posisi gerobak

        const playerX = playerPosition + 5;

        const fruitX = fruit.x;

        const cartDistance = Math.abs(fruitX - playerX);

        const cartY = worldHeight - 205;

        // Durian masuk gerobak

        if (
            fruit.y > cartY - 20 &&
            fruit.y < cartY + 65 &&
            cartDistance < 13
        ) {

            collectFruit(fruit);

            return;

        }

        // Durian mengenai badan pemain

        if (
            fruit.y > worldHeight - 230 &&
            fruit.y < worldHeight - 145 &&
            Math.abs(fruitX - playerPosition) < 5
        ) {

            hitPlayer(fruit);

            return;

        }

        // Durian jatuh ke tanah

        if (fruit.y > worldHeight - 140) {

            removeFruit(fruit);

        }

    });

    fruits = fruits.filter(fruit => fruit.active);

}


// ==========================================
// DURlAN MASUK GEROBAK
// ==========================================

function collectFruit(fruit) {

    fruit.active = false;

    fruit.element.remove();

    cartCount++;

    score++;

    showNotification("🥭 Durian berhasil ditangkap!");

    updateCart();

    if (score >= WIN_SCORE) {

        endGame(true, "Kamu berhasil mengumpulkan 30 durian!");

    }

}


// ==========================================
// DURlAN MENGENAI PEMAIN
// ==========================================

function hitPlayer(fruit) {

    fruit.active = false;

    fruit.element.remove();

    score -= 5;

    showNotification("💥 Durian mengenai badan! Nilai -5");

    if (score <= LOSE_SCORE) {

        endGame(false, "Nilai mencapai -30!");

    }

}


// ==========================================
// MENGHAPUS DURIAN
// ==========================================

function removeFruit(fruit) {

    fruit.active = false;

    fruit.element.remove();

}


// ==========================================
// TAMPILAN ISI GEROBAK
// ==========================================

function updateCart() {

    const cartDurian = document.getElementById("cart-durian");

    cartDurian.innerHTML = "";

    const visibleCount = Math.min(cartCount, 18);

    for (let i = 0; i < visibleCount; i++) {

        const item = document.createElement("span");

        item.textContent = "🌰";

        cartDurian.appendChild(item);

    }

}


// ==========================================
// MUSUH MUNCUL SETIAP 500 CM
// ==========================================

function checkEnemySpawn() {

    if (distance - lastEnemyDistance >= ENEMY_INTERVAL) {

        spawnEnemy();

        lastEnemyDistance = distance;

    }

}


// ==========================================
// MEMBUAT MUSUH
// ==========================================

function spawnEnemy() {

    const enemy = document.createElement("div");

    enemy.className = "enemy";

    enemy.innerHTML = `
        <div class="enemy-head">👨</div>
        <div class="enemy-body"></div>
        <div class="enemy-legs">🦵🦵</div>
        <div class="enemy-hammer">🔨</div>
    `;

    const x = 10 + Math.random() * 75;

    enemy.style.left = x + "%";

    enemyContainer.appendChild(enemy);

    const enemyObject = {

        element: enemy,

        x: x,

        active: true,

        speed: 40,

        kicked: false

    };

    enemies.push(enemyObject);

    showNotification("⚠️ Musuh datang! Lindungi gerobak!");

}


// ==========================================
// GERAKAN DAN TENDANGAN MUSUH
// ==========================================

function updateEnemies(delta) {

    enemies.forEach(enemy => {

        if (!enemy.active) return;

        enemy.x -= enemy.speed * delta / 10;

        enemy.element.style.left = enemy.x + "%";

        const cartX = playerPosition + 12;

        const distanceToCart = Math.abs(enemy.x - cartX);

        if (distanceToCart < 10 && !enemy.kicked) {

            enemy.kicked = true;

            kickCart(enemy);

        }

        if (enemy.x < -15 || enemy.kicked) {

            enemy.active = false;

            setTimeout(() => {
                enemy.element.remove();
            }, 500);

        }

    });

    enemies = enemies.filter(enemy => enemy.active);

}


// ==========================================
// MUSUH MENENDANG GEROBAK
// ==========================================

function kickCart(enemy) {

    enemy.element.classList.add("kick");

    if (cartCount > 0) {

        cartCount--;

        score--;

        showNotification("🔨 Musuh menendang gerobak! 1 durian jatuh!");

        // Animasi durian terjatuh

        const dropped = document.createElement("div");

        dropped.className = "durian";

        dropped.textContent = "🌰";

        dropped.style.left = (playerPosition + 10) + "%";

        dropped.style.top = "310px";

        fruitContainer.appendChild(dropped);

        let dropY = 310;

        const dropAnimation = setInterval(() => {

            dropY += 8;

            dropped.style.top = dropY + "px";

            if (dropY > world.clientHeight - 100) {

                clearInterval(dropAnimation);

                dropped.remove();

            }

        }, 30);

        updateCart();

    }

    if (score <= LOSE_SCORE) {

        endGame(false, "Nilai mencapai -30!");

    }

}


// ==========================================
// GERAKAN POHON
// ==========================================

function updateTrees() {

    const trees = document.querySelectorAll(".tree");

    trees.forEach(tree => {

        const treePosition = Number(tree.dataset.position);

        const newPosition =
            (treePosition * 150 - distance * 0.5) % 1800;

        tree.style.left = newPosition + "px";

    });

}


// ==========================================
// SAMPAI DI PASAR
// ==========================================

function arriveAtMarket() {

    if (reachedMarket) return;

    reachedMarket = true;

    market.classList.remove("hidden");

    marketPanel.classList.remove("hidden");

    marketTime = 0;

    showNotification("🏪 Kamu sampai di pasar! Lindungi durian!");

    marketMessage.textContent =
        "Tunggu 20 detik agar pembeli membeli durian. Hindari lalat!";

}


// ==========================================
// PROSES PASAR
// ==========================================

function updateMarket(delta) {

    marketTime += delta;

    const progress = Math.min(
        marketTime / MARKET_DURATION * 100,
        100
    );

    marketProgress.style.width = progress + "%";

    const remaining = Math.max(
        0,
        Math.ceil(MARKET_DURATION - marketTime)
    );

    marketTimerElement.textContent =
        remaining + " detik";

    if (marketTime >= MARKET_DURATION) {

        sellDurian();

    }

    // Lalat muncul secara berkala

    if (performance.now() - lastFlySpawn > 700) {

        spawnFly();

        lastFlySpawn = performance.now();

    }

}


// ==========================================
// MEMBUAT LALAT
// ==========================================

function spawnFly() {

    if (!reachedMarket || gameFinished) return;

    const fly = document.createElement("div");

    fly.className = "fly";

    fly.textContent = "🪰";

    const x = Math.random() * 90 + 5;

    const y = 170 + Math.random() * 160;

    fly.style.left = x + "%";

    fly.style.top = y + "px";

    flyContainer.appendChild(fly);

    const flyObject = {

        element: fly,

        x: x,

        y: y,

        targetX: playerPosition + 10,

        targetY: world.clientHeight - 220,

        speed: 30 + Math.random() * 35,

        active: true

    };

    flies.push(flyObject);

}


// ==========================================
// GERAKAN LALAT DAN SERANGAN
// ==========================================

function updateFlies(delta) {

    flies.forEach(fly => {

        if (!fly.active) return;

        const targetX = playerPosition + 10;

        const targetY = world.clientHeight - 220;

        const dx = targetX - fly.x;

        const dy = targetY - fly.y;

        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

        if (distanceToTarget > 2) {

            fly.x += dx / distanceToTarget *
                fly.speed * delta / 10;

            fly.y += dy / distanceToTarget *
                fly.speed * delta / 10;

        }

        fly.element.style.left = fly.x + "%";

        fly.element.style.top = fly.y + "px";

        // Lalat menyentuh durian di gerobak

        if (
            Math.abs(fly.x - targetX) < 5 &&
            Math.abs(fly.y - targetY) < 35
        ) {

            fly.active = false;

            fly.element.remove();

            flyHitsDurian();

        }

        if (fly.x < -10 || fly.x > 110) {

            fly.active = false;

            fly.element.remove();

        }

    });

    flies = flies.filter(fly => fly.active);

}


// ==========================================
// 5 LALAT MEMBUSUKKAN 1 DURIAN
// ==========================================

function flyHitsDurian() {

    if (cartCount <= 0) {

        showNotification("🪰 Lalat menyerang gerobak kosong!");

        return;

    }

    marketFlyHits++;

    updateStatus();

    showNotification(
        "🪰 Lalat menyentuh durian! " +
        marketFlyHits + "/5"
    );

    if (marketFlyHits >= 5) {

        marketFlyHits = 0;

        cartCount--;

        score--;

        marketMessage.textContent =
            "Satu durian membusuk akibat serangan lalat!";

        // Animasi durian busuk jatuh

        const rotten = document.createElement("div");

        rotten.className = "durian durian-bad";

        rotten.textContent = "🥭";

        rotten.style.left = (playerPosition + 10) + "%";

        rotten.style.top = "320px";

        fruitContainer.appendChild(rotten);

        setTimeout(() => {

            rotten.style.transition = "all 1s";

            rotten.style.top = "500px";

            rotten.style.opacity = "0";

            setTimeout(() => rotten.remove(), 1100);

        }, 100);

        showNotification("🤢 1 durian membusuk dan jatuh!");

        updateCart();

    }

    if (score <= LOSE_SCORE) {

        endGame(false, "Nilai mencapai -30!");

    }

}


// ==========================================
// PENJUALAN DURIAN
// ==========================================

function sellDurian() {

    gameRunning = false;

    marketMessage.textContent =
        "🎉 Pembeli datang! Durian berhasil dijual!";

    if (cartCount >= WIN_SCORE || score >= WIN_SCORE) {

        endGame(true, "Selamat! Kamu berhasil memanen dan menjual durian!");

    } else {

        endGame(
            false,
            "Pembeli datang, tetapi durian yang terkumpul belum mencapai 30 buah."
        );

    }

}


// ==========================================
// JEDA PERMAINAN
// ==========================================

document.getElementById("pause-button")
    .addEventListener("click", togglePause);

function togglePause() {

    if (!gameRunning || gameFinished) return;

    gamePaused = !gamePaused;

    const button = document.getElementById("pause-button");

    if (gamePaused) {

        button.textContent = "▶ LANJUT";

        cancelAnimationFrame(gameFrame);

        showNotification("Permainan dijeda!");

    } else {

        button.textContent = "⏸ JEDA";

        lastTime = performance.now();

        gameFrame = requestAnimationFrame(gameLoop);

        showNotification("Permainan dilanjutkan!");

    }

}


// ==========================================
// MENANG ATAU KALAH
// ==========================================

function endGame(won, message) {

    if (gameFinished) return;

    gameFinished = true;

    gameRunning = false;

    gamePaused = false;

    cancelAnimationFrame(gameFrame);

    document.getElementById("pause-button").textContent =
        "⏸ JEDA";

    const resultTitle = document.getElementById("result-title");

    const resultIcon = document.getElementById("result-icon");

    const resultMessage = document.getElementById("result-message");

    const finalScore = document.getElementById("final-score");

    if (won) {

        resultTitle.textContent = "🏆 KAMU MENANG!";

        resultIcon.textContent = "🎉🌳🥭";

    } else {

        resultTitle.textContent = "GAME OVER!";

        resultIcon.textContent = "😢";

    }

    resultMessage.textContent = message;

    finalScore.textContent =
        "Nilai akhir: " + score +
        " | Durian tersisa: " + cartCount;

    resultScreen.classList.remove("hidden");

}


// ==========================================
// RESET TOMBOL SAAT FOKUS HILANG
// ==========================================

window.addEventListener("blur", function() {

    keys.left = false;

    keys.right = false;

});


// ==========================================
// MENCEGAH SCROLL SAAT BERMAIN
// ==========================================

document.addEventListener("keydown", function(event) {

    if (
        ["ArrowLeft", "ArrowRight", " "].includes(event.key)
    ) {

        event.preventDefault();

    }

});


// ==========================================
// SELESAI
// ==========================================