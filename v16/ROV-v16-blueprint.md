# ROV Task Manager v16 — Cursor 改版規格書

> **版本**：v16 Blueprint  
> **基於**：ROV_Task_Manager_v15.html（已完整閱讀分析）  
> **目標**：簡單 · 直觀 · 高效——提升賽場對戰操作品質  
> **原則**：最小化破壞性改動，聚焦高頻場景優化

---

## 一、問題診斷（基於 v15 原始碼）

| # | 問題位置 | 具體問題 | 影響程度 |
|---|---|---|---|
| 1 | `<nav>` 導航列 | 11 個平級標籤（dashboard / prep / competition / scoreboard / strategy / tasks / checklist / gantt / members / intel / notes），賽場切換成本高 | 🔴 高 |
| 2 | `#page-scoreboard` | 新增 Mission Run 需開 Modal → 填 11 個欄位，賽中記分路徑過長 | 🔴 高 |
| 3 | `#page-competition` | 比賽日面板與計分板（`#page-scoreboard`）分屬不同頁，場邊需跨頁操作 | 🔴 高 |
| 4 | `.competition-num` | 計時數字 `font-size: 2rem`，遠距難讀 | 🟠 中 |
| 5 | `.tab-btn` 行動版 | 字體縮至 `.78rem`，觸控目標 < 44px | 🟠 中 |
| 6 | 任務狀態更改 | 需點擊行 → 開 task-detail-modal → 切換狀態 → 儲存（4 步操作）| 🟠 中 |
| 7 | `state` 資料模型 | 無 `missionEvents`（賽中事件流），無法支援賽後自動時間軸回放 | 🟡 低 |
| 8 | `localStorage` fallback | 網路斷線時僅部分模組有本機備份 | 🟡 低 |

---

## 二、v16 架構藍圖

### 2.1 導航重組：三模式 + 子頁籤

**改動位置**：`<nav>` 標籤（第 300–321 行）

**改動前**：11 個平級 `.tab-btn`

**改動後**：3 個大模式按鈕（頂層），每個模式內有子頁籤

```
┌─────────────────────────────────────────────────────────────────┐
│  🤿 ROV 備戰  │  [ 🏋️ 備戰 ]  [ 🏁 比賽 ]  [ 📊 回顧 ]  │ 🌓 │
│               │  ── 子頁籤根據模式顯示 ─────────────────────── │
└─────────────────────────────────────────────────────────────────┘
```

| 模式按鈕 ID | 子頁籤（showPage 目標） | 預設子頁 |
|---|---|---|
| `mode-prep` 🏋️ 備戰 | tasks、gantt、members、prep、notes | tasks |
| `mode-competition` 🏁 比賽 | competition（含 scoreboard 嵌入面板）| competition |
| `mode-review` 📊 回顧 | dashboard、scoreboard、strategy、intel、checklist | dashboard |

**實作方式**：

```javascript
// 新增全域變數
let currentMode = 'prep'; // 'prep' | 'competition' | 'review'

function switchMode(mode) {
  currentMode = mode;
  // 隱藏所有子頁籤，顯示對應模式的子頁籤
  document.querySelectorAll('.mode-subnav').forEach(el => el.classList.add('hidden'));
  document.getElementById('subnav-' + mode).classList.remove('hidden');
  // 切換大模式按鈕 active 狀態
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('mode-btn-' + mode).classList.add('active');
  // 自動顯示預設子頁
  const defaultPages = { prep: 'tasks', competition: 'competition', review: 'dashboard' };
  showPage(defaultPages[mode], null);
  // 比賽模式自動進入深色
  if (mode === 'competition') document.body.classList.add('competition-focus');
  else document.body.classList.remove('competition-focus');
}
```

```html
<!-- 新 nav HTML 結構 -->
<nav>
  <div class="logo">🤿 ROV v16</div>

  <!-- 三大模式按鈕 -->
  <button id="mode-btn-prep"        class="mode-btn active" onclick="switchMode('prep')">🏋️ 備戰</button>
  <button id="mode-btn-competition" class="mode-btn"        onclick="switchMode('competition')">🏁 比賽</button>
  <button id="mode-btn-review"      class="mode-btn"        onclick="switchMode('review')">📊 回顧</button>

  <div class="mode-subnav" id="subnav-prep">
    <button class="tab-btn" onclick="showPage('tasks',this)">✅ 任務</button>
    <button class="tab-btn" onclick="showPage('gantt',this)">📅 甘特圖</button>
    <button class="tab-btn" onclick="showPage('members',this)">👥 成員</button>
    <button class="tab-btn" onclick="showPage('prep',this)">🎒 備戰中心</button>
    <button class="tab-btn" onclick="showPage('notes',this)">📝 備忘</button>
  </div>
  <div class="mode-subnav hidden" id="subnav-competition">
    <button class="tab-btn active" onclick="showPage('competition',this)">🏁 指揮中心</button>
  </div>
  <div class="mode-subnav hidden" id="subnav-review">
    <button class="tab-btn" onclick="showPage('dashboard',this)">📊 總覽</button>
    <button class="tab-btn" onclick="showPage('scoreboard',this)">🏆 計分分析</button>
    <button class="tab-btn" onclick="showPage('strategy',this)">🎯 策略</button>
    <button class="tab-btn" onclick="showPage('intel',this)">🔍 觀摩</button>
    <button class="tab-btn" onclick="showPage('checklist',this)">📋 備賽設備清單</button>
  </div>

  <div class="nav-spacer"></div>
  <select id="season-select" onchange="switchSeason(this.value)">...</select>
  <button class="tab-btn" onclick="toggleTheme()" id="theme-toggle">🌓</button>
</nav>
```

---

### 2.2 Competition Command Center（核心改動）

**改動位置**：`#page-competition`（第 434–476 行）

**目標**：把比賽日面板、即時計分快速輸入、備賽設備清單三合一，**比賽模式不需離開此頁**。

#### 2.2.1 頁面整體佈局（替換現有 page-competition 內容）

```
┌── 頂部固定狀態列（sticky-header） ──────────────────────────────┐
│  🟢 水中  │  ⏱ 14:23  │  本輪得分：62 / 目標：85  │  ✅ 8/12  │
└─────────────────────────────────────────────────────────────────┘
┌── 左欄（50%） ─────────┐  ┌── 右欄（50%） ─────────────────────┐
│  📋 備賽設備清單        │  │  ⚡ 快速計分面板                  │
│  （大字可勾版）          │  │  （本輪任務卡 + 得分按鈕）         │
│                          │  │                                    │
│  🧭 一鍵賽前流程          │  │  ┌─ 快速記錄表單（內嵌，非Modal）─┐│
│  （flow-panel）          │  │  │ 輪次 │ 操控手 │ 秒數 │ 備註  ││
│                          │  │  │ 任務 ││ +得分  │ -扣分 │ ✓  ││
└──────────────────────────┘  │  └───────────────────────────────┘│
                              │  📍 負責人 · 下一步行動             │
                              └────────────────────────────────────┘
┌── 底部（Float 裁判提示卡，可折疊）─────────────────────────────┐
```

#### 2.2.2 頂部固定狀態列

```html
<!-- 新增 sticky 狀態列，插入 page-competition 最頂部 -->
<div id="ccc-header" style="
  position: sticky; top: 0; z-index: 50;
  display: grid; grid-template-columns: auto 1fr 1fr auto;
  gap: 12px; align-items: center;
  background: #081827; color: #fff;
  padding: 10px 20px; border-radius: 0 0 10px 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,.4);
">
  <!-- ROV 狀態燈 -->
  <div id="ccc-rov-status" onclick="cycleROVStatus()"
    style="width:48px;height:48px;border-radius:50%;background:var(--green);
           cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.4rem"
    title="點擊切換：待機 / 水中 / 出水 / 問題">🟢</div>

  <!-- 大字計時器 -->
  <div style="text-align:center">
    <div id="ccc-timer" style="
      font-size: 4rem; font-weight: 900; line-height: 1;
      font-variant-numeric: tabular-nums;
      font-family: 'SF Mono', 'Consolas', monospace;
    ">--:--</div>
    <div style="font-size:.75rem;color:rgba(255,255,255,.6)" id="ccc-timer-label">距離下水</div>
  </div>

  <!-- 得分與 Checklist 進度 -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div style="background:rgba(255,255,255,.1);border-radius:8px;padding:10px;text-align:center">
      <div id="ccc-score" style="font-size:2rem;font-weight:900;font-variant-numeric:tabular-nums">0</div>
      <div style="font-size:.7rem;color:rgba(255,255,255,.6)">本輪累計分</div>
    </div>
    <div style="background:rgba(255,255,255,.1);border-radius:8px;padding:10px;text-align:center">
      <div id="ccc-checklist-pct" style="font-size:2rem;font-weight:900">0%</div>
      <div style="font-size:.7rem;color:rgba(255,255,255,.6)">設備清單 ✅</div>
    </div>
  </div>

  <!-- 控制按鈕 -->
  <div style="display:flex;flex-direction:column;gap:6px">
    <button class="btn" onclick="toggleMissionTimer()" id="ccc-timer-btn"
      style="background:var(--green);color:#fff;padding:8px 16px;font-size:.9rem;min-height:44px">
      ▶ 開始計時
    </button>
    <button class="btn" onclick="saveCCCQuickRound()"
      style="background:var(--orange);color:#fff;padding:8px 16px;font-size:.85rem;min-height:44px">
      💾 儲存本輪
    </button>
  </div>
</div>
```

#### 2.2.3 ROV 狀態燈邏輯（新增函式）

```javascript
// 新增 ROV 狀態管理
const ROV_STATES = [
  { key: 'standby',    emoji: '⚪', color: '#888',          label: '待機' },
  { key: 'diving',     emoji: '🟢', color: 'var(--green)',  label: '水中' },
  { key: 'surfacing',  emoji: '🟡', color: 'var(--orange)', label: '出水' },
  { key: 'issue',      emoji: '🔴', color: 'var(--red)',    label: '問題' },
];
let rovStateIndex = 0;

function cycleROVStatus() {
  rovStateIndex = (rovStateIndex + 1) % ROV_STATES.length;
  const s = ROV_STATES[rovStateIndex];
  const el = document.getElementById('ccc-rov-status');
  if (el) { el.textContent = s.emoji; el.style.background = s.color; el.title = s.label; }
  // 同步寫入事件流
  addMissionEvent({ type: 'rov_status', value: s.key, label: `ROV 狀態：${s.label}` });
}
```

#### 2.2.4 Mission 計時器（升級現有倒數邏輯）

```javascript
// 升級現有計時系統：支援倒數（賽前）與正數（賽中任務計時）
let missionTimerMode = 'countdown'; // 'countdown' | 'mission'
let missionTimerStart = null;
let missionTimerInterval = null;
let missionTimerElapsed = 0; // 記錄入水後已用秒數

function toggleMissionTimer() {
  if (missionTimerMode === 'countdown') {
    // 切換為賽中任務計時
    missionTimerMode = 'mission';
    missionTimerStart = Date.now() - missionTimerElapsed * 1000;
    missionTimerInterval = setInterval(updateMissionTimerDisplay, 500);
    document.getElementById('ccc-timer-btn').textContent = '⏸ 暫停';
    document.getElementById('ccc-timer-btn').style.background = 'var(--orange)';
    document.getElementById('ccc-timer-label').textContent = '任務用時';
    addMissionEvent({ type: 'timer_start', label: '計時開始' });
  } else {
    clearInterval(missionTimerInterval);
    missionTimerElapsed = Math.floor((Date.now() - missionTimerStart) / 1000);
    document.getElementById('ccc-timer-btn').textContent = '▶ 繼續';
    addMissionEvent({ type: 'timer_pause', value: missionTimerElapsed, label: `計時暫停：${missionTimerElapsed}s` });
  }
}

function updateMissionTimerDisplay() {
  const elapsed = Math.floor((Date.now() - missionTimerStart) / 1000);
  const min = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const sec = (elapsed % 60).toString().padStart(2, '0');
  const el = document.getElementById('ccc-timer');
  if (el) {
    el.textContent = `${min}:${sec}`;
    // 超過 25 分鐘警示（MATE 一般單輪 25-30 分鐘）
    if (elapsed > 25 * 60) {
      el.style.color = 'var(--red)';
      el.style.animation = 'ccc-blink 1s ease-in-out infinite';
    }
  }
}
```

#### 2.2.5 快速計分面板（內嵌，取代 Mission Run Modal）

**重點**：不彈 Modal，直接在頁面右欄操作。

```html
<!-- 插入 page-competition 右欄 -->
<div id="ccc-quick-score" class="card" style="background:#0D2137;border:1px solid rgba(255,255,255,.15)">
  <h2 style="color:#fff;margin-bottom:12px">⚡ 快速計分</h2>

  <!-- 本輪基本資訊（精簡為 3 欄）-->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
    <div>
      <label style="font-size:.7rem;color:rgba(255,255,255,.6)">輪次</label>
      <input type="text" id="ccc-round-name" placeholder="Practice R1"
        style="width:100%;background:#1a2d45;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:6px 8px;font-size:.85rem">
    </div>
    <div>
      <label style="font-size:.7rem;color:rgba(255,255,255,.6)">操控手</label>
      <input type="text" id="ccc-pilot" placeholder="鄧諾軒"
        style="width:100%;background:#1a2d45;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:6px 8px;font-size:.85rem">
    </div>
    <div>
      <label style="font-size:.7rem;color:rgba(255,255,255,.6)">官方扣分次數</label>
      <input type="number" id="ccc-penalty-count" value="0" min="0"
        style="width:100%;background:#1a2d45;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:6px 8px;font-size:.85rem"
        oninput="updateCCCScoreDisplay()">
    </div>
  </div>

  <!-- 任務得分卡片區（從 strategy_items 動態生成）-->
  <div id="ccc-mission-cards" style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px"></div>

  <!-- 即時累計顯示 -->
  <div style="background:rgba(255,255,255,.08);border-radius:8px;padding:10px;margin-bottom:10px;text-align:center">
    <div id="ccc-total-display" style="font-size:2.5rem;font-weight:900;color:#fff;font-variant-numeric:tabular-nums">0</div>
    <div style="font-size:.7rem;color:rgba(255,255,255,.5)">原始得分 − 扣分 × 5</div>
  </div>

  <!-- 備註（1行）-->
  <input type="text" id="ccc-note" placeholder="這輪備註 / 改進點…"
    style="width:100%;background:#1a2d45;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:8px 10px;font-size:.85rem;margin-bottom:8px">
</div>
```

#### 2.2.6 Mission 任務卡片渲染函式（新增）

```javascript
// 從 state.strategy 動態生成賽中任務卡，支援單擊加分
function renderCCCMissionCards() {
  const container = document.getElementById('ccc-mission-cards');
  if (!container) return;

  // 若 strategy 為空，顯示提示
  if (!state.strategy || !state.strategy.length) {
    container.innerHTML = `<div style="color:rgba(255,255,255,.5);font-size:.82rem;text-align:center;padding:12px">
      前往 📊 回顧 → 策略板，新增任務項目後此處自動顯示
    </div>`;
    return;
  }

  container.innerHTML = state.strategy.map(item => `
    <div class="ccc-mission-card" id="ccc-card-${item.id}"
      style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;align-items:center;
             padding:10px 12px;border-radius:8px;background:rgba(255,255,255,.07);
             border:1px solid rgba(255,255,255,.12);min-height:52px;cursor:pointer;
             transition:background .15s"
      data-id="${item.id}" data-score="${item.score || 0}" data-status="pending">

      <!-- 任務名 + 預估分 -->
      <div>
        <div style="color:#fff;font-size:.92rem;font-weight:600">${escapeHtml(item.name)}</div>
        <div style="color:rgba(255,255,255,.45);font-size:.72rem">預計 +${item.score}分 · ${item.seconds || '?'}秒</div>
      </div>

      <!-- 得分輸入 -->
      <input type="number" value="${item.score || 0}" min="0"
        id="ccc-score-${item.id}"
        style="width:60px;background:#1a2d45;color:#7dffb0;border:1px solid rgba(125,255,176,.3);
               border-radius:6px;padding:4px 6px;font-size:1rem;font-weight:700;text-align:center;
               font-variant-numeric:tabular-nums"
        oninput="updateCCCScoreDisplay()"
        onclick="event.stopPropagation()">

      <!-- 完成 / 失敗 快速標記 -->
      <button onclick="setCCCCardStatus('${item.id}', 'done')"
        id="ccc-done-${item.id}"
        style="padding:8px 10px;border-radius:6px;background:rgba(112,173,71,.3);color:#7dffb0;
               border:1px solid rgba(112,173,71,.4);font-size:.78rem;min-width:44px;min-height:44px;cursor:pointer">
        ✓
      </button>
      <button onclick="setCCCCardStatus('${item.id}', 'fail')"
        id="ccc-fail-${item.id}"
        style="padding:8px 10px;border-radius:6px;background:rgba(192,0,0,.2);color:#ff8080;
               border:1px solid rgba(192,0,0,.3);font-size:.78rem;min-width:44px;min-height:44px;cursor:pointer">
        ✗
      </button>
    </div>
  `).join('');
}

function setCCCCardStatus(itemId, status) {
  const card = document.getElementById('ccc-card-' + itemId);
  if (!card) return;
  const prev = card.dataset.status;

  if (status === 'done') {
    card.style.background = 'rgba(112,173,71,.18)';
    card.style.borderColor = 'rgba(112,173,71,.5)';
    card.dataset.status = prev === 'done' ? 'pending' : 'done'; // toggle
  } else {
    card.style.background = 'rgba(192,0,0,.15)';
    card.style.borderColor = 'rgba(192,0,0,.4)';
    card.dataset.status = prev === 'fail' ? 'pending' : 'fail';
    // 失敗自動清零得分
    const scoreInput = document.getElementById('ccc-score-' + itemId);
    if (scoreInput && card.dataset.status === 'fail') scoreInput.value = 0;
  }

  // 重置為 pending 時還原樣式
  if (card.dataset.status === 'pending') {
    card.style.background = 'rgba(255,255,255,.07)';
    card.style.borderColor = 'rgba(255,255,255,.12)';
  }

  addMissionEvent({ type: 'task_' + card.dataset.status, taskId: itemId, label: `任務 ${itemId}：${card.dataset.status}` });
  updateCCCScoreDisplay();
}

function updateCCCScoreDisplay() {
  let total = 0;
  state.strategy.forEach(item => {
    const input = document.getElementById('ccc-score-' + item.id);
    if (input) total += Number(input.value) || 0;
  });
  const penaltyCount = Number(document.getElementById('ccc-penalty-count')?.value) || 0;
  total -= penaltyCount * 5;
  const el = document.getElementById('ccc-total-display');
  if (el) el.textContent = total;
  const headerScore = document.getElementById('ccc-score');
  if (headerScore) headerScore.textContent = total;
}
```

#### 2.2.7 儲存本輪（接入現有 missionRuns 資料流）

```javascript
// saveCCCQuickRound：把快速面板資料轉換為標準 missionRun 格式
async function saveCCCQuickRound() {
  const gross = state.strategy.reduce((sum, item) => {
    const input = document.getElementById('ccc-score-' + item.id);
    return sum + (Number(input?.value) || 0);
  }, 0);
  const penaltyCount = Number(document.getElementById('ccc-penalty-count')?.value) || 0;
  const totalScore = gross - penaltyCount * 5;

  // 收集任務逐項得分（reuse score_items 格式）
  const scoreItems = state.strategy.map(item => ({
    id: item.id,
    label: item.name,
    score: Number(document.getElementById('ccc-score-' + item.id)?.value) || 0,
    status: document.getElementById('ccc-card-' + item.id)?.dataset.status || 'pending'
  }));

  const completedCount = scoreItems.filter(s => s.status === 'done').length;
  const successRate = state.strategy.length > 0
    ? Math.round(completedCount / state.strategy.length * 100) : 0;

  const run = {
    id: Date.now(),
    run_date: new Date().toISOString().slice(0, 10),
    round_name: document.getElementById('ccc-round-name')?.value.trim() || 'Round',
    pilot: document.getElementById('ccc-pilot')?.value.trim() || '',
    gross_score: gross,
    penalty: penaltyCount * 5,
    seconds: missionTimerElapsed || 0,
    faults: penaltyCount,
    success_rate: successRate,
    note: document.getElementById('ccc-note')?.value.trim() || '',
    score_items: JSON.stringify(scoreItems),
    missions: scoreItems.filter(s => s.status === 'done').map(s => s.label).join('、'),
    season: currentSeason,
  };

  // 使用現有 addMissionRun 邏輯寫入 state + Supabase
  state.missionRuns.push(run);
  saveLocalMissionRuns();
  if (optionalSchema.missionRuns) {
    await db.from('mission_runs').insert([{
      run_date: run.run_date, round_name: run.round_name, pilot: run.pilot,
      gross_score: run.gross_score, penalty: run.penalty, seconds: run.seconds,
      faults: run.faults, success_rate: run.success_rate, note: run.note,
      score_items: optionalSchema.missionScoreItems ? run.score_items : undefined,
      missions: run.missions,
      ...(optionalSchema.missionSeason ? { season: run.season } : {})
    }]);
  }

  markDirty('scoreboard');
  showToast('✅ 本輪計分已儲存！');
  resetCCCQuickScore(); // 清空面板準備下一輪
  addMissionEvent({ type: 'round_saved', value: totalScore, label: `本輪儲存：${totalScore} 分` });
}

function resetCCCQuickScore() {
  missionTimerElapsed = 0;
  missionTimerMode = 'countdown';
  clearInterval(missionTimerInterval);
  document.getElementById('ccc-timer').textContent = '--:--';
  document.getElementById('ccc-timer-btn').textContent = '▶ 開始計時';
  document.getElementById('ccc-penalty-count').value = 0;
  document.getElementById('ccc-note').value = '';
  state.strategy.forEach(item => {
    const input = document.getElementById('ccc-score-' + item.id);
    if (input) input.value = item.score || 0;
    const card = document.getElementById('ccc-card-' + item.id);
    if (card) { card.dataset.status = 'pending'; card.style.background = 'rgba(255,255,255,.07)'; card.style.borderColor = 'rgba(255,255,255,.12)'; }
  });
  updateCCCScoreDisplay();
}
```

---

### 2.3 任務狀態單擊快速切換

**改動位置**：`renderTasks()` 函式中任務行的生成邏輯

**目標**：任務行「狀態」欄位改為可點擊 badge，單擊循環切換 待辦 → 進行中 → 已完成，無需開 Modal。

```javascript
// 在 task-tbody 渲染時，把狀態欄改為可點擊
// 原本：<td><span class="badge ...">...</span></td>
// 改為：
function renderTaskStatusBadge(task) {
  const statusCycle = { '待辦': '進行中', '進行中': '已完成', '已完成': '待辦' };
  const next = statusCycle[task.status] || '待辦';
  return `<td>
    <span class="badge ${badgeClass(task.status)}"
      style="cursor:pointer;min-width:64px;display:inline-block;text-align:center;padding:4px 10px;font-size:.8rem"
      onclick="quickToggleTaskStatus(${task.id})"
      title="點擊切換 → ${next}">
      ${task.status}
    </span>
  </td>`;
}

async function quickToggleTaskStatus(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  const cycle = { '待辦': '進行中', '進行中': '已完成', '已完成': '待辦' };
  task.status = cycle[task.status] || '待辦';
  // 寫入 Supabase（使用現有更新邏輯）
  if (db) {
    await db.from('tasks').update({ status: task.status }).eq('id', taskId);
  }
  markDirty('tasks');
  markDirty('dashboard');
  renderTasks();
  updateBadges();
}
```

---

### 2.4 計時器字體與視覺強化

**改動位置**：CSS（第 74 行附近的 `.competition-num`）

```css
/* 替換現有 .competition-num */
.competition-num {
  font-size: clamp(2.5rem, 6vw, 5rem); /* 原為 2rem，提升為響應式大字 */
  font-weight: 900;
  color: var(--navy);
  line-height: 1.1;
  font-variant-numeric: tabular-nums; /* 新增：防止數字跳動 */
  font-family: 'SF Mono', 'Consolas', 'Courier New', monospace; /* 新增：等寬字體 */
  letter-spacing: -0.02em;
}

/* 新增：比賽深色模式下的計時器 */
body.competition-focus .competition-num,
body.competition-focus #ccc-timer {
  color: #fff;
  text-shadow: 0 0 20px rgba(0, 200, 150, 0.4);
}

/* 新增：超時閃爍動畫 */
@keyframes ccc-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* 大觸控按鈕（比賽模式）*/
body.competition-focus .btn {
  min-height: 44px;
  min-width: 44px;
  font-size: 1rem;
  padding: 10px 18px;
}
```

---

### 2.5 賽中事件流（新增資料層）

**目標**：在記憶體中維護一個輕量事件流，供賽後時間軸自動生成。

```javascript
// 新增全域事件陣列
let missionEventLog = [];

function addMissionEvent(event) {
  missionEventLog.push({
    ts: Date.now(),
    time_str: new Date().toLocaleTimeString('zh-HK'),
    ...event
  });
  // 事件流只存本地，不寫 Supabase（賽中避免延遲）
  try {
    localStorage.setItem('rov_events_' + currentSeason + '_' + new Date().toISOString().slice(0, 10),
      JSON.stringify(missionEventLog.slice(-200))); // 只保留最近 200 筆
  } catch(e) {}
}

// 在 saveCCCQuickRound 後，可呼叫此函式把事件流附加到 missionRun.note
function getEventLogSummary() {
  return missionEventLog
    .filter(e => ['task_done', 'task_fail', 'timer_start', 'timer_pause', 'rov_status'].includes(e.type))
    .map(e => `[${e.time_str}] ${e.label}`)
    .join('\n');
}
```

---

## 三、CSS 改動彙整

在現有 `<style>` 區塊**尾部**新增以下樣式，不覆蓋現有規則：

```css
/* ══════════════════ v16 新增樣式 ══════════════════ */

/* 三模式按鈕 */
.mode-btn {
  background: rgba(255,255,255,.12);
  border: none;
  color: rgba(255,255,255,.75);
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: .9rem;
  font-weight: 600;
  transition: background .18s, color .18s;
  min-height: 38px;
}
.mode-btn:hover { background: rgba(255,255,255,.22); color: #fff; }
.mode-btn.active { background: rgba(255,255,255,.28); color: #fff; }

/* 子導航 */
.mode-subnav { display: flex; align-items: center; gap: 2px; }
.mode-subnav.hidden { display: none; }

/* CCC 頁面佈局 */
#page-competition.ccc-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: calc(100vh - 52px);
}
.ccc-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;
  align-items: start;
}
@media (max-width: 768px) {
  .ccc-body { grid-template-columns: 1fr; }
}

/* 任務卡片 hover */
.ccc-mission-card:hover { background: rgba(255,255,255,.12) !important; }

/* 狀態 badge 可點擊 */
.badge[onclick] { cursor: pointer; user-select: none; }
.badge[onclick]:hover { filter: brightness(1.1); transform: scale(1.03); }
.badge[onclick]:active { transform: scale(0.97); }

/* 比賽深色模式：所有 card 加深 */
body.competition-focus #page-competition .card {
  background: #0D2137;
  border: 1px solid rgba(255,255,255,.1);
}
body.competition-focus #page-competition h2 { color: rgba(255,255,255,.85); }
body.competition-focus #page-competition label { color: rgba(255,255,255,.6); }
body.competition-focus #page-competition input,
body.competition-focus #page-competition select {
  background: #1a2d45;
  color: #fff;
  border-color: rgba(255,255,255,.2);
}

/* 超時紅色警示 */
#ccc-timer.overtime {
  color: var(--red) !important;
  animation: ccc-blink 1s ease-in-out infinite;
}
```

---

## 四、改動優先級清單（給 Cursor）

| 優先級 | 改動 | 影響範圍 | 預估工時 |
|---|---|---|---|
| P0 | 三模式導航重組（nav + switchMode） | nav HTML + CSS + JS | 2h |
| P0 | Competition Command Center 頂部狀態列 | page-competition HTML | 1h |
| P0 | 快速計分面板（ccc-quick-score）+ renderCCCMissionCards | HTML + JS | 3h |
| P0 | saveCCCQuickRound 接入 missionRuns | JS | 1h |
| P1 | 計時器字體強化（tabular-nums、大字、閃爍）| CSS | 30min |
| P1 | 任務狀態單擊快速切換（quickToggleTaskStatus）| JS | 1h |
| P1 | Mission 計時器升級（倒數 + 正計時切換）| JS | 1.5h |
| P2 | 賽中事件流（missionEventLog + addMissionEvent）| JS | 1h |
| P2 | ROV 狀態燈（cycleROVStatus）| HTML + JS | 30min |
| P2 | 離線本機備份層（localStorage 30s 快照）| JS | 1h |

---

## 五、不改動的部分（v15 保留）

以下功能完整保留，**Cursor 不要動這些**：

- Supabase 連線邏輯（`loadFromSupabase`、`detectOptionalSupabaseFeatures`）
- `state` 物件結構（只新增 `missionEventLog`，不修改現有欄位）
- `DEFAULT_*` 預設資料
- 備戰中心（`#page-prep`）的全部功能
- 甘特圖（`#page-gantt`）
- 成員管理（`#page-members`）
- 觀摩記錄（`#page-intel`）
- 備忘錄（`#page-notes`）
- 總覽儀表板（`#page-dashboard`）
- 備賽設備清單（`#page-checklist`）獨立頁
- 任務策略板（`#page-strategy`）完整保留於 Review 模式
- 賽季切換（`switchSeason`）
- 所有匯出函式（CSV / XLSX / 列印）
- Float Packet 分析工具
- DB 設定 Modal

---

## 六、備賽設備清單（給 Cursor 驗收）

改完後請逐項確認：

- [ ] 進入比賽模式時，`body` 自動加上 `competition-focus` class，頁面變深色
- [ ] 頂部狀態列固定置頂，不隨頁面捲動
- [ ] 計時器數字在 768px 以上螢幕最小 48px
- [ ] ROV 狀態燈可點擊循環切換 4 種狀態
- [ ] 任務卡片從 `state.strategy` 動態生成（策略板為空時顯示提示）
- [ ] 任務卡的 ✓ / ✗ 按鈕觸控面積 ≥ 44×44px
- [ ] 儲存本輪後，資料出現在 `state.missionRuns` 及計分板（Review 模式）
- [ ] 切換模式時，子頁籤正確顯示/隱藏
- [ ] 退出比賽模式時，`competition-focus` class 被移除
- [ ] 任務狀態 badge 單擊可循環切換，不開 Modal
- [ ] 現有所有 Supabase 寫入功能不受影響

---

## 七、延伸建議（v17 方向）

1. **語音輸入**：整合 `window.SpeechRecognition`，比賽中說「任務二完成，得 20 分」自動填入 `ccc-score`
2. **對手雷達圖**：在 `#page-intel` 新增雷達圖，對比觀摩到的對手與自隊各任務得分分布
3. **策略動態排序器**：根據剩餘計時與當前得分，自動重新排列建議任務執行順序

---

*此規格書基於 ROV_Task_Manager_v15.html 完整分析生成，可直接貼入 Cursor 作為改版指令。*
