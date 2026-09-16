const Assets = {
  chengxiImg: new Image(), theaterBg: new Image(), chengxiLoaded: false, theaterBgLoaded: false,
  init() { this.chengxiImg.src = 'chengxi.png'; this.chengxiImg.onload = () => this.chengxiLoaded = true; this.theaterBg.src = 'theater-bg.png'; this.theaterBg.onload = () => this.theaterBgLoaded = true; }
};

const Flow = {
  currentAct: 2,
  startGame() { document.getElementById('start-screen').style.display = 'none'; },
  endGame() { document.getElementById('end-screen').style.display = 'flex'; },
  setAct(act) {
    this.currentAct = act;
    const sub = document.getElementById('chapter-sub'); const badge = document.getElementById('chapter-badge');
    const dTag = document.getElementById('speaker-tag'); const dText = document.getElementById('dialogue-text');
    document.getElementById('dialogue-actions').innerHTML = "";
    
    if (act === 2) {
      sub.innerText = "第二幕 · 老戲院地下室"; badge.innerText = "第 29 場"; World.player.x = 200;
      dTag.innerText = "戲院老闆"; dText.innerText = "「這幾張黑膠是從戲院地下室翻出來的，泛黃磨損得厲害，你看看有沒有什麼用得上。」";
    } else if (act === 3) {
      sub.innerText = "第三幕 · 程曦房間 (夜)"; badge.innerText = "第 37 場"; World.player.x = 400;
      dTag.innerText = "系統"; dText.innerText = "夜裡安靜，窗簾隨風微動，月光落在程曦的臉上。地板上靜靜擺著一雙舊皮鞋……";
    } else if (act === 4) {
      sub.innerText = "第四幕 · 廢棄音樂酒吧"; badge.innerText = "第 74 場"; World.player.x = 250;
      dTag.innerText = "陳導"; dText.innerText = "「這裡，我打算作為那場舞會的取景地。」\n（程曦望著地上的痕跡與一面破碎的鏡子……）";
    }
  },
  takeVideoRecorder() {
    document.getElementById('speaker-tag').innerText = "系統 / 程曦"; document.getElementById('dialogue-text').innerText = "程曦迅速後退半步，深呼吸，連忙從口袋掏出手套戴上。接過了老闆手中的舊錄影機。";
    document.getElementById('dialogue-actions').innerHTML = `<button class="action-btn-sm" onclick="Flow.showModal('【觸發回憶夢境】', '錄影機裡傳來輕快的圓舞曲，與戲院老闆母親的對話。\\n程曦帶著這疊黑膠與錄影機回到房間。夜深人靜，疲憊的她沉沉睡去……')">進入房間 ➔</button>`;
  },
  wakeUpFromDream() {
    document.getElementById('speaker-tag').innerText = "程曦"; document.getElementById('dialogue-text').innerText = "程曦猛地睜眼，一滴眼淚從眼角滴落。她伸手輕觸地上的舊皮鞋：「海邊。」";
    document.getElementById('dialogue-actions').innerHTML = `<button class="action-btn-sm" onclick="Flow.showModal('【前往勘景】', '兩人循著記憶的線索，與劇組一同來到了下一個勘景地點：廢棄的音樂酒吧。')">前往廢棄酒吧 ➔</button>`;
  },
  fallDown() {
    document.getElementById('speaker-tag').innerText = "系統"; document.getElementById('dialogue-text').innerText = "程曦下意識模仿鏡中女孩的動作，旋轉、跨步、單腳重心前傾，卻不幸失去平衡，整個人向後倒去！";
    document.getElementById('dialogue-actions').innerHTML = `<button class="action-btn-sm" style="background:var(--danger); font-size:1.2rem; padding:16px;" onclick="Flow.catchHer()">[E] 李相暮接住她！</button>`;
  },
  catchHer() {
    Flow.showModal('【心跳失衡】', '李相暮眼疾手快，一把接住她。\n兩人相視，呼吸交錯。空氣一陣靜默。');
  },
  showModal(title, desc) { document.getElementById('modal-title').innerText = title; document.getElementById('modal-desc').innerText = desc; document.getElementById('story-modal').classList.add('show'); },
  onModalConfirm() { 
    document.getElementById('story-modal').classList.remove('show');
    if (this.currentAct === 2) this.setAct(3); 
    else if (this.currentAct === 3) this.setAct(4);
    else if (this.currentAct === 4) { this.endGame(); }
  }
};

const World = {
  canvas: null, ctx: null, keys: {}, player: { x: 200, y: 190, speed: 4, dir: 1, isMoving: false, walkFrame: 0 }, activePrompt: null,
  init() {
    Assets.init(); this.canvas = document.getElementById('world-canvas'); this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800; this.canvas.height = 320; this.ctx.imageSmoothingEnabled = false;
    window.addEventListener('keydown', e => { this.keys[e.key.toLowerCase()] = true; if(e.key.toLowerCase()==='e') this.handleInteract(); });
    window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
    this.setupTouch('btn-left', 'arrowleft'); this.setupTouch('btn-right', 'arrowright');
    document.getElementById('btn-act').addEventListener('touchstart', e => { e.preventDefault(); this.handleInteract(); });
    Flow.setAct(2); this.loop();
  },
  setupTouch(id, key) { const el = document.getElementById(id); el.addEventListener('touchstart', e => { e.preventDefault(); this.keys[key] = true; }); el.addEventListener('touchend', e => { e.preventDefault(); this.keys[key] = false; }); },
  handleInteract() {
    if (this.activePrompt === 'ITEM_VINYL') Puzzle.open(1); else if (this.activePrompt === 'ITEM_DREAM') Puzzle.open(2); else if (this.activePrompt === 'ITEM_DANCE') Puzzle.open(3);
  },
  update() {
    let moving = false;
    if (this.keys['a'] || this.keys['arrowleft']) { this.player.x -= this.player.speed; this.player.dir = -1; moving = true; }
    if (this.keys['d'] || this.keys['arrowright']) { this.player.x += this.player.speed; this.player.dir = 1; moving = true; }
    this.player.x = Math.max(60, Math.min(740, this.player.x)); this.player.isMoving = moving; if (moving) this.player.walkFrame += 0.2;
    
    const prompt = document.getElementById('interact-prompt');
    if (Flow.currentAct === 2 && Math.abs(this.player.x - 380) < 70) { this.activePrompt = 'ITEM_VINYL'; prompt.style.display = 'block'; prompt.innerText = "點擊 [E] 觸摸黑膠唱片"; }
    else if (Flow.currentAct === 3 && Math.abs(this.player.x - 380) < 70) { this.activePrompt = 'ITEM_DREAM'; prompt.style.display = 'block'; prompt.innerText = "點擊 [E] 觸摸舊皮鞋"; }
    else if (Flow.currentAct === 4 && Math.abs(this.player.x - 450) < 70) { this.activePrompt = 'ITEM_DANCE'; prompt.style.display = 'block'; prompt.innerText = "點擊 [E] 凝視破碎鏡子"; }
    else { this.activePrompt = null; prompt.style.display = 'none'; }
  },
  draw() {
    this.ctx.clearRect(0, 0, 800, 320);
    if (Flow.currentAct === 2) {
      if (Assets.theaterBgLoaded) this.ctx.drawImage(Assets.theaterBg, 0, 0, 800, 320); else { this.ctx.fillStyle = "#0a0d14"; this.ctx.fillRect(0, 0, 800, 210); this.ctx.fillStyle = "#121722"; this.ctx.fillRect(0, 210, 800, 110); }
      this.ctx.fillStyle = "#2d241c"; this.ctx.fillRect(340, 190, 80, 40); this.ctx.fillStyle = "#111"; this.ctx.beginPath(); this.ctx.ellipse(380, 185, 20, 8, 0, 0, Math.PI*2); this.ctx.fill();
    } else if (Flow.currentAct === 3) {
      this.ctx.fillStyle = "#040508"; this.ctx.fillRect(0, 0, 800, 210); this.ctx.fillStyle = "#11151f"; this.ctx.fillRect(0, 210, 800, 110);
      this.ctx.fillStyle = "#1c2130"; this.ctx.fillRect(300, 80, 160, 130); this.ctx.fillStyle = "#3e2723"; this.ctx.fillRect(360, 200, 40, 15);
    } else if (Flow.currentAct === 4) {
      this.ctx.fillStyle = "#26211a"; this.ctx.fillRect(0, 0, 800, 210); this.ctx.fillStyle = "#3d3428"; this.ctx.fillRect(0, 210, 800, 110); 
      this.ctx.fillStyle = "#8a9eb8"; this.ctx.globalAlpha = 0.6; this.ctx.beginPath(); this.ctx.moveTo(420, 80); this.ctx.lineTo(480, 70); this.ctx.lineTo(490, 180); this.ctx.lineTo(440, 200); this.ctx.fill(); this.ctx.globalAlpha = 1.0;
    }
    this.renderChengXi(this.player.x, this.player.y, this.player.dir, this.player.isMoving ? Math.sin(this.player.walkFrame)*4 : 0);
  },
  renderChengXi(x, y, dir, bounce) {
    const ctx = this.ctx; ctx.save(); ctx.translate(x, y + bounce); ctx.scale(dir, 1);
    ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath(); ctx.ellipse(0, 72, 24, 8, 0, 0, Math.PI * 2); ctx.fill();
    if (Assets.chengxiLoaded) { const drawH = 145; const drawW = (Assets.chengxiImg.width / Assets.chengxiImg.height) * drawH; ctx.drawImage(Assets.chengxiImg, -drawW / 2, -65, drawW, drawH); } else { ctx.fillStyle = "#f0f4f8"; ctx.fillRect(-10, -30, 20, 50); }
    ctx.restore();
  },
  loop() { this.update(); this.draw(); requestAnimationFrame(() => this.loop()); }
};

const Puzzle = {
  type: 1, isTouch: false, overload: 0, clarity: 0.1, val1: 0, val2: 0, isVReady: false, isAReady: false, phase: 0, recordAngle: 0, targetR: 60, hitCount: 0,
  open(type) { 
    this.type = type; document.getElementById('puzzle-overlay').classList.add('show');
    this.vC = document.getElementById('vision-canvas'); this.vCtx = this.vC.getContext('2d'); this.vC.width = 300; this.vC.height = 90;
    this.wC = document.getElementById('waveform-canvas'); this.wCtx = this.wC.getContext('2d'); this.wC.width = 300; this.wC.height = 90;
    
    if (type === 1) {
      document.getElementById('puzzle-title').innerText = "【雙軌共感：泛黃的黑膠】"; document.getElementById('card-audio').style.display = "flex";
      document.getElementById('slider-area').style.display = "block"; document.getElementById('p-touch-btn').style.display = "block"; document.getElementById('touch-ui-area').style.display = "block"; document.getElementById('p-rhythm-btn').style.display = "none"; document.getElementById('sync-act-btn').style.display = "block";
    } else if (type === 2) {
      document.getElementById('puzzle-title').innerText = "【時間軸：無聲的共感夢境】"; document.getElementById('card-audio').style.display = "flex";
      document.getElementById('slider1-label').innerText = "時間點"; document.getElementById('slider2-label').innerText = "環境音軌";
      document.getElementById('p-touch-btn').style.display = "none"; document.getElementById('touch-ui-area').style.display = "none"; document.getElementById('p-rhythm-btn').style.display = "none"; document.getElementById('sync-act-btn').style.display = "block";
    } else if (type === 3) {
      document.getElementById('puzzle-title').innerText = "【鏡中獨舞：抓準重心節奏】"; document.getElementById('card-audio').style.display = "none"; document.getElementById('sync-act-btn').style.display = "none";
      document.getElementById('p-touch-btn').style.display = "none"; document.getElementById('touch-ui-area').style.display = "none"; document.getElementById('p-rhythm-btn').style.display = "block";
      this.targetR = 60; this.hitCount = 0;
    }
    this.puzzleLoop(); 
  },
  close() { document.getElementById('puzzle-overlay').classList.remove('show'); this.isTouch = false; this.overload = 0; },
  startTouch() { if (this.type === 1) this.isTouch = true; }, stopTouch() { if (this.type === 1) this.isTouch = false; },
  onSlider1(v) { this.val1 = parseInt(v); document.getElementById('slider1-val-txt').innerText = this.val1; this.eval(); },
  onSlider2(v) { this.val2 = parseInt(v); document.getElementById('slider2-val-txt').innerText = this.val2; this.eval(); },
  eval() {
    if (this.type === 1) { this.isAReady = (this.val1 >= 20 && this.val2 >= 60 && this.val2 <= 90); }
    else if (this.type === 2) { this.isVReady = (this.val1 > 70 && this.val1 < 85); this.isAReady = (this.val2 > 75 && this.val2 < 90); }
    document.getElementById('sync-act-btn').className = this.isVReady && this.isAReady ? 'sync-act-btn ready' : 'sync-act-btn';
  },
  hitRhythm() {
    if (this.targetR > 15 && this.targetR < 35) {
      this.hitCount++; this.targetR = 60;
      if (this.hitCount >= 3) { this.close(); Flow.fallDown(); } 
    } else { this.close(); Flow.fallDown(); } 
  },
  attemptSync() { 
    if (this.isVReady && this.isAReady) { 
      this.close(); 
      if (this.type === 1) { Flow.showModal('【感官過載】', '一個女孩身處昏黃舞池，哭泣低語：「不要走……求你……」\n程曦猛地回神，手發抖，唱片啪嗒落地。'); setTimeout(()=>Flow.takeVideoRecorder(), 500); }
      else if (this.type === 2) { Flow.showModal('【男孩視角】', '他靠近女孩耳邊，清晰地說了一句：\n「我愛妳」'); setTimeout(()=>Flow.wakeUpFromDream(), 500); }
    } else alert("尚未完全對齊！");
  },
  puzzleLoop() {
    if (!document.getElementById('puzzle-overlay').classList.contains('show')) return;
    this.vCtx.fillStyle = "#05070a"; this.vCtx.fillRect(0, 0, 300, 90);
    
    if (this.type === 1) {
      this.overload = this.isTouch ? Math.min(100, this.overload + 0.4) : Math.max(0, this.overload - 0.8); this.clarity = this.isTouch ? Math.min(1.0, this.clarity + 0.02) : Math.max(0.1, this.clarity - 0.02);
      if (this.overload >= 100) { this.isTouch = false; this.overload = 0; alert("【過載】唱片差點掉落！"); }
      document.getElementById('p-overload-bar').style.width = `${this.overload}%`;
      this.isVReady = (this.clarity >= 0.85 && this.overload < 90); document.getElementById('sync-act-btn').className = this.isVReady && this.isAReady ? 'sync-act-btn ready' : 'sync-act-btn';
      this.vCtx.save(); this.vCtx.translate(150, 45); this.recordAngle += this.isTouch ? 0.05 : 0.01; this.vCtx.rotate(this.recordAngle);
      this.vCtx.fillStyle = "#111"; this.vCtx.beginPath(); this.vCtx.arc(0, 0, 40, 0, Math.PI*2); this.vCtx.fill(); this.vCtx.restore();
    } else if (this.type === 2) {
      let offset = Math.abs(75 - this.val1); this.vCtx.globalAlpha = Math.max(0.2, 1 - (offset * 0.02));
      this.vCtx.fillStyle = "#58a6ff"; this.vCtx.fillRect(140 - offset, 30, 15, 30); this.vCtx.fillStyle = "#e5b544"; this.vCtx.fillRect(160 + offset, 35, 12, 25); this.vCtx.globalAlpha = 1.0;
    } else if (this.type === 3) {
      this.vCtx.fillStyle = "#e5b544"; this.vCtx.fillRect(145, 30, 10, 30); 
      this.vCtx.strokeStyle = "#fff"; this.vCtx.beginPath(); this.vCtx.arc(150, 45, 25, 0, Math.PI*2); this.vCtx.stroke(); 
      this.targetR -= 0.6; if (this.targetR < 10) this.targetR = 60; 
      this.vCtx.strokeStyle = "rgba(88,166,255,0.8)"; this.vCtx.beginPath(); this.vCtx.arc(150, 45, this.targetR, 0, Math.PI*2); this.vCtx.stroke();
      document.getElementById('v-title').innerText = `節奏判定 (第 ${this.hitCount + 1}/3 步：${['旋轉','跨步','單腳重心前傾'][this.hitCount] || ''})`;
    }

    if (this.type !== 3) {
      this.wCtx.fillStyle = "#030406"; this.wCtx.fillRect(0, 0, 300, 90); this.wCtx.strokeStyle = this.isAReady ? "#3fb950" : "#f85149"; this.wCtx.beginPath();
      for(let i=0; i<=30; i++) { const x = i*10; const y = 45 + Math.sin(i*0.4 + this.phase) * (this.isAReady ? 10 : 30) * (this.isAReady ? Math.sin(i*0.3+this.phase) : (Math.random()-0.5)*2); if(i===0) this.wCtx.moveTo(x,y); else this.wCtx.lineTo(x,y); }
      this.wCtx.stroke(); this.phase += 0.15;
    }
    requestAnimationFrame(() => this.puzzleLoop());
  }
};
window.onload = () => World.init();
