
// ????????????????????????????????????????????????????????// ??SUPABASE CONFIG
// ????????????????????????????????????????????????????????const SUPABASE_URL = 'https://funahmlcriyrpqelefah.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bmFobWxjcml5cnBxZWxlZmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MTQ5MjQsImV4cCI6MjA5MzA5MDkyNH0.G6de9ZXI4s-AkyzW5poQwwZEVaoUJvw17cXFj90FP88';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DATA DEFAULTS
const DEFAULT_TASKS = [
  { id:1, name:'Task 1', cat:'High', owner:'A', due:'2026-04-29', status:'敺齒', note:'' },
  { id:2, name:'Task 2', cat:'High', owner:'B', due:'2026-04-30', status:'敺齒', note:'' },
  { id:3, name:'Task 3', cat:'Mid', owner:'A', due:'2026-05-01', status:'敺齒', note:'' },
  { id:4, name:'Task 4', cat:'Mid', owner:'C', due:'2026-05-02', status:'敺齒', note:'' },
  { id:5, name:'Task 5', cat:'Low', owner:'D', due:'2026-05-04', status:'敺齒', note:'' },
  { id:6, name:'Presentation deck', cat:'Doc', owner:'E', due:'2026-05-04', status:'敺齒', note:'' },
  { id:7, name:'Mission prep', cat:'Mission', owner:'F', due:'2026-05-02', status:'敺齒', note:'' }
];

const DEFAULT_MEMBERS = [
  { name:'A', role:'Pilot', canada:'Y', tasks:['Task 1','Task 2'], note:'' },
  { name:'B', role:'Engineer', canada:'Y', tasks:['Task 3'], note:'' },
  { name:'C', role:'Docs', canada:'Y', tasks:['Task 4'], note:'' },
  { name:'D', role:'Ops', canada:'Y', tasks:['Task 5'], note:'' },
  { name:'E', role:'Presentation', canada:'Y', tasks:['Presentation deck'], note:'' },
  { name:'F', role:'Mission', canada:'Y', tasks:['Mission prep'], note:'' }
];

const DEFAULT_CHECKLIST = [
  { sec:'A', secName:'Section A', items:[
    { id:'pa01', text:'Check frame', qty:1, owner:'A', time:'出發前', done:false },
    { id:'pa02', text:'Check motor', qty:1, owner:'B', time:'出發前', done:false }
  ]},
  { sec:'B', secName:'Section B', items:[
    { id:'pb01', text:'Check battery', qty:1, owner:'D', time:'出發前', done:false }
  ]}
];

const DEFAULT_PREDIVE_CHECKLIST = [
  { sec:'A', secName:'Pre-Dive A', items:[
    { id:'a1', text:'Power test', qty:1, owner:'A', time:'5 min', done:false },
    { id:'a2', text:'Connector test', qty:1, owner:'B', time:'5 min', done:false }
  ]},
  { sec:'B', secName:'Pre-Dive B', items:[
    { id:'b1', text:'Safety test', qty:1, owner:'C', time:'0 min', done:false }
  ]}
];

const DEFAULT_INTEL = [
  { id:1, team:'Team A', recorder:'E', cat:'Presentation', what:'Prep summary', why:'Need alignment', how:'Use checklist', action:'Review deck', status:'敺齒' },
  { id:2, team:'Team B', recorder:'B', cat:'ROV', what:'Mission prep', why:'Reduce risk', how:'Short drills', action:'Review prep', status:'敺齒' }
];

const DEFAULT_STRATEGY = [
  { id:1, name:'Mission drill', score:40, difficulty:3, risk:2, seconds:120, note:'' },
  { id:2, name:'Stability drill', score:25, difficulty:2, risk:1, seconds:70, note:'' },
  { id:3, name:'Presentation drill', score:50, difficulty:5, risk:4, seconds:180, note:'' }
];

const DEFAULT_PRACTICE_RUNS = [
  { id:1, run_date:'2026-05-01', pilot:'A', score:80, seconds:520, faults:4, note:'Initial run' },
  { id:2, run_date:'2026-05-02', pilot:'A', score:105, seconds:470, faults:2, note:'Improved run' }
];

const DEFAULT_MISSION_RUNS = [
  { id:1, run_date:'2026-05-02', round_name:'Practice R1', pilot:'A', missions:'Task set', gross_score:120, penalty:15, seconds:480, faults:3, success_rate:70, video_url:'', score_items:[], note:'Baseline run' }
];

const DEFAULT_GEAR_ITEMS = [
  { id:1, name:'Gear 1', cat:'Pack', box:'A', owner:'A', status:'未打包' },
  { id:2, name:'Gear 2', cat:'Pack', box:'B', owner:'B', status:'未打包' },
  { id:3, name:'Gear 3', cat:'Critical', box:'C', owner:'C', status:'未打包' },
  { id:4, name:'Gear 4', cat:'Critical', box:'D', owner:'D', status:'未打包' },
  { id:5, name:'Gear 5', cat:'Support', box:'E', owner:'E', status:'未打包' }
];

const DEFAULT_PRESENTATION_RUNS = [
  { id:1, run_date:'2026-05-02', speaker:'E', structure_score:8, technical_score:8, delivery_score:7, qa_score:6, comment:'Baseline', next_action:'Review 10 Q&A' }
];

const COMPETITION_FLOW_STEPS = ['Prep','Checklist','Pre-Dive','Mission Run','Review'];
const COMPETITION_FLOW_DETAILS = {
  'Prep': { owner:'Team', detail:'Align roles and priorities.', checks:['Assign owner','Confirm timing','Review tools'] },
  'Checklist': { owner:'Ops', detail:'Clear required items before start.', checks:['ROV ready','Gear ready','Docs ready'] },
  'Pre-Dive': { owner:'Ops', detail:'Complete pre-dive checks.', checks:['Checklist complete','Safety ready','Log ready'] },
  'Mission Run': { owner:'Pilot', detail:'Execute mission run and score.', checks:['Run started','Data recorded','Result reviewed'] },
  'Review': { owner:'Coach', detail:'Close the loop and define next actions.', checks:['Run reviewed','Issues logged','Next drill defined'] }
};

const MISSION_SCORE_TEMPLATES = {
  general: {
    label:'General Mission',
    station:'Mission',
    items:[
      { id:'sample', label:'Sample', score:40, type:'score' },
      { id:'deploy', label:'Deploy', score:30, type:'score' },
      { id:'position', label:'Position', score:25, type:'score' },
      { id:'recover', label:'Recover', score:25, type:'score' },
      { id:'presentation_bonus', label:'Presentation bonus', score:10, type:'score' },
      { id:'collision', label:'Collision', score:-5, type:'penalty' },
      { id:'timeout', label:'Timeout', score:-10, type:'penalty' },
      { id:'missed_target', label:'Missed target', score:-15, type:'penalty' }
    ]
  },
  mateFloats: {
    label:'MATE Floats',
    station:'Ice Tank',
    items:[
      { id:'pre_dive_packet', label:'Pre-dive packet', score:5, type:'score' },
      { id:'p1_25m_hold', label:'Profile 1 hold 2.5m', score:5, type:'score' },
      { id:'p1_40cm_hold', label:'Profile 1 hold 40cm', score:5, type:'score' },
      { id:'p2_25m_hold', label:'Profile 2 hold 2.5m', score:5, type:'score' },
      { id:'p2_40cm_hold', label:'Profile 2 hold 40cm', score:5, type:'score' },
      { id:'all_packets', label:'Transmit all packets', score:10, type:'score' },
      { id:'one_packet', label:'Transmit one packet', score:5, type:'score' },
      { id:'depth_graph', label:'Depth graph', score:10, type:'score' },
      { id:'mate_data_graph', label:'MATE graph', score:10, type:'score' }
    ]
  }
};

const FLOAT_CHECKLIST_TEMPLATE = {
  sec:'F',
  secName:'Float / Non-ROV Device',
  items:[
    { id:'float-ubolt', text:'Float #310 U-bolt / recovery ring', qty:1, owner:'D', time:'出發前', done:false },
    { id:'float-battery-packs', text:'Battery packs', qty:2, owner:'D', time:'出發前', done:false },
    { id:'float-chargers', text:'Float chargers', qty:1, owner:'D', time:'出發前', done:false },
    { id:'float-fuses', text:'Blade fuses + holder', qty:1, owner:'D', time:'出發前', done:false },
    { id:'float-pressure-sensor', text:'Pressure sensor', qty:1, owner:'F', time:'出發前', done:false },
    { id:'float-receiver', text:'Mission station receiver', qty:1, owner:'F', time:'出發前', done:false },
    { id:'float-cables', text:'Cables', qty:1, owner:'F', time:'出發前', done:false },
    { id:'float-laptop', text:'Data laptop', qty:1, owner:'F', time:'出發前', done:false },
    { id:'float-doc004', text:'DOC-004 data packet log', qty:1, owner:'C', time:'出發前', done:false },
    { id:'float-field-kit', text:'Field kit', qty:1, owner:'Ops', time:'出發前', done:false }
  ]
};

const FLOAT_MISSION_FLOW = [
  { step:'Launch', note:'Set up mission station and begin data collection.' },
  { step:'Profile 1', note:'Hold 2.5m and 40cm for 30 seconds.' },
  { step:'Profile 2', note:'Repeat at 2.27-2.83m and 0.07-0.73m windows.' },
  { step:'Transmit', note:'Send all data packets.' },
  { step:'Review', note:'Close with graph and next actions.' }
];

// STATE
// ????????????????????????????????????????????????????????// STATE
// ????????????????????????????????????????????????????????let state = { tasks: [], members: [], checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST)), prediveChecklist: JSON.parse(JSON.stringify(DEFAULT_PREDIVE_CHECKLIST)), intel: [], notes: '', attachments: [], strategy: [], practiceRuns: [], missionRuns: [], gearItems: [], presentationRuns: [] };
let taskSort = { col: 'due', dir: 1 };
let taskQuickFilter = '';
let chartInstances = {};
let taskSchema = { depends_on: false, sort_order: false, deleted_at: false, season: false };
let optionalSchema = { membersSeason: false, intelSeason: false, intelExtras: false, auditLog: false, strategy: false, strategySeason: false, practiceRuns: false, practiceSeason: false, missionRuns: false, missionSeason: false, missionExtras: false, missionScoreItems: false };
const SEASON_SCHEMA_TABLES = [
  { tbl:'tasks', label:'隞餃?', recommended:true, active:true },
  { tbl:'members', label:'?', recommended:true, active:true },
  { tbl:'intel', label:'閫?抵???, recommended:true, active:true },
  { tbl:'checklist_items', label:'?魚閮剖?皜', recommended:false, active:false },
  { tbl:'predive_checklist_items', label:'Pre-Dive Checklist', recommended:false, active:false },
  { tbl:'notes', label:'??', recommended:false, active:false },
  { tbl:'quotes', label:'?毀?', recommended:false, active:false },
  { tbl:'task_attachments', label:'隞餃??辣', recommended:false, active:false },
  { tbl:'audit_log', label:'??甇瑕', recommended:false, active:false },
  { tbl:'strategy_items', label:'蝑??, recommended:true, active:true },
  { tbl:'practice_runs', label:'蝺渡?蝝??, recommended:true, active:true },
  { tbl:'mission_runs', label:'Mission Run', recommended:true, active:true }
];
let attachmentsAvailable = false;
let currentPage = 'dashboard';
let currentMode = 'review';
let currentPrepView = localStorage.getItem('rov_prep_view') || 'all';
let lastPageByMode = { review:'dashboard', prep:'prep', competition:'competition' };
let currentSeason = localStorage.getItem('rov_current_season') || '2025-2026';
let selectedTaskIds = new Set();
let dirtyFlags = { dashboard:true, prep:true, competition:true, 'competition-flow':true, 'competition-contacts':true, 'competition-float':true, scoreboard:true, strategy:true, tasks:true, checklist:true, 'predive-checklist':true, gantt:true, presentation:true, members:true, intel:true, notes:true };
let sortableInstances = { tasks: null, checklist: [], prediveChecklist: [] };
let isInitialLoading = true;
let editingChecklistItemId = null;
let editingPrediveChecklistItemId = null;
let competitionCountdownTimer = null;
let competitionRunState = safeJsonParse(localStorage.getItem('rov_competition_run_state_' + currentSeason), {});
let competitionQuickScoreDirty = false;
let competitionSnapshotRestoreInfo = null;
let pendingMissionRunSyncing = false;
let missionEventLog = [];

const SYSTEM_BACKUP_HISTORY_KEY = 'rov_system_backup_history';
const SYSTEM_EVENT_LOG_KEY = 'rov_system_event_log';
const SYSTEM_LOAD_DIAG_KEY = 'rov_system_load_diagnostics';
const SYSTEM_LAST_FIX_REPORT_KEY = 'rov_last_auto_fix_report';
const TASK_HISTORY_KEY = 'rov_task_change_history';
const AUTO_BACKUP_LAST_KEY = 'rov_auto_backup_last_at';
const AUTO_BACKUP_CHANGE_KEY = 'rov_auto_backup_change_count';
const AUTO_BACKUP_INTERVAL_MS = 30 * 60 * 1000;
const AUTO_BACKUP_CHANGE_THRESHOLD = 5;
const TRAINING_ITEMS_KEY_PREFIX = 'rov_training_items_';
const LAST_PRE_IMPORT_BACKUP_KEY = 'rov_last_pre_import_backup';
const FRONTEND_ERROR_LOG_KEY = 'rov_frontend_error_log';
const SMOKE_TEST_LOG_KEY = 'rov_smoke_test_log';
const OWNER_SETTINGS_KEY_PREFIX = 'rov_owner_settings_';
const MAX_SYSTEM_BACKUP_HISTORY = 5;
const MAX_SYSTEM_EVENT_LOG = 30;
const CHANGELOG_ITEMS = [
  { version:'v2.31.54', date:'2026-05-04', title:'?啣?銵典鞎痊鈭箔????, items:['隞餃???遙?遙?底?鞈hecklist?re-Dive ??Mission Run ??鞎砌犖 / ???雿?其???柴?,'銝??賊??????∪??虜?典?蝯?隞亙?隞餃??鞈?皜銝剖歇?箇??鞎砌犖??] },
  { version:'v2.31.53', date:'2026-05-04', title:'隞餃???閬＊蝷箇移蝪?, items:['隞餃??亙熒??蝘駁摨?內?伐?靽??暹??憛????7 ?亙敹急蝭拚??,'鞎痊鈭箏極雿??寞??舀?蒂?身撅?嚗?蝵桐遙?憛?????銝?憿舐內蝛箇???摮?] },
  { version:'v2.31.52', date:'2026-05-04', title:'隞餃??宏?日??冽?雿?', items:['隞餃?蝞∠????＊蝷箇絞銝??????踹??????箇隞餃????翰?瑟???,'靽?隞餃????祉?撌乩??啗??憛?閬祟?詨??憓遙??雿?] },
  { version:'v2.31.51', date:'2026-05-04', title:'Presentation ?餈?3 甈∪?頞典', items:['Presentation 瞍毀頞典?啣??餈?3 甈∪?頞典?憛?,'蝯???銵”?&A ? ??/ ??/ ??憿舐內?餈?蝺湔????撟喋?] },
  { version:'v2.31.50', date:'2026-05-04', title:'憭批????冽?雿?蝯曹?', items:['憭批??憓絞銝?????撌阡??璅??葉???閬?翰?瑟?雿?,'撌脣??典?“蝮質汗???唬葉敹遙?resentation???～ission Run??鞈賣??桐葉敹hecklist ??Pre-Dive Checklist??] },
  { version:'v2.31.49', date:'2026-05-04', title:'?閫閬?', items:['??憓??脰?????Pilot?極蝔resentation??????蝯?,'閫閬??????銵??祟?詨?甇伐?暺?? chip ?舐?仿脣蝺刻摩??] },
  { version:'v2.31.48', date:'2026-05-04', title:'?撣??箇??芸?', items:['?啣?蝯曹??∠? header / actions / ?瑁”?潭見撘?霈???典蝬剜?撌行?憿??????,'Dashboard 蝺乩遙?”?遙???渲”?潦resentation 瞍毀閮??ission Run 閰喟敦銵具毀蝧隅?Ｚ”?寞????芸??底蝝啗”?潭??,'Checklist ??Pre-Dive ?之?楊頛臬極?瑟??details ?箇?嚗?璈??芸?靽????翰?瑟???] },
  { version:'v2.31.47', date:'2026-05-04', title:'?“?勗??撘瑕?', items:['?“璅∪??勗??鋆??祇勗???望憓暹??憛? Mission Run ?脫郊/?甇仿＊蝷箝?,'銴ˊ?勗???寞??舐?亥票蝯西葦???∠??澆?嚗???Mission Run ??啣??詻?甈∪??貉??脫郊/?甇亦???] },
  { version:'v2.31.46', date:'2026-05-04', title:'Presentation 瞍毀頞典', items:['Presentation ??頞典?⊥??蝺渲隅?Ｕ捱蝑?選??Ⅱ憿舐內??啁蜇??撘梢???甈⊥?閰脩毀隞暻潦?,'?啣?蝯???銵”?&A ???璇?霈?Presentation 銝?航??”嚗??賜?交??箔?銝甈∟?蝺湔??] },
  { version:'v2.31.45', date:'2026-05-04', title:'隞餃?蝭拚??蝵株矽??, items:['隞餃??祟?貉????宏?啣?蝵桐遙?憛?閬?敺?霈??Ｗ?憿舐內?餃??斗嚗??脰?蝭拚??撠憓?箄??寥??臬??,'靽????filter ??雿???ID嚗?蔣?踵??撠翰?祟?貉??臬???] },
  { version:'v2.31.44', date:'2026-05-04', title:'隞餃??Ｘ?身撅?', items:['隞餃???撌乩??啗????芸???雿??寞??舀??憛?銝阡?閮剖???,'靽? task-workbench-panel ??task-priority-panel ?? ID嚗?蔣?踵?葡??] },
  { version:'v2.31.43', date:'2026-05-04', title:'隞餃?撌乩??啗??撥??, items:['隞餃???撌乩??啗????隞餃????嚗脤????啣?颲艾脰?銝准憛?/ ?暹?銝???,'靽??隞餃?銵冽?其??對?撌乩??啗?鞎祆??交?莎?銵冽鞎痊摰蝞∠????雿?] },
  { version:'v2.31.42', date:'2026-05-04', title:'閫鈭斗?∠宏?單??⊿?', items:['閫鈭斗?∪??銝剖?閰喟敦撌亙蝘餃???摨嚗?鈭斗鞈?頝??∟???典?銝?極雿???,'???render ??甇亙?唬漱?亙嚗蒂靽? handoff-cards ?? ID??] },
  { version:'v2.31.41', date:'2026-05-04', title:'?銝剖?銝惜?惜', items:['?銝剖??寞?銝惜鞈??嗆?嚗洵銝撅支??亦蜇??堆?蝚砌?撅支??乩??啜??亦撩??? Mission Run 皞?摨佗?蝚砌?撅斗蝝???鞈?鈭斗閰喟敦撌亙??,'靽???????頛?ID嚗隞?render 敺???蝵殷???????鞈?霈?仃??憸券??] },
  { version:'v2.31.40', date:'2026-05-04', title:'隞?阡?璅∪?', items:['?銝剖?蝚砌?撅斗憓??亦暺芋撘??葉隞敹?隞餃??憛?蝺渲? Presentation 銝?甇乓?,'?阡??⊥?港??菔歲頧遙?憛祟?詻?蝺湧???Presentation 閰?銵剁?皜?蝡?敺鞈?????] },
  { version:'v2.31.39', date:'2026-05-04', title:'撣????唳?蝔??, items:['?銝剖???惜?箇?嚗????蜇???亦蜇??啗?隞?蝻箏?函洵銝撅扎?,'隞餃??憓極雿閬?嚗?銝剖?颲艾脰?銝准憛??暹?隞餃??翰????雿?,'Presentation ?憓隅?Ｗ嚗＊蝷箸??啁蜇??銝活霈???撘梁雁摨西?銝?甇乓?,'?“蝮質汗?啣??勗????鋆賣????嫣噶蝡?敺???憓暹??憛???,'瘥魚璅∪? Float 鋆?內??Data Packet 瑼Ｘ?冽?箸??憛???瘥魚?撟脫??] },
  { version:'v2.31.38', date:'2026-05-04', title:'蝟餌絞蝝??, items:['隞蝮賣??桀?葉憿舐內銝?甇乓??啁撩??ission Run 皞?摨西?蝡??賢??,'?啣??芸? smoke test嚗炎?乩蜓閬??Ｚ??詨? DOM ??暺?,'?啣??垢?航炊餈質馱嚗?銝剛???window error ??Promise rejection??,'?湔隤芣??啣?鞈?撽????唳?閬?] }
];

const COMPETITOR_SCORE_AXES = [
  { key:'T1', label:'Task 1 Seabed', max:85, templates:['seabed2030'] },
  { key:'T2', label:'Task 2 SmartAtlantic', max:135, templates:['smartAtlantic','smartAtlanticOeb'] },
  { key:'T3', label:'Task 3 Wind Platform', max:60, templates:['windPlatform'] },
  { key:'T4', label:'Task 4 MATE Floats', max:70, templates:['mateFloats'] }
];

const MODE_CONFIG = {
  prep: {
    defaultPage:'prep',
    pages:[
      { id:'prep', label:'?銝剖?' },
      { id:'tasks', label:'隞餃?' },
      { id:'gantt', label:'??? },
      { id:'presentation', label:'Presentation' },
      { id:'members', label:'?' },
      { id:'checklist', label:'?魚閮剖?皜' },
      { id:'notes', label:'??' }
    ]
  },
  competition: {
    defaultPage:'competition',
    pages:[
      { id:'competition', label:'鞈賢?銝剖?' },
      { id:'competition-flow', label:'鞈賢?瘚?' },
      { id:'competition-contacts', label:'?湧?鞎痊鈭? },
      { id:'competition-float', label:'Float 鋆?內' },
      { id:'scoreboard', label:'鞈賢?蝯梯?' },
      { id:'predive-checklist', label:'Pre-Dive Checklist' }
    ]
  },
  review: {
    defaultPage:'dashboard',
    pages:[
      { id:'dashboard', label:'蝮質汗' },
      { id:'strategy', label:'蝑' },
      { id:'intel', label:'閫?抵??? },
      { id:'scoreboard', label:'頞典/鞈賢??勗?' }
    ]
  }
};

function setTaskSort(col) {
  if (taskSort.col === col) { taskSort.dir *= -1; }
  else { taskSort.col = col; taskSort.dir = 1; }
  renderTasks();
}

function applySortIcons() {
  ['name','cat','owner','start_date','due','status'].forEach(c => {
    const el = document.getElementById('sort-icon-' + c);
    if (!el) return;
    if (taskSort.col === c) { el.textContent = taskSort.dir === 1 ? ' ?? : ' ??; el.style.color = 'var(--blue)'; }
    else { el.textContent = ' ??; el.style.color = '#ccc'; }
  });
}
let editingTaskId = null;
let editingMemberId = null;
let memberTaskItems = []; // temp list while editing member modal

function saveAll() {}

function safeJsonParse(raw, fallback = null) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch(e) {
    return fallback;
  }
}

function getAppCacheKey() {
  return 'rov_boot_cache_' + currentSeason;
}

function restoreBootCache() {
  const cached = safeJsonParse(localStorage.getItem(getAppCacheKey()), null);
  if (!cached?.state) return false;
  state = {
    ...state,
    ...cached.state,
    checklist: cached.state.checklist || state.checklist,
    prediveChecklist: cached.state.prediveChecklist || state.prediveChecklist
  };
  state.tasks = (state.tasks || []).map(normalizeTask);
  markAllDirty();
  return true;
}

function saveBootCache() {
  const payload = {
    ts: Date.now(),
    state: {
      tasks: state.tasks,
      members: state.members,
      checklist: state.checklist,
      prediveChecklist: state.prediveChecklist,
      intel: state.intel,
      notes: state.notes,
      attachments: state.attachments,
      strategy: state.strategy,
      practiceRuns: state.practiceRuns,
      missionRuns: state.missionRuns,
      gearItems: state.gearItems,
      presentationRuns: state.presentationRuns,
      quotes: state.quotes
    }
  };
  try { localStorage.setItem(getAppCacheKey(), JSON.stringify(payload)); } catch(e) {}
}

// ????????????????????????????????????????????????????????// SUPABASE LOAD
// ????????????????????????????????????????????????????????async function loadFromSupabase() {
  const loadStartedAt = performance.now();
  const loadDiag = createLoadDiagnostics();
  await detectOptionalSupabaseFeatures();
  // ?? TASKS ??
  try {
    let query = db.from('tasks').select('*');
    if (taskSchema.season) query = query.eq('season', currentSeason);
    if (taskSchema.deleted_at) query = query.is('deleted_at', null);
    query = query.order(taskSchema.sort_order ? 'sort_order' : 'id', { ascending: true });
    let td = await fetchPagedRows(query);
    if (!td || td.length === 0) {
      const seeds = DEFAULT_TASKS.map((t, i) => ({
        name:t.name, cat:t.cat, owner:t.owner, due:t.due||null, status:t.status, note:t.note||'',
        ...(taskSchema.season ? { season: currentSeason } : {}),
        ...(taskSchema.sort_order ? { sort_order: i + 1 } : {})
      }));
      const { error: ie } = await db.from('tasks').insert(seeds);
      if (ie) throw ie;
      let reload = db.from('tasks').select('*');
      if (taskSchema.season) reload = reload.eq('season', currentSeason);
      if (taskSchema.deleted_at) reload = reload.is('deleted_at', null);
      const { data: re } = await reload.order(taskSchema.sort_order ? 'sort_order' : 'id', { ascending: true });
      state.tasks = re || DEFAULT_TASKS;
    } else { state.tasks = td; }
    setLoadDiagTable(loadDiag, 'tasks', 'db', state.tasks.length);
  } catch(e) {
    console.warn('?? tasks fallback to default:', e.message);
    logSystemEvent('error', 'tasks 頛憭望?嚗歇雿輻?身鞈?', e.message);
    state.tasks = DEFAULT_TASKS.map((t,i) => ({...t, id:i+1}));
    setLoadDiagTable(loadDiag, 'tasks', 'default', state.tasks.length, e.message);
  }
  state.tasks = state.tasks.map(normalizeTask);

  // ?? TASK ATTACHMENTS ??
  if (attachmentsAvailable) {
    try {
      const { data: ad, error: ae } = await db.from('task_attachments').select('*').order('created_at', { ascending: false });
      if (ae) throw ae;
      state.attachments = ad || [];
      setLoadDiagTable(loadDiag, 'task_attachments', 'db', state.attachments.length);
    } catch(e) {
      console.warn('?? task attachments fallback:', e.message);
      logSystemEvent('warn', '隞餃??辣頛憭望?', e.message);
      state.attachments = [];
      attachmentsAvailable = false;
      setLoadDiagTable(loadDiag, 'task_attachments', 'error', 0, e.message);
    }
  } else {
    setLoadDiagTable(loadDiag, 'task_attachments', 'skipped', 0, '?辣銵冽? Storage ?芸???);
  }

  // ?? MEMBERS ??
  try {
    let memberQuery = db.from('members').select('*');
    if (optionalSchema.membersSeason) memberQuery = memberQuery.eq('season', currentSeason);
    let { data: md, error: me } = await memberQuery.order('id');
    if (me) throw new Error('霈?仃??' + me.message);
    if (!md || md.length === 0) {
      const seeds = DEFAULT_MEMBERS.map(m => ({
        name:m.name, role:m.role, canada:m.canada,
        tasks:JSON.stringify(m.tasks), note:m.note||'',
        ...(optionalSchema.membersSeason ? { season: currentSeason } : {})
      }));
      const { error: ie } = await db.from('members').insert(seeds);
      if (ie) {
        const msg = ie.message||'';
        if (msg.includes('row-level security') || msg.includes('RLS') || msg.includes('policy')) {
          throw new Error('RLS ?餅?撖怠 ??隢????DB 閮剖???鋆?SQL ??RLS policy 畾菔嚗 Supabase SQL Editor ?瑁?');
        }
        throw new Error('?啣??身鞈?憭望?嚗? + msg);
      }
      let reloadMembers = db.from('members').select('*');
      if (optionalSchema.membersSeason) reloadMembers = reloadMembers.eq('season', currentSeason);
      const { data: re } = await reloadMembers.order('id');
      state.members = (re || []).map(parseMemberTasks);
    } else { state.members = md.map(parseMemberTasks); }
    setLoadDiagTable(loadDiag, 'members', 'db', state.members.length);
    setMemberDbStatus('ok');
  } catch(e) {
    console.warn('?? members fallback to default:', e.message);
    logSystemEvent('error', 'members 頛憭望?嚗歇雿輻?身鞈?', e.message);
    state.members = DEFAULT_MEMBERS.map((m,i) => parseMemberTasks({...m, id:i+1, tasks:JSON.stringify(m.tasks)}));
    setLoadDiagTable(loadDiag, 'members', 'default', state.members.length, e.message);
    setMemberDbStatus('error', e.message);
  }

  // ?? INTEL ??
  try {
    let intelQuery = db.from('intel').select('*');
    if (optionalSchema.intelSeason) intelQuery = intelQuery.eq('season', currentSeason);
    let { data: id2, error: ie } = await intelQuery.order('id');
    if (ie) throw ie;
    if (!id2 || id2.length === 0) {
      const seeds = DEFAULT_INTEL.map(i => ({
        team:i.team, recorder:i.recorder, cat:i.cat, what:i.what, why:i.why, how:i.how, action:i.action, status:i.status,
        ...(optionalSchema.intelSeason ? { season: currentSeason } : {})
      }));
      const { error: se } = await db.from('intel').insert(seeds);
      if (se) throw se;
      let reloadIntel = db.from('intel').select('*');
      if (optionalSchema.intelSeason) reloadIntel = reloadIntel.eq('season', currentSeason);
      const { data: re } = await reloadIntel.order('id');
      state.intel = re || DEFAULT_INTEL;
    } else { state.intel = id2; }
    setLoadDiagTable(loadDiag, 'intel', 'db', state.intel.length);
  } catch(e) {
    console.warn('?? intel fallback to default:', e.message);
    logSystemEvent('warn', 'intel 頛憭望?嚗歇雿輻?身鞈?', e.message);
    state.intel = DEFAULT_INTEL.map((x,i) => ({...x, id:i+1}));
    setLoadDiagTable(loadDiag, 'intel', 'default', state.intel.length, e.message);
  }

  // ?? CHECKLIST ??
  try {
    let { data: cd, error: ce } = await db.from('checklist_items').select('*').order('order_index');
    if (ce) throw ce;
    if (!cd || cd.length === 0) {
      const seeds = getDefaultChecklistSeedRows();
      const { error: se } = await db.from('checklist_items').insert(seeds);
      if (se) throw se;
      const { data: re } = await db.from('checklist_items').select('*').order('order_index');
      rebuildChecklist(re || []);
      queueObsoleteChecklistCleanup();
    } else {
      const syncedChecklist = await syncDefaultChecklistRows(cd);
      rebuildChecklist(syncedChecklist);
      queueObsoleteChecklistCleanup();
    }
    setLoadDiagTable(loadDiag, 'checklist_items', 'db', state.checklist.reduce((sum, sec) => sum + (sec.items || []).length, 0));
  } catch(e) {
    console.warn('?? checklist fallback to default:', e.message);
    state.checklist = loadLocalChecklist();
    setLoadDiagTable(loadDiag, 'checklist_items', 'local', state.checklist.reduce((sum, sec) => sum + (sec.items || []).length, 0), e.message);
  }

  // ?? PRE-DIVE CHECKLIST嚗?鞈賣芋撘???
  try {
    let { data: pd, error: pe } = await db.from('predive_checklist_items').select('*').order('order_index');
    if (pe) throw pe;
    if (!pd || pd.length === 0) {
      const seeds = checklistSectionsToSeedRows(DEFAULT_PREDIVE_CHECKLIST);
      const { error: se } = await db.from('predive_checklist_items').insert(seeds);
      if (se) throw se;
      const { data: re } = await db.from('predive_checklist_items').select('*').order('order_index');
      rebuildPrediveChecklist(re || []);
    } else {
      const synced = await syncPrediveDefaultRows(pd);
      rebuildPrediveChecklist(synced);
    }
    setLoadDiagTable(loadDiag, 'predive_checklist_items', 'db', state.prediveChecklist.reduce((sum, sec) => sum + (sec.items || []).length, 0));
  } catch(e) {
    console.warn('?? predive checklist fallback:', e.message);
    state.prediveChecklist = loadLocalPrediveChecklist();
    setLoadDiagTable(loadDiag, 'predive_checklist_items', 'local', state.prediveChecklist.reduce((sum, sec) => sum + (sec.items || []).length, 0), e.message);
  }

  // ?? NOTES ??
  try {
    const { data: nd } = await db.from('notes').select('content').eq('id', 1).single();
    if (nd) state.notes = nd.content || '';
    setLoadDiagTable(loadDiag, 'notes', nd ? 'db' : 'local', nd ? 1 : 0, nd ? '' : 'notes ?∟???靽??祆?/?身?批捆');
  } catch(e) {
    console.warn('?? notes fallback:', e.message);
    setLoadDiagTable(loadDiag, 'notes', 'local', state.notes ? 1 : 0, e.message);
  }

  // ?? QUOTES ??
  try {
    const { data: qd, error: qe } = await db.from('quotes').select('*').order('order_index');
    if (qe) throw qe;
    if (!qd || qd.length === 0) {
      const seeds = DEFAULT_QUOTES.map((t,i) => ({ text:t, order_index:i }));
      const { error: qi } = await db.from('quotes').insert(seeds);
      if (qi) throw qi;
      const { data: qr } = await db.from('quotes').select('*').order('order_index');
      state.quotes = (qr||[]).map(q=>({ id:q.id, text:q.text }));
    } else {
      state.quotes = qd.map(q=>({ id:q.id, text:q.text }));
    }
    setLoadDiagTable(loadDiag, 'quotes', 'db', state.quotes.length);
  } catch(e) {
    console.warn('?? quotes fallback:', e.message);
    if (!state.quotes || !state.quotes.length || state.quotes.some(q=>!q.text))
      state.quotes = DEFAULT_QUOTES.map((t,i)=>({ id:i+1, text:t }));
    setLoadDiagTable(loadDiag, 'quotes', 'default', state.quotes.length, e.message);
  }

  // ?? STRATEGY BOARD ??
  try {
    if (optionalSchema.strategy) {
      let q = db.from('strategy_items').select('*');
      if (optionalSchema.strategySeason) q = q.eq('season', currentSeason);
      const { data, error } = await q.order('sort_order');
      if (error) throw error;
      state.strategy = (data && data.length) ? data : loadLocalStrategy();
      setLoadDiagTable(loadDiag, 'strategy_items', data && data.length ? 'db' : 'local', state.strategy.length);
    } else {
      state.strategy = loadLocalStrategy();
      setLoadDiagTable(loadDiag, 'strategy_items', 'skipped', state.strategy.length, 'strategy_items ?芸???);
    }
  } catch(e) {
    console.warn('?? strategy fallback:', e.message);
    state.strategy = loadLocalStrategy();
    setLoadDiagTable(loadDiag, 'strategy_items', 'local', state.strategy.length, e.message);
  }

  // ?? PRACTICE RUNS ??
  try {
    if (optionalSchema.practiceRuns) {
      let q = db.from('practice_runs').select('*');
      if (optionalSchema.practiceSeason) q = q.eq('season', currentSeason);
      const { data, error } = await q.order('run_date');
      if (error) throw error;
      state.practiceRuns = (data && data.length) ? data : loadLocalPracticeRuns();
      setLoadDiagTable(loadDiag, 'practice_runs', data && data.length ? 'db' : 'local', state.practiceRuns.length);
    } else {
      state.practiceRuns = loadLocalPracticeRuns();
      setLoadDiagTable(loadDiag, 'practice_runs', 'skipped', state.practiceRuns.length, 'practice_runs ?芸???);
    }
  } catch(e) {
    console.warn('?? practice fallback:', e.message);
    state.practiceRuns = loadLocalPracticeRuns();
    setLoadDiagTable(loadDiag, 'practice_runs', 'local', state.practiceRuns.length, e.message);
  }

  // ?? MISSION RUNS ??
  try {
    if (optionalSchema.missionRuns) {
      let q = db.from('mission_runs').select('*');
      if (optionalSchema.missionSeason) q = q.eq('season', currentSeason);
      const { data, error } = await q.order('run_date', { ascending: false });
      if (error) throw error;
      state.missionRuns = (data && data.length) ? data : loadLocalMissionRuns();
      setLoadDiagTable(loadDiag, 'mission_runs', data && data.length ? 'db' : 'local', state.missionRuns.length);
    } else {
      state.missionRuns = loadLocalMissionRuns();
      setLoadDiagTable(loadDiag, 'mission_runs', 'skipped', state.missionRuns.length, 'mission_runs ?芸???);
    }
  } catch(e) {
    console.warn('?? mission runs fallback:', e.message);
    state.missionRuns = loadLocalMissionRuns();
    setLoadDiagTable(loadDiag, 'mission_runs', 'local', state.missionRuns.length, e.message);
  }
  mergePendingMissionRunsIntoState();
  if (getPendingMissionRuns().length && optionalSchema.missionRuns) {
    await syncPendingMissionRuns({ silent:true });
  }
  state.gearItems = loadLocalGearItems();
  state.presentationRuns = loadLocalPresentationRuns();
  setLoadDiagTable(loadDiag, 'gear_items', 'local', state.gearItems.length);
  setLoadDiagTable(loadDiag, 'presentation_runs', 'local', state.presentationRuns.length);
  markAllDirty();
  saveBootCache();
  const elapsed = Math.round(performance.now() - loadStartedAt);
  localStorage.setItem('rov_last_load_ms', String(elapsed));
  finishLoadDiagnostics(loadDiag, elapsed);
  console.info(`ROV data sync completed in ${elapsed}ms`);
}

/**
 * 隞?Supabase range ?霈?之?????踹??格活?券?隢??之?? * @param {object} query Supabase query builder?? * @param {number} pageSize 瘥蝑?? * @returns {Promise<Array<object>>} ?蔥敺??? */
async function fetchPagedRows(query, pageSize = 500) {
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await query.range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

/**
 * ?菜葫?舫 DB 甈???隞嗉”嚗????澈?芸?蝝?隞雿輻?箸??? */
async function detectOptionalSupabaseFeatures() {
  const cacheKey = 'rov_schema_cache_v3';
  const cached = safeJsonParse(localStorage.getItem(cacheKey), null);
  if (cached && Date.now() - Number(cached.ts || 0) < 86400000) {
    taskSchema = { ...taskSchema, ...(cached.taskSchema || {}) };
    optionalSchema = { ...optionalSchema, ...(cached.optionalSchema || {}) };
    attachmentsAvailable = Boolean(cached.attachmentsAvailable);
    return;
  }
  const probe = async (table, columns) => {
    try {
      const { error } = await db.from(table).select(columns).limit(1);
      return !error;
    } catch(e) {
      return false;
    }
  };
  try {
    const fields = ['depends_on','sort_order','deleted_at','season'];
    const results = await Promise.all(fields.map(field => probe('tasks', field)));
    fields.forEach((field, index) => { taskSchema[field] = results[index]; });
  } catch(e) {
    taskSchema = { depends_on: false, sort_order: false, deleted_at: false, season: false };
  }
  const checks = await Promise.all([
    probe('members', 'season'),
    probe('intel', 'season'),
    probe('intel', 'tags,photo_url,inspiration'),
    probe('audit_log', 'id'),
    probe('strategy_items', 'id'),
    probe('strategy_items', 'season'),
    probe('practice_runs', 'id'),
    probe('practice_runs', 'season'),
    probe('mission_runs', 'id'),
    probe('mission_runs', 'season'),
    probe('mission_runs', 'success_rate,video_url'),
    probe('mission_runs', 'score_items'),
    probe('task_attachments', 'id')
  ]);
  [
    optionalSchema.membersSeason,
    optionalSchema.intelSeason,
    optionalSchema.intelExtras,
    optionalSchema.auditLog,
    optionalSchema.strategy,
    optionalSchema.strategySeason,
    optionalSchema.practiceRuns,
    optionalSchema.practiceSeason,
    optionalSchema.missionRuns,
    optionalSchema.missionSeason,
    optionalSchema.missionExtras,
    optionalSchema.missionScoreItems,
    attachmentsAvailable
  ] = checks;
  localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), taskSchema, optionalSchema, attachmentsAvailable }));
}

/**
 * 鋆?隞餃??拐辣??豢?雿??踹????? fallback 鞈??? UI ?斗憭望??? * @param {object} task 隞餃?鞈??? * @returns {object} 璅??遙???? */
function normalizeTask(task) {
  return {
    ...task,
    depends_on: task.depends_on ? Number(task.depends_on) : null,
    sort_order: Number(task.sort_order || task.id || 0),
    season: task.season || currentSeason
  };
}

/**
 * 頛?砍蝑??fallback?? * @returns {Array<object>} 蝑??? */
function loadLocalStrategy() {
  try {
    const raw = localStorage.getItem('rov_strategy_' + currentSeason);
    return raw ? JSON.parse(raw) : DEFAULT_STRATEGY.map(x => ({...x, season: currentSeason}));
  } catch(e) {
    return DEFAULT_STRATEGY.map(x => ({...x, season: currentSeason}));
  }
}

/**
 * 靽??砍蝑??fallback?? */
function saveLocalStrategy() {
  localStorage.setItem('rov_strategy_' + currentSeason, JSON.stringify(state.strategy));
}

/**
 * 頛?砍蝺渡?蝝??fallback?? * @returns {Array<object>} 蝺渡?蝝?? */
function loadLocalPracticeRuns() {
  try {
    const raw = localStorage.getItem('rov_practice_' + currentSeason);
    return raw ? JSON.parse(raw) : DEFAULT_PRACTICE_RUNS.map(x => ({...x, season: currentSeason}));
  } catch(e) {
    return DEFAULT_PRACTICE_RUNS.map(x => ({...x, season: currentSeason}));
  }
}

/**
 * 靽??砍蝺渡?蝝??fallback?? */
function saveLocalPracticeRuns() {
  localStorage.setItem('rov_practice_' + currentSeason, JSON.stringify(state.practiceRuns));
}

/**
 * 頛?砍 Mission Run 閮? fallback?? * @returns {Array<object>} Mission Run 蝝?? */
function loadLocalMissionRuns() {
  try {
    const raw = localStorage.getItem('rov_mission_runs_' + currentSeason);
    return raw ? JSON.parse(raw) : DEFAULT_MISSION_RUNS.map(x => ({...x, season: currentSeason}));
  } catch(e) {
    return DEFAULT_MISSION_RUNS.map(x => ({...x, season: currentSeason}));
  }
}

/**
 * 靽??砍 Mission Run 閮? fallback?? */
function saveLocalMissionRuns() {
  localStorage.setItem('rov_mission_runs_' + currentSeason, JSON.stringify(state.missionRuns));
}

function getPendingMissionRuns() {
  try {
    return JSON.parse(localStorage.getItem('rov_mission_runs_pending_' + currentSeason) || '[]');
  } catch(e) {
    return [];
  }
}

function savePendingMissionRuns(rows) {
  localStorage.setItem('rov_mission_runs_pending_' + currentSeason, JSON.stringify(rows));
}

function enqueuePendingMissionRun(run, errorMessage = '') {
  const pending = getPendingMissionRuns();
  const localId = run.local_id || run.id || Date.now();
  const queued = {
    ...run,
    id: localId,
    local_id: localId,
    pending_sync: true,
    pending_error: errorMessage,
    queuedAt: new Date().toISOString()
  };
  savePendingMissionRuns([...pending.filter(item => String(item.local_id || item.id) !== String(localId)), queued]);
  return queued;
}

function mergePendingMissionRunsIntoState() {
  const pending = getPendingMissionRuns();
  if (!pending.length) return;
  const existingIds = new Set(state.missionRuns.map(run => String(run.local_id || run.id)));
  pending.forEach(run => {
    if (!existingIds.has(String(run.local_id || run.id))) state.missionRuns.push(run);
  });
  saveLocalMissionRuns();
}

function buildMissionRunDbPayload(run) {
  const payload = {
    run_date:run.run_date, round_name:run.round_name, pilot:run.pilot,
    missions:run.missions, gross_score:run.gross_score, penalty:run.penalty,
    seconds:run.seconds, faults:run.faults, note:run.note
  };
  if (optionalSchema.missionSeason) payload.season = currentSeason;
  if (optionalSchema.missionExtras) {
    payload.success_rate = run.success_rate;
    payload.video_url = run.video_url;
  }
  if (optionalSchema.missionScoreItems) payload.score_items = run.score_items;
  return payload;
}

/**
 * 頛?砍鞈賢?抵?蝞望??柴? * @returns {Array<object>} ?抵?皜?? */
function loadLocalGearItems() {
  try {
    const raw = localStorage.getItem('rov_gear_' + currentSeason);
    const rows = raw ? JSON.parse(raw) : DEFAULT_GEAR_ITEMS.map(x => ({...x}));
    return rows.map(normalizeGearItem);
  } catch(e) {
    return DEFAULT_GEAR_ITEMS.map(x => normalizeGearItem({...x}));
  }
}

/**
 * 璅??鞈??株?鞈??? * @param {object} item ?抵???? * @returns {object} 璅??鞈??柴? */
function normalizeGearItem(item) {
  const oldStatusAsCat = ['敹葆','?','??].includes(item.status);
  return {
    ...item,
    cat: item.cat || (oldStatusAsCat ? item.status : '敹葆'),
    box: item.box || '',
    status: item.status === '撌脰?蝞? ? '撌脰?蝞? : '?芾?蝞?
  };
}

/**
 * 靽?鞈賢?抵?蝞望??柴? */
function saveLocalGearItems() {
  localStorage.setItem('rov_gear_' + currentSeason, JSON.stringify(state.gearItems));
}

/**
 * 頛?砍 Presentation 瞍毀閰?蝝?? * @returns {Array<object>} Presentation 瞍毀蝝?? */
function loadLocalPresentationRuns() {
  try {
    const raw = localStorage.getItem('rov_presentation_' + currentSeason);
    return raw ? JSON.parse(raw) : DEFAULT_PRESENTATION_RUNS.map(x => ({...x, season: currentSeason}));
  } catch(e) {
    return DEFAULT_PRESENTATION_RUNS.map(x => ({...x, season: currentSeason}));
  }
}

/**
 * 靽??砍 Presentation 瞍毀閰?蝝?? */
function saveLocalPresentationRuns() {
  localStorage.setItem('rov_presentation_' + currentSeason, JSON.stringify(state.presentationRuns));
}

function parseMemberTasks(m) {
  let tasks = m.tasks;
  if (typeof tasks === 'string') {
    try { tasks = JSON.parse(tasks); } catch(e) { tasks = tasks.split('\n').filter(Boolean); }
  }
  if (!Array.isArray(tasks)) tasks = [];
  return { ...m, tasks };
}

/**
 * 甇????鞈質身???格?甇??詻? * @param {unknown} value 隞餅?頛詨?? * @returns {number} ?喳???1 ??? */
function normalizeChecklistQty(value) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * 撠?畾萄?皜頧鞈?銵?seed rows?? * @param {Array<{sec:string,secName:string,items:Array<object>}>} sections ?畾菔??? * @returns {Array<object>} seed rows?? */
function checklistSectionsToSeedRows(sections) {
  const seeds = [];
  let oi = 0;
  sections.forEach(sec => sec.items.forEach(item => {
    seeds.push({
      item_id: item.id,
      sec: sec.sec,
      sec_name: sec.secName,
      text: item.text,
      qty: normalizeChecklistQty(item.qty),
      owner: item.owner,
      time: item.time,
      done: false,
      order_index: oi++
    });
  }));
  return seeds;
}

/**
 * 敺?Supabase 蝘駁撌脩????checklist item_id?? */
async function deleteObsoleteChecklistItemRows() {
  if (!OBSOLETE_CHECKLIST_ITEM_IDS.length) return;
  try {
    const { error } = await db.from('checklist_items').delete().in('item_id', OBSOLETE_CHECKLIST_ITEM_IDS);
    if (error) throw error;
  } catch(e) {
    /* ?Ｙ??甈??蕭??*/
  }
}

function queueObsoleteChecklistCleanup() {
  setTimeout(() => deleteObsoleteChecklistItemRows(), 0);
}

function rebuildChecklist(rows) {
  const map = {};
  rows.forEach(r => {
    if (!map[r.sec]) map[r.sec] = { sec:r.sec, secName:r.sec_name, items:[] };
    map[r.sec].items.push({
      id:r.item_id,
      text:r.text,
      qty:normalizeChecklistQty(r.qty),
      owner:r.owner,
      time:r.time,
      done:r.done
    });
  });
  state.checklist = Object.values(map);
  saveLocalChecklist();
}

/**
 * 撱箇??魚閮剖?皜??閮剛????? * @returns {Array<object>} checklist_items seed rows?? */
function getDefaultChecklistSeedRows() {
  return checklistSectionsToSeedRows(DEFAULT_CHECKLIST);
}

/**
 * 撠?啗????身?畾萄?雿蛛?靽??暸????芾???? * @param {Array<object>|null} source ?Ｘ??畾菔??? * @param {Array<object>} defaultSections DEFAULT_*CHECKLIST?? * @returns {Array<object>} ?蔥敺?畾萸? */
function mergeChecklistSectionsWithDefault(source, defaultSections) {
  const existingItems = new Map();
  const defaultIds = new Set();
  (source || []).forEach(sec => (sec.items || []).forEach(item => existingItems.set(item.id, item)));
  const merged = defaultSections.map(sec => ({
    sec: sec.sec,
    secName: sec.secName,
    items: sec.items.map(item => {
      defaultIds.add(item.id);
      const prev = existingItems.get(item.id);
      return {
        ...item,
        qty: normalizeChecklistQty(prev?.qty ?? item.qty),
        done: Boolean(prev?.done)
      };
    })
  }));
  (source || []).forEach(sec => {
    (sec.items || []).forEach(item => {
      if (defaultIds.has(item.id)) return;
      const target = merged.find(s => s.sec === sec.sec) || (() => {
        const next = { sec: sec.sec, secName: sec.secName, items: [] };
        merged.push(next);
        return next;
      })();
      target.items.push({
        ...item,
        qty: normalizeChecklistQty(item.qty),
        done: Boolean(item.done)
      });
    });
  });
  return merged;
}

/**
 * 撠??Checklist ?蔥?唳??鞈質身???桅?閮剛???靽??暸?閮??柴? * @param {Array<object>} source ?Ｘ? Checklist 鞈??? * @returns {Array<object>} ?蔥敺?Checklist?? */
function mergeChecklistWithDefault(source) {
  return mergeChecklistSectionsWithDefault(source, DEFAULT_CHECKLIST);
}

/**
 * ?郊隞餅? checklist 鞈?銵函??身?? * @param {Array<object>} rows ?暹?鞈??? * @param {string} tableName Supabase 銵典??? * @param {Array<object>} defaultSections ?身?畾萸? * @returns {Promise<Array<object>>} ?郊敺????? */
async function syncChecklistRowsForTable(rows, tableName, defaultSections) {
  const defaults = checklistSectionsToSeedRows(defaultSections);
  const byId = new Map((rows || []).map(row => [row.item_id, row]));
  const defaultIds = new Set(defaults.map(row => row.item_id));
  const syncedDefaults = [];
  const rowsToUpsert = [];

  for (const row of defaults) {
    const existing = byId.get(row.item_id);
    const next = { ...row, done: existing ? Boolean(existing.done) : false };
    syncedDefaults.push(next);
    if (!existing || isChecklistDefaultRowStale(existing, next)) {
      rowsToUpsert.push({
        item_id: next.item_id,
        sec: next.sec,
        sec_name: next.sec_name,
        text: next.text,
        qty: normalizeChecklistQty(next.qty),
        owner: next.owner,
        time: next.time,
        done: next.done,
        order_index: next.order_index
      });
    }
  }

  if (rowsToUpsert.length) {
    try {
      const { error } = await db.from(tableName).upsert(rowsToUpsert, { onConflict:'item_id' });
      if (error) throw error;
    } catch(e) {
      console.warn(`${tableName} default sync saved locally only:`, e.message);
    }
  }

  const customRows = (rows || []).filter(row => !defaultIds.has(row.item_id));
  return [...syncedDefaults, ...customRows].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
}

function isChecklistDefaultRowStale(existing, next) {
  return existing.sec !== next.sec
    || existing.sec_name !== next.sec_name
    || existing.text !== next.text
    || normalizeChecklistQty(existing.qty) !== normalizeChecklistQty(next.qty)
    || (existing.owner || '') !== (next.owner || '')
    || (existing.time || '') !== (next.time || '')
    || Number(existing.order_index || 0) !== Number(next.order_index || 0);
}

/**
 * ?郊 Supabase checklist_items嚗???Pre-Dive ?身??啁?魚?抵?皜?? * @param {Array<object>} rows ?暹? checklist_items rows?? * @returns {Promise<Array<object>>} ?郊敺?rows?? */
async function syncDefaultChecklistRows(rows) {
  return syncChecklistRowsForTable(rows, 'checklist_items', DEFAULT_CHECKLIST);
}

/**
 * ?郊 Supabase predive_checklist_items嚗re-Dive Checklist嚗? * @param {Array<object>} rows ?暹?鞈??? * @returns {Promise<Array<object>>} ?郊敺????? */
async function syncPrediveDefaultRows(rows) {
  return syncChecklistRowsForTable(rows, 'predive_checklist_items', DEFAULT_PREDIVE_CHECKLIST);
}

/**
 * 頛?砍 Checklist fallback?? * @returns {Array<object>} Checklist 鞈??? */
function loadLocalChecklist() {
  try {
    if (localStorage.getItem('rov_checklist_qty_schema') !== CHECKLIST_QTY_SCHEMA) {
      localStorage.setItem('rov_checklist_qty_schema', CHECKLIST_QTY_SCHEMA);
      localStorage.removeItem('rov_checklist_' + currentSeason);
    }
    const raw = localStorage.getItem('rov_checklist_' + currentSeason);
    return raw ? mergeChecklistWithDefault(JSON.parse(raw)) : JSON.parse(JSON.stringify(DEFAULT_CHECKLIST));
  } catch(e) {
    return JSON.parse(JSON.stringify(DEFAULT_CHECKLIST));
  }
}

function rebuildPrediveChecklist(rows) {
  const map = {};
  rows.forEach(r => {
    if (!map[r.sec]) map[r.sec] = { sec:r.sec, secName:r.sec_name, items:[] };
    map[r.sec].items.push({
      id:r.item_id,
      text:r.text,
      qty:normalizeChecklistQty(r.qty),
      owner:r.owner,
      time:r.time,
      done:r.done
    });
  });
  state.prediveChecklist = Object.values(map);
  saveLocalPrediveChecklist();
}

/**
 * 頛?砍 Pre-Dive Checklist fallback?? * @returns {Array<object>} Pre-Dive 鞈??? */
function loadLocalPrediveChecklist() {
  try {
    if (localStorage.getItem('rov_predive_checklist_schema') !== PREDIVE_CHECKLIST_SCHEMA) {
      localStorage.setItem('rov_predive_checklist_schema', PREDIVE_CHECKLIST_SCHEMA);
      localStorage.removeItem('rov_predive_checklist_' + currentSeason);
    }
    const raw = localStorage.getItem('rov_predive_checklist_' + currentSeason);
    return raw ? mergeChecklistSectionsWithDefault(JSON.parse(raw), DEFAULT_PREDIVE_CHECKLIST) : JSON.parse(JSON.stringify(DEFAULT_PREDIVE_CHECKLIST));
  } catch(e) {
    return JSON.parse(JSON.stringify(DEFAULT_PREDIVE_CHECKLIST));
  }
}

/**
 * 靽??砍 Pre-Dive Checklist fallback?? */
function saveLocalPrediveChecklist() {
  localStorage.setItem('rov_predive_checklist_' + currentSeason, JSON.stringify(state.prediveChecklist));
}

/**
 * 靽??砍 Checklist fallback?? */
function saveLocalChecklist() {
  localStorage.setItem('rov_checklist_' + currentSeason, JSON.stringify(state.checklist));
}

/**
 * 璅?????閬??啁鼓鋆賬? * @param {string|string[]} pages ? ID ??? */
function markDirty(pages) {
  (Array.isArray(pages) ? pages : [pages]).forEach(page => { dirtyFlags[page] = true; });
}

/**
 * 璅??券??閬??啁鼓鋆賬? */
function markAllDirty() {
  Object.keys(dirtyFlags).forEach(page => { dirtyFlags[page] = true; });
}

/**
 * ?亦???Ｗ歇璅? dirty嚗??瑁?皜脫??? * @param {string} id ? ID?? * @param {boolean} force ?臬撘瑕皜脫??? */
function renderPageIfNeeded(id, force = false) {
  if (!force && !dirtyFlags[id]) return;
  if(id==='dashboard') renderDashboard();
  if(id==='prep') renderPrepCenter();
  if(id==='competition') renderCompetitionMode();
  if(id==='competition-flow') renderCompetitionFlowPanel();
  if(id==='competition-contacts') renderCompetitionContacts();
  if(id==='competition-float') { renderFloatMissionFlow(); renderFloatJudgeCard(); renderSavedFloatPacketTool(); }
  if(id==='scoreboard') renderMissionScoreboard();
  if(id==='strategy') renderStrategyBoard();
  if(id==='tasks') renderTasks();
  if(id==='checklist') renderChecklist();
  if(id==='predive-checklist') renderPrediveChecklist();
  if(id==='gantt') renderGantt();
  if(id==='presentation') { renderPresentationTrendPanel(); renderPresentationScorecard(); renderPresentationQuestionBank(); }
  if(id==='members') { renderMembers(); renderOwnerSettingsPanel(); }
  if(id==='intel') renderIntel();
  if(id==='notes') renderNotesPage();
  renderPageTopbar(id);
  renderOwnerDropdowns();
  dirtyFlags[id] = false;
}

function addOwnerOptionValue(set, value) {
  const raw = String(value || '').trim();
  if (!raw) return;
  set.add(raw);
  raw.split(/[+嚗?嚗?嚗?嚗/).map(part => part.trim()).filter(Boolean).forEach(part => set.add(part));
}

function getOwnerSettingsKey() {
  return OWNER_SETTINGS_KEY_PREFIX + currentSeason;
}

function getOwnerSettings() {
  return safeJsonParse(localStorage.getItem(getOwnerSettingsKey()), []);
}

function saveOwnerSettings(rows) {
  const unique = [];
  const seen = new Set();
  rows.map(value => String(value || '').trim()).filter(Boolean).forEach(value => {
    const key = value.toLocaleLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(value);
    }
  });
  localStorage.setItem(getOwnerSettingsKey(), JSON.stringify(unique.sort((a, b) => a.localeCompare(b, 'zh-Hant'))));
}

function normalizeOwnerSettings() {
  const current = getOwnerSettings();
  const cleaned = current
    .map(value => String(value || '').trim())
    .filter(value => value && !/^\d+$/.test(value));
  saveOwnerSettings(cleaned);
  renderOwnerSettingsPanel();
  refreshOwnerSettingsConsumers();
  showToast('鞎痊鈭箸??桀歇?渡?');
}

function getOwnerOptionValues(extra = []) {
  const values = new Set(getOwnerSettings());
  extra.forEach(value => addOwnerOptionValue(values, value));
  return [...values].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
}

function renderOwnerSelect(id, placeholder = '?豢?鞎痊鈭?, currentValue = null) {
  let el = document.getElementById(id);
  if (!el) return null;
  const current = currentValue !== null ? String(currentValue || '') : String(el.value || '');
  const query = String(document.getElementById(id + '-search')?.value || '').trim().toLowerCase();
  if (el.tagName !== 'SELECT') {
    const select = document.createElement('select');
    select.id = id;
    select.className = el.className || '';
    select.style.cssText = el.style.cssText || '';
    el.replaceWith(select);
    el = select;
  }
  let values = getOwnerOptionValues([current]);
  if (query) values = values.filter(value => String(value).toLowerCase().includes(query) || value === current);
  el.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>` + values.map(value => `<option value="${escapeAttr(value)}">${escapeHtml(value)}</option>`).join('');
  el.value = current;
  return el;
}

function rebuildTaskOwnerSelects(currentOwner = '') {
  renderOwnerSelect('m-owner', '?豢?鞎痊鈭?, currentOwner);
  renderOwnerSelect('de-owner', '?豢?鞎痊鈭?, currentOwner);
  populateTaskOwnerFilter();
}

function renderOwnerDropdowns() {
  [
    ['m-owner','?豢?鞎痊鈭?],
    ['de-owner','?豢?鞎痊鈭?],
    ['batch-owner','?寥?鞎痊鈭?],
    ['gear-owner','?豢?鞎痊鈭?],
    ['check-owner','?豢?鞎痊鈭?],
    ['predive-check-owner','?豢?鞎痊鈭?],
    ['score-pilot','?豢????/ 蝯']
  ].forEach(([id, placeholder]) => renderOwnerSelect(id, placeholder));
}

function refreshOwnerSettingsConsumers() {
  renderOwnerDropdowns();
  rebuildTaskOwnerSelects(document.getElementById('m-owner')?.value || document.getElementById('de-owner')?.value || '');
  populateTaskOwnerFilter();
  if (currentPage === 'members') renderOwnerSettingsPanel();
  if (currentPage === 'tasks') {
    renderTaskOwnerLoadPanel();
    renderUnassignedTaskHint();
  }
}

function populateTaskOwnerFilter() {
  const ownerSel = document.getElementById('filter-owner');
  if (!ownerSel) return;
  const curOwner = ownerSel.value;
  const owners = getOwnerOptionValues([curOwner]);
  ownerSel.innerHTML = '<option value="">???鞎砌犖</option>' + owners.map(owner => `<option value="${escapeAttr(owner)}">${escapeHtml(owner)}</option>`).join('');
  ownerSel.value = curOwner;
}

function getPageTopbarConfig(id) {
  const openTasks = state.tasks.filter(t => t.status !== '撌脣???);
  const overdue = openTasks.filter(t => isOverdue(t.due)).length;
  const blocked = openTasks.filter(t => isTaskLocked(t)).length;
  const latestRun = [...state.missionRuns].sort((a,b)=>String(b.run_date || b.created_at || '').localeCompare(String(a.run_date || a.created_at || '')))[0];
  const cfg = {
    dashboard:{ title:'?“蝮質汗', summary:`?芸???${openTasks.length}嚚暹? ${overdue}嚚憛?${blocked}`, actions:[['銴ˊ?勗','copyWeeklyReviewSummary()']] },
    prep:{ title:'?銝剖?', summary:`隞蝻箏 ${getPrepGapItems().length}嚚un 皞? ${getMissionRunReadiness().score}%`, actions:[['銴ˊ?毀??','copyCoachPrepSummary()']] },
    presentation:{ title:'Presentation', summary:`瞍毀 ${state.presentationRuns.length} 甈∴????${state.presentationRuns[0] ? getPresentationTotal(state.presentationRuns[0]) + '/40' : '?芾???}`, actions:[['?啣?瞍毀','document.getElementById("pres-speaker")?.focus()']] },
    members:{ title:'?', summary:`? ${state.members.length} 雿?閫閬?撌脣?蝯, actions:[['?啣??','openAddMember()']] },
    scoreboard:{ title:'Mission Run', summary:`蝝??${state.missionRuns.length} 頛迎????${latestRun ? getMissionRunTotal(latestRun) + ' ?? : '?芾???}`, actions:[['鋆 Run','openMissionRunModal()'],['?臬 CSV','exportMissionRunsCSV()']] },
    competition:{ title:'鞈賢?銝剖?', summary:'?單?閮???郎??敹怎靽?', actions:[['靽?敹怎','manualSaveCompetitionSnapshot()'],['??/?怠?','toggleCompetitionClock()']] },
    checklist:{ title:'?魚閮剖?皜', summary:`Checklist ${state.checklist.flatMap(sec => sec.items).filter(i => i.done).length}/${state.checklist.flatMap(sec => sec.items).length}`, actions:[['憟 Float 璅⊥','applyFloatChecklistTemplate()']] },
    'predive-checklist':{ title:'Pre-Dive Checklist', summary:`Pre-Dive ${state.prediveChecklist.flatMap(sec => sec.items).filter(i => i.done).length}/${state.prediveChecklist.flatMap(sec => sec.items).length}`, actions:[['憟 Float 璅⊥','applyPrediveFloatChecklistTemplate()']] }
  };
  return cfg[id] || null;
}

function renderPageTopbar(id = currentPage) {
  const page = document.getElementById('page-' + id);
  const config = getPageTopbarConfig(id);
  if (!page) return;
  if (!config) {
    page.querySelector(':scope > .page-topbar')?.remove();
    return;
  }
  let bar = page.querySelector(':scope > .page-topbar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'card page-topbar';
    const h1 = page.querySelector(':scope > h1');
    h1?.insertAdjacentElement('afterend', bar);
  }
  bar.innerHTML = `
    <div class="page-top-title">${escapeHtml(config.title)}</div>
    <div class="page-top-summary">${escapeHtml(config.summary)}</div>
    <div class="page-top-actions">${config.actions.map(([label, action]) => `<button class="btn btn-sm" onclick="${action}">${escapeHtml(label)}</button>`).join('')}</div>`;
}

/**
 * 隞餃?鞈??啣?敺絞銝?瑟?賊???? * @param {boolean} forceCurrent ?臬蝡?鼓?桀???? */
function refreshAfterTaskChange(forceCurrent = true) {
  markDirty(['dashboard','prep','competition','tasks','gantt','members']);
  queueAutoSystemBackup('change');
  updateNavBadge();
  if (forceCurrent) renderPageIfNeeded(currentPage, true);
}

/**
 * 憿舐內頛撉冽撅? * @param {string} page ? ID?? */
function showSkeleton(page) {
  const html = '<div class="skeleton-card"><div class="skeleton-line short"></div><div class="skeleton-line"></div><div class="skeleton-line mid"></div><div class="skeleton-line"></div></div>';
  if (page === 'dashboard') {
    document.getElementById('stat-cards').innerHTML = html + html;
    document.getElementById('deadline-timeline').innerHTML = html;
    document.getElementById('progress-bars').innerHTML = html;
    document.getElementById('urgent-table').innerHTML = '<tr><td colspan="4">' + html + '</td></tr>';
  }
}

/**
 * 皜脫??????仿??? */
function renderNotesPage() {
  const raw = state.notes || '';
  const sep = raw.indexOf('\n\n__QUOTES__');
  if (sep !== -1) {
    document.getElementById('notes-area').value = raw.substring(0, sep);
    try { state.quotes = JSON.parse(raw.substring(sep + 13)); } catch(e) { state.quotes = [...DEFAULT_QUOTES]; }
  } else {
    document.getElementById('notes-area').value = raw;
    if (!state.quotes || !state.quotes.length) state.quotes = [...DEFAULT_QUOTES];
  }
  renderQuotes();
}

// ????????????????????????????????????????????????????????// NAVIGATION
// ????????????????????????????????????????????????????????/**
 * ??銝之撌乩?璅∪??? * @param {string} mode 璅∪? ID?? * @param {HTMLElement} btn 鋡恍???銝餃??芣??? */
function showMode(mode, btn) {
  currentMode = MODE_CONFIG[mode] ? mode : 'prep';
  document.querySelectorAll('nav .tab-btn[data-mode]').forEach(b=>b.classList.remove('active'));
  const activeBtn = btn || document.querySelector(`nav .tab-btn[data-mode="${currentMode}"]`);
  activeBtn?.classList.add('active');
  renderModeSubnav();
  const rememberedPage = lastPageByMode[currentMode];
  const targetPage = MODE_CONFIG[currentMode].pages.some(page => page.id === rememberedPage)
    ? rememberedPage
    : MODE_CONFIG[currentMode].defaultPage;
  showPage(targetPage);
}

/**
 * 皜脫??桀?璅∪??抒?摮??賢??? */
function renderModeSubnav() {
  const el = document.getElementById('mode-subnav');
  if (!el) return;
  const pages = MODE_CONFIG[currentMode]?.pages || [];
  el.innerHTML = pages.map(page => `
    <button class="mode-tab ${page.id === currentPage ? 'active' : ''}" onclick="showPage('${page.id}', this)">
      ${escapeHtml(page.label)}
    </button>
  `).join('');
}

/**
 * ?梢???ID ??撅祆芋撘??冽?翰?琿??撘????郊銝餃??芥? * @param {string} pageId ? ID?? * @returns {string} 璅∪? ID?? */
function getModeForPage(pageId) {
  return Object.entries(MODE_CONFIG).find(([, cfg]) => cfg.pages.some(p => p.id === pageId))?.[0] || currentMode;
}

function showPage(id, btn) {
  const targetPage = document.getElementById('page-' + id) ? id : MODE_CONFIG[currentMode]?.defaultPage;
  if (!targetPage) return;
  if (currentPage === 'competition' && targetPage !== 'competition') {
    const hadUnsavedCompetitionChanges = competitionQuickScoreDirty;
    saveCompetitionSnapshot?.();
    if (hadUnsavedCompetitionChanges) showToast('??撌脣?ａ? CCC ??摮?鞈賢翰??);
  }
  id = targetPage;
  currentPage = id;
  const currentModeHasPage = MODE_CONFIG[currentMode]?.pages.some(page => page.id === id);
  if (!currentModeHasPage) currentMode = getModeForPage(id);
  lastPageByMode[currentMode] = id;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('nav .tab-btn[data-mode]').forEach(b=>b.classList.toggle('active', b.dataset.mode === currentMode));
  document.getElementById('page-'+id)?.classList.add('active');
  renderModeSubnav();
  document.querySelectorAll('.mode-tab').forEach(b=>b.classList.remove('active'));
  if(btn?.classList?.contains('mode-tab')) btn.classList.add('active');
  else document.querySelector(`.mode-tab[onclick*="'${id}'"]`)?.classList.add('active');
  applyCompetitionFocusState(id);
  renderPageIfNeeded(id);
}

function goToTaskAndOpen(id) {
  showMode('prep', document.querySelector('nav .tab-btn[data-mode="prep"]'));
  showPage('tasks');
  setTimeout(() => {
    const row = document.querySelector(`[data-task-id="${Number(id)}"]`);
    row?.scrollIntoView({ behavior:'smooth', block:'center' });
    openTaskDetail(Number(id));
  }, 0);
}

/**
 * ?ａ??刻撟?瘜冽芋撘??Ｗ儔銝?祇??Ｗ?閫?? */
function applyCompetitionFocusState() {
  const shouldFocus = currentPage === 'competition' && !!document.fullscreenElement;
  document.body.classList.toggle('competition-focus', shouldFocus);
  updateCompetitionFocusButton();
}

/**
 * ?郊瘥魚撠釣璅∪??????? */
function updateCompetitionFocusButton() {
  const btn = document.getElementById('competition-focus-btn');
  if (!btn) return;
  btn.textContent = document.body.classList.contains('competition-focus') ? '????箏?Ｗ?' : '???刻撟?;
}

// ????????????????????????????????????????????????????????// PREP CENTER
// ????????????????????????????????????????????????????????/**
 * 皜脫??銝剖?????鞈賣???憛? */
function renderPrepCenter() {
  applyPrepView();
  renderPrepEfficiencyScore();
  renderDailyCommandCenter();
  renderDailyFocusMode();
  renderPrepGapPanel();
  renderTodayActionBoard();
  renderDailyStandupBoard();
  renderNextRunTargetPanel();
  renderMissionRunReadinessPanel();
  renderTrainingScheduleAdvisor();
  renderTrainingItemBoard();
  renderCountdownChecklistPanel();
  renderWorkloadBalancePanel();
  renderDailyDirectives();
  renderPracticePerformanceRadar();
  renderRiskRadar();
  renderErrorAnalysis();
  renderGearList();
  renderHandoffCards();
  organizePrepCenterLayers();
  applyPrepView();
}

function organizePrepCenterLayers() {
  const commandBody = document.getElementById('prep-layer-command-body');
  const executionBody = document.getElementById('prep-layer-execution-body');
  const toolsBody = document.getElementById('prep-layer-tools-body');
  if (!commandBody || !executionBody || !toolsBody) return;
  const cardFor = id => document.getElementById(id)?.closest('.card');
  const ensureLayerCard = (target, id, title) => {
    let card = document.getElementById(id);
    if (!card) {
      card = document.createElement('div');
      card.className = 'card prep-layer-managed';
      card.id = id;
      card.innerHTML = `<h2>${title}</h2><div data-layer-card-body></div>`;
    }
    target.appendChild(card);
    return card.querySelector('[data-layer-card-body]');
  };
  const moveElements = (target, ids) => ids.map(id => document.getElementById(id)).filter(Boolean).forEach(node => target.appendChild(node));
  const move = (target, nodes) => nodes.filter(Boolean).forEach(node => {
    node.classList.add('prep-layer-managed');
    target.appendChild(node);
  });
  document.querySelectorAll('#page-prep > details.card.prep-section').forEach(details => {
    if (!['prep-layer-execution', 'prep-layer-tools'].includes(details.id)) details.style.display = 'none';
  });
  move(commandBody, [
    cardFor('daily-command-center'),
    cardFor('daily-focus-mode')
  ]);
  move(executionBody, [
    cardFor('today-action-board'),
    cardFor('prep-gap-panel')
  ]);
  moveElements(ensureLayerCard(executionBody, 'prep-layer-run-card', 'Mission Run 皞?摨?), [
    'next-run-target-panel',
    'mission-run-readiness-panel'
  ]);
  moveElements(ensureLayerCard(toolsBody, 'prep-layer-training-advisor-card', '銝?甈∟?蝺湔?蝔遣霅?), [
    'training-schedule-advisor'
  ]);
  move(toolsBody, [
    cardFor('prep-efficiency-score'),
    cardFor('daily-standup-board'),
    cardFor('training-item-board'),
    cardFor('countdown-checklist-panel'),
    cardFor('workload-balance-panel'),
    cardFor('daily-directives'),
    cardFor('practice-performance-radar')?.parentElement?.closest('.prep-grid') || cardFor('practice-performance-radar'),
    cardFor('error-analysis')?.parentElement?.closest('.prep-grid') || cardFor('error-analysis')
  ]);
}

function setPrepView(view) {
  currentPrepView = ['all','today','training','precomp','team'].includes(view) ? view : 'all';
  localStorage.setItem('rov_prep_view', currentPrepView);
  applyPrepView();
}

function applyPrepView() {
  document.querySelectorAll('[data-prep-view-btn]').forEach(btn => {
    const active = btn.dataset.prepViewBtn === currentPrepView;
    btn.classList.toggle('btn-primary', active);
  });
  document.querySelectorAll('#page-prep .prep-section').forEach(section => {
    const tags = String(section.dataset.prepSection || '').split(/\s+/);
    section.classList.toggle('prep-view-hidden', currentPrepView !== 'all' && !tags.includes(currentPrepView));
  });
}

function getPrepGapItems() {
  const open = state.tasks.filter(t => t.status !== '撌脣???);
  const conversion = getTrainingConversionStats();
  const fill = getTrainingResultFillStats();
  const items = [];
  const unassigned = open.filter(t => !String(t.owner || '').trim()).slice(0, 3);
  if (unassigned.length) items.push({ title:'?芸??遙??, count:unassigned.length, detail:unassigned.map(t => t.name).join('??), action:'filterTasksByOwner("?芸???)', button:'?亦??芸???, color:'var(--orange)', priority:70 + unassigned.length * 8 });
  const overdue = open.filter(t => isOverdue(t.due)).slice(0, 3);
  if (overdue.length) items.push({ title:'?暹?隞餃?', count:overdue.length, detail:overdue.map(t => t.name).join('??), action:"taskQuickFilter='overdue';showPage('tasks')", button:'?亦??暹?', color:'var(--red)', priority:100 + overdue.length * 10 });
  const blocked = open.filter(isTaskLocked).slice(0, 3);
  if (blocked.length) items.push({ title:'?蔭?餃?', count:blocked.length, detail:blocked.map(t => t.name).join('??), action:"taskQuickFilter='blocked';showPage('tasks')", button:'?亦??餃?', color:'var(--red)', priority:95 + blocked.length * 10 });
  if (conversion.missing.length) items.push({ title:'?芾?閮毀', count:conversion.missing.length, detail:conversion.missing.map(item => item.title).join('??), action:'addMissingTodayActionsToTraining()', button:'銝?菔?閮毀', color:'var(--green)', priority:75 + conversion.missing.length * 7 });
  if (fill.missingAll.length) items.push({ title:'閮毀?芸?憛?, count:fill.missingAll.length, detail:fill.missingAll.slice(0, 3).map(item => item.title).join('??), action:"document.getElementById('training-item-board')?.scrollIntoView({behavior:'smooth',block:'start'})", button:'憛怎???, color:'var(--blue)', priority:65 + fill.missingAll.length * 6 });
  return items.sort((a, b) => b.priority - a.priority);
}

function buildPrepGapSummary() {
  const items = getPrepGapItems();
  return [
    '?OV 隞?蝻箏??,
    ...(items.length ? items.slice(0, 3).map((item, i) => `${i + 1}. ${item.title}嚗?{item.count}嚗?${item.detail}嚚?銝甇伐?${item.button}`) : ['?桀?瘝??＊?蝻箏嚗隞交???Mission Run ??Presentation 瞍毀??])
  ].join('\n');
}

async function copyPrepGapSummary() {
  const text = buildPrepGapSummary();
  try {
    await navigator.clipboard.writeText(text);
    showToast('??隞?蝻箏撌脰?鋆踝??舐?亥票?啁黎蝯?);
  } catch(e) {
    prompt('隢???鋆賭??亙??啁撩???', text);
  }
}

async function autoHandlePrepGaps() {
  const beforeTraining = getTrainingItems().length;
  addMissingTodayActionsToTraining();
  const addedTraining = Math.max(0, getTrainingItems().length - beforeTraining);
  const remaining = getPrepGapItems().filter(item => item.title !== '?芾?閮毀');
  const summary = [
    '?OV 隞?蝻箏??蝯???,
    `撌脰??閮毀嚗?{addedTraining} ?,
    ...(remaining.length ? [
      '',
      '隞?鈭箏極??嚗?,
      ...remaining.slice(0, 4).map((item, i) => `${i + 1}. ${item.title}嚗?{item.count}嚗?${item.detail}`)
    ] : ['', '?桀?瘝??拚?鈭箏極蝻箏??])
  ].join('\n');
  try {
    await navigator.clipboard.writeText(summary);
    showToast('??撌脰???芸?蝻箏嚗??歇銴ˊ');
  } catch(e) {
    prompt('隢???鋆賭??亙??啁撩???????', summary);
  }
  renderPrepGapPanel();
}

function getPrepGapProgress(items = getPrepGapItems()) {
  const totalTypes = 5;
  const openTypes = Math.min(totalTypes, items.length);
  const cleared = Math.max(0, totalTypes - openTypes);
  const progress = Math.round(cleared / totalTypes * 100);
  return {
    cleared,
    totalTypes,
    openTypes,
    progress,
    color:progress >= 80 ? 'var(--green)' : progress >= 50 ? 'var(--orange)' : 'var(--red)',
    label:progress >= 80 ? '蝻箏憯?雿? : progress >= 50 ? '隞??券? : '蝻箏憯?擃?
  };
}

function renderPrepGapPanel() {
  const el = document.getElementById('prep-gap-panel');
  if (!el) return;
  const items = getPrepGapItems();
  if (!items.length) {
    el.innerHTML = '<div style="font-size:.86rem;color:var(--muted);font-weight:800">隞?怎?＊?蝻箏嚗隞交???? Mission Run ??Presentation 瞍毀??/div>';
    return;
  }
  const best = items[0];
  const progress = getPrepGapProgress(items);
  el.innerHTML = `
    <div style="display:flex;justify-content:flex-end;gap:7px;flex-wrap:wrap;margin-bottom:8px">
      <button class="btn btn-sm btn-success" onclick="autoHandlePrepGaps()">銝?菔???芸?蝻箏</button>
      <button class="btn btn-sm btn-primary" onclick="copyPrepGapSummary()">銴ˊ蝻箏皜</button>
    </div>
    <div style="border:1px solid var(--border);border-left:5px solid ${progress.color};border-radius:8px;background:var(--input-bg);padding:10px 12px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:6px">
        <div>
          <div style="font-size:.78rem;color:var(--muted);font-weight:900">蝻箏???脣漲</div>
          <div style="font-size:.86rem;color:var(--navy);font-weight:900">${escapeHtml(progress.label)}</div>
        </div>
        <span style="font-size:1.05rem;font-weight:900;color:${progress.color}">${progress.cleared}/${progress.totalTypes} 憿歇皜?/span>
      </div>
      <div class="prog-wrap"><div class="prog-bar" style="width:${progress.progress}%;background:${progress.color}"></div></div>
    </div>
    <div style="border:1px solid var(--border);border-left:5px solid ${best.color};border-radius:8px;background:var(--input-bg);padding:10px 12px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
        <div>
          <div style="font-size:.78rem;color:var(--muted);font-weight:900">銝???雿喳?雿?/div>
          <div style="font-size:.98rem;color:var(--navy);font-weight:900">${escapeHtml(best.title)}</div>
          <div style="font-size:.78rem;color:var(--muted);margin-top:3px">${escapeHtml(best.detail)}</div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="${best.action}">${escapeHtml(best.button)}</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:9px">
      ${items.map(item => `
        <div style="border:1px solid var(--border);border-left:4px solid ${item.color};border-radius:8px;background:var(--input-bg);padding:9px 10px">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:5px">
            <strong style="color:var(--navy)">${escapeHtml(item.title)}</strong>
            <span style="font-size:1.05rem;font-weight:900;color:${item.color}">${item.count}</span>
          </div>
          <div style="font-size:.76rem;color:var(--muted);line-height:1.45;min-height:34px">${escapeHtml(item.detail)}</div>
          <button class="btn btn-sm" style="margin-top:7px" onclick="${item.action}">${escapeHtml(item.button)}</button>
        </div>
      `).join('')}
    </div>`;
}

/**
 * ?寞?隞餃??hecklist?毀蝧??鞈?撱箇?憸券??? * @returns {Array<object>} 憸券??? */
function getPrepRisks() {
  const openTasks = state.tasks.filter(t => t.status !== '撌脣???);
  const equipmentTasks = openTasks.filter(t => matchAny([t.name, t.note, t.owner, t.cat], ['撌亦?','閮剖?','甇餅?','?餅?','蝺?','憭拍?','motor','camera','?脫偌','?券?,'T200','MEKA']));
  const missionTasks = openTasks.filter(t => matchAny([t.name, t.note, t.owner, t.cat], ['Mission','蝺渡?','?','?見','?','?','Five Pan','Fishing','隞餃?']));
  const docTasks = openTasks.filter(t => matchAny([t.name, t.note, t.owner, t.cat], ['Presentation','?辣','靽','蝪質?','鞈潛巨','雿挪','?芾?','銵?,'霅瑞','??']));
  const unconfirmedMembers = state.members.filter(m => !String(m.canada || '').includes('??)).length;
  const checklistOpen = state.checklist.flatMap(sec => sec.items).filter(item => !item.done && matchAny([item.text, item.owner], ['閮剖?','蝟餌絞','??','??','?','Presentation'])).length;
  const recentFaults = state.missionRuns.slice(-3).reduce((sum, run) => sum + (Number(run.faults) || 0), 0);
  const floatChecklistOpen = state.checklist
    .filter(sec => sec.sec === 'F')
    .flatMap(sec => sec.items)
    .filter(item => !item.done).length;
  const floatGearOpen = state.gearItems.filter(item => matchAny([item.name], ['Float','U-bolt','DOC-004','SID','receiver','depth','pressure']) && item.status !== '撌脰?蝞?).length;
  const floatRuns = state.missionRuns.filter(run => parseMissionScoreItems(run.score_items).some(item => String(item.id || '').includes('p1_') || String(item.id || '').includes('p2_') || String(item.id || '').includes('float')));
  const floatPenalty = floatRuns.some(run => parseMissionScoreItems(run.score_items).some(item => String(item.id || '').includes('ice_penalty')));
  return [
    { label:'閮剖??芰帘摰?, count:equipmentTasks.length + checklistOpen, detail:equipmentTasks[0]?.name || '瑼Ｘ閮剖??頂蝯晞皞?蝥??脫偌?' },
    { label:'隞餃??芰毀??, count:missionTasks.length + (recentFaults >= 5 ? 2 : recentFaults > 0 ? 1 : 0), detail:missionTasks[0]?.name || '?亦?閮??輯?蝺渡?蝝???葉蝺游仃?遙?? },
    { label:'??芰Ⅱ隤?, count:unconfirmedMembers, detail:unconfirmedMembers ? `${unconfirmedMembers} 雿??∩??芸??函Ⅱ隤銵?閫` : '???帘摰? },
    { label:'?辣?芸???, count:docTasks.length, detail:docTasks[0]?.name || '?辣?resentation???芥偷霅?⊿?憸券敺齒' },
    { label:'Float 隞餃?憸券', count:floatChecklistOpen + floatGearOpen + (floatPenalty ? 2 : 0), detail:floatChecklistOpen || floatGearOpen ? 'Float 瑼Ｘ?鞈??芸??? : 'Float ?辣?鞈?隞餃?蝝??⊥?憿舐撩?? },
    { label:'Data Packet 憸券', count:floatRuns.length ? 0 : 1, detail:'蝣箄?鞈???砍蝺刻????ressure/depth嚗? graph ?喳? 20 蝑??? }
  ];
}

function renderPrepEfficiencyScore() {
  const el = document.getElementById('prep-efficiency-score');
  if (!el) return;
  const score = getPrepEfficiencyScore();
  el.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
      <button class="btn btn-sm btn-primary" onclick="copyCoachPrepSummary()">銴ˊ?毀??</button>
    </div>
    <div style="display:grid;grid-template-columns:160px 1fr;gap:14px;align-items:center">
      <div style="text-align:center">
        <div style="font-size:2.4rem;font-weight:900;color:${score.color};line-height:1">${score.total}</div>
        <div style="font-size:.78rem;color:var(--muted);font-weight:900">${escapeHtml(score.label)}</div>
      </div>
      <div>
        <div style="display:grid;gap:7px">
          ${score.parts.map(part => `
            <div>
              <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:3px">
                <strong>${escapeHtml(part.label)}</strong><span>${part.value}%</span>
              </div>
              <div class="prog-wrap"><div class="prog-bar" style="width:${part.value}%;background:${part.color}"></div></div>
            </div>
          `).join('')}
        </div>
        <div style="font-size:.82rem;color:var(--muted);margin-top:8px;font-weight:800">??剜嚗?{escapeHtml(score.weakest.label)}嚚?{escapeHtml(score.weakest.tip)}</div>
      </div>
    </div>`;
}

function getPrepEfficiencyScore() {
  const actions = getTodayActionItems();
  const training = getTrainingItems();
  const trainingOpen = training.filter(item => !item.done).length;
  const perf = getPracticePerformanceMetrics();
  const perfAvg = Math.round(perf.reduce((sum, m) => sum + (Number(m.score) || 0), 0) / perf.length);
  const ownerRows = getTaskOwnerLoadRows();
  const maxPressure = ownerRows.length ? Math.max(...ownerRows.map(row => row.overdue * 4 + row.week * 2 + row.open)) : 0;
  const countdown = getCountdownChecklistGroups();
  const countdownOpen = countdown.reduce((sum, group) => sum + group.items.length, 0);
  const parts = [
    { label:'隞雿', value:Math.max(0, 100 - actions.length * 12), tip:'??隞雿?踹? 3 ?? },
    { label:'閮毀?瑁?', value:training.length ? Math.round((training.length - trainingOpen) / training.length * 100) : 45, tip:'???唳隞餃?頧?隞閮毀?蒂摰??? },
    { label:'蝺渡???', value:perfAvg, tip:'??Mission Run 撽???仃隤扎???蝛拙?摨艾? },
    { label:'?極撟唾﹛', value:Math.max(0, 100 - maxPressure * 6), tip:'??憯?鞎砌犖??憸券隞餃?頧晷?? },
    { label:'?皞?', value:Math.max(0, 100 - countdownOpen * 3), tip:'?芸???隞??澆???瘞游??芸????? }
  ].map(part => ({ ...part, color:part.value >= 75 ? 'var(--green)' : part.value >= 55 ? 'var(--orange)' : 'var(--red)' }));
  const total = Math.round(parts.reduce((sum, part) => sum + part.value, 0) / parts.length);
  const weakest = [...parts].sort((a, b) => a.value - b.value)[0];
  return {
    total,
    parts,
    weakest,
    label:total >= 80 ? '????臬末' : total >= 60 ? '?閬?銝剜?? : '??餃???',
    color:total >= 80 ? 'var(--green)' : total >= 60 ? 'var(--orange)' : 'var(--red)'
  };
}

function renderDailyCommandCenter() {
  const el = document.getElementById('daily-command-center');
  if (!el) return;
  const prep = getPrepEfficiencyScore();
  const gaps = getPrepGapItems();
  const best = gaps[0];
  const run = getMissionRunReadiness();
  const standup = getStandupExecutionScore();
  const nextLabel = best ? best.title : '摰?摰瞍毀';
  const nextDetail = best ? best.detail : '隞?⊥?憿舐撩???撱箄降? Mission Run ??Presentation 瞍毀??;
  const nextAction = best ? best.action : "showPage('scoreboard')";
  const nextButton = best ? best.button : '?? Mission Run';
  el.innerHTML = `
    <div style="border:1px solid var(--border);border-left:5px solid ${best?.color || 'var(--green)'};border-radius:8px;background:var(--input-bg);padding:10px 12px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
        <div>
          <div style="font-size:.78rem;color:var(--muted);font-weight:900">?曉?閰脣?</div>
          <div style="font-size:1.05rem;font-weight:900;color:var(--navy)">${escapeHtml(nextLabel)}</div>
          <div style="font-size:.8rem;color:var(--muted);margin-top:3px">${escapeHtml(nextDetail)}</div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="${nextAction}">${escapeHtml(nextButton)}</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px">
      ${[
        { label:'???', value:`${prep.total}/100`, color:prep.color, detail:prep.label },
        { label:'蝻箏??, value:String(gaps.length), color:gaps.length ? 'var(--orange)' : 'var(--green)', detail:gaps.length ? '隞???' : '憯?雿? },
        { label:'Run 皞?', value:`${run.score}%`, color:run.color, detail:run.label },
        { label:'蝡??賢', value:`${standup.total}/100`, color:standup.color, detail:standup.label }
      ].map(card => `
        <div style="border:1px solid var(--border);border-left:4px solid ${card.color};border-radius:8px;background:var(--white);padding:8px 10px">
          <div style="font-size:.74rem;color:var(--muted);font-weight:900">${escapeHtml(card.label)}</div>
          <div style="font-size:1.25rem;font-weight:900;color:${card.color}">${escapeHtml(card.value)}</div>
          <div style="font-size:.72rem;color:var(--muted)">${escapeHtml(card.detail)}</div>
        </div>
      `).join('')}
    </div>`;
}

function getLatestPresentationAction() {
  const rows = [...state.presentationRuns].sort((a,b)=>String(b.run_date || '').localeCompare(String(a.run_date || '')));
  const latest = rows[0];
  if (!latest) return { label:'?芣? Presentation 瞍毀', action:'??銝甈?40 ?閰?', score:null };
  const dims = [
    ['蝯?', Number(latest.structure_score) || 0],
    ['?銵?, Number(latest.technical_score) || 0],
    ['銵券?', Number(latest.delivery_score) || 0],
    ['Q&A', Number(latest.qa_score) || 0]
  ].sort((a,b)=>a[1]-b[1]);
  return {
    label:`${getPresentationTotal(latest)}/40嚚?撘梧?${dims[0][0]} ${dims[0][1]}/10`,
    action:latest.next_action || `鋆撥 ${dims[0][0]}嚗?銝甈⊥???1 ?,
    score:getPresentationTotal(latest)
  };
}

function renderDailyFocusMode() {
  const el = document.getElementById('daily-focus-mode');
  if (!el) return;
  const openTasks = state.tasks.filter(t => t.status !== '撌脣???);
  const topTask = [...openTasks]
    .filter(t => !isTaskLocked(t))
    .sort((a,b)=>getTaskPriorityScore(b)-getTaskPriorityScore(a) || String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31')))[0];
  const blocked = openTasks.filter(t => isTaskLocked(t)).slice(0, 3);
  const training = getTrainingItems().filter(item => !item.done).slice(0, 2);
  const pres = getLatestPresentationAction();
  const focusCards = [
    {
      title:'隞敹?隞餃?',
      value:topTask ? topTask.name : '瘝??舀?脖遙??,
      detail:topTask ? `${topTask.owner || '?芸???}嚚?{topTask.due ? `?芣迫 ${topTask.due}` : '?芾身摰甇?}` : '?臭誑頧閮毀??Presentation 瞍毀??,
      color:'var(--blue)',
      action:topTask ? `goToTaskAndOpen(${topTask.id})` : "showPage('tasks')",
      button:topTask ? '?亦?隞餃?' : '?颱遙??'
    },
    {
      title:'?圾?餃?',
      value:`${blocked.length} ?,
      detail:blocked.length ? blocked.map(t => `#${t.id} ${t.name}`).join('??) : '?桀?瘝??蔭隞餃??餃???,
      color:blocked.length ? '#7030A0' : 'var(--green)',
      action:"setTaskQuickFilter('blocked');showPage('tasks')",
      button:'?憛?
    },
    {
      title:'隞閮毀',
      value:training.length ? `${training.length} ?摰?` : '?芣?閮毀',
      detail:training.length ? training.map(item => item.title).join('??) : '???唳隞餃?頧?隞閮毀??,
      color:'var(--orange)',
      action:"document.getElementById('training-item-board')?.scrollIntoView({behavior:'smooth',block:'start'})",
      button:'??蝺?
    },
    {
      title:'Presentation 銝?甇?,
      value:pres.label,
      detail:pres.action,
      color:pres.score !== null && pres.score >= 32 ? 'var(--green)' : 'var(--red)',
      action:"showPage('presentation')",
      button:'?餉??”'
    }
  ];
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px">
      ${focusCards.map(card => `
        <div style="border:1px solid var(--border);border-left:5px solid ${card.color};border-radius:8px;background:var(--input-bg);padding:10px 12px">
          <div style="font-size:.76rem;color:var(--muted);font-weight:900">${escapeHtml(card.title)}</div>
          <div style="font-size:.95rem;color:var(--navy);font-weight:900;margin-top:3px">${escapeHtml(card.value)}</div>
          <div style="font-size:.78rem;color:var(--muted);line-height:1.45;min-height:36px;margin-top:4px">${escapeHtml(card.detail)}</div>
          <button class="btn btn-sm" style="margin-top:8px" onclick="${card.action}">${escapeHtml(card.button)}</button>
        </div>
      `).join('')}
    </div>
    <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:8px">撱箄降??嚗圾?餃? ??摰?隞敹? ???‵閮毀蝯? ???湔 Presentation 銝?甇乓?/div>`;
}

function buildCoachPrepSummary() {
  const score = getPrepEfficiencyScore();
  const actions = getTodayActionItems().slice(0, 3);
  const training = getTrainingItems().filter(item => !item.done).slice(0, 3);
  const target = getNextMissionRunTarget();
  const ownerRows = getTaskOwnerLoadRows().slice(0, 3);
  const countdown = getCountdownChecklistGroups();
  const urgentCountdown = countdown.flatMap(group => group.items.slice(0, 2).map(item => `${group.title}: ${item.text}`)).slice(0, 4);
  return [
    `?OV ????,
    `???嚗?{score.total}/100嚗?{score.label}嚗,
    `??剜嚗?{score.weakest.label} - ${score.weakest.tip}`,
    '',
    '隞?芸?嚗?,
    ...(actions.length ? actions.map((item, i) => `${i + 1}. ${item.title}嚚?{item.reason}嚚?{item.owner || '?芸???}`) : ['1. 隞?⊿?憯遙??]),
    '',
    '隞閮毀嚗?,
    ...(training.length ? training.map((item, i) => `${i + 1}. ${item.title}嚚璅?${item.target}${formatTrainingResultForSummary(item)}`) : ['1. 撠?閮毀????雿?踹? 3 ??閮毀']),
    '',
    '銝?頛?Mission Run嚗?,
    ...target.metrics.map(m => `${m.label}: ${m.value}`),
    '',
    '?極??嚗?,
    ...(ownerRows.length ? ownerRows.map(row => `${row.owner}: ${row.open} ?芸???/ ${row.overdue} ?暹? / ${row.week} ?祇常) : ['?極?怎?＊憯?']),
    '',
    '?皜嚗?,
    ...(urgentCountdown.length ? urgentCountdown : ['?皜?怎???'])
  ].join('\n');
}

function formatTrainingResultForSummary(item) {
  const result = item.result || {};
  const parts = [
    result.success ? `??${result.success}` : '',
    result.faults ? `憭梯炊${result.faults}` : '',
    result.seconds ? `?冽?${result.seconds}s` : ''
  ].filter(Boolean);
  return parts.length ? `嚚???${parts.join('/')}` : '';
}

async function copyCoachPrepSummary() {
  const text = buildCoachPrepSummary();
  try {
    await navigator.clipboard.writeText(text);
    showToast('???毀??撌脰?鋆踝??舐?亥票?啁黎蝯?);
  } catch(e) {
    prompt('隢???鋆賣?蝺湔?閬?', text);
  }
}

function buildDailyStandupAgenda() {
  const score = getPrepEfficiencyScore();
  const open = state.tasks.filter(t => t.status !== '撌脣???);
  const blocked = open.filter(isTaskLocked).slice(0, 4);
  const ownerRows = getTaskOwnerLoadRows().slice(0, 4);
  const actions = getTodayActionItems().slice(0, 4);
  const training = getTrainingItems().filter(item => !item.done).slice(0, 4);
  const todayDue = open.filter(t => getTaskDueInfo(t).days === 0).slice(0, 4);
  return [
    '?OV 隞蝡?霅啁???,
    `1. ???嚗?{score.total}/100嚗?{score.label}嚗,
    `   ??剜嚗?{score.weakest.label} - ${score.weakest.tip}`,
    '',
    '2. 隞雿',
    ...(actions.length ? actions.map((item, i) => `   ${i + 1}. ${item.title}嚚?{item.owner || '?芸???}嚚?{item.reason}`) : ['   1. 隞?⊿?憯遙??]),
    '',
    '3. ?餃?蝣箄?',
    ...(blocked.length ? blocked.map((t, i) => `   ${i + 1}. ${t.name} ??${getDependencyTask(t)?.name || '?蔭?芸???}嚚?{t.owner || '?芸???}`) : ['   1. ?桀??⊿憛?]),
    '',
    '4. 隞?芣迫',
    ...(todayDue.length ? todayDue.map((t, i) => `   ${i + 1}. ${t.name}嚚?{t.owner || '?芸???}`) : ['   1. 隞?⊥甇Ｖ遙??]),
    '',
    '5. ?極隤踵',
    ...(ownerRows.length ? ownerRows.map((row, i) => `   ${i + 1}. ${row.owner}: ${row.open} ?芸???/ ${row.overdue} ?暹? / ${row.week} ?祇常) : ['   1. ?極?怎?＊憯?']),
    '',
    '6. 隞閮毀',
    ...(training.length ? training.map((item, i) => `   ${i + 1}. ${item.title}嚚璅?${item.target}${formatTrainingResultForSummary(item)}`) : ['   1. 撠?閮毀????雿?踹? 3 ??閮毀']),
    '',
    '7. ???',
    '   - 瘥?鞎痊鈭箏??梧?摰? / ?餃? / 銝?甇?,
    '   - ?毀銴ˊ????啁黎蝯?蝯?閮?'
  ].join('\n');
}

async function copyDailyStandupAgenda() {
  const text = buildDailyStandupAgenda();
  try {
    await navigator.clipboard.writeText(text);
    showToast('??隞蝡?霅啁?撌脰?鋆踝??舐?亥票?啁黎蝯?);
  } catch(e) {
    prompt('隢???鋆賭??亦??降蝔?', text);
  }
}

function buildDailyStandupFollowupPack() {
  return [
    buildDailyStandupAgenda(),
    '',
    '------------------------------',
    buildStandupExecutionActionSummary(),
    '',
    '------------------------------',
    buildBlockerClearanceSummary(),
    '',
    '------------------------------',
    buildOwnerCommitmentSummary(),
    '',
    '------------------------------',
    buildTrainingResultGapSummary(),
    '',
    '------------------------------',
    buildTrainingResultFillSummary()
  ].join('\n');
}

function getStandupPackPostedKey() {
  return `rov_standup_pack_posted_${currentSeason}_${new Date().toISOString().slice(0,10)}`;
}

function markStandupPackPosted() {
  localStorage.setItem(getStandupPackPostedKey(), new Date().toISOString());
}

function hasStandupPackPostedToday() {
  return Boolean(localStorage.getItem(getStandupPackPostedKey()));
}

async function copyDailyStandupFollowupPack() {
  const text = buildDailyStandupFollowupPack();
  try {
    await navigator.clipboard.writeText(text);
    markStandupPackPosted();
    showToast('??蝡?摰?歇銴ˊ嚗?湔鞎澆蝢斤?');
  } catch(e) {
    prompt('隢???鋆賜????游?嚗?, text);
    markStandupPackPosted();
  }
  renderDailyStandupBoard();
}

async function runStandupCloseoutAll() {
  const text = buildDailyStandupFollowupPack();
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch(e) {
    prompt('隢???鋆賜????游?嚗?, text);
  }
  markStandupPackPosted();

  const taskIds = [...new Set(getStandupOwnerCommitments()
    .flatMap(row => row.items)
    .map(item => Number(item.taskId))
    .filter(Boolean))];
  let updated = 0;
  for (const id of taskIds) {
    const task = state.tasks.find(t => Number(t.id) === id);
    if (!task || task.status !== '敺齒') continue;
    const before = { ...task };
    task.status = '?脰?銝?;
    try {
      await db.from('tasks').update({ status:'?脰?銝? }).eq('id', id);
      await writeAuditLog('standup_closeout_in_progress', 'tasks', id, before, task);
    } catch(e) {
      console.warn('Standup closeout status update saved locally only:', e.message);
    }
    updated++;
  }

  const missingResults = getTrainingResultFillStats().missingAll.length;
  refreshAfterTaskChange(false);
  renderDailyStandupBoard();
  showToast(`??蝡??嗅偏撌脰???${copied ? '撌脰?鋆賢??游?' : '撌脫?閮??游?'}嚗?{updated} ?隢曇??脰?銝哨?${missingResults} ??蝺游??‵`);
  if (missingResults) document.getElementById('training-item-board')?.scrollIntoView({ behavior:'smooth', block:'start' });
}

function renderStandupTimebox() {
  const steps = [
    { time:'0-2 ??', title:'???', detail:'蝣箄?蝮賢????剜嚗瘙箏?隞?阡???, color:'var(--blue)' },
    { time:'2-5 ??', title:'隞雿', detail:'??蝣箄???4 ??憯遙??鞎痊鈭箄?銝?甇乓?, color:'var(--orange)' },
    { time:'5-7 ??', title:'?餃?', detail:'?芾???蝵格摰???鞈游雿?閬?蝺渲?瘙箇????, color:'var(--red)' },
    { time:'7-9 ??', title:'?極', detail:'瑼Ｘ?暹?????極雿????犖嚗??唾?瘣整?, color:'var(--navy)' },
    { time:'9-11 ??', title:'隞閮毀', detail:'蝣箄?隞予閬?霅?閮毀?? Mission Run ?格???, color:'var(--green)' },
    { time:'11-12 ??', title:'?', detail:'瘥?鞎痊鈭箸隢曉??憛?銝?甇伐???鞎潭?閬?, color:'#7030A0' }
  ];
  return `
    <div style="display:grid;gap:6px;margin-bottom:10px">
      ${steps.map(step => `
        <div style="display:grid;grid-template-columns:68px 1fr;gap:8px;align-items:start;border:1px solid var(--border);border-left:4px solid ${step.color};border-radius:8px;padding:7px 9px;background:var(--input-bg)">
          <div style="font-size:.74rem;font-weight:900;color:${step.color};white-space:nowrap">${escapeHtml(step.time)}</div>
          <div>
            <div style="font-size:.83rem;font-weight:900;color:var(--navy)">${escapeHtml(step.title)}</div>
            <div style="font-size:.78rem;color:var(--muted);line-height:1.45">${escapeHtml(step.detail)}</div>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function getBlockerClearanceRows(blockedTasks, limit = 5) {
  return blockedTasks.slice(0, limit).map(task => {
    const dep = getDependencyTask(task);
    const depOwner = dep?.owner || '?芸???;
    const taskOwner = task.owner || '?芸???;
    const action = dep
      ? `????蝵柴?{dep.name}???圾??{task.name}?
      : `鋆??蔭隞餃?鞈?嚗Ⅱ隤?{task.name}?◤?芯??雿;
    return { task, dep, depOwner, taskOwner, action };
  });
}

function buildBlockerClearanceSummary() {
  const blocked = state.tasks.filter(t => t.status !== '撌脣??? && isTaskLocked(t));
  const rows = getBlockerClearanceRows(blocked, 8);
  return [
    '?OV ?餃?皜?皜??,
    ...(rows.length ? rows.map((row, i) => [
      `${i + 1}. 鋡恍憛?${row.task.name}嚚?鞎穿?${row.taskOwner}`,
      `   ?蔭嚗?{row.dep?.name || '?蔭隞餃?銝???}嚚?鞎穿?${row.depOwner}`,
      `   撱箄降嚗?{row.action}`
    ].join('\n')) : ['?桀?瘝??餃?隞餃?嚗?????颱??亥?蝺湔? Mission Run 撽???]),
    '',
    '??澆?嚗?蝵桀???/ 隞憛?/ ?閬???
  ].join('\n');
}

async function copyBlockerClearanceSummary() {
  const text = buildBlockerClearanceSummary();
  try {
    await navigator.clipboard.writeText(text);
    showToast('???餃?皜?皜撌脰?鋆踝??舐?亥票?啁黎蝯?);
  } catch(e) {
    prompt('隢???鋆賡憛????殷?', text);
  }
}

function renderBlockerClearancePanel(blockedTasks) {
  const rows = getBlockerClearanceRows(blockedTasks, 5);
  if (!rows.length) {
    return `<div style="font-size:.84rem;color:var(--muted);font-weight:800;padding:8px 0">?桀?瘝??餃?隞餃?嚗?????颱??亥?蝺湔? Mission Run 撽???/div>`;
  }
  return `
    <div style="display:grid;gap:8px;margin-bottom:10px">
      ${rows.map(row => `
        <div style="border:1px solid var(--border);border-left:4px solid var(--red);border-radius:8px;background:var(--input-bg);padding:8px 10px">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;flex-wrap:wrap">
            <div>
              <div style="font-size:.84rem;font-weight:900;color:var(--navy)">${escapeHtml(row.task.name)}</div>
              <div style="font-size:.78rem;color:var(--muted);line-height:1.45">鋡怠?蝵桀雿?${escapeHtml(row.dep?.name || '?蔭隞餃?銝???)}嚚遙??鞎穿?${escapeHtml(row.taskOwner)}嚚?蝵株?鞎穿?${escapeHtml(row.depOwner)}</div>
              <div style="font-size:.78rem;color:var(--red);font-weight:800;margin-top:4px">${escapeHtml(row.action)}</div>
            </div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
              ${row.dep ? `<button class="btn btn-sm" onclick="goToTaskAndOpen(${row.dep.id})">??蝵?/button>` : ''}
              <button class="btn btn-sm btn-primary" onclick="goToTaskAndOpen(${row.task.id})">?◤?餃?</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function getStandupOwnerCommitments() {
  const map = new Map();
  const add = (owner, text, type, score = 0, taskId = null) => {
    const key = owner || '?芸???;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({ text, type, score, taskId });
  };
  getTodayActionItems().slice(0, 8).forEach(item => {
    add(item.owner, item.title, item.reason, item.score || 0, item.taskId);
  });
  state.tasks
    .filter(t => t.status !== '撌脣??? && getTaskDueInfo(t).days === 0)
    .forEach(task => add(task.owner, task.name, '隞?芣迫', getTaskPriorityScore(task) + 80, task.id));
  getTrainingItems().filter(item => !item.done).slice(0, 8).forEach(item => {
    add(item.owner, `${item.title}嚚璅?${item.target}`, '隞閮毀', 60, item.taskId || null);
  });
  return [...map.entries()].map(([owner, items]) => ({
    owner,
    items: items
      .sort((a, b) => b.score - a.score)
      .filter((item, index, arr) => arr.findIndex(other => other.text === item.text && other.type === item.type) === index)
      .slice(0, 4)
  })).sort((a, b) => b.items.length - a.items.length || a.owner.localeCompare(b.owner, 'zh-Hant'));
}

function buildOwnerCommitmentSummary() {
  const rows = getStandupOwnerCommitments();
  return [
    '?OV 隞鞎痊鈭箸隢整?,
    ...(rows.length ? rows.flatMap(row => [
      '',
      `${row.owner}:`,
      ...row.items.map((item, i) => `${i + 1}. ${item.text}嚚?{item.type}`)
    ]) : ['', '?桀?瘝?隞?輯姥??隢??函??Ⅱ隤?鞎砌犖???乩漱隞?]),
    '',
    '??澆?嚗???/ ?餃? / 銝?甇?
  ].join('\n');
}

async function copyOwnerCommitmentSummary() {
  const text = buildOwnerCommitmentSummary();
  try {
    await navigator.clipboard.writeText(text);
    showToast('??隞鞎痊鈭箸隢曉歇銴ˊ嚗?湔鞎澆蝢斤?');
  } catch(e) {
    prompt('隢???鋆賭??亥?鞎砌犖?輯姥嚗?, text);
  }
}

function getTrainingConversionStats() {
  const actions = getTodayActionItems().filter(item => item.taskId).slice(0, 8);
  const trainingTaskIds = new Set(getTrainingItems().filter(item => !item.done && item.taskId).map(item => Number(item.taskId)));
  const converted = actions.filter(item => trainingTaskIds.has(Number(item.taskId)));
  const missing = actions.filter(item => !trainingTaskIds.has(Number(item.taskId))).slice(0, 4);
  const rate = actions.length ? Math.round(converted.length / actions.length * 100) : 0;
  return {
    total: actions.length,
    converted: converted.length,
    missing,
    rate,
    label: rate >= 70 ? '頧??臬末' : rate >= 40 ? '?閬?閮毀' : '閮?憭瞍毀',
    color: rate >= 70 ? 'var(--green)' : rate >= 40 ? 'var(--orange)' : 'var(--red)'
  };
}

function addMissingTodayActionsToTraining() {
  const stats = getTrainingConversionStats();
  let added = 0;
  stats.missing.forEach(item => {
    const before = getTrainingItems().length;
    addTrainingItemFromTask(item.taskId);
    if (getTrainingItems().length > before) added++;
  });
  renderDailyStandupBoard();
  showToast(added ? `??撌脰?朣?${added} ???乩??啗?蝺循 : '?對? 隞雿撌脰??亥?蝺?);
}

function renderTrainingConversionPanel() {
  const stats = getTrainingConversionStats();
  if (!stats.total) {
    return `<div style="font-size:.84rem;color:var(--muted);font-weight:800;padding:8px 0">隞雿?踵?∪頧?蝺港遙??/div>`;
  }
  return `
    <div style="border:1px solid var(--border);border-left:4px solid ${stats.color};border-radius:8px;background:var(--input-bg);padding:9px 10px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
        <strong style="color:var(--navy)">隞閮毀頧???/strong>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">
          ${stats.missing.length ? `<button class="btn btn-sm btn-success" onclick="addMissingTodayActionsToTraining()">銝?菔?朣?蝺?/button>` : ''}
          <span style="font-size:1.05rem;font-weight:900;color:${stats.color}">${stats.converted}/${stats.total} (${stats.rate}%)</span>
        </div>
      </div>
      <div class="prog-wrap" style="margin-bottom:7px"><div class="prog-bar" style="width:${stats.rate}%;background:${stats.color}"></div></div>
      <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-bottom:${stats.missing.length ? '7px' : '0'}">${escapeHtml(stats.label)}嚗?隞雿頧?閮毀?????脣撖阡?瞍毀??????/div>
      ${stats.missing.length ? `<div style="display:grid;gap:5px">
        ${stats.missing.map(item => `
          <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;background:var(--white);border:1px solid var(--border);border-radius:7px;padding:6px 8px">
            <div>
              <div style="font-size:.82rem;font-weight:800">${escapeHtml(item.title)}</div>
              <div style="font-size:.74rem;color:var(--muted)">${escapeHtml(item.reason)}嚚?{escapeHtml(item.owner || '?芸???)}</div>
            </div>
            <button class="btn btn-sm btn-success" onclick="addTrainingItemFromTask(${item.taskId})">頧?蝺?/button>
          </div>
        `).join('')}
      </div>` : ''}
    </div>`;
}

function hasTrainingResult(item) {
  const result = item?.result || {};
  return Boolean(result.success || result.faults || result.seconds);
}

function getTrainingResultFillStats() {
  const rows = getTrainingItems();
  const filled = rows.filter(item => {
    const result = normalizeTrainingResult(item.result || {});
    return Number(result.success) || Number(result.faults) || Number(result.seconds) || result.errorReason || result.improvementTask || result.nextTarget || result.verification;
  });
  const missing = rows.filter(item => !item.done && !filled.includes(item));
  return {
    total: rows.length,
    filled: filled.length,
    rate: rows.length ? Math.round(filled.length / rows.length * 100) : 0,
    missing,
    missingAll: rows.filter(item => !filled.includes(item))
  };
}

function buildTrainingResultFillSummary() {
  const stats = getTrainingResultFillStats();
  return [
    '【ROV 訓練結果回填提醒】',
    `整體回填率：${stats.rate}%（${stats.filled}/${stats.total || 0}）`,
    ...(stats.missingAll.length ? stats.missingAll.map((item, i) => `${i + 1}. ${item.title}｜負責：${item.owner || '未分配'}｜目標：${item.target || '未設定'}`) : ['目前沒有未回填訓練結果。']),
    '',
    '補齊內容：成功次數、失誤次數、用時秒數、失誤原因、改善任務、下次目標、驗證狀態。'
  ].join('\n');
}
function getMissionRunReadiness() {
  const openTraining = getTrainingItems().filter(item => !item.done);
  const resultStats = getTrainingResultFillStats();
  const blocked = state.tasks.filter(t => t.status !== '撌脣??? && isTaskLocked(t)).length;
  const recentRuns = state.missionRuns.slice(-3);
  const hasRecentRun = recentRuns.length > 0;
  const checks = [
    { label:'隞閮毀??, done:openTraining.length >= 1, detail:openTraining.length ? `${openTraining.length} ??蝺循 : '撠撱箇?閮毀?? },
    { label:'蝯??‵', done:resultStats.total > 0 && resultStats.rate >= 60, detail:resultStats.total ? `${resultStats.rate}% 撌脣?憛冑 : '撠閮毀蝯?' },
    { label:'?餃?皜?', done:blocked === 0, detail:blocked ? `${blocked} ?憛 : '?⊿憛? },
    { label:'餈??箸?', done:hasRecentRun, detail:hasRecentRun ? `${recentRuns.length} 蝑?Mission Run` : '撠 Mission Run ?箸?' }
  ];
  const done = checks.filter(c => c.done).length;
  const score = Math.round(done / checks.length * 100);
  return {
    checks,
    score,
    label:score >= 75 ? '?臬???Mission Run' : score >= 50 ? '???蝻箏' : '?思?撱箄降摰 Run',
    color:score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--orange)' : 'var(--red)'
  };
}

function renderMissionRunReadinessPanel() {
  const el = document.getElementById('mission-run-readiness-panel');
  if (!el) return;
  const readiness = getMissionRunReadiness();
  el.innerHTML = `
    <div style="border:1px solid var(--border);border-left:5px solid ${readiness.color};border-radius:8px;background:var(--input-bg);padding:10px 12px">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        <div>
          <div style="font-size:.78rem;color:var(--muted);font-weight:900">Mission Run ??皞?摨?/div>
          <div style="font-size:.92rem;color:var(--navy);font-weight:900">${escapeHtml(readiness.label)}</div>
        </div>
        <div style="font-size:1.35rem;font-weight:900;color:${readiness.color}">${readiness.score}%</div>
      </div>
      <div class="prog-wrap" style="margin-bottom:8px"><div class="prog-bar" style="width:${readiness.score}%;background:${readiness.color}"></div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:7px">
        ${readiness.checks.map(check => `
          <div style="background:var(--white);border:1px solid var(--border);border-radius:7px;padding:7px 8px">
            <div style="font-size:.78rem;font-weight:900;color:${check.done ? 'var(--green)' : 'var(--orange)'}">${check.done ? '?? : '??'} ${escapeHtml(check.label)}</div>
            <div style="font-size:.72rem;color:var(--muted);margin-top:3px">${escapeHtml(check.detail)}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function getNextMissionRunTarget() {
  const rows = [...state.missionRuns].sort((a,b) => String(b.run_date || '').localeCompare(String(a.run_date || '')) || Number(b.id || 0) - Number(a.id || 0));
  if (!rows.length) {
    return {
      label:'撱箇??箸?',
      level:'mid',
      metrics:[
        { label:'?格?蝮賢?', value:'摰?擐憚', color:'var(--blue)' },
        { label:'憭梯炊', value:'閮??券', color:'var(--orange)' },
        { label:'????, value:'撱箇??箸?', color:'var(--navy)' },
        { label:'?冽?', value:'摰閮?', color:'var(--green)' }
      ],
      actions:['????頛芸??渲???Mission Run??, '閮?瘥活????仃隤方??∩?雿蔭??, '頝?敺??喳‵?亥??嚗??箔?銝頛芰璅皞?]
    };
  }
  const latest = rows[0];
  const previous = rows[1];
  const latestTotal = getMissionRunTotal(latest);
  const bestTotal = Math.max(...rows.map(getMissionRunTotal));
  const latestSuccess = Number(latest.success_rate) || 0;
  const latestFaults = Number(latest.faults) || 0;
  const latestSeconds = Number(latest.seconds) || 0;
  const targetScore = Math.max(latestTotal + 10, bestTotal);
  const targetFaults = Math.max(0, latestFaults - 1);
  const targetSuccess = latestSuccess ? Math.min(100, latestSuccess + 10) : 70;
  const targetSeconds = latestSeconds ? Math.max(0, latestSeconds - 30) : 0;
  const scoreDelta = previous ? latestTotal - getMissionRunTotal(previous) : 0;
  const actions = [
    `蝮賢??格?嚗撠?${targetScore} ?????${latestTotal}嚗?雿?${bestTotal}嚗,
    `憭梯炊?格?嚗??潭?蝑 ${targetFaults} 甈∴?????擃憭梯炊??{getErrorCategoryStats()[0]?.label || '?芸?憿?}?,
    latestSeconds ? `???格?嚗?嗅 ${targetSeconds} 蝘嚗???啣翰 30 蝘 : '???格?嚗頛芸????渲????,
    scoreDelta < 0 ? '銝?頛芸??訾???銝?頛芸?嫣????亥????踹????孵云憭? : '銝?頛芸??豢??????臭誑?岫?銝????蝑??
  ];
  return {
    label:scoreDelta >= 0 ? '???格?' : '?Ｗ儔?格?',
    level:scoreDelta >= 0 ? 'done' : 'urgent',
    metrics:[
      { label:'?格?蝮賢?', value:`${targetScore}`, color:'var(--green)' },
      { label:'憭梯炊銝?', value:`${targetFaults} 甈︶, color:targetFaults ? 'var(--orange)' : 'var(--green)' },
      { label:'???璅?, value:`${targetSuccess}%`, color:'var(--blue)' },
      { label:'?冽??格?', value:targetSeconds ? `${targetSeconds}s` : '?閮?', color:'var(--navy)' }
    ],
    actions
  };
}

function getTrainingSchedulePlan() {
  const latestRuns = [...state.missionRuns].sort((a,b) => String(b.run_date || '').localeCompare(String(a.run_date || '')) || Number(b.id || 0) - Number(a.id || 0)).slice(0, 3);
  const avgSuccess = getAverageMissionSuccessRate();
  const avgFaults = latestRuns.length ? Math.round(latestRuns.reduce((sum, r) => sum + (Number(r.faults) || 0), 0) / latestRuns.length) : 0;
  const bestStrategy = [...state.strategy].sort((a, b) => getStrategyValue(b) - getStrategyValue(a))[0];
  const actions = getTodayActionItems();
  const missionAction = actions.find(item => matchAny([item.title, item.reason], ['Mission','隞餃?','蝺渡?','?','?見','?','?'])) || actions[0];
  const errorTop = getErrorCategoryStats()[0];
  const duration = avgSuccess && avgSuccess < 65 ? 120 : avgFaults >= 3 ? 90 : 60;
  const blocks = [
    {
      time:'0-10 ??',
      title:'?瑼Ｘ + 隞?格?',
      detail:`蝣箄?隞雿?踹? 3 ??閮剖??祈憚?格?嚗?{avgSuccess ? `????${Math.min(100, avgSuccess + 10)}%` : '摰? 1 頛芸??渲???}?,
      owner:'? + ?毀',
      color:'var(--blue)'
    },
    {
      time:'10-35 ??',
      title:'撘梢??桅??毀',
      detail:missionAction ? `${missionAction.title}嚗????桅??毀嚗璅?? 3 甈⊥?? : '?豢?擃◢??Mission 隞餃????蝺湛??格???? 3 甈⊥???,
      owner:missionAction?.owner || 'Pilot + 撌亦?蝯?,
      color:'var(--orange)'
    },
    {
      time:'35-60 ??',
      title:'摰 Mission Run',
      detail:`摰閮?銝頛迎???憯???{errorTop?.label || '憭梯炊'}???格?憭梯炊撠 ${Math.max(0, avgFaults - 1)} 甈～,
      owner:'Pilot + 閮???,
      color:'var(--green)'
    },
    {
      time:duration > 60 ? '60-90 ??' : '?嗅偏 10 ??',
      title:'蝑隤踵 / Presentation 敹怠?敹怎?',
      detail:bestStrategy ? `瑼Ｘ蝑??{bestStrategy.name}??虫??舀?擃????湔銝?頛芷?摨 : '?渡??祈憚?????嚗票?亙?敹蒂瘙箏?銝?頛芷?摨?,
      owner:'蝑蝯?+ Presentation',
      color:'#7030A0'
    }
  ];
  if (duration > 90) {
    blocks.push({
      time:'90-120 ??',
      title:'??銝頛芷?霅?,
      detail:'?函???亙?頝?頛迎??芸?閮望銝????蝣箄??孵??臬????,
      owner:'?券?',
      color:'var(--red)'
    });
  }
  return {
    metrics:[
      { label:'撱箄降?', value:`${duration} ??`, color:'var(--navy)' },
      { label:'餈?????, value:avgSuccess ? `${avgSuccess}%` : '?芾???, color:avgSuccess >= 75 ? 'var(--green)' : 'var(--orange)' },
      { label:'撟喳?憭梯炊', value:latestRuns.length ? `${avgFaults} 甈︶ : '?芾???, color:avgFaults >= 3 ? 'var(--red)' : 'var(--green)' },
      { label:'?芸?撘梢?', value:errorTop?.label || '?芾???, color:'var(--blue)' }
    ],
    blocks
  };
}

function getTrainingItemsKey() {
  return TRAINING_ITEMS_KEY_PREFIX + currentSeason;
}

function getTrainingItems() {
  const rows = safeJsonParse(localStorage.getItem(getTrainingItemsKey()), []);
  return Array.isArray(rows) ? rows : [];
}

function saveTrainingItems(rows) {
  localStorage.setItem(getTrainingItemsKey(), JSON.stringify(rows.slice(0, 30)));
}

function addTrainingItemFromTask(taskId) {
  const task = state.tasks.find(t => Number(t.id) === Number(taskId));
  if (!task) return;
  const rows = getTrainingItems();
  if (rows.some(item => Number(item.taskId) === Number(taskId) && !item.done)) {
    showToast('??甇支遙?歇?其??亥?蝺湧?');
    return;
  }
  const reason = isTaskLocked(task) ? '??閫?憛?蝵殷????桅??毀' : isOverdue(task.due) ? '?暹?隞餃?頧?蝺湛?隞予閬??舫?霅??? : '敺??乩??唳頧閮毀';
  rows.unshift({
    id:'train_' + Date.now(),
    taskId:task.id,
    title:task.name,
    owner:task.owner || '?芸???,
    reason,
    target:getTrainingTargetForTask(task),
    createdAt:new Date().toISOString(),
    done:false
  });
  saveTrainingItems(rows);
  renderTrainingItemBoard();
  showToast('??撌脣??乩??亥?蝺湧?');
}

function getTrainingTargetForTask(task) {
  if (matchAny([task.name, task.note], ['?','?見','?','?','Mission','隞餃?'])) return '??? 3 甈⊥???銝西????憭梯炊';
  if (matchAny([task.name, task.note], ['閮剖?','?脫偌','蝺?','?券?,'??','??'])) return '摰? 20 ??蝛拙?皜祈岫銝西??撣?;
  if (matchAny([task.name, task.note], ['Presentation','?辣','?芾?','靽','蝪質?'])) return '摰?銝??漱頛詨嚗??箸瘙箏?憿?;
  return '摰?銝甈∪撽?瞍毀嚗?????銝?甇?;
}

function toggleTrainingItem(id) {
  const rows = getTrainingItems();
  const item = rows.find(row => row.id === id);
  if (!item) return;
  item.done = !item.done;
  item.doneAt = item.done ? new Date().toISOString() : null;
  saveTrainingItems(rows);
  renderTrainingItemBoard();
}

function updateTrainingItemResult(id, field, value) {
  const rows = getTrainingItems();
  const item = rows.find(row => row.id === id);
  if (!item) return;
  item.result = { ...(item.result || {}), [field]: value };
  item.resultUpdatedAt = new Date().toISOString();
  saveTrainingItems(rows);
  renderPrepEfficiencyScore();
}

function getTrainingTaskStatusSuggestion(item) {
  if (!item?.taskId) return null;
  const task = state.tasks.find(t => Number(t.id) === Number(item.taskId));
  if (!task || task.status === '撌脣???) return null;
  const result = item.result || {};
  const success = Number(result.success) || 0;
  const faults = Number(result.faults) || 0;
  const hasResult = success || faults || result.seconds;
  if (success >= 3 && faults <= 1) return { status:'撌脣???, label:'撱箄降摰?隞餃?', cls:'btn-success' };
  if (hasResult && task.status === '敺齒') return { status:'?脰?銝?, label:'撱箄降?脰?銝?, cls:'btn-primary' };
  return null;
}

async function applyTrainingTaskStatusSuggestion(itemId) {
  const item = getTrainingItems().find(row => row.id === itemId);
  const suggestion = getTrainingTaskStatusSuggestion(item);
  if (!item || !suggestion) return;
  const task = state.tasks.find(t => Number(t.id) === Number(item.taskId));
  if (!task) return;
  if (suggestion.status === '撌脣??? && isTaskLocked(task)) {
    showToast('?? ?蔭隞餃?撠摰?嚗??賣?閮???);
    return;
  }
  const before = {...task};
  await db.from('tasks').update({ status:suggestion.status }).eq('id', task.id);
  task.status = suggestion.status;
  await writeAuditLog('training_status_suggestion', 'tasks', task.id, before, task);
  refreshAfterTaskChange(false);
  renderTrainingItemBoard();
  renderTodayActionBoard();
  showToast(`??撌脫?隞餃?璅???{suggestion.status}`);
}

function clearDoneTrainingItems() {
  saveTrainingItems(getTrainingItems().filter(item => !item.done));
  renderTrainingItemBoard();
  showToast('已清除完成的訓練項');
}

function normalizeTrainingResult(result = {}) {
  return {
    success: result.success || '',
    faults: result.faults || '',
    seconds: result.seconds || '',
    errorReason: result.errorReason || '',
    improvementTask: result.improvementTask || '',
    nextTarget: result.nextTarget || '',
    verification: result.verification || ''
  };
}

function getTrainingResultNotes(item) {
  const result = normalizeTrainingResult(item.result || {});
  return [
    result.errorReason ? `失誤原因：${result.errorReason}` : '',
    result.improvementTask ? `改善任務：${result.improvementTask}` : '',
    result.nextTarget ? `下次目標：${result.nextTarget}` : '',
    result.verification ? `驗證：${result.verification}` : ''
  ].filter(Boolean);
}

function renderTrainingItemBoard() {
  const el = document.getElementById('training-item-board');
  if (!el) return;
  const rows = getTrainingItems();
  const open = rows.filter(item => !item.done);
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px">
      <span style="font-size:.82rem;color:var(--muted);font-weight:800">?芸???${open.length} / ?券 ${rows.length}</span>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-sm" onclick="getTodayActionItems().slice(0,3).forEach(item=>addTrainingItemFromTask(item.taskId))">?雿?踹? 3 ??/button>
        <button class="btn btn-sm" onclick="clearDoneTrainingItems()">皜撌脣???/button>
      </div>
    </div>
    <div style="display:grid;gap:7px">
      ${rows.length ? rows.map(item => `
        <div style="display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:start;border:1px solid var(--border);border-radius:8px;padding:8px;background:${item.done ? 'var(--lgreen)' : 'var(--input-bg)'}">
          <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleTrainingItem('${escapeAttr(item.id)}')">
          <div>
            <strong style="${item.done ? 'text-decoration:line-through;opacity:.7' : ''}">${escapeHtml(item.title)}</strong>
            <div style="font-size:.78rem;color:var(--muted)">?格?嚗?{escapeHtml(item.target)}嚚?鞎穿?${escapeHtml(item.owner)}</div>
            <div style="font-size:.76rem;color:var(--muted)">靘?嚗?{escapeHtml(item.reason)}</div>
            <div style="display:grid;grid-template-columns:repeat(3,minmax(70px,1fr));gap:6px;margin-top:7px;max-width:360px">
              <input type="text" value="${escapeHtml(item.result?.success || '')}" placeholder="成功次數" title="成功次數" onchange="updateTrainingItemResult('${escapeAttr(item.id)}','success',this.value)">
              <input type="text" value="${escapeHtml(item.result?.faults || '')}" placeholder="失誤次數" title="失誤次數" onchange="updateTrainingItemResult('${escapeAttr(item.id)}','faults',this.value)">
              <input type="text" value="${escapeHtml(item.result?.seconds || '')}" placeholder="用時秒數" title="用時秒數" onchange="updateTrainingItemResult('${escapeAttr(item.id)}','seconds',this.value)">
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,minmax(120px,1fr));gap:6px;margin-top:6px;max-width:360px">
              <input type="text" value="${escapeHtml(item.result?.errorReason || '')}" placeholder="失誤原因" title="失誤原因" onchange="updateTrainingItemResult('${escapeAttr(item.id)}','errorReason',this.value)">
              <input type="text" value="${escapeHtml(item.result?.verification || '')}" placeholder="驗證狀態" title="驗證狀態" onchange="updateTrainingItemResult('${escapeAttr(item.id)}','verification',this.value)">
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,minmax(120px,1fr));gap:6px;margin-top:6px;max-width:360px">
              <input type="text" value="${escapeHtml(item.result?.improvementTask || '')}" placeholder="改善任務" title="改善任務" onchange="updateTrainingItemResult('${escapeAttr(item.id)}','improvementTask',this.value)">
              <input type="text" value="${escapeHtml(item.result?.nextTarget || '')}" placeholder="下次目標" title="下次目標" onchange="updateTrainingItemResult('${escapeAttr(item.id)}','nextTarget',this.value)">
            </div>
            ${renderTrainingItemResultSummary(item)}
          </div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
            ${item.taskId ? `<button class="btn btn-sm" onclick="goToTaskAndOpen(${Number(item.taskId)})">隞餃?</button>` : ''}
            <button class="btn btn-sm btn-primary" onclick="fillMissionRunFromTrainingItem('${escapeAttr(item.id)}')">頧?Run</button>
            ${renderTrainingTaskStatusSuggestionButton(item)}
          </div>
        </div>
      `).join('') : '<div style="font-size:.86rem;color:var(--muted);font-weight:800">撠?閮毀???臬?隞雿?輯??乓?/div>'}
    </div>`;
}

function renderTrainingTaskStatusSuggestionButton(item) {
  const suggestion = getTrainingTaskStatusSuggestion(item);
  return suggestion ? `<button class="btn btn-sm ${suggestion.cls}" onclick="applyTrainingTaskStatusSuggestion('${escapeAttr(item.id)}')">${escapeHtml(suggestion.label)}</button>` : '';
}

function renderTrainingItemResultSummary(item) {
  const result = normalizeTrainingResult(item.result || {});
  const parts = [
    result.success ? `?? ${result.success}` : '',
    result.faults ? `憭梯炊 ${result.faults}` : '',
    result.seconds ? `?冽? ${result.seconds}s` : '',
    result.errorReason ? `原因 ${result.errorReason}` : '',
    result.verification ? `驗證 ${result.verification}` : ''
  ].filter(Boolean);
  return parts.length ? `<div style="font-size:.76rem;color:var(--blue);font-weight:800;margin-top:5px">蝯?嚗?{escapeHtml(parts.join('嚚?))}</div>` : '';
}

function fillMissionRunFromTrainingItem(id) {
  const item = getTrainingItems().find(row => row.id === id);
  if (!item) return;
  showMode('competition', document.querySelector('nav .tab-btn[data-mode="competition"]'));
  showPage('scoreboard');
  setTimeout(() => {
    const result = normalizeTrainingResult(item.result || {});
    const success = Number(result.success) || 0;
    const faults = Number(result.faults) || 0;
    const attempts = success + faults;
    const successRate = attempts ? Math.round(success / attempts * 100) : '';
    document.getElementById('score-round').value = document.getElementById('score-round').value || `Training ${new Date().toISOString().slice(5,10)}`;
    document.getElementById('score-pilot').value = document.getElementById('score-pilot').value || item.owner || '';
    document.getElementById('score-missions').value = item.title || '';
    document.getElementById('score-seconds').value = result.seconds || '';
    document.getElementById('score-faults').value = result.faults || '';
    document.getElementById('score-success-rate').value = successRate;
    document.getElementById('score-note').value = [
      `訓練項：${item.title || ''}`,
      `目標：${item.target || ''}`,
      `結果：${[result.success ? `成功 ${result.success}` : '', result.faults ? `失誤 ${result.faults}` : '', result.seconds ? `用時 ${result.seconds}s` : ''].filter(Boolean).join(' / ') || '未填'}`,
      `失誤原因：${result.errorReason || '未填'}`,
      `改善任務：${result.improvementTask || '未填'}`,
      `下次目標：${result.nextTarget || '未填'}`,
      `驗證：${result.verification || '未填'}`
    ].join('\n');
    updateMissionItemScorePreview();
    showToast('??撌脫?閮毀蝯?撣嗅 Mission Run 銵典');
  }, 0);
}
function renderCountdownChecklistPanel() {
  const el = document.getElementById('countdown-checklist-panel');
  if (!el) return;
  const groups = getCountdownChecklistGroups();
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
      ${groups.map(group => `
        <div style="border:1px solid var(--border);border-top:4px solid ${group.color};border-radius:8px;padding:10px;background:var(--input-bg)">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:7px">
            <strong style="color:var(--navy)">${escapeHtml(group.title)}</strong>
            <span class="badge ${group.items.length ? group.badge : 'done'}">${group.items.length}</span>
          </div>
          <div style="display:grid;gap:6px">
            ${(group.items.length ? group.items.slice(0, 6) : [{ text:'?怎???', owner:'', source:'' }]).map(item => `
              <div style="font-size:.82rem;border-bottom:1px solid var(--border);padding-bottom:5px">
                <div style="font-weight:800">${escapeHtml(item.text)}</div>
                <div style="font-size:.75rem;color:var(--muted)">${escapeHtml([item.owner, item.source].filter(Boolean).join('嚚?))}</div>
              </div>
            `).join('')}
          </div>
          ${group.items.length > 6 ? `<div style="font-size:.75rem;color:var(--muted);margin-top:5px">?行? ${group.items.length - 6} ?憿舐內</div>` : ''}
        </div>
      `).join('')}
    </div>`;
}

function getCountdownChecklistGroups() {
  const openTasks = state.tasks.filter(t => t.status !== '撌脣???);
  const today = openTasks.filter(t => isOverdue(t.due) || getTaskDueInfo(t).days === 0)
    .map(t => ({ text:t.name, owner:t.owner || '?芸???, source:isOverdue(t.due) ? `?暹? ${getOverdueDays(t.due)} 憭奈 : '隞?芣迫' }));
  const week = openTasks.filter(t => {
    const days = getTaskDueInfo(t).days;
    return days !== null && days > 0 && days <= 7;
  }).map(t => ({ text:t.name, owner:t.owner || '?芸???, source:`${getTaskDueInfo(t).days} ?亙?芣迫` }));
  const depart = [
    ...state.checklist.flatMap(sec => (sec.items || []).map(item => ({ item, sec })))
      .filter(({ item }) => !item.done && matchAny([item.text, item.owner], ['鋆拳','?辣','靽','霅瑞','蝪質?','?餅?','撌亙','Float','SID','DOC']))
      .map(({ item, sec }) => ({ text:item.text, owner:item.owner || '', source:sec.secName || '?魚皜' })),
    ...state.gearItems.filter(item => item.status !== '撌脰?蝞? && ['敹葆','?辣','撌亙'].includes(item.cat))
      .map(item => ({ text:item.name, owner:item.owner || '', source:`?抵?蝞?${item.box || item.cat || ''}` }))
  ];
  const predive = state.prediveChecklist.flatMap(sec => (sec.items || []).map(item => ({ item, sec })))
    .filter(({ item }) => !item.done)
    .map(({ item, sec }) => ({ text:item.text, owner:item.owner || '', source:sec.secName || 'Pre-Dive' }));
  return [
    { title:'隞', items:today, color:'var(--red)', badge:'urgent' },
    { title:'?祇?, items:week, color:'var(--orange)', badge:'mid' },
    { title:'?箇??, items:depart, color:'var(--blue)', badge:'inprog' },
    { title:'銝偌??, items:predive, color:'var(--green)', badge:'done' }
  ];
}

function renderWorkloadBalancePanel() {
  const el = document.getElementById('workload-balance-panel');
  if (!el) return;
  const rows = getTaskOwnerLoadRows();
  const suggestions = getWorkloadTransferSuggestions(rows);
  if (!rows.length) {
    el.innerHTML = '<div style="font-size:.86rem;color:var(--muted);font-weight:800">?桀?瘝??芸??遙???怎?極憯???/div>';
    return;
  }
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:9px;margin-bottom:10px">
      ${rows.slice(0, 6).map(row => {
        const pressure = getOwnerPressureLevel(row);
        return `<button class="btn" onclick="showMode('prep', document.querySelector('nav .tab-btn[data-mode=&quot;prep&quot;]'));showPage('tasks');setTimeout(()=>filterTasksByOwner('${escapeAttr(row.owner)}'),0)" style="text-align:left;background:var(--input-bg);color:var(--text);border:1px solid var(--border);border-left:4px solid ${pressure.color}">
          <div style="font-weight:900">${escapeHtml(row.owner)}</div>
          <div style="font-size:.78rem;color:var(--muted)">${row.open} ?芸???${row.overdue} ?暹?嚚?{row.week} ?祇?/div>
          <div style="font-size:.78rem;color:${pressure.color};font-weight:900;margin-top:4px">${pressure.label}</div>
        </button>`;
      }).join('')}
    </div>
    <div style="font-weight:900;color:var(--navy);font-size:.84rem;margin-bottom:6px">頧晷撱箄降</div>
    <div style="display:grid;gap:7px">
      ${suggestions.length ? suggestions.map(s => `
        <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--input-bg)">
          <div>
            <strong>${escapeHtml(s.task.name)}</strong>
            <div style="font-size:.78rem;color:var(--muted)">??${escapeHtml(s.from)} ?頧晷蝯?${escapeHtml(s.to)}嚚???${escapeHtml(s.reason)}</div>
          </div>
          <button class="btn btn-sm" onclick="goToTaskAndOpen(${s.task.id})">?亦?</button>
        </div>
      `).join('') : '<div style="font-size:.84rem;color:var(--muted);font-weight:800">?桀?瘝??＊?閬?瘣曄?隞餃???/div>'}
    </div>`;
}

function getOwnerPressureLevel(row) {
  const score = row.overdue * 4 + row.week * 2 + row.open;
  if (score >= 12) return { label:'擃?嚗遣霅唳?隞餃?', color:'var(--red)' };
  if (score >= 7) return { label:'??嚗???', color:'var(--orange)' };
  return { label:'?舀??, color:'var(--green)' };
}

function getWorkloadTransferSuggestions(rows) {
  const overloaded = rows.filter(row => getOwnerPressureLevel(row).color !== 'var(--green)' && row.owner !== '?芸???);
  const candidates = rows.filter(row => getOwnerPressureLevel(row).color === 'var(--green)' && row.owner !== '?芸???);
  if (!overloaded.length || !candidates.length) return [];
  return overloaded.flatMap((row, rowIndex) => {
    const target = candidates[rowIndex % candidates.length];
    return state.tasks
      .filter(t => t.status !== '撌脣??? && (t.owner || '?芸???) === row.owner && !isOverdue(t.due) && !isTaskLocked(t))
      .sort((a, b) => getTaskPriorityScore(a) - getTaskPriorityScore(b))
      .slice(0, 1)
      .map(task => ({ task, from:row.owner, to:target.owner, reason:`${row.open} ?摰?嚗?{target.owner} 憯?頛?` }));
  }).slice(0, 4);
}

/**
 * 皜脫?瘥銝?閮毀?誘?? */
function renderDailyDirectives() {
  const openTasks = state.tasks.filter(t => t.status !== '撌脣???);
  const mission = pickPriorityTask(openTasks, ['Mission','蝺渡?','?','?見','?','?','Five Pan','Fishing']) || state.strategy.sort((a,b)=>getStrategyValue(b)-getStrategyValue(a))[0];
  const equipment = pickPriorityTask(openTasks, ['撌亦?','閮剖?','甇餅?','?餅?','蝺?','憭拍?','?脫偌','?券?,'??']);
  const docs = pickPriorityTask(openTasks, ['Presentation','?辣','靽','蝪質?','鞈潛巨','雿挪','?芾?','霅瑞']);
  const directives = [
    { title:'隞予敹毀 Mission', text: mission?.name || mission?.note || '?訾???擃?/?擃◢?芯遙??摰閮?蝺渡?', owner: mission?.owner || 'Pilot + 撌亦?蝯? },
    { title:'隞予敹耨閮剖?', text: equipment?.name || '摰??餅???蝥?????瘞游??炎??, owner: equipment?.owner || '撌亦?蝯? },
    { title:'隞予敹漱?辣', text: docs?.name || '蝣箄? Presentation?閰”???芥偷霅??箄??辣??啁???, owner: docs?.owner || 'CEO / ?毀' }
  ];
  document.getElementById('daily-directives').innerHTML = directives.map((d, i) => `
    <div class="directive-card">
      <div style="font-size:.78rem;color:var(--blue);font-weight:900">#${i + 1} ${d.title}</div>
      <div style="font-size:1rem;font-weight:800;margin:3px 0">${escapeHtml(d.text)}</div>
      <div style="font-size:.78rem;color:var(--muted)">鞎痊嚗?{escapeHtml(d.owner || '?芣?摰?)}</div>
    </div>
  `).join('');
}

/**
 * 皜脫?憭梯炊????璁? */
function renderErrorAnalysis() {
  const ranked = getErrorCategoryStats();
  document.getElementById('error-analysis').innerHTML = ranked.map((cat, i) => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="width:24px;font-weight:900;color:var(--navy)">#${i + 1}</div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:3px"><strong>${cat.label}</strong><span>${cat.count} 甈?/span></div>
        <div class="prog-wrap"><div class="prog-bar" style="width:${Math.min(100, cat.count * 25)}%;background:${cat.count ? 'var(--red)' : 'var(--green)'}"></div></div>
      </div>
    </div>
  `).join('') + '<div style="font-size:.76rem;color:var(--muted);margin-top:8px">靘?嚗毀蝧???閮餉? Mission Run ?酉/隞餃?????/div>';
}

/**
 * 皜脫?鞈賢?抵?蝞望??柴? */
function renderGearList() {
  renderGearDepartureSummary();
  const statusColors = { '?芾?蝞?:'#FFD6D6', '撌脰?蝞?:'#D5F5E3', '敹葆':'#FFD6D6', '?':'#D6EAF8', '??:'#FFF3CD' };
  const rows = [...state.gearItems].sort((a,b) => {
    const aUrgent = a.cat === '敹葆' && a.status !== '撌脰?蝞? ? 0 : 1;
    const bUrgent = b.cat === '敹葆' && b.status !== '撌脰?蝞? ? 0 : 1;
    return aUrgent - bUrgent || String(a.cat || '').localeCompare(String(b.cat || ''));
  });
  document.getElementById('gear-list').innerHTML = rows.map(item => {
    const packed = item.status === '撌脰?蝞?;
    return `
    <div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);${item.cat === '敹葆' && !packed ? 'background:#FFF8F8' : ''}">
      <input type="checkbox" ${packed ? 'checked' : ''} onchange="toggleGearPacked(${item.id}, this.checked)" style="width:22px;height:22px">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <div style="font-size:.76rem;color:var(--muted)">${escapeHtml(item.cat || '?芸?憿?)} 繚 ${escapeHtml(item.box || '?芾身摰?蝵?)} 繚 鞎痊嚗?{escapeHtml(item.owner || '?芣?摰?)}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn btn-sm" style="background:${statusColors[item.status] || '#eee'};color:#333" onclick="cycleGearStatus(${item.id})">${item.status || '?芾?蝞?}</button>
        <button class="btn btn-sm btn-danger" onclick="deleteGearItem(${item.id})">?芷</button>
      </div>
    </div>
  `; }).join('') || '<div style="color:#999;font-size:.85rem">撠?抵??</div>';
}

/**
 * 皜脫??箇?鞈撠?閬? */
function renderGearDepartureSummary() {
  const must = state.gearItems.filter(item => item.cat === '敹葆');
  const missing = must.filter(item => item.status !== '撌脰?蝞?);
  const doneText = missing.length ? `隞? ${missing.length} 隞嗅?撣嗆鋆拳` : '?臭誑?箇';
  const bg = missing.length ? '#FFF3CD' : '#D5F5E3';
  const color = missing.length ? '#7F6000' : '#1F6B35';
  const next = missing.slice(0, 3).map(item => `${item.name}嚗?{item.box || '?芾身摰?蝵?}嚗).join('??);
  document.getElementById('gear-departure-summary').innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;background:${bg};color:${color};padding:10px 12px;border-radius:8px;font-weight:800">
      <div>?箇?撠?${doneText}</div>
      <div style="font-size:.78rem;font-weight:600">${missing.length ? escapeHtml(next) : '敹葆?抵?撌脣?刻?蝞?}</div>
    </div>`;
}

/**
 * 皜脫? Presentation 瞍毀閰?銵具? */
function renderPresentationScorecard() {
  const rows = [...state.presentationRuns].sort((a,b)=>String(b.run_date || '').localeCompare(String(a.run_date || '')));
  if (!document.getElementById('pres-date').value) document.getElementById('pres-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('presentation-scorecard').innerHTML = `
    <details class="card mobile-collapse-table" style="padding:10px 14px">
      <summary>瞍毀閮?閰喟敦銵冽</summary>
    <div class="long-table-wrap">
      <table>
        <thead><tr><th>?交?</th><th>銝餉?</th><th>蝮賢?</th><th>蝯?</th><th>?銵?/th><th>銵券?</th><th>Q&A</th><th>閰? / 銝活?孵?</th><th>??</th></tr></thead>
        <tbody>${rows.map(run => {
          const total = getPresentationTotal(run);
          return `<tr>
            <td>${escapeHtml(run.run_date || '')}</td>
            <td>${escapeHtml(run.speaker || '')}</td>
            <td><strong style="color:var(--navy)">${total}/40</strong></td>
            <td>${Number(run.structure_score) || 0}</td>
            <td>${Number(run.technical_score) || 0}</td>
            <td>${Number(run.delivery_score) || 0}</td>
            <td>${Number(run.qa_score) || 0}</td>
            <td><div style="font-size:.78rem">${escapeHtml(run.comment || '')}</div><div style="font-size:.75rem;color:var(--muted)">${escapeHtml(run.next_action || '')}</div></td>
            <td><button class="btn btn-sm btn-danger" onclick="deletePresentationRun(${run.id})">?芷</button></td>
          </tr>`;
        }).join('') || '<tr><td colspan="9" style="text-align:center;color:#999;padding:14px">撠 Presentation 瞍毀蝝??/td></tr>'}</tbody>
      </table>
    </div>
    </details>`;
}

/**
 * 皜脫? 2026 Presentation ??憿澈?? */
function renderPresentationQuestionBank() {
  const el = document.getElementById('presentation-question-bank');
  if (!el) return;
  el.innerHTML = `
    <div style="background:#F8FBFF;border:1px solid var(--border);border-radius:8px;padding:10px 12px">
      <div style="font-weight:900;color:var(--navy);margin-bottom:6px">2026 Float / Non-ROV Device ??憿澈</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:6px">
        ${PRESENTATION_2026_QUESTIONS.map((q, i) => `<div style="font-size:.82rem;padding:6px 8px;border-radius:6px;background:var(--white)">Q${i + 1}. ${escapeHtml(q)}</div>`).join('')}
      </div>
    </div>`;
}

/**
 * 頛撌脖?摮? Float 撠????批捆?? */
function renderSavedFloatPacketTool() {
  const input = document.getElementById('float-packet-input');
  if (!input) return;
  input.value = localStorage.getItem('rov_float_packets_' + currentSeason) || '';
  if (input.value.trim()) analyzeFloatPackets(false);
  else renderFloatPacketSummary(null);
}

/**
 * 頛 Float 撠?蝷箔?嚗靘踵葫閰行楛摨衣????”?? */
function loadFloatPacketExample() {
  const lines = [
    'EX01 00:00 UTC 24.5 kpa 2.50 meters',
    'EX01 00:05 UTC 24.6 kpa 2.51 meters',
    'EX01 00:10 UTC 24.4 kpa 2.49 meters',
    'EX01 00:15 UTC 24.3 kpa 2.48 meters',
    'EX01 00:20 UTC 24.7 kpa 2.52 meters',
    'EX01 00:25 UTC 24.6 kpa 2.51 meters',
    'EX01 00:30 UTC 24.5 kpa 2.50 meters',
    'EX01 00:35 UTC 3.9 kpa 0.40 meters',
    'EX01 00:40 UTC 4.0 kpa 0.41 meters',
    'EX01 00:45 UTC 4.1 kpa 0.42 meters',
    'EX01 00:50 UTC 3.8 kpa 0.39 meters',
    'EX01 00:55 UTC 4.0 kpa 0.41 meters',
    'EX01 01:00 UTC 3.9 kpa 0.40 meters',
    'EX01 01:05 UTC 4.0 kpa 0.41 meters',
    'EX01 01:10 UTC 24.5 kpa 2.50 meters',
    'EX01 01:15 UTC 24.7 kpa 2.52 meters',
    'EX01 01:20 UTC 24.4 kpa 2.49 meters',
    'EX01 01:25 UTC 24.5 kpa 2.50 meters',
    'EX01 01:30 UTC 4.0 kpa 0.41 meters',
    'EX01 01:35 UTC 3.9 kpa 0.40 meters'
  ];
  document.getElementById('float-packet-input').value = lines.join('\n');
  analyzeFloatPackets();
}

/**
 * 皜 Float 撠?撌亙?? */
function clearFloatPacketTool() {
  document.getElementById('float-packet-input').value = '';
  localStorage.removeItem('rov_float_packets_' + currentSeason);
  localStorage.removeItem('rov_float_last_analysis_' + currentSeason);
  renderFloatPacketSummary(null);
  chartInstances.floatDepth?.destroy();
  markDirty('competition');
  renderFloatJudgeCard();
}

/**
 * ?? Float data packets 銝衣鼓鋆賣楛摨行????? * @param {boolean} showMessage ?臬憿舐內?內?? */
function analyzeFloatPackets(showMessage = true) {
  const raw = document.getElementById('float-packet-input')?.value || '';
  localStorage.setItem('rov_float_packets_' + currentSeason, raw);
  const packets = parseFloatPackets(raw);
  const analysis = buildFloatPacketAnalysis(packets, raw);
  renderFloatPacketSummary(analysis);
  renderFloatDepthChart(packets);
  markDirty('competition');
  renderFloatJudgeCard();
  if (showMessage) showToast(packets.length ? `??撌脣???${packets.length} 蝑?Float 撠?` : '?? ?芾圾???撠?');
}

/**
 * 閫?? Float data packets?? * @param {string} raw ??撠????? * @returns {Array<object>} 撌脰圾???? */
function parseFloatPackets(raw) {
  return raw.split(/\r?\n/)
    .map((line, index) => parseFloatPacketLine(line, index))
    .filter(Boolean);
}

/**
 * 閫???株? Float 撠??? * @param {string} line ??銵? * @param {number} index 銵?蝝Ｗ??? * @returns {object|null} 撠?鞈??? */
function parseFloatPacketLine(line, index) {
  const text = line.trim();
  if (!text) return null;
  const company = text.match(/\b[A-Z]{1,3}\d{1,3}\b/i)?.[0] || '';
  const timeText = text.match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/)?.[0] || '';
  const seconds = parseFloatPacketTime(timeText, index);
  const depthMatch = text.match(/(-?\d+(?:\.\d+)?)\s*(meters?|metres?|m|centimeters?|centimetres?|cm)\b/i);
  const pressureMatch = text.match(/(-?\d+(?:\.\d+)?)\s*(kpa|pa)\b/i);
  let depthMeters = null;
  if (depthMatch) depthMeters = convertDepthToMeters(Number(depthMatch[1]), depthMatch[2]);
  else if (pressureMatch) depthMeters = convertPressureToDepthMeters(Number(pressureMatch[1]), pressureMatch[2]);
  return {
    raw:text,
    company,
    timeText,
    seconds,
    depthMeters,
    hasPressure:Boolean(pressureMatch),
    hasDepth:Boolean(depthMatch)
  };
}

/**
 * 撠???銝脰??箇??詻? * @param {string} value ??摮葡?? * @param {number} fallbackIndex fallback 摨??? * @returns {number} 蝘?? */
function parseFloatPacketTime(value, fallbackIndex) {
  if (!value) return fallbackIndex * 5;
  const parts = value.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

/**
 * 撠楛摨血雿??箇掖?? * @param {number} value ?詨潦? * @param {string} unit ?桐??? * @returns {number} 蝐喋? */
function convertDepthToMeters(value, unit) {
  return /cm|cent/i.test(unit) ? value / 100 : value;
}

/**
 * 撠????交?蝞瘞湔楛嚗?閮毀?”雿輻?? * @param {number} value 憯??詨潦? * @param {string} unit 憯??桐??? * @returns {number} 蝝瘞湔楛蝐喋? */
function convertPressureToDepthMeters(value, unit) {
  const kpa = unit.toLowerCase() === 'pa' ? value / 1000 : value;
  return kpa / 9.80665;
}

/**
 * 撱箇? Float 撠?瑼Ｘ蝯??? * @param {Array<object>} packets 撌脰圾???? * @param {string} raw ?????? * @returns {object} ??蝯??? */
function buildFloatPacketAnalysis(packets, raw) {
  const analysis = {
    total: packets.length,
    rawLines: raw.split(/\r?\n/).filter(line => line.trim()).length,
    hasCompany: packets.some(p => p.company),
    hasTime: packets.some(p => p.timeText),
    hasDepthOrPressure: packets.some(p => p.hasDepth || p.hasPressure),
    enoughForGraph: packets.length >= 20,
    range25: checkFloatDepthSequence(packets, 2.27, 2.83),
    range40: checkFloatDepthSequence(packets, 0.07, 0.73)
  };
  analysis.autoScore = calculateFloatAutoScore(analysis);
  localStorage.setItem('rov_float_last_analysis_' + currentSeason, JSON.stringify(analysis));
  return analysis;
}

/**
 * ?寞?撠???隡啁? MATE Floats ?航????詻? * @param {object} analysis Float 撠????? * @returns {{score:number,items:Array<object>,needsMateData:boolean}} ?芸??文??? */
function calculateFloatAutoScore(analysis) {
  const items = [
    { id:'pre_dive_packet', label:'銝???/ ?函蔡?????data packet', score:analysis.hasCompany && analysis.hasTime && analysis.hasDepthOrPressure ? 5 : 0, max:5 },
    { id:'hold_25m', label:'?航??雁??2.5m 瘛勗漲 30 蝘?, score:analysis.range25.ok ? 5 : 0, max:5 },
    { id:'hold_40cm', label:'?航??雁??40cm 瘛勗漲 30 蝘?, score:analysis.range40.ok ? 5 : 0, max:5 },
    { id:'data_packets', label:'?敺撅內頞喳? data packets', score:analysis.enoughForGraph ? 10 : (analysis.total > 0 ? 5 : 0), max:10 },
    { id:'depth_graph', label:'?舐鼓鋆?depth-time graph', score:analysis.enoughForGraph ? 10 : 0, max:10 }
  ];
  return {
    score:items.reduce((sum, item) => sum + item.score, 0),
    items,
    needsMateData:!analysis.enoughForGraph
  };
}

/**
 * 霈??餈?甈?Float 撠????? * @returns {object|null} ?餈??? */
function getLastFloatAnalysis() {
  try {
    const raw = localStorage.getItem('rov_float_last_analysis_' + currentSeason);
    return raw ? JSON.parse(raw) : null;
  } catch(e) {
    return null;
  }
}

/**
 * 瑼Ｘ?臬??7 蝑??鞈??賢??瘛勗漲蝭?銝西??? 30 蝘? * @param {Array<object>} packets 撠??? * @param {number} min ?撠楛摨艾? * @param {number} max ?憭扳楛摨艾? * @returns {{ok:boolean,count:number,span:number}} 瑼Ｘ蝯??? */
function checkFloatDepthSequence(packets, min, max) {
  let best = { ok:false, count:0, span:0 };
  let current = [];
  packets.forEach(packet => {
    const inRange = Number.isFinite(packet.depthMeters) && packet.depthMeters >= min && packet.depthMeters <= max;
    if (inRange) current.push(packet);
    else current = [];
    const span = current.length > 1 ? current[current.length - 1].seconds - current[0].seconds : 0;
    if (current.length > best.count || span > best.span) best = { ok:current.length >= 7 && span >= 30, count:current.length, span };
  });
  return best;
}

/**
 * 皜脫? Float 撠??????? * @param {object|null} analysis ??蝯??? */
function renderFloatPacketSummary(analysis) {
  const el = document.getElementById('float-packet-summary');
  if (!el) return;
  if (!analysis) {
    el.innerHTML = '<div style="font-size:.85rem;color:var(--muted)">鞎潔? data packets 敺?蝟餌絞?炎?交撘?0 蝑??楛摨衣?????? 30 蝘?瘙?/div>';
    return;
  }
  const autoScore = analysis.autoScore || calculateFloatAutoScore(analysis);
  const checks = [
    { label:'Company number', ok:analysis.hasCompany },
    { label:'Time data', ok:analysis.hasTime },
    { label:'Pressure / Depth data', ok:analysis.hasDepthOrPressure },
    { label:'?喳? 20 蝑?graph 鞈?', ok:analysis.enoughForGraph },
    { label:'2.5m 蝭? 7 蝑?/ 30 蝘?, ok:analysis.range25.ok, detail:`${analysis.range25.count} 蝑?${analysis.range25.span}s` },
    { label:'40cm 蝭? 7 蝑?/ 30 蝘?, ok:analysis.range40.ok, detail:`${analysis.range40.count} 蝑?${analysis.range40.span}s` }
  ];
  el.innerHTML = `
    <div class="card-grid" style="margin-bottom:8px">
      <div class="stat-card"><div class="stat-num">${analysis.total}</div><div class="stat-label">撌脰圾????/div></div>
      <div class="stat-card" style="border-top-color:${analysis.enoughForGraph ? 'var(--green)' : 'var(--red)'}"><div class="stat-num" style="color:${analysis.enoughForGraph ? 'var(--green)' : 'var(--red)'}">${analysis.enoughForGraph ? 'OK' : '銝雲'}</div><div class="stat-label">Graph 20 蝑?瘙?/div></div>
      <div class="stat-card" style="border-top-color:#7030A0"><div class="stat-num" style="color:#7030A0">${autoScore.score}</div><div class="stat-label">撠??航???</div></div>
    </div>
    ${checks.map(c => `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--border);font-size:.82rem">
      <strong>${c.ok ? '?? : '??'} ${escapeHtml(c.label)}</strong>
      <span style="color:var(--muted)">${escapeHtml(c.detail || (c.ok ? '??' : '?鋆?))}</span>
    </div>`).join('')}
    <div style="margin-top:8px;background:#F8FBFF;border:1px solid var(--border);border-radius:8px;padding:8px 10px">
      <div style="font-weight:900;color:var(--navy);margin-bottom:4px">Float Score ?芸??文?</div>
      ${autoScore.items.map(item => `<div style="display:flex;justify-content:space-between;gap:8px;font-size:.8rem;padding:4px 0;border-bottom:1px solid #eef">
        <span>${item.score ? '?? : '??'} ${escapeHtml(item.label)}</span><strong>${item.score}/${item.max}</strong>
      </div>`).join('')}
      <div style="font-size:.78rem;color:${autoScore.needsMateData ? 'var(--red)' : 'var(--green)'};margin-top:6px;font-weight:800">
        ${autoScore.needsMateData ? '撱箄降嚗???頞?20 蝑?皞????方?瘙?MATE data?? : 'Graph 鞈?頞喳?嚗撅內?芸振 Float depth-time graph??}
      </div>
      <button class="btn btn-sm btn-primary" style="margin-top:8px" onclick="applyFloatAutoScoreToMissionForm()">憟?啗??銵典</button>
    </div>`;
}

/**
 * 蝜芾ˊ Float depth-time graph?? * @param {Array<object>} packets 撠??? */
function renderFloatDepthChart(packets) {
  if (typeof Chart === 'undefined') return;
  const canvas = document.getElementById('float-depth-chart');
  if (!canvas) return;
  chartInstances.floatDepth?.destroy();
  const rows = packets.filter(p => Number.isFinite(p.depthMeters));
  chartInstances.floatDepth = new Chart(canvas, {
    type:'line',
    data:{
      labels:rows.map(p => p.timeText || `${p.seconds}s`),
      datasets:[
        { label:'瘛勗漲(m)', data:rows.map(p => Number(p.depthMeters.toFixed(2))), borderColor:'#2F75B5', backgroundColor:'rgba(47,117,181,.12)', tension:.25 },
        { label:'2.27m 銝?', data:rows.map(() => 2.27), borderColor:'#70AD47', borderDash:[5,5], pointRadius:0 },
        { label:'2.83m 銝?', data:rows.map(() => 2.83), borderColor:'#70AD47', borderDash:[5,5], pointRadius:0 },
        { label:'0.07m 銝?', data:rows.map(() => 0.07), borderColor:'#C65911', borderDash:[5,5], pointRadius:0 },
        { label:'0.73m 銝?', data:rows.map(() => 0.73), borderColor:'#C65911', borderDash:[5,5], pointRadius:0 }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      scales:{ y:{ reverse:true, beginAtZero:true, title:{ display:true, text:'Depth (m)' } } },
      plugins:{ legend:{ position:'bottom' } }
    }
  });
}

/**
 * 撠?Float ?芸??文?蝯?憟??Mission Run 銵典?? */
function applyFloatAutoScoreToMissionForm() {
  const analysis = getLastFloatAnalysis();
  if (!analysis?.autoScore) {
    showToast('?? 隢??? Float 撠?');
    return;
  }
  const items = MISSION_SCORE_TEMPLATES.mateFloats.items.filter(item => {
    if (item.id === 'pre_dive_packet') return analysis.autoScore.items.find(x => x.id === 'pre_dive_packet')?.score;
    if (item.id === 'p1_25m_hold' || item.id === 'p2_25m_hold') return analysis.range25.ok;
    if (item.id === 'p1_40cm_hold' || item.id === 'p2_40cm_hold') return analysis.range40.ok;
    if (item.id === 'all_packets') return analysis.enoughForGraph;
    if (item.id === 'one_packet') return !analysis.enoughForGraph && analysis.total > 0;
    if (item.id === 'depth_graph') return analysis.enoughForGraph;
    if (item.id === 'mate_data_graph') return !analysis.enoughForGraph;
    return false;
  });
  const gross = items.filter(item => item.score > 0).reduce((sum, item) => sum + item.score, 0);
  const penalty = Math.abs(items.filter(item => item.score < 0).reduce((sum, item) => sum + item.score, 0));
  document.getElementById('score-round').value = document.getElementById('score-round').value || 'Float Data Packet Review';
  document.getElementById('mission-score-station').value = 'Ice Tank';
  renderMissionScoreTemplateSelect(true);
  document.getElementById('mission-score-template').value = 'mateFloats';
  renderMissionScoreItems();
  document.getElementById('score-missions').value = 'MATE Floats嚗? + items.map(item => item.label).join('??);
  document.getElementById('score-gross').value = gross || '';
  document.getElementById('score-penalty').value = penalty || '';
  document.getElementById('score-note').value = analysis.autoScore.needsMateData ? '撠?銝雲 20 蝑??皞????方?瘙?MATE data?? : '撠?頞喳?嚗撅內?芸振 depth-time graph??;
  updateMissionScorePreview();
  showMode('competition');
  showPage('competition');
  openMissionRunModal();
  showToast('??Float ?芸??文?撌脣??典閮??輯”??);
}


/**
 * 皜脫?閫鈭斗?～? */
function renderHandoffCards() {
  const el = document.getElementById('handoff-cards');
  if (!el) return;
  el.innerHTML = state.members.map((m, i) => {
    const backup = state.members[(i + 1) % Math.max(1, state.members.length)]?.name || '?毀';
    return `<div class="handoff-card">
      <div style="font-weight:900;color:var(--navy)">${escapeHtml(m.name)}</div>
      <div style="font-size:.78rem;color:var(--muted);margin-bottom:6px">${escapeHtml(m.role || '?芾身摰???)}</div>
      <div style="font-size:.8rem"><strong>?嗅予鞎砌遙嚗?/strong>${escapeHtml((m.tasks || []).slice(0,2).join(' / ') || '敺???)}</div>
      <div style="font-size:.8rem"><strong>?典??誘嚗?/strong>${escapeHtml(getRoleCommand(m.role))}</div>
      <div style="font-size:.8rem"><strong>?鈭綽?</strong>${escapeHtml(backup)}</div>
    </div>`;
  }).join('') || '<div style="color:#999;font-size:.85rem">撠?鞈?</div>';
}

/**
 * ?啣??抵???? */
function addGearItem() {
  const item = {
    id: Date.now(),
    name: document.getElementById('gear-name').value.trim(),
    cat: document.getElementById('gear-cat').value.trim(),
    box: document.getElementById('gear-box').value.trim(),
    owner: document.getElementById('gear-owner').value.trim(),
    status: '?芾?蝞?
  };
  if (!item.name) { showToast('隢撓?亦鞈?蝔?); return; }
  state.gearItems.push(item);
  saveLocalGearItems();
  ['gear-name','gear-box','gear-owner'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('gear-cat').value = '敹葆';
  renderGearList();
}

/**
 * 銝?萄???2026 MATE Floats 敹葆?抵?璅⊥?? */
function applyFloatGearTemplate() {
  let added = 0;
  FLOAT_GEAR_TEMPLATE.forEach(template => {
    const exists = state.gearItems.some(item => item.name === template.name);
    if (exists) return;
    state.gearItems.push({ id: Date.now() + added, status:'?芾?蝞?, ...template });
    added++;
  });
  saveLocalGearItems();
  renderGearList();
  showToast(added ? `??撌脣???${added} ??Float ?抵?` : '?對? Float ?抵?璅⊥撌脣???);
}

/**
 * 敺芰?抵???? * @param {number} id ?抵? ID?? */
function cycleGearStatus(id) {
  const order = ['?芾?蝞?,'撌脰?蝞?];
  const item = state.gearItems.find(x => x.id === id);
  if (!item) return;
  item.status = order[(order.indexOf(item.status) + 1) % order.length];
  saveLocalGearItems();
  renderGearList();
}

/**
 * ???抵??臬撌脰?蝞晞? * @param {number} id ?抵? ID?? * @param {boolean} packed ?臬撌脰?蝞晞? */
function toggleGearPacked(id, packed) {
  const item = state.gearItems.find(x => x.id === id);
  if (!item) return;
  item.status = packed ? '撌脰?蝞? : '?芾?蝞?;
  saveLocalGearItems();
  renderGearList();
}

/**
 * 閮? Presentation 瞍毀蝮賢??? * @param {object} run 瞍毀蝝?? * @returns {number} 40 ?蝮賢??? */
function getPresentationTotal(run) {
  return ['structure_score','technical_score','delivery_score','qa_score']
    .reduce((sum, key) => sum + (Number(run[key]) || 0), 0);
}

function renderPresentationTrendPanel() {
  const el = document.getElementById('presentation-trend-panel');
  if (!el) return;
  const rows = [...state.presentationRuns].sort((a,b)=>String(b.run_date || '').localeCompare(String(a.run_date || '')));
  if (!rows.length) {
    el.innerHTML = '<div class="card" style="padding:10px 14px"><strong style="color:var(--navy)">瞍毀頞典</strong><div style="font-size:.86rem;color:var(--muted);font-weight:800;margin-top:6px">撠??Presentation 瞍毀蝝??摰?銝甈∟????＊蝷箸??啁蜇??撘梢???甈⊥?閰脩毀隞暻潦?/div></div>';
    return;
  }
  const latest = rows[0];
  const previous = rows[1];
  const latestTotal = getPresentationTotal(latest);
  const previousTotal = previous ? getPresentationTotal(previous) : null;
  const delta = previousTotal === null ? null : latestTotal - previousTotal;
  const dims = [
    ['蝯?', Number(latest.structure_score) || 0],
    ['?銵?, Number(latest.technical_score) || 0],
    ['銵券?', Number(latest.delivery_score) || 0],
    ['Q&A', Number(latest.qa_score) || 0]
  ].sort((a,b)=>a[1]-b[1]);
  const weakest = dims[0];
  const action = latest.next_action || `銝活?閰脩毀??{weakest[0]}???? ${weakest[0]} ?? 1 ????摰瞍毀?;
  const bars = dims.map(([label, value]) => {
    const color = value >= 8 ? 'var(--green)' : value >= 6 ? 'var(--orange)' : 'var(--red)';
    return `<div>
      <div style="display:flex;justify-content:space-between;font-size:.78rem;font-weight:900;margin-bottom:3px"><span>${label}</span><span style="color:${color}">${value}/10</span></div>
      <div class="prog-wrap"><div class="prog-bar" style="width:${Math.min(100, value * 10)}%;background:${color}"></div></div>
    </div>`;
  }).join('');
  const trendKeys = [
    ['蝯?','structure_score'],
    ['?銵?,'technical_score'],
    ['銵券?','delivery_score'],
    ['Q&A','qa_score']
  ];
  const recent = rows.slice(0, 3);
  const miniTrend = recent.length >= 2 ? trendKeys.map(([label, key]) => {
    const latestValue = Number(recent[0][key]) || 0;
    const baseValue = Number(recent[recent.length - 1][key]) || 0;
    const diff = latestValue - baseValue;
    const symbol = diff > 0 ? '?? : diff < 0 ? '?? : '??;
    const color = diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--muted)';
    return `<span style="display:inline-flex;align-items:center;gap:5px;border:1px solid var(--border);border-radius:99px;background:var(--white);padding:5px 9px;font-size:.82rem;font-weight:900">
      ${escapeHtml(label)} <span style="color:${color};font-size:1rem">${symbol}</span> <span style="color:${color}">${diff > 0 ? '+' : ''}${diff}</span>
    </span>`;
  }).join('') : '<span style="font-size:.82rem;color:var(--muted);font-weight:800">蝝舐??喳? 2 甈⊥?蝺游??＊蝷箏? / 頝?/ ?像??/span>';
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
      <strong style="color:var(--navy)">瞍毀頞典</strong>
      <span style="font-size:.8rem;color:var(--muted);font-weight:800">???貉???銝甈⊥?蝺湔捱蝑?/span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px">
      <div style="border:1px solid var(--border);border-left:4px solid var(--blue);border-radius:8px;padding:8px 10px;background:var(--input-bg)">
        <div style="font-size:.74rem;color:var(--muted);font-weight:900">??啁蜇??/div>
        <div style="font-size:1.45rem;font-weight:900;color:var(--blue)">${latestTotal}/40</div>
      </div>
      <div style="border:1px solid var(--border);border-left:4px solid ${delta === null ? 'var(--muted)' : delta >= 0 ? 'var(--green)' : 'var(--red)'};border-radius:8px;padding:8px 10px;background:var(--input-bg)">
        <div style="font-size:.74rem;color:var(--muted);font-weight:900">頛?甈?/div>
        <div style="font-size:1.25rem;font-weight:900">${delta === null ? '擐活' : `${delta >= 0 ? '+' : ''}${delta} ?}</div>
      </div>
      <div style="border:1px solid var(--border);border-left:4px solid var(--orange);border-radius:8px;padding:8px 10px;background:var(--input-bg)">
        <div style="font-size:.74rem;color:var(--muted);font-weight:900">?撘梢?</div>
        <div style="font-size:1.05rem;font-weight:900;color:var(--orange)">${weakest[0]} ${weakest[1]}/10</div>
      </div>
      <div style="border:1px solid var(--border);border-left:4px solid #7030A0;border-radius:8px;padding:8px 10px;background:var(--input-bg)">
        <div style="font-size:.74rem;color:var(--muted);font-weight:900">銝活?閰脩毀隞暻?/div>
        <div style="font-size:.86rem;font-weight:800">${escapeHtml(action)}</div>
      </div>
    </div>
    <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:9px 10px;margin-top:8px;display:grid;gap:7px">
      ${bars}
    </div>
    <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:9px 10px;margin-top:8px">
      <div style="font-size:.76rem;color:var(--muted);font-weight:900;margin-bottom:6px">?餈?${recent.length} 甈∪?頞典</div>
      <div style="display:flex;gap:7px;flex-wrap:wrap">${miniTrend}</div>
    </div>`;
}

/**
 * ?啣? Presentation 瞍毀蝝?? */
function addPresentationRun() {
  const run = {
    id: Date.now(),
    run_date: document.getElementById('pres-date').value || new Date().toISOString().split('T')[0],
    speaker: document.getElementById('pres-speaker').value.trim(),
    structure_score: Number(document.getElementById('pres-structure').value) || 0,
    technical_score: Number(document.getElementById('pres-technical').value) || 0,
    delivery_score: Number(document.getElementById('pres-delivery').value) || 0,
    qa_score: Number(document.getElementById('pres-qa').value) || 0,
    comment: document.getElementById('pres-comment').value.trim(),
    next_action: document.getElementById('pres-next-action').value.trim(),
    season: currentSeason
  };
  if (!run.speaker) { showToast('隢撓?乩蜓雓?/ 蝯'); return; }
  state.presentationRuns.push(run);
  saveLocalPresentationRuns();
  ['pres-speaker','pres-structure','pres-technical','pres-delivery','pres-qa','pres-comment','pres-next-action'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pres-date').value = new Date().toISOString().split('T')[0];
  renderPresentationTrendPanel();
  renderPresentationScorecard();
  showToast('??Presentation 瞍毀蝝?歇?啣?');
}

/**
 * ?芷 Presentation 瞍毀蝝?? * @param {number} id 瞍毀蝝??ID?? */
function deletePresentationRun(id) {
  if (!confirm('蝣箄??芷甇?Presentation 瞍毀蝝??')) return;
  state.presentationRuns = state.presentationRuns.filter(run => run.id !== id);
  saveLocalPresentationRuns();
  renderPresentationTrendPanel();
  renderPresentationScorecard();
}

/**
 * ?芷?抵???? * @param {number} id ?抵? ID?? */
function deleteGearItem(id) {
  if (!confirm('蝣箄??芷甇斤鞈??殷?')) return;
  state.gearItems = state.gearItems.filter(x => x.id !== id);
  saveLocalGearItems();
  renderGearList();
}

/**
 * ?詨蝚血??摮??擃?摰?隞餃??? * @param {Array<object>} tasks 隞餃?皜?? * @param {string[]} keys ?摮? * @returns {object|undefined} 隞餃??? */
function pickPriorityTask(tasks, keys) {
  const weight = {'? 蝺?:0,'?? 擃??:1,'? 銝剖??:2,'? ??':3};
  return tasks
    .filter(t => matchAny([t.name, t.note, t.owner, t.cat], keys))
    .sort((a,b) => (weight[a.cat] ?? 9) - (weight[b.cat] ?? 9) || String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31')))[0];
}

/**
 * ?斗憭?摮?雿?血??思遙銝?摮? * @param {Array<unknown>} fields 甈??? * @param {string[]} keys ?摮? * @returns {boolean} ?臬?賭葉?? */
function matchAny(fields, keys) {
  const text = fields.map(v => String(v || '').toLowerCase()).join(' ');
  return keys.some(key => text.includes(String(key).toLowerCase()));
}

/**
 * 靘??脩??游隞扎? * @param {string} role ?閫?? * @returns {string} ?典??誘?? */
function getRoleCommand(role) {
  if (matchAny([role], ['Pilot','??'])) return '?Ｕ帘??蝣箄??恍';
  if (matchAny([role], ['撌亦?','LP','BD'])) return '??鳴?????;
  if (matchAny([role], ['CEO','Presentation'])) return '??蝯?嚗?雓???;
  if (matchAny([role], ['?矽'])) return '銝?乩??誘嚗Ⅱ隤?閬?;
  return '?嗅隞餃?敺??梁???;
}

// ????????????????????????????????????????????????????????// DASHBOARD
// ????????????????????????????????????????????????????????function renderDashboard() {
  const tasks = state.tasks;
  const total = tasks.length;
  const done = tasks.filter(t=>t.status==='撌脣???).length;
  const inprog = tasks.filter(t=>t.status==='?脰?銝?).length;
  const urgent = tasks.filter(t=>t.cat==='? 蝺? && t.status!=='撌脣???).length;
  const pct = total ? Math.round(done/total*100) : 0;
  const prevPct = Number(localStorage.getItem('rov_prev_pct_' + previousSeason(currentSeason)) || 0);
  const todo = tasks.filter(t=>t.status==='敺齒').length;

  document.getElementById('stat-cards').innerHTML = `
    <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">蝮賭遙?</div></div>
    <div class="stat-card" style="border-top-color:var(--green)"><div class="stat-num" style="color:var(--green)">${done}</div><div class="stat-label">撌脣???/div></div>
    <div class="stat-card" style="border-top-color:var(--orange)"><div class="stat-num" style="color:var(--orange)">${inprog}</div><div class="stat-label">?脰?銝?/div></div>
    <div class="stat-card" style="border-top-color:var(--red)"><div class="stat-num" style="color:var(--red)">${urgent}</div><div class="stat-label">?芸????乩遙??/div></div>
    <div class="stat-card" style="border-top-color:var(--navy)">
      <div class="stat-num">${pct}%</div><div class="stat-label">?湧?摰???/div>
      <div class="prog-wrap" style="margin-top:6px"><div class="prog-bar" style="width:${pct}%;background:var(--navy)"></div></div>
    </div>
    <div class="stat-card" style="border-top-color:#7030A0">
      <div class="stat-num" style="color:#7030A0">87</div><div class="stat-label">頝??魚憭拇</div>
    </div>
    <div class="stat-card" style="border-top-color:var(--blue)">
      <div class="stat-num" style="color:var(--blue)">${pct - prevPct >= 0 ? '+' : ''}${pct - prevPct}%</div><div class="stat-label">頛?摮????</div>
    </div>
  `;
  localStorage.setItem('rov_prev_pct_' + currentSeason, String(pct));
  document.getElementById('task-status-counts').innerHTML = [
    { label:'敺齒', value:todo, color:'var(--red)' },
    { label:'?脰?銝?, value:inprog, color:'var(--orange)' },
    { label:'撌脣???, value:done, color:'var(--green)' },
    { label:'蝮賣', value:total, color:'var(--navy)' }
  ].map(item => `
    <div style="border:1px solid var(--border);border-left:4px solid ${item.color};border-radius:8px;background:var(--input-bg);padding:8px 10px">
      <div style="font-size:.74rem;color:var(--muted);font-weight:900">${item.label}</div>
      <div style="font-size:1.25rem;font-weight:900;color:${item.color}">${item.value}</div>
    </div>
  `).join('');
  renderWeeklyReviewSummary();

  // ?? ??芣迫?伐???敺?tasks table 霈?? due ?交?銝摰??遙????
  const today = new Date(); today.setHours(0,0,0,0);
  const deadlineTasks = tasks
    .filter(t => t.due && t.status !== '撌脣???)
    .sort((a,b) => new Date(a.due) - new Date(b.due))
    .slice(0, 12); // ?憭＊蝷?2??
  document.getElementById('deadline-timeline').innerHTML = deadlineTasks.length
    ? deadlineTasks.map(d=>{
        const dt = new Date(d.due); dt.setHours(0,0,0,0);
        const diff = Math.ceil((dt-today)/86400000);
        const isOverdue = diff < 0;
        const isUrgent = !isOverdue && diff <= 3;
        const cls = isOverdue ? 'done' : (isUrgent ? 'urgent' : '');
        const diffLabel = isOverdue ? `?暹?${Math.abs(diff)}憭奈 : (diff===0 ? '隞?芣迫' : diff+'憭拙?');
        const diffColor = isOverdue ? '#aaa' : (isUrgent ? 'var(--red)' : 'var(--blue)');
        return `<div class="tl-item">
          <div class="tl-dot ${cls}"></div>
          <div class="tl-date">${d.due} <span style="color:${diffColor};font-weight:700">${diffLabel}</span>
            <span style="font-size:.7rem;color:#999;margin-left:4px">${d.cat||''}</span></div>
          <div class="tl-content">${d.name}
            ${d.owner ? `<span style="font-size:.73rem;color:#888;margin-left:6px">? ${d.owner}</span>` : ''}
          </div>
        </div>`;
      }).join('')
    : '<div style="color:#aaa;font-size:.85rem;padding:12px 0">?桀??∪?颲行甇Ｖ遙??/div>';

  const cats = ['? 蝺?,'?? 擃??,'? 銝剖??,'? ??'];
  const catColors = {'? 蝺?:'var(--red)','?? 擃??:'var(--orange)','? 銝剖??:'#D4AC0D','? ??':'var(--green)'};
  document.getElementById('progress-bars').innerHTML = cats.map(cat=>{
    const ct = tasks.filter(t=>t.cat===cat);
    const cd2 = ct.filter(t=>t.status==='撌脣???).length;
    const p2 = ct.length ? Math.round(cd2/ct.length*100) : 0;
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:3px">
        <span>${cat}</span><span>${cd2}/${ct.length} (${p2}%)</span></div>
      <div class="prog-wrap"><div class="prog-bar" style="width:${p2}%;background:${catColors[cat]}"></div></div>
    </div>`;
  }).join('');

  const urgentTasks = tasks.filter(t=>t.cat==='? 蝺?&&t.status!=='撌脣???);
  document.getElementById('urgent-table').innerHTML = urgentTasks.map(t=>`
    <tr>
      <td>${t.name}</td>
      <td>${t.owner}</td>
      <td style="color:var(--red);font-weight:700">${t.due||'??}</td>
      <td><button class="btn btn-sm btn-primary" onclick="quickDone(${t.id})">??摰?</button><button class="btn btn-sm" onclick="goToTaskAndOpen(${t.id})" style="margin-left:4px">?亦?</button></td>
    </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--green);padding:16px">?? ????乩遙?歇摰?嚗?/td></tr>';
  renderSystemHealthPanel();
  scheduleDashboardChartsRender();
  updateNavBadge();
}

function scheduleDashboardChartsRender() {
  const render = () => renderDashboardCharts();
  if ('requestIdleCallback' in window) {
    requestIdleCallback(render, { timeout: 1200 });
  } else {
    setTimeout(render, 80);
  }
}

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d;
}

function buildWeeklyReviewSummary() {
  const weekStart = getWeekStart();
  const history = getTaskChangeHistory().filter(row => new Date(row.ts) >= weekStart);
  const completedIds = new Set(history
    .filter(row => row.changes?.some(c => String(c.after).includes('撌脣???)) || row.action === 'toggle_status')
    .map(row => row.taskId));
  const createdIds = new Set(history.filter(row => row.action === 'create').map(row => row.taskId));
  const openTasks = state.tasks.filter(t => t.status !== '撌脣???);
  const overdue = openTasks.filter(t => isOverdue(t.due));
  const blocked = openTasks.filter(t => isTaskLocked(t));
  const runs = [...state.missionRuns].sort((a,b)=>String(b.run_date || b.created_at || '').localeCompare(String(a.run_date || a.created_at || '')));
  const latestRun = runs[0];
  const previousRun = runs[1];
  const scoreOf = run => Number(run?.total_score ?? run?.score ?? run?.total ?? 0) || 0;
  const runDelta = latestRun && previousRun ? scoreOf(latestRun) - scoreOf(previousRun) : null;
  const latestScore = latestRun ? scoreOf(latestRun) : null;
  const previousScore = previousRun ? scoreOf(previousRun) : null;
  const runTrend = !latestRun ? '?祇望閮?' : runDelta === null ? '擐活閮?' : runDelta > 0 ? `?脫郊 +${runDelta}` : runDelta < 0 ? `?甇?${runDelta}` : '?像';
  const lines = [
    '?OV ?勗????,
    `?祇勗???${completedIds.size} ?,
    `?祇望憓?${createdIds.size} ?,
    `?暹?嚗?{overdue.length} ?,
    `?餃?嚗?{blocked.length} ?,
    `Mission Run嚗?{latestRun ? `${latestScore} ??${runTrend}${previousScore === null ? '' : `嚚?甈?${previousScore} ?}` : '?祇望閮?'}`
  ];
  return { completed:completedIds.size, created:createdIds.size, overdue, blocked, latestRun, latestScore, previousScore, runDelta, runTrend, lines };
}

function renderWeeklyReviewSummary() {
  const el = document.getElementById('weekly-review-summary');
  if (!el) return;
  const summary = buildWeeklyReviewSummary();
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
      <strong style="color:var(--navy)">?“?勗??</strong>
      <button class="btn btn-sm" onclick="copyWeeklyReviewSummary()">銴ˊ?勗??</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px">
      <div class="stat-card" style="padding:10px;border-top-color:var(--green)"><div class="stat-num" style="font-size:1.3rem;color:var(--green)">${summary.completed}</div><div class="stat-label">?祇勗???/div></div>
      <div class="stat-card" style="padding:10px;border-top-color:var(--blue)"><div class="stat-num" style="font-size:1.3rem;color:var(--blue)">${summary.created}</div><div class="stat-label">?祇望憓?/div></div>
      <div class="stat-card" style="padding:10px;border-top-color:var(--red)"><div class="stat-num" style="font-size:1.3rem;color:var(--red)">${summary.overdue.length}</div><div class="stat-label">?暹?</div></div>
      <div class="stat-card" style="padding:10px;border-top-color:#7030A0"><div class="stat-num" style="font-size:1.3rem;color:#7030A0">${summary.blocked.length}</div><div class="stat-label">?餃?</div></div>
      <div class="stat-card" style="padding:10px;border-top-color:${summary.runDelta === null ? 'var(--blue)' : summary.runDelta >= 0 ? 'var(--green)' : 'var(--red)'}">
        <div class="stat-num" style="font-size:1.3rem;color:${summary.runDelta === null ? 'var(--blue)' : summary.runDelta >= 0 ? 'var(--green)' : 'var(--red)'}">${summary.latestScore === null ? '-' : summary.latestScore}</div>
        <div class="stat-label">Mission Run ${escapeHtml(summary.runTrend)}</div>
      </div>
    </div>
    <div style="font-size:.82rem;color:var(--muted);margin-top:8px">${escapeHtml(summary.lines.join('嚚?))}</div>`;
}

function copyWeeklyReviewSummary() {
  const text = buildWeeklyReviewSummary().lines.join('\n');
  navigator.clipboard?.writeText(text).then(() => showToast('撌脰?鋆賡勗??')).catch(() => {
    prompt('?勗??', text);
  });
}

function renderSystemHealthPanel() {
  const el = document.getElementById('system-health-panel');
  if (!el) return;
  const lastLoad = Number(localStorage.getItem('rov_last_load_ms') || 0);
  const bootCache = safeJsonParse(localStorage.getItem(getAppCacheKey()), null);
  const cacheAge = bootCache?.ts ? Math.max(0, Math.round((Date.now() - Number(bootCache.ts)) / 60000)) : null;
  const snapshot = safeJsonParse(localStorage.getItem('rov_competition_snapshot_' + currentSeason), null);
  const snapshotAge = getCompetitionSnapshotAgeSeconds(snapshot);
  const pendingRuns = getPendingMissionRuns().length;
  const lastBackupAt = Number(localStorage.getItem('rov_last_backup_at') || 0);
  const backupAge = lastBackupAt ? Math.max(0, Math.round((Date.now() - lastBackupAt) / 60000)) : null;
  const preImportBackup = safeJsonParse(localStorage.getItem(LAST_PRE_IMPORT_BACKUP_KEY), null);
  const hasPreImportBackup = preImportBackup?.type === 'rov_task_manager_backup' && preImportBackup?.state;
  const backupHistory = getSystemBackupHistory();
  const dataIssues = getSystemDataIssues();
  const errorLog = getSystemEventLog();
  const loadDiag = getLastLoadDiagnostics();
  const fixReport = getLastAutoFixReport();
  const offlineState = getOfflineModeState(loadDiag);
  const reminder = getSystemBackupReminder(backupAge, pendingRuns);
  const overdue = state.tasks.filter(t => t.status !== '撌脣??? && isOverdue(t.due)).length;
  const doneTaskIds = new Set(state.tasks.filter(t => t.status === '撌脣???).map(t => Number(t.id)));
  const blocked = state.tasks.filter(t => t.status !== '撌脣??? && t.depends_on && !doneTaskIds.has(Number(t.depends_on))).length;
  const health = [
    { label:'頛', value:lastLoad ? `${(lastLoad / 1000).toFixed(1)}s` : '?芰', level:lastLoad && lastLoad <= 5000 ? 'done' : lastLoad <= 12000 ? 'mid' : 'urgent' },
    { label:'蝬脩窗', value:offlineState.online ? '?函?' : '?Ｙ?', level:offlineState.online ? 'done' : 'urgent' },
    { label:'鞈?靘?', value:getLoadSourceLabel(loadDiag?.source), level:loadDiag?.source === 'database' ? 'done' : loadDiag?.source === 'fallback' ? 'urgent' : 'mid' },
    { label:'敹怠?', value:cacheAge === null ? '?? : `${cacheAge}??`, level:cacheAge !== null && cacheAge <= 1440 ? 'done' : 'mid' },
    { label:'CCC 敹怎', value:snapshotAge === null ? '?? : (snapshotAge < 60 ? `${snapshotAge}蝘?` : `${Math.floor(snapshotAge / 60)}??`), level:snapshotAge !== null && snapshotAge <= 300 ? 'done' : 'mid' },
    { label:'?餈?隞?, value:backupAge === null ? '?? : `${backupAge}??`, level:backupAge !== null && backupAge <= 1440 ? 'done' : 'mid' },
    { label:'?遢甇瑕', value:`${backupHistory.length}/${MAX_SYSTEM_BACKUP_HISTORY}`, level:backupHistory.length ? 'done' : 'mid' },
    { label:'鞈?瑼Ｘ', value:String(dataIssues.length), level:dataIssues.some(i => i.level === 'urgent') ? 'urgent' : dataIssues.length ? 'mid' : 'done' },
    { label:'敺?甇?, value:String(pendingRuns), level:pendingRuns ? 'urgent' : 'done' },
    { label:'?暹?隞餃?', value:String(overdue), level:overdue ? 'urgent' : 'done' },
    { label:'?餃?隞餃?', value:String(blocked), level:blocked ? 'mid' : 'done' },
    { label:'鈭辣閮?', value:String(errorLog.length), level:errorLog.some(e => e.level === 'error') ? 'urgent' : errorLog.length ? 'mid' : 'done' }
  ];
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px">
      <strong style="color:var(--navy)">蝟餌絞?亙熒????隞?/strong>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-sm" onclick="exportSystemBackupJson()">?臬?祆??遢 JSON</button>
        <button class="btn btn-sm" onclick="document.getElementById('system-backup-import').click()">?臬?祆??遢</button>
        <button class="btn btn-sm" onclick="runSmokeTest()">?瑁? Smoke Test</button>
        <button class="btn btn-sm" onclick="openFrontendErrorReport()">?垢?航炊 ${getFrontendErrorLog().length}</button>
        ${hasPreImportBackup ? '<button class="btn btn-sm btn-warning" onclick="undoLastSystemBackupImport()">?日銝活?臬</button>' : ''}
        <input type="file" id="system-backup-import" accept=".json,application/json" style="display:none" onchange="importSystemBackupJson(event)">
      </div>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${health.map(item => `<span class="badge ${item.level}">${escapeHtml(item.label)} ${escapeHtml(item.value)}</span>`).join('')}
    </div>
    <div style="font-size:.78rem;color:var(--muted);margin-top:8px">?遢??桀?鞈賢迤隞餃????～hecklist???乓ission Run?璈翰?扯?敺?甇乩???/div>
    ${renderOfflineModeNotice(offlineState)}
    <div style="margin-top:8px;padding:8px 10px;border-radius:8px;background:${reminder.level === 'done' ? 'var(--lgreen)' : '#FFF3CD'};color:${reminder.level === 'done' ? '#375623' : '#856404'};font-size:.82rem;font-weight:800">
      ?遢??嚗?{escapeHtml(reminder.text)}
    </div>
    ${renderSystemDataIssueHtml(dataIssues)}
    ${renderSmokeTestSummaryHtml()}
    ${renderFrontendErrorSummaryHtml()}
    ${renderAutoFixReportHtml(fixReport)}
    ${renderSystemLoadDiagnosticsHtml(loadDiag)}
    ${renderSystemBackupHistoryHtml(backupHistory)}
    ${renderSystemEventLogHtml(errorLog)}`;
}

function getLoadSourceLabel(source) {
  return ({ database:'DB', mixed:'瘛瑕?', fallback:'Fallback', loading:'頛銝? })[source] || '?芰';
}

function getOfflineModeState(loadDiag) {
  const online = navigator.onLine !== false;
  const source = loadDiag?.source || 'unknown';
  const fallbackTables = Object.entries(loadDiag?.tables || {})
    .filter(([, row]) => ['local','default','error'].includes(row.source))
    .map(([table]) => table);
  return {
    online,
    source,
    active:!online || source === 'mixed' || source === 'fallback' || fallbackTables.length > 0,
    fallbackTables
  };
}

function renderOfflineModeNotice(info) {
  if (!info?.active) return '';
  const bg = info.online ? '#FFF3CD' : '#FFD6D6';
  const color = info.online ? '#856404' : 'var(--red)';
  const title = info.online ? '瘛瑕? / ?祆?鞈?璅∪?' : '?Ｙ?璅∪?';
  const detail = info.online
    ? '?典?鞈?銵其蝙?冽璈??身 fallback嚗憓?靽格敺????臬???郊??Supabase??
    : '?汗?函?蝺??啣??耨?嫘hecklist?ission Run ?翰?批?賢??靽??冽璈?;
  return `
    <div style="margin-top:8px;padding:9px 10px;border-radius:8px;background:${bg};color:${color};font-size:.82rem;font-weight:800">
      ${title}嚗?{detail}
      ${info.fallbackTables.length ? `<div style="font-size:.76rem;margin-top:4px;font-weight:700">?蔣?輯???${escapeHtml(info.fallbackTables.slice(0, 8).join(', '))}${info.fallbackTables.length > 8 ? '?? : ''}</div>` : ''}
    </div>`;
}

function renderSystemDataIssueHtml(issues) {
  if (!issues.length) return '<div style="font-size:.8rem;color:var(--green);font-weight:800;margin-top:8px">鞈??亙熒瑼Ｘ嚗?潛蝻箏?蝔晞隤斗??鞈湧憭望?蝛箄???憿?/div>';
  const autoFixable = getAutoFixableSystemIssueCount();
  return `
    <div style="margin-top:10px">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:5px">
        <div style="font-weight:900;color:var(--navy);font-size:.84rem">鞈??亙熒瑼Ｘ</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
          <button class="btn btn-sm" onclick="openSystemIssueReport()">摰?勗? ${issues.length}</button>
          ${autoFixable ? `<button class="btn btn-sm btn-success" onclick="autoFixSystemDataIssues()">銝?萎耨敺拙?芸?????${autoFixable}</button>` : ''}
        </div>
      </div>
      <div style="display:grid;gap:5px">
        ${issues.slice(0, 6).map(issue => `
          <div style="display:flex;gap:6px;align-items:center;font-size:.8rem">
            <span class="badge ${issue.level}">${escapeHtml(issue.label)}</span>
            <span style="color:var(--muted)">${escapeHtml(issue.detail)}</span>
          </div>
        `).join('')}
      </div>
      ${issues.length > 6 ? `<div style="font-size:.76rem;color:var(--muted);margin-top:4px">?行? ${issues.length - 6} ??憿憿舐內??/div>` : ''}
    </div>`;
}

function getSmokeTestLog() {
  return safeJsonParse(localStorage.getItem(SMOKE_TEST_LOG_KEY), []);
}

function saveSmokeTestResult(result) {
  const rows = getSmokeTestLog();
  rows.unshift(result);
  localStorage.setItem(SMOKE_TEST_LOG_KEY, JSON.stringify(rows.slice(0, 10)));
}

function runSmokeTest() {
  const checks = [
    ['?“蝮質汗', 'page-dashboard'],
    ['?銝剖?', 'page-prep'],
    ['隞餃?', 'page-tasks'],
    ['???, 'page-gantt'],
    ['Presentation', 'page-presentation'],
    ['瘥魚?銝剖?', 'page-competition'],
    ['Float 鋆?內', 'page-competition-float'],
    ['Mission Run', 'page-scoreboard'],
    ['蝟餌絞?亙熒', 'system-health-panel'],
    ['隞蝮賣??桀', 'daily-command-center']
  ].map(([label, id]) => ({ label, id, ok:Boolean(document.getElementById(id)) }));
  const failed = checks.filter(c => !c.ok);
  const result = { ts:new Date().toISOString(), ok:failed.length === 0, checks };
  saveSmokeTestResult(result);
  logSystemEvent(result.ok ? 'info' : 'error', 'Smoke Test', result.ok ? '?券??' : failed.map(f => f.id).join(', '));
  renderSystemHealthPanel();
  showToast(result.ok ? '??Smoke Test ?券??' : `?? Smoke Test 憭望? ${failed.length} ?);
}

function renderSmokeTestSummaryHtml() {
  const latest = getSmokeTestLog()[0];
  if (!latest) return '<div style="font-size:.8rem;color:var(--muted);font-weight:800;margin-top:8px">Smoke Test嚗??芸銵?/div>';
  const failed = latest.checks.filter(c => !c.ok);
  return `<div style="font-size:.8rem;color:${latest.ok ? 'var(--green)' : 'var(--red)'};font-weight:800;margin-top:8px">Smoke Test嚗?{latest.ok ? '??' : `憭望? ${failed.length} ?}嚚?{new Date(latest.ts).toLocaleString()}</div>`;
}

function getFrontendErrorLog() {
  return safeJsonParse(localStorage.getItem(FRONTEND_ERROR_LOG_KEY), []);
}

function logFrontendError(type, message, detail = '') {
  const rows = getFrontendErrorLog();
  rows.unshift({ ts:new Date().toISOString(), type, message:String(message || '').slice(0, 220), detail:String(detail || '').slice(0, 500), page:currentPage });
  localStorage.setItem(FRONTEND_ERROR_LOG_KEY, JSON.stringify(rows.slice(0, 30)));
}

function clearFrontendErrorLog() {
  localStorage.removeItem(FRONTEND_ERROR_LOG_KEY);
  renderSystemHealthPanel();
  showToast('???垢?航炊閮?撌脫???);
}

function renderFrontendErrorSummaryHtml() {
  const rows = getFrontendErrorLog();
  if (!rows.length) return '<div style="font-size:.8rem;color:var(--green);font-weight:800;margin-top:8px">?垢?航炊餈質馱嚗???隤方???/div>';
  return `<div style="font-size:.8rem;color:var(--red);font-weight:800;margin-top:8px">?垢?航炊餈質馱嚗?餈?${rows.length} 蝑???堆?${escapeHtml(rows[0].message)}</div>`;
}

function openFrontendErrorReport() {
  const rows = getFrontendErrorLog();
  const body = document.getElementById('system-issue-report-body');
  if (!body) return;
  body.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px">
      <strong style="color:var(--navy)">?垢?航炊餈質馱</strong>
      <button class="btn btn-sm btn-danger" onclick="clearFrontendErrorLog();closeModal('system-issue-report-modal')">皜閮?</button>
    </div>
    ${rows.length ? `<div style="display:grid;gap:7px">${rows.map(row => `
      <div style="border:1px solid var(--border);border-left:4px solid var(--red);border-radius:8px;background:var(--input-bg);padding:8px 10px">
        <div style="font-weight:900;color:var(--navy)">${escapeHtml(row.type)}嚚?{escapeHtml(row.page || '')}</div>
        <div style="font-size:.82rem;color:var(--red);font-weight:800">${escapeHtml(row.message)}</div>
        <div style="font-size:.76rem;color:var(--muted)">${escapeHtml(row.detail || '')}</div>
        <div style="font-size:.72rem;color:var(--muted);margin-top:3px">${escapeHtml(new Date(row.ts).toLocaleString())}</div>
      </div>
    `).join('')}</div>` : '<div style="padding:18px;text-align:center;color:var(--green);font-weight:900">?桀?瘝??垢?航炊??/div>'}`;
  document.getElementById('system-issue-report-modal').classList.add('open');
}

function getAutoFixableSystemIssueCount() {
  const tasks = Array.isArray(state.tasks) ? state.tasks : [];
  const ids = new Set(tasks.map(t => Number(t.id)));
  let count = 0;
  tasks.forEach(t => {
    if (t.depends_on && !ids.has(Number(t.depends_on))) count++;
    if (t.id && t.depends_on && hasDependencyCycle(Number(t.id), Number(t.depends_on))) count++;
    if (!Number(t.sort_order)) count++;
  });
  if (!Array.isArray(state.checklist) || !state.checklist.length) count++;
  if (!Array.isArray(state.prediveChecklist) || !state.prediveChecklist.length) count++;
  return count;
}

function openSystemIssueReport() {
  const issues = getSystemDataIssues();
  const el = document.getElementById('system-issue-report-body');
  if (!el) return;
  if (!issues.length) {
    el.innerHTML = '<div style="padding:18px;text-align:center;color:var(--green);font-weight:900">?桀?瘝?鞈??亙熒????/div>';
  } else {
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px">
        <strong style="color:var(--navy)">??${issues.length} ??憿?/strong>
        <button class="btn btn-sm btn-success" onclick="autoFixSystemDataIssues()">銝?萎耨敺拙?芸?????${getAutoFixableSystemIssueCount()}</button>
      </div>
      <div style="display:grid;gap:7px">
        ${issues.map((issue, index) => `
          <div style="display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--input-bg)">
            <span style="font-size:.78rem;color:var(--muted);font-weight:900">#${index + 1}</span>
            <div>
              <span class="badge ${issue.level}">${escapeHtml(issue.label)}</span>
              <span style="font-size:.84rem;color:var(--muted);margin-left:6px">${escapeHtml(issue.detail)}</span>
            </div>
            ${issue.taskId ? `<button class="btn btn-sm" onclick="closeModal('system-issue-report-modal');goToTaskAndOpen(${Number(issue.taskId)})">?亦?隞餃?</button>` : '<span style="font-size:.76rem;color:var(--muted)">蝟餌絞??/span>'}
          </div>
        `).join('')}
      </div>`;
  }
  document.getElementById('system-issue-report-modal').classList.add('open');
}

function renderSystemLoadDiagnosticsHtml(diag) {
  if (!diag?.tables) return '<div style="font-size:.8rem;color:var(--muted);font-weight:800;margin-top:8px">頛閮箸嚗??芣?摰?郊閮???/div>';
  const rows = Object.entries(diag.tables);
  const sourceColor = { db:'done', local:'mid', default:'urgent', error:'urgent', skipped:'mid' };
  const sourceText = { db:'DB', local:'?祆?', default:'?身', error:'?航炊', skipped:'?仿?' };
  const badRows = rows.filter(([, row]) => ['default','error'].includes(row.source));
  return `
    <div style="margin-top:10px">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:5px">
        <div style="font-weight:900;color:var(--navy);font-size:.84rem">頛憭望?閮箸</div>
        <span style="font-size:.78rem;color:var(--muted)">${escapeHtml(new Date(diag.finishedAt || diag.startedAt).toLocaleString('zh-HK'))}嚚?{Math.round(Number(diag.elapsedMs || 0) / 1000)}s</span>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${rows.map(([table, row]) => `<span class="badge ${sourceColor[row.source] || 'mid'}" title="${escapeAttr(row.detail || '')}">${escapeHtml(table)} ${sourceText[row.source] || row.source}${row.count !== null ? ` ${row.count}` : ''}</span>`).join('')}
      </div>
      ${badRows.length ? `<div style="font-size:.78rem;color:var(--red);font-weight:800;margin-top:6px">??${badRows.length} ???”雿輻 fallback嚗?曌???badge ?舐??航炊????/div>` : '<div style="font-size:.78rem;color:var(--green);font-weight:800;margin-top:6px">銝餉?鞈?撌脣????伐??芰?曉撥?園?閮?fallback??/div>'}
    </div>`;
}

function renderAutoFixReportHtml(report) {
  if (!report?.items?.length) return '';
  return `
    <div style="margin-top:10px">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:5px">
        <div style="font-weight:900;color:var(--navy);font-size:.84rem">?餈??耨敺拙??/div>
        <span style="font-size:.78rem;color:var(--muted)">${escapeHtml(new Date(report.ts).toLocaleString('zh-HK'))}</span>
      </div>
      <div style="display:grid;gap:4px">
        ${report.items.slice(0, 8).map(item => `
          <div style="font-size:.78rem;color:var(--muted);border-left:3px solid var(--green);padding:4px 8px;background:var(--input-bg)">
            <strong style="color:var(--text)">${escapeHtml(item.type)}</strong>
            <span style="margin-left:5px">${escapeHtml(item.detail)}</span>
          </div>
        `).join('')}
      </div>
      ${report.items.length > 8 ? `<div style="font-size:.76rem;color:var(--muted);margin-top:4px">?行? ${report.items.length - 8} ?耨敺拇憿舐內??/div>` : ''}
    </div>`;
}

function renderSystemBackupHistoryHtml(history) {
  if (!history.length) return '';
  return `
    <div style="margin-top:10px">
      <div style="font-weight:900;color:var(--navy);font-size:.84rem;margin-bottom:5px">?餈?隞賢翰??/div>
      <div style="display:grid;gap:5px">
        ${history.slice(0, MAX_SYSTEM_BACKUP_HISTORY).map(row => `
          <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;padding:7px 8px;background:var(--input-bg)">
            <span style="font-size:.8rem">
              <strong>${escapeHtml(row.reason || 'backup')}</strong>
              <span style="color:var(--muted);margin-left:5px">${escapeHtml(new Date(row.savedAt).toLocaleString('zh-HK'))}嚚?{escapeHtml(row.summary || '')}</span>
            </span>
            <button class="btn btn-sm" onclick="restoreSystemBackupHistory('${escapeAttr(row.id)}')">??</button>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function renderSystemEventLogHtml(rows) {
  if (!rows.length) return '';
  return `
    <div style="margin-top:10px">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:5px">
        <div style="font-weight:900;color:var(--navy);font-size:.84rem">?航炊 / ??閮?</div>
        <button class="btn btn-sm" onclick="clearSystemEventLog()">皜閮?</button>
      </div>
      <div style="display:grid;gap:5px">
        ${rows.slice(0, 5).map(row => `
          <div style="font-size:.78rem;color:var(--muted);border-left:3px solid ${row.level === 'error' ? 'var(--red)' : row.level === 'warn' ? 'var(--orange)' : 'var(--blue)'};padding:4px 8px;background:var(--input-bg)">
            <strong style="color:var(--text)">${escapeHtml(row.title)}</strong>
            <span style="margin-left:5px">${escapeHtml(new Date(row.ts).toLocaleString('zh-HK'))}</span>
            ${row.detail ? `<div>${escapeHtml(row.detail)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>`;
}

function buildSystemBackupPayload() {
  saveBootCache();
  saveCompetitionSnapshot?.();
  const payload = {
    type:'rov_task_manager_backup',
    version:'v15',
    season:currentSeason,
    exportedAt:new Date().toISOString(),
    lastLoadMs:Number(localStorage.getItem('rov_last_load_ms') || 0),
    state:{
      tasks:state.tasks,
      members:state.members,
      checklist:state.checklist,
      prediveChecklist:state.prediveChecklist,
      intel:state.intel,
      notes:state.notes,
      strategy:state.strategy,
      missionRuns:state.missionRuns,
      gearItems:state.gearItems,
      presentationRuns:state.presentationRuns
    },
    local:{
      bootCache:safeJsonParse(localStorage.getItem(getAppCacheKey()), null),
      competitionSnapshot:safeJsonParse(localStorage.getItem('rov_competition_snapshot_' + currentSeason), null),
      pendingMissionRuns:getPendingMissionRuns(),
      schemaCache:safeJsonParse(localStorage.getItem('rov_schema_cache_v3'), null)
    }
  };
  payload.checksum = calculateBackupChecksum(payload);
  return payload;
}

function calculateBackupChecksum(payload) {
  const clone = { ...payload };
  delete clone.checksum;
  const text = JSON.stringify(clone);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

function getBackupChecksumStatus(payload) {
  if (!payload.checksum) return '?撘??⊥撽Ⅳ嚗?;
  return calculateBackupChecksum(payload) === payload.checksum ? `OK ${payload.checksum}` : `憭望?嚗???${payload.checksum}嚗;
}

function getSystemBackupHistory() {
  const rows = safeJsonParse(localStorage.getItem(SYSTEM_BACKUP_HISTORY_KEY), []);
  return Array.isArray(rows) ? rows : [];
}

function saveSystemBackupHistory(rows) {
  localStorage.setItem(SYSTEM_BACKUP_HISTORY_KEY, JSON.stringify(rows.slice(0, MAX_SYSTEM_BACKUP_HISTORY)));
}

function addSystemBackupHistory(payload, reason = 'manual') {
  const history = getSystemBackupHistory();
  history.unshift({
    id:'bak_' + Date.now(),
    reason,
    savedAt:new Date().toISOString(),
    season:payload.season || currentSeason,
    summary:getSystemBackupCompactSummary(payload),
    payload
  });
  saveSystemBackupHistory(history);
}

function addAutomaticSystemBackup(reason) {
  try {
    const payload = buildSystemBackupPayload();
    addSystemBackupHistory(payload, reason);
    localStorage.setItem(AUTO_BACKUP_LAST_KEY, String(Date.now()));
    localStorage.setItem('rov_last_backup_at', String(Date.now()));
    logSystemEvent('info', '?芸??遢敹怎', `${reason}嚚?{getSystemBackupCompactSummary(payload)}`);
    renderSystemHealthPanel();
  } catch(e) {
    logSystemEvent('error', '?芸??遢憭望?', e.message || e);
  }
}

function queueAutoSystemBackup(trigger) {
  const count = Number(localStorage.getItem(AUTO_BACKUP_CHANGE_KEY) || 0) + 1;
  localStorage.setItem(AUTO_BACKUP_CHANGE_KEY, String(count));
  const lastAt = Number(localStorage.getItem(AUTO_BACKUP_LAST_KEY) || 0);
  if (count >= AUTO_BACKUP_CHANGE_THRESHOLD || Date.now() - lastAt >= AUTO_BACKUP_INTERVAL_MS) {
    localStorage.setItem(AUTO_BACKUP_CHANGE_KEY, '0');
    setTimeout(() => addAutomaticSystemBackup(trigger === 'interval' ? 'auto-interval' : 'auto-change'), 0);
  }
}

function initAutoSystemBackup() {
  const lastAt = Number(localStorage.getItem(AUTO_BACKUP_LAST_KEY) || 0);
  setTimeout(() => {
    if (!lastAt || Date.now() - lastAt >= AUTO_BACKUP_INTERVAL_MS) addAutomaticSystemBackup('auto-open');
  }, 1200);
  setInterval(() => queueAutoSystemBackup('interval'), AUTO_BACKUP_INTERVAL_MS);
}

function getSystemBackupCompactSummary(payload) {
  const s = payload.state || {};
  return `${Array.isArray(s.tasks) ? s.tasks.length : 0} 隞餃? / ${Array.isArray(s.members) ? s.members.length : 0} ? / ${Array.isArray(s.missionRuns) ? s.missionRuns.length : 0} Run`;
}

function getSystemEventLog() {
  const rows = safeJsonParse(localStorage.getItem(SYSTEM_EVENT_LOG_KEY), []);
  return Array.isArray(rows) ? rows : [];
}

function logSystemEvent(level, title, detail = '') {
  const rows = getSystemEventLog();
  rows.unshift({ ts:new Date().toISOString(), level, title, detail:String(detail || '').slice(0, 600) });
  localStorage.setItem(SYSTEM_EVENT_LOG_KEY, JSON.stringify(rows.slice(0, MAX_SYSTEM_EVENT_LOG)));
}

function clearSystemEventLog() {
  localStorage.removeItem(SYSTEM_EVENT_LOG_KEY);
  renderSystemHealthPanel();
  showToast('??蝟餌絞閮?撌脫???);
}

function createLoadDiagnostics() {
  return { startedAt:new Date().toISOString(), finishedAt:null, elapsedMs:0, tables:{}, source:'loading' };
}

function setLoadDiagTable(diag, table, source, count = null, detail = '') {
  if (!diag?.tables) return;
  diag.tables[table] = { source, count, detail:String(detail || '').slice(0, 220) };
}

function finishLoadDiagnostics(diag, elapsedMs) {
  if (!diag) return;
  diag.finishedAt = new Date().toISOString();
  diag.elapsedMs = elapsedMs;
  const rows = Object.values(diag.tables || {});
  diag.source = rows.some(row => row.source === 'error' || row.source === 'default') ? 'fallback' : rows.some(row => row.source === 'local') ? 'mixed' : 'database';
  localStorage.setItem(SYSTEM_LOAD_DIAG_KEY, JSON.stringify(diag));
}

function getLastLoadDiagnostics() {
  return safeJsonParse(localStorage.getItem(SYSTEM_LOAD_DIAG_KEY), null);
}

function getLastAutoFixReport() {
  return safeJsonParse(localStorage.getItem(SYSTEM_LAST_FIX_REPORT_KEY), null);
}

function saveLastAutoFixReport(report) {
  localStorage.setItem(SYSTEM_LAST_FIX_REPORT_KEY, JSON.stringify(report));
}

function getSystemDataIssues() {
  const issues = [];
  const tasks = Array.isArray(state.tasks) ? state.tasks : [];
  const ids = new Set();
  const duplicateIds = new Set();
  tasks.forEach(t => {
    const id = Number(t.id);
    if (ids.has(id)) duplicateIds.add(id);
    ids.add(id);
  });
  tasks.forEach(t => {
    if (!String(t.name || '').trim()) issues.push({ level:'urgent', label:'隞餃?蝻箏?蝔?, detail:`#${t.id || '?！D'}`, taskId:t.id || null });
    if (t.status !== '撌脣??? && !String(t.owner || '').trim()) issues.push({ level:'mid', label:'隞餃??芸???, detail:`#${t.id} ${t.name || ''}`, taskId:t.id });
    if (t.due && Number.isNaN(new Date(t.due).getTime())) issues.push({ level:'urgent', label:'?交??澆??航炊', detail:`#${t.id} ${t.due}`, taskId:t.id });
    if (t.depends_on && !ids.has(Number(t.depends_on))) {
      issues.push({ level:'urgent', label:'?蔭隞餃?銝???, detail:`#${t.id} -> #${t.depends_on}`, taskId:t.id });
    }
    if (t.id && hasDependencyCycle(Number(t.id), Number(t.depends_on))) issues.push({ level:'urgent', label:'?蔭敺芰', detail:`#${t.id} ${t.name || ''}`, taskId:t.id });
  });
  duplicateIds.forEach(id => issues.push({ level:'urgent', label:'隞餃? ID ??', detail:`#${id}`, taskId:id }));
  if (!Array.isArray(state.members) || !state.members.length) issues.push({ level:'mid', label:'?鞈??箇征', detail:'members ?∟??? });
  if (!Array.isArray(state.checklist) || !state.checklist.length) issues.push({ level:'mid', label:'Checklist ?箇征', detail:'?魚閮剖?皜?∟??? });
  if (!Array.isArray(state.prediveChecklist) || !state.prediveChecklist.length) issues.push({ level:'mid', label:'Pre-Dive ?箇征', detail:'Pre-Dive Checklist ?∟??? });
  return issues;
}

function getSystemBackupReminder(backupAge, pendingRuns) {
  if (pendingRuns) return { level:'urgent', text:`??${pendingRuns} 蝑?Mission Run 敺?甇伐?隢??臬?遢` };
  if (backupAge === null) return { level:'mid', text:'撠撱箇??祆??遢' };
  if (backupAge > 1440) return { level:'mid', text:`頝?甈∪?隞?${Math.round(backupAge / 60)} 撠?` };
  return { level:'done', text:'?遢??迤撣? };
}

async function autoFixSystemDataIssues() {
  const fixable = getAutoFixableSystemIssueCount();
  if (!fixable) {
    showToast('?桀?瘝??航?耨敺拍?鞈???');
    return;
  }
  if (!confirm(`撠?撱箇??遢嚗敺?耨敺?${fixable} ???典?憿n\n????皜?箏仃/敺芰?蔭??隞餃????敺拍征 Checklist?Ⅱ隤匱蝥?`)) return;
  const beforeFix = buildSystemBackupPayload();
  addSystemBackupHistory(beforeFix, 'before-auto-fix');
  downloadSystemBackupPayload(beforeFix, 'before-auto-fix');

  const ids = new Set(state.tasks.map(t => Number(t.id)));
  let changedTasks = 0;
  const fixItems = [];
  state.tasks.forEach((task, index) => {
    let changed = false;
    if (task.depends_on && !ids.has(Number(task.depends_on))) {
      fixItems.push({ type:'皜?箏仃?蔭', detail:`#${task.id} ${task.name || ''}嚗??蔭 #${task.depends_on}` });
      task.depends_on = null;
      changed = true;
    }
    if (task.id && task.depends_on && hasDependencyCycle(Number(task.id), Number(task.depends_on))) {
      fixItems.push({ type:'皜敺芰?蔭', detail:`#${task.id} ${task.name || ''}嚗??蔭 #${task.depends_on}` });
      task.depends_on = null;
      changed = true;
    }
    if (!Number(task.sort_order)) {
      task.sort_order = index + 1;
      fixItems.push({ type:'鋆遙??摨?, detail:`#${task.id} ${task.name || ''}嚗ort_order = ${task.sort_order}` });
      changed = true;
    }
    if (changed) changedTasks++;
  });

  let fixedLists = 0;
  if (!Array.isArray(state.checklist) || !state.checklist.length) {
    state.checklist = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST));
    saveLocalChecklist();
    fixedLists++;
    fixItems.push({ type:'?Ｗ儔 Checklist', detail:'?魚閮剖?皜?箇征嚗歇?Ｗ儔?身皜' });
  }
  if (!Array.isArray(state.prediveChecklist) || !state.prediveChecklist.length) {
    state.prediveChecklist = JSON.parse(JSON.stringify(DEFAULT_PREDIVE_CHECKLIST));
    saveLocalPrediveChecklist();
    fixedLists++;
    fixItems.push({ type:'?Ｗ儔 Pre-Dive', detail:'Pre-Dive Checklist ?箇征嚗歇?Ｗ儔?身皜' });
  }

  if (taskSchema.depends_on || taskSchema.sort_order) {
    const updates = state.tasks
      .filter(task => task.id)
      .map(task => {
        const payload = {};
        if (taskSchema.depends_on) payload.depends_on = task.depends_on || null;
        if (taskSchema.sort_order) payload.sort_order = Number(task.sort_order || 0);
        return Object.keys(payload).length ? db.from('tasks').update(payload).eq('id', task.id) : null;
      })
      .filter(Boolean);
    await Promise.all(updates);
  }

  saveBootCache();
  markAllDirty();
  renderPageIfNeeded(currentPage, true);
  const report = { ts:new Date().toISOString(), changedTasks, fixedLists, items:fixItems };
  saveLastAutoFixReport(report);
  logSystemEvent('warn', '?芸?靽桀儔鞈??亙熒??', fixItems.map(item => `${item.type}: ${item.detail}`).join('嚗?) || `隞餃? ${changedTasks} ??皜 ${fixedLists} ?);
  showToast(`??撌脰?耨敺?${changedTasks + fixedLists} ????憿);
}

function downloadSystemBackupPayload(payload, suffix = '') {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const suffixText = suffix ? `-${suffix}` : '';
  a.download = `rov-task-manager-backup-${payload.season || currentSeason}-${new Date().toISOString().slice(0,10)}${suffixText}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  localStorage.setItem('rov_last_backup_at', String(Date.now()));
  renderSystemHealthPanel();
}

function exportSystemBackupJson() {
  const payload = buildSystemBackupPayload();
  addSystemBackupHistory(payload, 'manual');
  downloadSystemBackupPayload(payload);
  logSystemEvent('info', '???臬?遢', getSystemBackupCompactSummary(payload));
  showToast('???祆??遢 JSON 撌脣??);
}

function storeLastPreImportBackupPayload(payload) {
  localStorage.setItem(LAST_PRE_IMPORT_BACKUP_KEY, JSON.stringify(payload));
  addSystemBackupHistory(payload, 'pre-import');
}

function applySystemBackupPayload(payload) {
  const backupState = payload.state || {};
  currentSeason = payload.season || currentSeason;
  localStorage.setItem('rov_current_season', currentSeason);
  state = {
    ...state,
    ...backupState,
    tasks:(backupState.tasks || []).map(normalizeTask),
    checklist:backupState.checklist || state.checklist,
    prediveChecklist:backupState.prediveChecklist || state.prediveChecklist,
    missionRuns:backupState.missionRuns || [],
    strategy:backupState.strategy || [],
    gearItems:backupState.gearItems || [],
    presentationRuns:backupState.presentationRuns || []
  };
  if (payload.local?.competitionSnapshot) {
    localStorage.setItem('rov_competition_snapshot_' + currentSeason, JSON.stringify(payload.local.competitionSnapshot));
  }
  if (payload.local?.pendingMissionRuns) {
    savePendingMissionRuns(payload.local.pendingMissionRuns);
  }
  if (payload.local?.schemaCache) {
    localStorage.setItem('rov_schema_cache_v3', JSON.stringify(payload.local.schemaCache));
  }
  saveBootCache();
  competitionRunState = safeJsonParse(localStorage.getItem('rov_competition_run_state_' + currentSeason), {});
  restoreCompetitionSnapshot();
  selectedTaskIds.clear();
  markAllDirty();
  document.getElementById('season-select').value = currentSeason;
  renderPageIfNeeded(currentPage, true);
}

function importSystemBackupJson(event) {
  const input = event?.target;
  const file = input?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result || '{}'));
      if (payload.type !== 'rov_task_manager_backup' || !payload.state) throw new Error('invalid backup');
      const summary = getSystemBackupSummary(payload);
      const checksumStatus = getBackupChecksumStatus(payload);
      if (checksumStatus.startsWith('憭望?') && !confirm('?遢?⊿?憭望?嚗?獢?質◤靽格??瑯?閬匱蝥?伐?')) return;
      if (!confirm(summary + '\n\n蝣箄??臬嚗??Ｚ???鋡怠?隞賢摰寡???)) return;
      const preImportPayload = buildSystemBackupPayload();
      storeLastPreImportBackupPayload(preImportPayload);
      downloadSystemBackupPayload(preImportPayload, 'pre-import');
      applySystemBackupPayload(payload);
      logSystemEvent('warn', '?臬?祆??遢', getSystemBackupCompactSummary(payload));
      showToast('???祆??遢撌脣??);
    } catch(e) {
      logSystemEvent('error', '?遢?臬憭望?', e.message || e);
      alert('?遢瑼??澆?銝迤蝣綽?隢?蝟餌絞?亙熒?Ｘ?臬??JSON??);
    } finally {
      if (input) input.value = '';
    }
  };
  reader.readAsText(file);
}

function undoLastSystemBackupImport() {
  try {
    const payload = safeJsonParse(localStorage.getItem(LAST_PRE_IMPORT_BACKUP_KEY), null);
    if (!payload || payload.type !== 'rov_task_manager_backup' || !payload.state) {
      alert('?曆??啣?日??亙?敹怎??);
      renderSystemHealthPanel();
      return;
    }
    const checksumStatus = getBackupChecksumStatus(payload);
    if (checksumStatus.startsWith('憭望?') && !confirm('?臬?翰?扳撽仃??隞??岫??嚗?)) return;
    if (!confirm(getSystemBackupSummary(payload) + '\n\n蝣箄??日銝活?臬嚗???臬????')) return;
    downloadSystemBackupPayload(buildSystemBackupPayload(), 'before-undo-import');
    applySystemBackupPayload(payload);
    localStorage.removeItem(LAST_PRE_IMPORT_BACKUP_KEY);
    localStorage.setItem('rov_last_import_undo_at', String(Date.now()));
    logSystemEvent('warn', '?日銝活?臬', getSystemBackupCompactSummary(payload));
    renderSystemHealthPanel();
    showToast('??撌脫?瑚?甈∪?乩蒂???臬????);
  } catch(e) {
    logSystemEvent('error', '?日?臬憭望?', e.message || e);
    alert('?日?臬憭望?嚗??寧 pre-import JSON ???臬??);
  }
}

function restoreSystemBackupHistory(id) {
  const row = getSystemBackupHistory().find(item => item.id === id);
  const payload = row?.payload;
  if (!payload || payload.type !== 'rov_task_manager_backup' || !payload.state) {
    alert('?曆??圈遢?遢敹怎??);
    renderSystemHealthPanel();
    return;
  }
  const checksumStatus = getBackupChecksumStatus(payload);
  if (checksumStatus.startsWith('憭望?') && !confirm('?遢敹怎?⊿?憭望?嚗?閬?閰阡???')) return;
  if (!confirm(getSystemBackupSummary(payload) + '\n\n蝣箄????遢?遢敹怎嚗?????摮?隞賢?隞賬?)) return;
  const beforeRestore = buildSystemBackupPayload();
  addSystemBackupHistory(beforeRestore, 'before-restore-history');
  downloadSystemBackupPayload(beforeRestore, 'before-restore-history');
  applySystemBackupPayload(payload);
  logSystemEvent('warn', '???遢甇瑕', row.summary || '');
  showToast('??撌脤???隞賢翰??);
}

function getBackupDiffSummary(payload) {
  const current = buildSystemBackupPayload();
  const targetState = payload.state || {};
  const currentState = current.state || {};
  const lines = ['撌桃?汗嚗????-> ?遢嚗?];
  lines.push(getArrayDiffLine('隞餃?', currentState.tasks, targetState.tasks, getTaskDiffFingerprint));
  lines.push(getArrayDiffLine('?', currentState.members, targetState.members, getStableJsonFingerprint));
  lines.push(getArrayDiffLine('Mission Run', currentState.missionRuns, targetState.missionRuns, getStableJsonFingerprint));
  lines.push(getArrayDiffLine('蝑', currentState.strategy, targetState.strategy, getStableJsonFingerprint));
  lines.push(getChecklistDiffLine('Checklist', currentState.checklist, targetState.checklist));
  lines.push(getChecklistDiffLine('Pre-Dive', currentState.prediveChecklist, targetState.prediveChecklist));
  const currentPending = current.local?.pendingMissionRuns || [];
  const targetPending = payload.local?.pendingMissionRuns || [];
  lines.push(getArrayDiffLine('敺?甇?, currentPending, targetPending, getStableJsonFingerprint));
  return lines.join('\n');
}

function getArrayDiffLine(label, currentRows = [], targetRows = [], fingerprintFn = getStableJsonFingerprint) {
  const current = Array.isArray(currentRows) ? currentRows : [];
  const target = Array.isArray(targetRows) ? targetRows : [];
  const currentMap = mapRowsForDiff(current, fingerprintFn);
  const targetMap = mapRowsForDiff(target, fingerprintFn);
  let added = 0, removed = 0, changed = 0;
  targetMap.forEach((value, key) => {
    if (!currentMap.has(key)) added++;
    else if (currentMap.get(key) !== value) changed++;
  });
  currentMap.forEach((_, key) => { if (!targetMap.has(key)) removed++; });
  return `${label}嚗??${current.length} / ?遢 ${target.length}嚚憓?${added}???${removed}????${changed}`;
}

function mapRowsForDiff(rows, fingerprintFn) {
  const used = new Set();
  const map = new Map();
  rows.forEach((row, index) => {
    let key = row?.id !== undefined && row?.id !== null ? String(row.id) : `row_${index}`;
    while (used.has(key)) key = `${key}_${index}`;
    used.add(key);
    map.set(key, fingerprintFn(row));
  });
  return map;
}

function getTaskDiffFingerprint(task) {
  return getStableJsonFingerprint({
    name:task?.name || '',
    cat:task?.cat || '',
    owner:task?.owner || '',
    start_date:task?.start_date || '',
    due:task?.due || '',
    status:task?.status || '',
    note:task?.note || '',
    depends_on:task?.depends_on || null,
    sort_order:Number(task?.sort_order || 0)
  });
}

function getStableJsonFingerprint(value) {
  if (Array.isArray(value)) return '[' + value.map(getStableJsonFingerprint).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key => `${key}:${getStableJsonFingerprint(value[key])}`).join(',') + '}';
  }
  return JSON.stringify(value ?? null);
}

function flattenChecklistItems(sections = []) {
  return (Array.isArray(sections) ? sections : []).flatMap(sec => (sec.items || []).map(item => ({ ...item, sec:sec.sec || sec.secName || '' })));
}

function getChecklistDiffLine(label, currentSections, targetSections) {
  return getArrayDiffLine(label, flattenChecklistItems(currentSections), flattenChecklistItems(targetSections), getStableJsonFingerprint);
}

function getSystemBackupSummary(payload) {
  const exportedAt = payload.exportedAt ? new Date(payload.exportedAt) : null;
  const timeText = exportedAt && !Number.isNaN(exportedAt.getTime()) ? exportedAt.toLocaleString('zh-HK') : '?芰??';
  const s = payload.state || {};
  const pending = payload.local?.pendingMissionRuns || [];
  return [
    '?遢?批捆?汗',
    `鞈賢迤嚗?{payload.season || '?芰'}`,
    `?臬??嚗?{timeText}`,
    `?⊿?嚗?{getBackupChecksumStatus(payload)}`,
    getBackupDiffSummary(payload),
    `隞餃?嚗?{Array.isArray(s.tasks) ? s.tasks.length : 0} 蝑,
    `?嚗?{Array.isArray(s.members) ? s.members.length : 0} 雿,
    `Mission Run嚗?{Array.isArray(s.missionRuns) ? s.missionRuns.length : 0} 蝑,
    `蝑嚗?{Array.isArray(s.strategy) ? s.strategy.length : 0} ?,
    `敺?甇伐?${Array.isArray(pending) ? pending.length : 0} 蝑
  ].join('\n');
}

/**
 * ??銝??魚摮??銝脯? * @param {string} season ?桀?鞈賢迤?? * @returns {string} 銝?鞈賢迤?? */
function previousSeason(season) {
  const m = String(season).match(/(\d{4})-(\d{4})/);
  if (!m) return '2024-2025';
  return `${Number(m[1])-1}-${Number(m[2])-1}`;
}

/**
 * 蝜芾ˊ Dashboard ????擗????∪??? */
function renderDashboardCharts() {
  if (typeof Chart === 'undefined') {
    ['status-pie-chart','burndown-chart'].forEach(id => {
      const canvas = document.getElementById(id);
      if (canvas) canvas.parentElement.innerHTML = '<div style="color:#999;font-size:.85rem;padding:30px;text-align:center">Chart.js 頛憭望?嚗?瑼Ｘ蝬脩窗敺??唳??/div>';
    });
    return;
  }
  const pieData = getStatusChartData();
  chartInstances.statusPie?.destroy();
  chartInstances.statusPie = new Chart(document.getElementById('status-pie-chart'), {
    type: 'pie',
    data: {
      labels: pieData.labels,
      datasets: [{ data: pieData.values, backgroundColor: ['#C00000','#2F75B5','#548235'], borderColor: '#fff', borderWidth: 2 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });

  const burn = getBurndownData();
  chartInstances.burndown?.destroy();
  chartInstances.burndown = new Chart(document.getElementById('burndown-chart'), {
    type: 'line',
    data: {
      labels: burn.labels,
      datasets: [
        { label: '??拚?', data: burn.ideal, borderColor: '#999', borderDash: [5, 5], tension: .25, pointRadius: 2 },
        { label: '?桀??拚?', data: burn.remaining, borderColor: '#C00000', backgroundColor: 'rgba(192,0,0,.08)', fill: true, tension: .25, pointRadius: 2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// ????????????????????????????????????????????????????????// COMPETITION DAY MODE
// ????????????????????????????????????????????????????????/**
 * 靽?瘥魚/銝偌???? */
function saveCompetitionStart() {
  const value = document.getElementById('competition-start').value;
  localStorage.setItem('rov_competition_start', value);
  updateCompetitionCountdownDisplay();
  renderCompetitionMode();
}

/**
 * ???祈憚?格????身 85 ?? * @returns {number} ?祈憚?格??? */
function getCompetitionTargetScore() {
  return Number(localStorage.getItem('rov_competition_target_score_' + currentSeason)) || 85;
}

/**
 * 靽??祈憚?格??蒂?瑟敺?蝻箏?? */
function saveCompetitionTargetScore() {
  const value = Math.max(0, Number(document.getElementById('competition-target-score')?.value) || 0);
  localStorage.setItem('rov_competition_target_score_' + currentSeason, String(value || 85));
  updateCompetitionScoreGap();
  saveCompetitionSnapshot();
}

/**
 * ?湔 CCC ??擗??撩??? * @param {number} confirmed ?嗅?瘛典??? */
function updateCompetitionScoreGap(confirmed) {
  const target = Math.max(0, Number(document.getElementById('competition-target-score')?.value) || getCompetitionTargetScore());
  const gapEl = document.getElementById('command-score-gap');
  const current = Number(confirmed ?? 0) || 0;
  if (gapEl) gapEl.textContent = Math.max(0, target - current).toFixed(Number.isInteger(target - current) ? 0 : 2);
}

/**
 * 皜脫?瘥魚?交芋撘? */
function renderCompetitionMode() {
  const startInput = document.getElementById('competition-start');
  const savedStart = localStorage.getItem('rov_competition_start') || '';
  if (startInput && !startInput.value) startInput.value = savedStart;
  applyCompetitionRoleView();
  updateCompetitionFocusButton();
  const snapshot = safeJsonParse(localStorage.getItem('rov_competition_snapshot_' + currentSeason), null);
  updateCompetitionAutosaveStatus(snapshot?.savedAt);
  const targetInput = document.getElementById('competition-target-score');
  if (targetInput) targetInput.value = getCompetitionTargetScore();
  const total = state.prediveChecklist.reduce((s,sec)=>s+sec.items.length,0);
  const done = state.prediveChecklist.reduce((s,sec)=>s+sec.items.filter(i=>i.done).length,0);
  const pct = total ? Math.round(done / total * 100) : 0;
  const urgentOpen = state.tasks.filter(t => t.cat === '? 蝺? && t.status !== '撌脣???).length;
  const checkPctEl = document.getElementById('comp-check-pct');
  const openCriticalEl = document.getElementById('comp-open-critical');
  if (checkPctEl) checkPctEl.textContent = pct + '%';
  if (openCriticalEl) openCriticalEl.textContent = urgentOpen;
  updateCompetitionCountdownDisplay();
  startCompetitionCountdownTimer();
  renderCompetitionStatusButtons();
  renderCompetitionReadinessPanel();
  renderCompetitionQuickScorePanel();
  updateCompetitionWarning();
}

function renderCompetitionReadinessPanel() {
  const el = document.getElementById('competition-readiness-panel');
  if (!el) return;
  const snapshot = safeJsonParse(localStorage.getItem('rov_competition_snapshot_' + currentSeason), null);
  const draft = safeJsonParse(localStorage.getItem('rov_competition_score_draft_' + currentSeason), null);
  const total = state.prediveChecklist.reduce((s,sec)=>s+sec.items.length,0);
  const done = state.prediveChecklist.reduce((s,sec)=>s+sec.items.filter(i=>i.done).length,0);
  const pct = total ? Math.round(done / total * 100) : 0;
  const urgentOpen = state.tasks.filter(t => t.cat === '? 蝺? && t.status !== '撌脣???).length;
  const pendingRuns = getPendingMissionRuns().length;
  const savedText = snapshot?.savedAt ? new Date(snapshot.savedAt).toLocaleTimeString('zh-HK') : '?芯?摮?;
  const savedAge = getCompetitionSnapshotAgeSeconds(snapshot);
  const stale = savedAge === null || savedAge > 60;
  const ageText = savedAge === null ? '?芯?摮? : (savedAge < 60 ? `${savedAge}蝘?` : `${Math.floor(savedAge / 60)}??{savedAge % 60}蝘?`);
  const restoreNote = competitionSnapshotRestoreInfo
    ? `<div style="font-size:.8rem;color:var(--muted);margin-top:8px">敹怎?Ｗ儔嚗?{escapeHtml(competitionSnapshotRestoreInfo)}</div>`
    : '';
  el.innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between">
      <strong style="color:var(--navy)">鞈賢?舫??扳?閬?/strong>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="badge ${draft ? 'done' : 'mid'}">?阮 ${draft ? '撌脫摮? : '??}</span>
        <span class="badge ${stale ? 'urgent' : 'done'}">敹怎 ${savedText}嚚?{ageText}</span>
        <span class="badge ${pct >= 100 ? 'done' : pct >= 80 ? 'mid' : 'urgent'}">Pre-Dive ${pct}%</span>
        <span class="badge ${urgentOpen ? 'urgent' : 'done'}">蝺?${urgentOpen}</span>
        <span class="badge ${pendingRuns ? 'urgent' : 'done'}">敺?甇?${pendingRuns}</span>
      </div>
    </div>
    ${restoreNote}`;
}

function getCompetitionSnapshotAgeSeconds(snapshot) {
  if (!snapshot?.savedAt) return null;
  const time = new Date(snapshot.savedAt).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((Date.now() - time) / 1000));
}

/**
 * ??瘥魚?仿??刻撟??嫣噶?湧?撟單?芷＊蝷箄?渲?閮? */
async function toggleCompetitionFullscreen() {
  const page = document.getElementById('page-competition');
  try {
    if (!document.fullscreenElement) {
      document.body.classList.add('competition-focus');
      updateCompetitionFocusButton();
      if (page.requestFullscreen) await page.requestFullscreen();
    } else {
      await document.exitFullscreen?.();
      document.body.classList.remove('competition-focus');
      applyCompetitionFocusState();
    }
  } catch(e) {
    document.body.classList.toggle('competition-focus');
    updateCompetitionFocusButton();
    showToast('?對? ?汗?冽?迂?刻撟?撌脣???瘜函???);
  }
}

/**
 * ?瘥魚?交芋撘??梯?撠汗??雿????芯???湔撠?閮? */
function printCompetitionMode() {
  renderCompetitionMode();
  document.body.classList.add('competition-print-mode');
  setTimeout(() => window.print(), 80);
}

window.addEventListener('afterprint', () => {
  document.body.classList.remove('competition-print-mode');
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) applyCompetitionFocusState();
});

/**
 * ??瘥魚????? * @param {string} startValue datetime-local ?潦? * @returns {string} ????? */
function getCompetitionCountdown(startValue) {
  if (!startValue) return '--:--:--';
  const diff = new Date(startValue) - new Date();
  if (Number.isNaN(diff)) return '--:--:--';
  if (diff <= 0) return 'GO';
  const totalSeconds = Math.ceil(diff / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/**
 * ?芣?唳?鞈賣?甈?嚗??蝘?蝜芣??鞈賣??? */
function updateCompetitionCountdownDisplay() {
  const el = document.getElementById('comp-countdown');
  if (!el) return;
  if (competitionRunState.timerMode === 'mission') {
    const elapsed = getCompetitionMissionElapsedSeconds();
    el.textContent = formatCompetitionMissionTime(elapsed);
    el.classList.toggle('overtime', elapsed > 25 * 60);
    return;
  }
  el.classList.remove('overtime');
  const startInput = document.getElementById('competition-start');
  const savedStart = localStorage.getItem('rov_competition_start') || '';
  el.textContent = getCompetitionCountdown(startInput?.value || savedStart);
}

/**
 * ?澆???Mission 甇?????詻? * @param {number} seconds 撌脩蝘?? * @returns {string} MM:SS ??HH:MM:SS?? */
function formatCompetitionMissionTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return h > 0
    ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/**
 * ???桀? Mission 甇???歇?函??詻? * @returns {number} 撌脩蝘?? */
function getCompetitionMissionElapsedSeconds() {
  const base = Number(competitionRunState.missionElapsed || 0);
  if (!competitionRunState.clockRunning || !competitionRunState.missionStartedAt) return base;
  return Math.max(0, Math.floor((Date.now() - Number(competitionRunState.missionStartedAt)) / 1000));
}

/**
 * ??瘥魚?亙瘥??瑟?? */
function startCompetitionCountdownTimer() {
  if (competitionCountdownTimer) return;
  competitionCountdownTimer = setInterval(() => {
    if (currentPage === 'competition') {
      updateCompetitionCountdownDisplay();
      updateCompetitionWarning();
    }
  }, 1000);
}

/**
 * ???桀? URL ???魚?渲??脰??? * @returns {string} coach ??team?? */
function getRoleView() {
  const params = new URLSearchParams(location.search);
  const role = params.get('role');
  const mode = params.get('mode');
  if (role === 'team' || mode === 'pilot') return 'team';
  return 'coach';
}

/**
 * 靘??脰??矽?湔?鞈賣芋撘?閮?摨艾? */
function applyCompetitionRoleView() {
  const isTeam = getRoleView() === 'team';
  document.querySelectorAll('.quick-score-panel').forEach(el => { el.style.display = isTeam ? 'none' : ''; });
}

/**
 * ??頝銝偌?擗??詻? * @returns {number|null} ?拚?蝘?? */
function getCompetitionRemainingSeconds() {
  const startValue = document.getElementById('competition-start')?.value || localStorage.getItem('rov_competition_start') || '';
  if (!startValue) return null;
  const diff = new Date(startValue) - new Date();
  if (Number.isNaN(diff)) return null;
  return Math.ceil(diff / 1000);
}

/**
 * ??鞈賢閮??券?銵???靘?Space 敹急?萎蝙?具? */
function toggleCompetitionClock() {
  if (competitionRunState.clockRunning) {
    competitionRunState.missionElapsed = getCompetitionMissionElapsedSeconds();
    competitionRunState.clockRunning = false;
    addMissionEvent({ type:'timer_pause', value:competitionRunState.missionElapsed, label:`Mission 閮??怠?嚗?{formatCompetitionMissionTime(competitionRunState.missionElapsed)}` });
  } else {
    competitionRunState.timerMode = 'mission';
    competitionRunState.missionStartedAt = Date.now() - (Number(competitionRunState.missionElapsed || 0) * 1000);
    competitionRunState.clockRunning = true;
    addMissionEvent({ type:'timer_start', value:Number(competitionRunState.missionElapsed || 0), label:'Mission 閮??? / 蝜潛?' });
  }
  saveCompetitionRunState();
  updateCompetitionCountdownDisplay();
  renderCompetitionStatusButtons();
  showToast(competitionRunState.clockRunning ? '??Mission 甇????憪? : '??Mission 閮?撌脫??);
}

/**
 * ?蔭 Mission 甇?????璅∪??? */
function resetCompetitionMissionTimer() {
  competitionRunState.clockRunning = false;
  competitionRunState.timerMode = 'countdown';
  competitionRunState.missionStartedAt = null;
  competitionRunState.missionElapsed = 0;
  saveCompetitionRunState();
  updateCompetitionCountdownDisplay();
  renderCompetitionStatusButtons();
}

/**
 * 靽?瘥魚璅∪??單???? */
function saveCompetitionRunState() {
  localStorage.setItem('rov_competition_run_state_' + currentSeason, JSON.stringify(competitionRunState));
}

/**
 * 頛?砍飛撟渡?鞈賭葉鈭辣瘚? */
function loadMissionEventLog() {
  try {
    missionEventLog = safeJsonParse(localStorage.getItem('rov_events_' + currentSeason), []);
  } catch(e) {
    missionEventLog = [];
  }
}

/**
 * ?啣?銝蝑魚銝凋?隞塚??芯?摮?祆?隞仿?魚銝剔雯蝯∪辣?脯? * @param {object} event 鈭辣鞈??? */
function addMissionEvent(event) {
  missionEventLog.push({
    ts: Date.now(),
    time_str: new Date().toLocaleTimeString('zh-HK'),
    ...event
  });
  localStorage.setItem('rov_events_' + currentSeason, JSON.stringify(missionEventLog.slice(-200)));
}

/**
 * ??鞈賭葉鈭辣瘚?閬?靘?Mission Run ?酉靽??? * @returns {string} 鈭辣???? */
function getEventLogSummary() {
  return missionEventLog
    .filter(e => ['timer_start','timer_pause','rov_status','round_saved'].includes(e.type))
    .slice(-30)
    .map(e => `[${e.time_str}] ${e.label}`)
    .join('\n');
}

/**
 * 閮剖? ROV ????? * @param {string} status ???摮? */
function setCompetitionRovStatus(status) {
  competitionRunState.rovStatus = status;
  saveCompetitionRunState();
  addMissionEvent({ type:'rov_status', value:status, label:`ROV ???${status}` });
  renderCompetitionStatusButtons();
  updateCompetitionWarning();
}

/**
 * 皜脫? ROV 銝????? */
function renderCompetitionStatusButtons() {
  const el = document.getElementById('rov-status-buttons');
  if (!el) return;
  const current = competitionRunState.rovStatus || (competitionRunState.clockRunning ? '?脰?銝? : '敺?');
  const options = [
    { label:'? ?脰?銝?, value:'?脰?銝? },
    { label:'? 敺?', value:'敺?' },
    { label:'? 頞?', value:'頞?' },
    { label:'??摰?', value:'摰?' }
  ];
  el.innerHTML = options.map(opt => `
    <button class="${current === opt.value ? 'active' : ''}" onclick="setCompetitionRovStatus('${opt.value}')">${opt.label}</button>
  `).join('');
  const btn = document.getElementById('competition-clock-btn');
  if (btn) btn.textContent = competitionRunState.clockRunning ? '???怠?閮?' : '????閮?';
  if (btn && competitionRunState.timerMode === 'mission' && !competitionRunState.clockRunning) btn.textContent = '??蝜潛?閮?';
}

/**
 * ?湔摨鞈賢霅衣內璈急??? */
function updateCompetitionWarning() {
  const el = document.getElementById('competition-warning');
  if (!el) return;
  const remaining = getCompetitionRemainingSeconds();
  const status = competitionRunState.rovStatus || '敺?';
  if (remaining !== null && remaining <= 0) {
    el.textContent = '? 撌脣銝偌??嚗?蝡???斗?蝔銵?璅?摰???;
    el.classList.add('danger');
    return;
  }
  if (remaining !== null && remaining <= 120) {
    el.textContent = `? 頝銝偌撠 2 ??嚗擗?${Math.max(0, remaining)} 蝘;
    el.classList.add('danger');
    return;
  }
  el.textContent = `鞈賢???${status}??靽? Pre-Dive Checklist ?????甇乓;
  el.classList.remove('danger');
}

/**
 * ??瘥魚?交?蝔?郊撽揣撘? * @returns {number} 瘚?甇仿?蝝Ｗ??? */
function getCompetitionFlowStep() {
  const saved = Number(localStorage.getItem('rov_competition_flow_' + currentSeason));
  return Number.isFinite(saved) ? Math.max(0, Math.min(COMPETITION_FLOW_STEPS.length - 1, saved)) : 0;
}

/**
 * 霈?魚??蝔敦?Ⅱ隤??? * @returns {object} 隞交?蝔揣撘?摮?蝣箄???? */
function getCompetitionFlowChecks() {
  try {
    return JSON.parse(localStorage.getItem('rov_competition_flow_checks_' + currentSeason) || '{}');
  } catch(e) {
    return {};
  }
}

/**
 * 靽?鞈賢?瘚?蝝圈?蝣箄???? * @param {object} checks 蝣箄???? */
function saveCompetitionFlowChecks(checks) {
  localStorage.setItem('rov_competition_flow_checks_' + currentSeason, JSON.stringify(checks));
}

/**
 * ????瘚??撠敦?? * @param {number} stepIndex 瘚?蝝Ｗ??? * @returns {string[]} ?詨?蝝圈??? */
function getCompetitionFlowChecklist(stepIndex) {
  const step = COMPETITION_FLOW_STEPS[stepIndex];
  const detail = COMPETITION_FLOW_DETAILS[step] || {};
  return detail.checks || [detail.detail || '??湔?蝔銵?];
}

/**
 * ?斗??瘚??臬??敦?歇???? * @param {number} stepIndex 瘚?蝝Ｗ??? * @returns {boolean} ?臬摰??? */
function isCompetitionFlowStepComplete(stepIndex) {
  const checks = getCompetitionFlowChecks()[stepIndex] || {};
  return getCompetitionFlowChecklist(stepIndex).every((_, checkIndex) => checks[checkIndex]);
}

/**
 * ?斗?臬?臭誑????瘚??? * @param {number} stepIndex ?格?瘚?蝝Ｗ??? * @returns {boolean} ?臬?臭誑???? */
function canEnterCompetitionFlowStep(stepIndex) {
  for (let i = 0; i < stepIndex; i++) {
    if (!isCompetitionFlowStepComplete(i)) return false;
  }
  return true;
}

/**
 * ??鞈賢?瘚?蝝圈?蝣箄???? * @param {number} stepIndex 瘚?蝝Ｗ??? * @param {number} checkIndex 蝝圈?蝝Ｗ??? * @param {boolean} checked ?臬???? */
function toggleCompetitionFlowCheck(stepIndex, checkIndex, checked) {
  const checks = getCompetitionFlowChecks();
  if (!checks[stepIndex]) checks[stepIndex] = {};
  checks[stepIndex][checkIndex] = checked;
  saveCompetitionFlowChecks(checks);
  renderCompetitionFlowPanel();
}

/**
 * 皜脫?瘥魚?乩??菔魚??蝔?雿?踴? */
function renderCompetitionFlowPanel() {
  const current = getCompetitionFlowStep();
  const checks = getCompetitionFlowChecks();
  document.getElementById('competition-flow-panel').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-bottom:14px">
      ${COMPETITION_FLOW_STEPS.map((step, index) => {
        const active = index === current;
        const complete = isCompetitionFlowStepComplete(index);
        const detail = COMPETITION_FLOW_DETAILS[step] || { owner:'?湧??', detail:'??湔?蝔銵? };
        const stepChecks = checks[index] || {};
        return `<div style="text-align:left;padding:14px;border:2px solid ${active ? 'var(--blue)' : complete ? 'var(--green)' : 'var(--border)'};background:${active ? '#EAF3FF' : complete ? '#E8F5E9' : 'var(--white)'};color:var(--navy);font-weight:900;min-height:136px;border-radius:8px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${complete ? 'var(--green)' : active ? 'var(--blue)' : '#D8DEE8'};color:#fff;font-weight:900">${complete ? '?? : index + 1}</span>
            <span style="font-size:1rem">${step}</span>
          </div>
          <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-bottom:6px">鞎痊嚗?{escapeHtml(detail.owner)}</div>
          <div style="font-size:.82rem;line-height:1.55;color:#333;font-weight:700;margin-bottom:10px">${escapeHtml(detail.detail)}</div>
          <div style="display:grid;gap:7px;margin-bottom:10px">
            ${getCompetitionFlowChecklist(index).map((text, checkIndex) => `
              <label style="display:flex;align-items:flex-start;gap:8px;font-size:.8rem;line-height:1.45;color:#333;font-weight:800">
                <input type="checkbox" ${stepChecks[checkIndex] ? 'checked' : ''} onchange="toggleCompetitionFlowCheck(${index}, ${checkIndex}, this.checked)" style="margin-top:2px;width:18px;height:18px">
                <span>${escapeHtml(text)}</span>
              </label>`).join('')}
          </div>
          <button class="btn btn-sm" onclick="setCompetitionFlowStep(${index})">${active ? '?桀?瘚?' : '閮剔?桀?'}</button>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
      <div style="font-size:1rem;font-weight:900;color:var(--navy)">?桀?嚗?{COMPETITION_FLOW_STEPS[current]}嚗?{isCompetitionFlowStepComplete(current) ? '撌脤?' : '撠?券??'}嚗?/div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="advanceCompetitionFlow()">?脫?蝔?/button>
        <button class="btn" onclick="resetCompetitionFlow()">?身瘚?</button>
      </div>
    </div>`;
}

/**
 * 皜脫? 2026 Float 隞餃??曉瘚??? */
function renderFloatMissionFlow() {
  const el = document.getElementById('float-mission-flow');
  if (!el) return;
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-bottom:10px">
      ${FLOAT_MISSION_FLOW.map((item, i) => `
        <div style="border-left:4px solid ${i < 3 ? 'var(--blue)' : 'var(--green)'};background:#F8FBFF;border-radius:8px;padding:9px 10px">
          <div style="font-weight:900;color:var(--navy)">${i + 1}. ${escapeHtml(item.step)}</div>
          <div style="font-size:.78rem;color:var(--muted);margin-top:3px">${escapeHtml(item.note)}</div>
        </div>`).join('')}
    </div>
    <div style="font-size:.8rem;color:var(--muted);line-height:1.6">
      瘛勗漲??嚗?.5m 摰寡迂蝭???2.27m - 2.83m嚗?0cm 摰寡迂蝭???0.07m - 0.73m嚗??楛摨阡? 7 蝑??鞈?閬? 30 蝘?    </div>`;
}

/**
 * 皜脫? Float 隞餃?鋆?內?～? */
function renderFloatJudgeCard() {
  const el = document.getElementById('float-judge-card');
  if (!el) return;
  const analysis = getLastFloatAnalysis();
  const needsMateData = !analysis || analysis.autoScore?.needsMateData;
  const autoScore = analysis?.autoScore?.score ?? 0;
  const cards = [
    { title:'?函蔡???牧', text:'?????Ⅱ隤?Float 撌脣? mission station ?喲?data packet嚗敺??? profile?? },
    { title:'瘛勗漲鞈?閬?蝷?, text:'? 2.5m 蝭? 2.27m-2.83m??0cm 蝭? 0.07m-0.73m嚗?? 7 蝑??鞈?閬? 30 蝘? },
    { title:'Graph 閬?蝷?, text:'???文?蝷?time-depth graph嚗 頠貊 time嚗 頠貊 depth嚗?憟賣??喳? 20 蝑??? },
    { title:'Sensor offset 閬蜓?牧', text:'??depth / pressure sensor 銝 Float ????剁?閬????方牧??offset ?矽?游??????? },
    { title:'雿?閬? MATE data', text:needsMateData ? '?桀?撠?銝雲 20 蝑?撠??嚗???鋆閬? MATE data?? : '?桀?撠?頞喳?嚗??蝷箄摰?Float data嚗??閬? MATE data?? },
    { title:'銝瞍?', text:'?敺??頛詻撠?蝑?/ ?券 packets?epth-time graph ?舐蝡??嚗?閬撅內 profile?? }
  ];
  el.innerHTML = `
    <div class="card-grid" style="margin-bottom:10px">
      <div class="stat-card" style="border-top-color:#7030A0"><div class="stat-num" style="color:#7030A0">${autoScore}</div><div class="stat-label">撠??航???</div></div>
      <div class="stat-card" style="border-top-color:${needsMateData ? 'var(--orange)' : 'var(--green)'}"><div class="stat-num" style="color:${needsMateData ? 'var(--orange)' : 'var(--green)'}">${needsMateData ? '皞?' : 'OK'}</div><div class="stat-label">MATE data 蝑</div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px">
      ${cards.map(card => `<div style="border-left:4px solid var(--blue);background:#F8FBFF;border-radius:8px;padding:9px 10px">
        <div style="font-weight:900;color:var(--navy);margin-bottom:3px">${escapeHtml(card.title)}</div>
        <div style="font-size:.8rem;color:var(--muted);line-height:1.55">${escapeHtml(card.text)}</div>
      </div>`).join('')}
    </div>`;
}

/**
 * 閮剖?瘥魚?交?蝔郊撽? * @param {number} stepIndex 瘚?甇仿?蝝Ｗ??? */
function setCompetitionFlowStep(stepIndex) {
  const target = Math.max(0, Math.min(COMPETITION_FLOW_STEPS.length - 1, stepIndex));
  if (!canEnterCompetitionFlowStep(target)) {
    showToast('隢?摰??瘚???函敦?Ⅱ隤?, 'warning');
    return;
  }
  localStorage.setItem('rov_competition_flow_' + currentSeason, String(target));
  renderCompetitionFlowPanel();
}

/**
 * ?券脣銝???鞈賣瘚?甇仿??? */
function advanceCompetitionFlow() {
  const current = getCompetitionFlowStep();
  if (!isCompetitionFlowStepComplete(current)) {
    showToast('?桀?瘚?撠?券??嚗???豢??敦??, 'warning');
    return;
  }
  if (current >= COMPETITION_FLOW_STEPS.length - 1) {
    showToast('?券鞈賢? / 鞈賢?瘚?撌脤?', 'success');
    return;
  }
  setCompetitionFlowStep(current + 1);
}

/**
 * ?身瘥魚?交?蝔郊撽? */
function resetCompetitionFlow() {
  localStorage.setItem('rov_competition_flow_' + currentSeason, '0');
  localStorage.removeItem('rov_competition_flow_checks_' + currentSeason);
  renderCompetitionFlowPanel();
}

/**
 * 皜脫?瘥魚璅∪?敹恍????? */
function renderCompetitionQuickScorePanel() {
  const el = document.getElementById('competition-quick-score');
  if (!el) return;
  if (getRoleView() === 'team') {
    el.innerHTML = '<div style="color:var(--muted);font-weight:800">?豢?蝡臬憿舐內隞餃???Pre-Dive Checklist嚗???雿輻?毀蝡胯?/div>';
    return;
  }
  const saved = JSON.parse(localStorage.getItem('rov_competition_score_draft_' + currentSeason) || '{}');
  const station = document.getElementById('cq-station')?.value || saved.station || 'Flume Tank';
  const templates = Object.entries(MISSION_SCORE_TEMPLATES).filter(([, tpl]) => tpl.station === station);
  const requestedTemplate = document.getElementById('cq-template')?.value || saved.template;
  const templateKey = templates.some(([key]) => key === requestedTemplate) ? requestedTemplate : (templates[0]?.[0] || 'seabed2030');
  const template = MISSION_SCORE_TEMPLATES[templateKey];
  el.innerHTML = `
    <div class="quick-score-layout">
      <div class="quick-score-stack">
        <div class="form-row quick-score-field"><label>??</label><select id="cq-station" onchange="renderCompetitionQuickScorePanel();setCompetitionQuickScoreDirty(true)">
          ${['Flume Tank','OEB Wave Tank','Ice Tank'].map(s => `<option value="${s}" ${s === station ? 'selected' : ''}>${s}</option>`).join('')}
        </select></div>
        <div class="form-row quick-score-field"><label>隞餃?</label><select id="cq-template" onchange="renderCompetitionQuickScorePanel();setCompetitionQuickScoreDirty(true)">
          ${templates.map(([key, tpl]) => `<option value="${key}" ${key === templateKey ? 'selected' : ''}>${escapeHtml(tpl.label)}</option>`).join('')}
        </select></div>
        <div class="form-row quick-score-field"><label>頛芣活</label><input type="text" id="cq-round" value="${escapeHtml(saved.round || '')}" oninput="markCompetitionQuickScoreDirty()" placeholder="Final R1"></div>
        <div class="form-row quick-score-field"><label>???/ 蝯</label><input type="text" id="cq-pilot" value="${escapeHtml(saved.pilot || '')}" oninput="markCompetitionQuickScoreDirty()" placeholder="Pilot A"></div>
        <div class="form-row quick-score-field"><label>?冽?嚗?嚗?/label><input type="text" id="cq-seconds" value="${escapeHtml(saved.seconds || '')}" oninput="updateCompetitionQuickScorePreview();markCompetitionQuickScoreDirty()" placeholder="720"></div>
        <div class="form-row quick-score-field"><label>摰???甈⊥</label><input type="text" id="cq-penalty-count" value="${escapeHtml(saved.penaltyCount || '')}" oninput="updateCompetitionQuickScorePreview();markCompetitionQuickScoreDirty()" placeholder="0"></div>
      </div>
      <div>
        <div style="font-weight:900;color:var(--navy);margin-bottom:6px">隞餃???</div>
        <div class="quick-score-list">
          ${template.items.map(item => {
            const groupAttr = item.group ? ` data-score-group="${escapeHtml(item.group)}"` : '';
            return `<label class="quick-score-option">
              <input type="checkbox" class="cq-score-check" value="${item.id}"${groupAttr} onchange="handleCompetitionScoreToggle(this);markCompetitionQuickScoreDirty()">
              <span>${escapeHtml(item.label)}</span>
              <strong style="color:${item.score >= 0 ? 'var(--green)' : 'var(--red)'}">${item.score >= 0 ? '+' : ''}${item.score}</strong>
            </label>`;
          }).join('')}
        </div>
      </div>
      <div class="quick-score-actions">
        <div class="form-row"><label>?酉</label><textarea id="cq-note" style="height:132px" oninput="markCompetitionQuickScoreDirty()" placeholder="鋆?詨? / 鞈賢??寥?>${escapeHtml(saved.note || '')}</textarea></div>
        <div id="cq-dirty-status" style="font-size:.8rem;font-weight:800;color:var(--muted);background:#f6f8fb;border-radius:8px;padding:8px 10px">?阮???撌脣?甇?/div>
        <button class="btn btn-primary touch-btn" onclick="saveCompetitionQuickRun()">?脣??祈憚</button>
        <button class="btn touch-btn" onclick="saveCompetitionQuickDraft()">?怠??阮</button>
        <button class="btn touch-btn" onclick="clearCompetitionQuickScore()">皜征</button>
      </div>
    </div>`;
  (saved.selected || []).forEach(id => {
    const input = [...el.querySelectorAll('.cq-score-check')].find(node => node.value === id);
    if (input) input.checked = true;
  });
  updateCompetitionQuickScorePreview();
  setCompetitionQuickScoreDirty(false);
}

/**
 * ??敹恍?????璅⊥?? * @returns {object} 隞餃?璅⊥?? */
function getCompetitionQuickTemplate() {
  return MISSION_SCORE_TEMPLATES[document.getElementById('cq-template')?.value] || MISSION_SCORE_TEMPLATES.seabed2030;
}

/**
 * ??敹恍??獢???????蝬剜?鈭?豢??? * @param {HTMLInputElement} input 鋡怠????寞??? */
function handleCompetitionScoreToggle(input) {
  const group = input.dataset.scoreGroup;
  if (group && input.checked) {
    document.querySelectorAll(`.cq-score-check[data-score-group="${group}"]`).forEach(node => {
      if (node !== input) node.checked = false;
    });
  }
  updateCompetitionQuickScorePreview();
}

/**
 * ??敹恍??????殷?? time bonus ???寞?? * @returns {Array<object>} 敺???? */
function getCompetitionQuickScoreItems() {
  const template = getCompetitionQuickTemplate();
  const selected = [...document.querySelectorAll('.cq-score-check:checked')]
    .map(input => template.items.find(item => item.id === input.value))
    .filter(Boolean);
  const seconds = Number(document.getElementById('cq-seconds')?.value) || 0;
  const penaltyCount = Number(document.getElementById('cq-penalty-count')?.value) || 0;
  if (template.station !== 'Ice Tank' && seconds > 0 && seconds < 900) {
    const remaining = 900 - seconds;
    const minutes = Math.floor(remaining / 60);
    const secs = remaining % 60;
    selected.push({ id:'time_bonus', label:`Time bonus (${minutes}m ${secs}s remaining)`, score:Number((minutes + secs * 0.01).toFixed(2)), type:'score', auto:true });
  }
  if (penaltyCount > 0) selected.push({ id:'official_penalty', label:`Official penalty infractions x${penaltyCount}`, score:penaltyCount * -5, type:'penalty', auto:true });
  return selected;
}

/**
 * ?湔敹恍????閬質? Command Center ?嗉憚敺??? */
function updateCompetitionQuickScorePreview() {
  const items = getCompetitionQuickScoreItems();
  const gross = items.filter(item => item.score > 0).reduce((sum, item) => sum + item.score, 0);
  const penalty = Math.abs(items.filter(item => item.score < 0).reduce((sum, item) => sum + item.score, 0));
  const total = gross - penalty;
  const grossEl = document.getElementById('cq-gross');
  const penaltyEl = document.getElementById('cq-penalty');
  if (grossEl) grossEl.textContent = Number.isInteger(gross) ? gross : gross.toFixed(2);
  if (penaltyEl) penaltyEl.textContent = Number.isInteger(penalty) ? penalty : penalty.toFixed(2);
  updateCompetitionScoreGap(total);
}

function setCompetitionQuickScoreDirty(isDirty) {
  competitionQuickScoreDirty = !!isDirty;
  const el = document.getElementById('cq-dirty-status');
  if (!el) return;
  if (isDirty) {
    el.textContent = '?阮????靽?霈';
    el.style.color = 'var(--red)';
    el.style.background = '#fff1f1';
  } else {
    el.textContent = '?阮???撌脣?甇?;
    el.style.color = 'var(--muted)';
    el.style.background = '#f6f8fb';
  }
}

function markCompetitionQuickScoreDirty() {
  setCompetitionQuickScoreDirty(true);
  renderCompetitionReadinessPanel();
}

function hasCompetitionQuickScoreContent() {
  const draft = getCompetitionQuickDraftFromDom();
  if (!draft) return false;
  return Boolean(
    draft.round.trim() ||
    draft.pilot.trim() ||
    draft.seconds.trim() ||
    draft.penaltyCount.trim() ||
    draft.note.trim() ||
    draft.selected.length
  );
}

function shouldWarnCompetitionUnsavedChanges() {
  return currentPage === 'competition' && competitionQuickScoreDirty && hasCompetitionQuickScoreContent();
}

/**
 * ?怠?瘥魚璅∪?敹恍???蝔踴? */
function saveCompetitionQuickDraft() {
  const draft = getCompetitionQuickDraftFromDom() || {};
  localStorage.setItem('rov_competition_score_draft_' + currentSeason, JSON.stringify(draft));
  saveCompetitionSnapshot();
  setCompetitionQuickScoreDirty(false);
  showToast('??瘥魚閮??阮撌脫摮?);
}

/**
 * 皜征敹恍????? */
function clearCompetitionQuickScore() {
  if (hasCompetitionQuickScoreContent() && !confirm('?桀?敹恍????摰對?蝣箏?閬?蝛綽?')) return;
  localStorage.removeItem('rov_competition_score_draft_' + currentSeason);
  renderCompetitionQuickScorePanel();
  renderCompetitionReadinessPanel();
}

/**
 * ?脣?瘥魚璅∪?敹恍?? Mission Run?? */
async function saveCompetitionQuickRun() {
  const items = getCompetitionQuickScoreItems();
  const gross = items.filter(item => item.score > 0).reduce((sum, item) => sum + item.score, 0);
  const penalty = Math.abs(items.filter(item => item.score < 0).reduce((sum, item) => sum + item.score, 0));
  const run = {
    id: Date.now(),
    run_date: new Date().toISOString().split('T')[0],
    round_name: document.getElementById('cq-round')?.value.trim(),
    pilot: document.getElementById('cq-pilot')?.value.trim(),
    missions: items.filter(item => !item.auto && item.score > 0).map(item => item.label).join('??),
    gross_score: gross,
    penalty,
    seconds: Number(document.getElementById('cq-seconds')?.value) || 0,
    faults: 0,
    success_rate: 0,
    video_url: '',
    score_items: items,
    note: document.getElementById('cq-note')?.value.trim(),
    season: currentSeason
  };
  if (!run.round_name) { alert('隢撓?亥憚甈?/ ?湔活'); return; }
  if (!run.pilot) { alert('隢撓?交??扳? / 蝯'); return; }
  run.seconds = getCompetitionMissionElapsedSeconds() || run.seconds;
  const eventSummary = getEventLogSummary();
  if (eventSummary) run.note = [run.note, '鞈賭葉鈭辣嚗n' + eventSummary].filter(Boolean).join('\n\n');
  await persistMissionRun(run);
  addMissionEvent({ type:'round_saved', value:getMissionRunTotal(run), label:`?祈憚?脣?嚗?{getMissionRunTotal(run)} ? });
  resetCompetitionMissionTimer();
  clearCompetitionQuickScore();
}

/**
 * 皜脫??湧?鞎痊鈭箝? */
function renderCompetitionContacts() {
  const el = document.getElementById('competition-contacts');
  if (!el) return;
  const assignments = getCompetitionContactAssignments();
  const onshore = getCompetitionContactGroupMembers('onshore', assignments);
  const offshore = getCompetitionContactGroupMembers('offshore', assignments);
  el.innerHTML = `
    <div class="contact-team-grid">
      ${renderCompetitionContactGroup('Onshore', 'onshore', onshore)}
      ${renderCompetitionContactGroup('Offshore', 'offshore', offshore)}
    </div>
    <h2 style="margin-top:6px">???</h2>
    <div style="font-size:.82rem;color:var(--muted);margin-bottom:8px">?舀????∪銝 Onshore / Offshore 雿蔭嚗漲?舐銝??詨??嚗?蝯?憭?3 鈭箝?/div>
    <div id="contact-member-source">
      ${state.members.map(m => {
        const key = getCompetitionContactMemberKey(m);
        const group = assignments[key] || '';
        return `<div class="contact-member-row" data-member-key="${escapeHtml(key)}">
          <span class="drag-handle" title="????Onshore / Offshore">??/span>
          <div>
            <strong>${escapeHtml(m.name)}</strong>
            <span style="font-size:.78rem;color:var(--muted);margin-left:6px">${escapeHtml(m.role || '')}</span>
            <div style="font-size:.78rem;color:var(--muted)">${escapeHtml((m.tasks || []).slice(0,2).join(' / ') || '?芾身摰遙??)}</div>
          </div>
          <select onchange="setCompetitionContactGroup(this.closest('.contact-member-row').dataset.memberKey, this.value)">
            <option value="" ${!group ? 'selected' : ''}>?芸?蝯?/option>
            <option value="onshore" ${group === 'onshore' ? 'selected' : ''}>Onshore</option>
            <option value="offshore" ${group === 'offshore' ? 'selected' : ''}>Offshore</option>
          </select>
        </div>`;
      }).join('') || '<div style="color:#999">撠?鞈?</div>'}
    </div>`;
  initCompetitionContactDrag();
}

/**
 * ???湧?鞎痊鈭箏?蝯身摰? * @returns {Record<string,string>} ???閮剖??? */
function getCompetitionContactAssignments() {
  try {
    const saved = JSON.parse(localStorage.getItem('rov_competition_contacts_' + currentSeason) || '{}');
    return saved.assignments || saved;
  } catch(e) {
    return {};
  }
}

/**
 * ???湧?鞎痊鈭箸?摨身摰? * @returns {{onshore:string[],offshore:string[]}} ?????? */
function getCompetitionContactOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem('rov_competition_contacts_' + currentSeason) || '{}');
    return saved.order || { onshore:[], offshore:[] };
  } catch(e) {
    return { onshore:[], offshore:[] };
  }
}

/**
 * 靽??湧?鞎痊鈭箏?蝯???閮剖??? * @param {Record<string,string>} assignments ???閮剖??? * @param {{onshore:string[],offshore:string[]}} order ?????? */
function saveCompetitionContactConfig(assignments, order) {
  localStorage.setItem('rov_competition_contacts_' + currentSeason, JSON.stringify({ assignments, order }));
}

/**
 * ????典??蝯身摰葉??key?? * @param {object} member ?鞈??? * @returns {string} ? key?? */
function getCompetitionContactMemberKey(member) {
  return String(member.id || member.name);
}

/**
 * ?????????～? * @param {string} group ???迂?? * @param {Record<string,string>} assignments ???閮剖??? * @returns {Array<object>} ????? */
function getCompetitionContactGroupMembers(group, assignments) {
  const order = getCompetitionContactOrder()[group] || [];
  return state.members
    .filter(m => assignments[getCompetitionContactMemberKey(m)] === group)
    .sort((a, b) => {
      const ai = order.indexOf(getCompetitionContactMemberKey(a));
      const bi = order.indexOf(getCompetitionContactMemberKey(b));
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    })
    .slice(0, 3);
}

/**
 * 皜脫? Onshore / Offshore 鞎痊鈭箏?? * @param {string} label 憿舐內?迂?? * @param {string} group ???潦? * @param {Array<object>} members ????? * @returns {string} HTML 摮葡?? */
function renderCompetitionContactGroup(label, group, members) {
  const color = group === 'onshore' ? 'var(--blue)' : 'var(--green)';
  const slots = Array.from({ length: 3 }, (_, i) => members[i] || null);
  return `<div class="contact-team-card" style="border-top:4px solid ${color}">
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px">
      <h2 style="margin:0;border-left:none;padding-left:0;color:${color}">${label}</h2>
      <span class="badge ${members.length === 3 ? 'done' : 'mid'}">${members.length}/3</span>
    </div>
    <div class="contact-dropzone" data-contact-group="${group}">
      ${slots.map((member, index) => member ? renderCompetitionContactPerson(member, index) : `
        <div class="contact-empty-slot">${index + 1}. 敺??交???/div>
      `).join('')}
    </div>
  </div>`;
}

/**
 * 皜脫??舀????湧???～? * @param {object} member ?鞈??? * @param {number} index 憿舐內???? * @returns {string} HTML 摮葡?? */
function renderCompetitionContactPerson(member, index) {
  const key = getCompetitionContactMemberKey(member);
  return `<div class="contact-person-card" data-member-key="${escapeHtml(key)}">
    <div style="display:flex;gap:8px;align-items:flex-start">
      <span class="drag-handle" title="????">??/span>
      <div>
        <div style="font-weight:900;color:var(--navy)">${index + 1}. ${escapeHtml(member.name)}</div>
        <div style="font-size:.78rem;color:var(--muted)">${escapeHtml(member.role || '?芾身摰???)}</div>
        <div style="font-size:.78rem;color:var(--muted)">${escapeHtml((member.tasks || []).slice(0,2).join(' / ') || '?芾身摰遙??)}</div>
      </div>
    </div>
  </div>`;
}

/**
 * 閮剖????Onshore / Offshore ???? * @param {string} memberKey ? key?? * @param {string} group ???潦? */
function setCompetitionContactGroup(memberKey, group) {
  const assignments = getCompetitionContactAssignments();
  const order = getCompetitionContactOrder();
  const normalized = group === 'onshore' || group === 'offshore' ? group : '';
  if (normalized) {
    const sameGroupCount = Object.entries(assignments)
      .filter(([key, value]) => key !== memberKey && value === normalized).length;
    if (sameGroupCount >= 3) {
      showToast(`${normalized === 'onshore' ? 'Onshore' : 'Offshore'} 撌脫遛 3 鈭槁);
      renderCompetitionContacts();
      return;
    }
    assignments[memberKey] = normalized;
    order.onshore = (order.onshore || []).filter(key => key !== memberKey);
    order.offshore = (order.offshore || []).filter(key => key !== memberKey);
    order[normalized].push(memberKey);
  } else {
    delete assignments[memberKey];
    order.onshore = (order.onshore || []).filter(key => key !== memberKey);
    order.offshore = (order.offshore || []).filter(key => key !== memberKey);
  }
  saveCompetitionContactConfig(assignments, order);
  renderCompetitionContacts();
}

/**
 * ?????鞎砌犖?????? */
function initCompetitionContactDrag() {
  if (typeof Sortable === 'undefined') return;
  document.querySelectorAll('.contact-dropzone').forEach(zone => {
    new Sortable(zone, {
      group: { name:'competitionContacts', pull:true, put:true },
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      filter: '.contact-empty-slot',
      onAdd: scheduleCompetitionContactOrderSave,
      onUpdate: scheduleCompetitionContactOrderSave,
      onRemove: scheduleCompetitionContactOrderSave
    });
  });
  const source = document.getElementById('contact-member-source');
  if (source) {
    new Sortable(source, {
      group: { name:'competitionContacts', pull:'clone', put:false },
      handle: '.drag-handle',
      sort: false,
      animation: 150,
      ghostClass: 'sortable-ghost'
    });
  }
}

/**
 * 撱嗅?靽???蝯?嚗?敺楊甈宏???? */
function scheduleCompetitionContactOrderSave() {
  clearTimeout(window.rovContactDragTimer);
  window.rovContactDragTimer = setTimeout(saveCompetitionContactOrderFromDom, 80);
}

/**
 * ?望?????DOM 靽??湧?鞎痊鈭箸?摨????? */
function saveCompetitionContactOrderFromDom() {
  const assignments = {};
  const order = { onshore:[], offshore:[] };
  let overflow = false;
  document.querySelectorAll('.contact-dropzone').forEach(zone => {
    const group = zone.dataset.contactGroup;
    [...zone.querySelectorAll('.contact-person-card, .contact-member-row')].forEach(node => {
      const key = node.dataset.memberKey;
      if (!key || order[group].includes(key)) return;
      if (order[group].length >= 3) {
        overflow = true;
        return;
      }
      assignments[key] = group;
      order[group].push(key);
    });
  });
  saveCompetitionContactConfig(assignments, order);
  if (overflow) showToast('瘥??憭?3 鈭綽?撌脖???銝?');
  renderCompetitionContacts();
}

/**
 * ??隞餃????擗?鞈??? * @returns {{labels:string[], values:number[]}} ?”鞈??? */
function getStatusChartData() {
  return {
    labels: ['敺齒', '?脰?銝?, '撌脣???],
    values: ['敺齒', '?脰?銝?, '撌脣???].map(status => state.tasks.filter(t => t.status === status).length)
  };
}

/**
 * 靘遙?絲憪??????∪?鞈??? * @returns {{labels:string[], ideal:number[], remaining:number[]}} ????? */
function getBurndownData() {
  const dated = state.tasks.filter(t => t.due || t.start_date);
  if (!dated.length) return { labels: ['隞'], ideal: [0], remaining: [0] };
  const rawDates = dated.flatMap(t => [t.start_date, t.due].filter(Boolean)).map(d => new Date(d));
  const start = new Date(Math.min(...rawDates)); start.setHours(0,0,0,0);
  const end = new Date(Math.max(...rawDates)); end.setHours(0,0,0,0);
  const span = Math.max(1, Math.min(45, Math.round((end - start) / 86400000)));
  const total = state.tasks.length;
  const labels = [];
  const ideal = [];
  const remaining = [];
  for (let i = 0; i <= span; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const ratio = i / span;
    labels.push(`${d.getMonth()+1}/${d.getDate()}`);
    ideal.push(Math.max(0, Math.round(total * (1 - ratio))));
    remaining.push(state.tasks.filter(t => t.status !== '撌脣??? && (!t.due || new Date(t.due) >= d)).length);
  }
  return { labels, ideal, remaining };
}

// ????????????????????????????????????????????????????????// STRATEGY BOARD
// ????????????????????????????????????????????????????????/**
 * 閮?蝑????? * @param {object} item 蝑??? * @returns {number} ???? */
function getStrategyValue(item) {
  const score = Number(item.score) || 0;
  const difficulty = Math.max(1, Number(item.difficulty) || 1);
  const risk = Math.max(1, Number(item.risk) || 1);
  const seconds = Math.max(30, Number(item.seconds) || 30);
  return Math.round((score * 1000) / (difficulty * risk * seconds));
}

/**
 * 皜脫?隞餃?蝑?踴? */
function renderStrategyBoard() {
  renderStrategyDecisionPanel();
  const sorted = [...state.strategy].sort((a,b) => getStrategyValue(b) - getStrategyValue(a));
  document.getElementById('strategy-tbody').innerHTML = sorted.map((item, index) => `
    <tr class="${index < 3 ? 'strategy-top' : ''}">
      <td style="font-weight:900">${index + 1}</td>
      <td><strong>${escapeHtml(item.name)}</strong>${item.note?`<div style="font-size:.75rem;color:var(--muted)">${escapeHtml(item.note)}</div>`:''}</td>
      <td>${Number(item.score)||0}</td>
      <td>${Number(item.difficulty)||1}</td>
      <td>${Number(item.risk)||1}</td>
      <td>${Number(item.seconds)||0}s</td>
      <td><span class="strategy-score">${getStrategyValue(item)}</span></td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteStrategyItem(${item.id})">?芷</button></td>
    </tr>
  `).join('') || '<tr><td colspan="8" style="text-align:center;color:#999;padding:18px">撠蝑?</td></tr>';
}

function renderStrategyDecisionPanel() {
  const el = document.getElementById('strategy-decision-panel');
  if (!el) return;
  const picks = buildStrategyDecisionPicks();
  const latest = [...state.missionRuns].sort((a,b) => String(b.run_date || '').localeCompare(String(a.run_date || '')) || Number(b.id || 0) - Number(a.id || 0))[0];
  const signal = latest
    ? `??唬?頛?${escapeHtml(latest.round_name || 'Mission Run')}嚗?{getMissionRunTotal(latest)} ????? ${Number(latest.penalty) || 0}嚗??${Number(latest.seconds) || 0}s`
    : '撠 Mission Run嚗?隞亦??交????撱箇??箸???;
  el.innerHTML = `
    <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:8px">
      <strong style="color:var(--navy)">銝?頛芣捱蝑??/strong>
      <span style="font-size:.8rem;color:var(--muted)">${signal}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px">
      ${picks.map((pick, i) => `
        <div style="border-left:4px solid ${i === 0 ? 'var(--green)' : i === 1 ? 'var(--blue)' : 'var(--orange)'};background:#F8FBFF;border-radius:8px;padding:10px">
          <div style="font-size:.78rem;color:var(--muted);font-weight:900">#${i + 1} ${escapeHtml(pick.mode)}</div>
          <div style="font-weight:900;color:var(--navy);margin:3px 0">${escapeHtml(pick.name)}</div>
          <div style="font-size:.82rem;color:var(--muted);line-height:1.55">${escapeHtml(pick.reason)}</div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-sm" onclick="appendStrategyDecisionToNotes()">鞎澆蝑瘙箇?</button>
      <button class="btn btn-sm" onclick="seedStrategyFromWeakMissionItems()">敺?蝛拙??遣蝡???/button>
    </div>`;
}

function buildStrategyDecisionPicks() {
  const strategyRows = [...state.strategy].sort((a,b) => getStrategyValue(b) - getStrategyValue(a));
  const missionRows = [...state.missionRuns].sort((a,b) => String(b.run_date || '').localeCompare(String(a.run_date || '')) || Number(b.id || 0) - Number(a.id || 0));
  const weakItems = getWeakMissionScoreItems(missionRows);
  const latest = missionRows[0];
  const picks = [];
  if (strategyRows[0]) {
    picks.push({
      mode:'?擃???,
      name:strategyRows[0].name,
      reason:`蝑?? ${getStrategyValue(strategyRows[0])}嚗???${Number(strategyRows[0].score) || 0}嚗◢??${Number(strategyRows[0].risk) || 1}嚗?隡?${Number(strategyRows[0].seconds) || 0}s?
    });
  }
  if (weakItems[0]) {
    picks.push({
      mode:'鋆帘摰漲',
      name:weakItems[0].label,
      reason:`??敺??賭葉 ${weakItems[0].count}/${Math.max(1, missionRows.length)}嚗遣霅唬?銝頛芸???蝺氬
    });
  }
  if (latest && Number(latest.penalty || 0) > 0) {
    picks.push({
      mode:'?◢??,
      name:'?嗆?楝蝺?,
      reason:`??唬?頛芣 ${Number(latest.penalty) || 0} ???芸??粥閫貊?????蝵柴
    });
  }
  if (!picks.length) {
    picks.push({ mode:'撱箇??箸?', name:'?啣?蝑?', reason:'撠蝑??Mission Run 鞈?嚗??啣?擃?隞餃?銝血???頛芾??? });
  }
  return picks.slice(0, 3);
}

async function appendStrategyDecisionToNotes() {
  const picks = buildStrategyDecisionPicks();
  const text = [
    `## 銝?頛芰??交捱蝑?${new Date().toLocaleString()}`,
    '',
    ...picks.map((pick, i) => `${i + 1}. ${pick.mode}嚚?{pick.name}嚗?{pick.reason}`)
  ].join('\n');
  await appendTextToNotes(text);
  showToast('??蝑瘙箇?撌脰票?亙?敹?);
}

async function seedStrategyFromWeakMissionItems() {
  const weakItems = getWeakMissionScoreItems([...state.missionRuns]);
  if (!weakItems.length) {
    showToast('?? 撠雿帘摰????臬遣蝡???);
    return;
  }
  const existing = new Set(state.strategy.map(item => item.name));
  const toAdd = weakItems.slice(0, 3).filter(item => !existing.has(item.label)).map((item, index) => ({
    id: Date.now() + index,
    name:item.label,
    score:0,
    difficulty:3,
    risk:2,
    seconds:90,
    note:`?曹?蝛拙?敺??遣蝡??賭葉 ${item.count} 甈︶,
    sort_order:state.strategy.length + index + 1,
    season:currentSeason
  }));
  if (!toAdd.length) {
    showToast('??雿帘摰???撌脣蝑?蹂葉');
    return;
  }
  if (optionalSchema.strategy) {
    const payload = toAdd.map(item => ({
      name:item.name, score:item.score, difficulty:item.difficulty, risk:item.risk,
      seconds:item.seconds, note:item.note, sort_order:item.sort_order,
      ...(optionalSchema.strategySeason ? { season:currentSeason } : {})
    }));
    const { data, error } = await db.from('strategy_items').insert(payload).select();
    if (error) {
      alert('撱箇?蝑憭望?嚗? + error.message);
      return;
    }
    if (data) data.forEach((row, i) => { toAdd[i].id = row.id; });
  }
  state.strategy.push(...toAdd);
  saveLocalStrategy();
  markDirty('strategy');
  renderStrategyBoard();
  showToast(`??撌脣遣蝡?${toAdd.length} ???仿??害);
}

/**
 * ?啣?蝑??? */
async function addStrategyItem() {
  const item = {
    id: Date.now(),
    name: document.getElementById('strategy-name').value.trim(),
    score: Number(document.getElementById('strategy-score').value) || 0,
    difficulty: Number(document.getElementById('strategy-difficulty').value) || 1,
    risk: Number(document.getElementById('strategy-risk').value) || 1,
    seconds: Number(document.getElementById('strategy-seconds').value) || 60,
    sort_order: state.strategy.length + 1,
    season: currentSeason
  };
  if (!item.name) { alert('隢撓?乩遙??蝑?迂'); return; }
  if (optionalSchema.strategy) {
    const payload = {
      name:item.name, score:item.score, difficulty:item.difficulty, risk:item.risk,
      seconds:item.seconds, note:item.note || '', sort_order:item.sort_order
    };
    if (optionalSchema.strategySeason) payload.season = currentSeason;
    const { data, error } = await db.from('strategy_items').insert([payload]).select().single();
    if (error) { alert('蝑?脣?憭望?嚗? + error.message); return; }
    if (data) item.id = data.id;
  }
  state.strategy.push(item);
  saveLocalStrategy();
  ['strategy-name','strategy-score','strategy-difficulty','strategy-risk','strategy-seconds'].forEach(id => document.getElementById(id).value = '');
  markDirty('strategy');
  renderStrategyBoard();
}

/**
 * ?芷蝑??? * @param {number} id 蝑 ID?? */
async function deleteStrategyItem(id) {
  if (!confirm('蝣箄??芷甇斤??仿??殷?')) return;
  if (optionalSchema.strategy) await db.from('strategy_items').delete().eq('id', id);
  state.strategy = state.strategy.filter(item => item.id !== id);
  saveLocalStrategy();
  markDirty('strategy');
  renderStrategyBoard();
}

// ????????????????????????????????????????????????????????// PRACTICE TRENDS
// ????????????????????????????????????????????????????????/**
 * 皜脫?蝺渡??蜀頞典?? */
function renderPracticeTrends() {
  const rows = getPracticeTrendRows();
  document.getElementById('practice-tbody').innerHTML = rows.map(run => `
    <tr>
      <td>${escapeHtml(run.run_date || '')}</td>
      <td>${escapeHtml(run.round_name || '')}${run.pending_sync ? '<div style="font-size:.72rem;color:var(--orange);font-weight:800">敺?甇?/div>' : ''}</td>
      <td>${escapeHtml(run.pilot || '')}</td>
      <td><strong>${getMissionRunTotal(run)}</strong></td>
      <td>${Number(run.gross_score)||0} / -${Number(run.penalty)||0}</td>
      <td>${Number(run.seconds)||0}s</td>
      <td>${formatSuccessRate(run.success_rate)}</td>
      <td>${Number(run.faults)||0}</td>
      <td class="mission-note-cell" style="font-size:.82rem;padding-top:10px;padding-bottom:10px">${formatMissionRunNoteHtml(run.note)}</td>
    </tr>
  `).join('') || '<tr><td colspan="9" style="text-align:center;color:#999;padding:18px">撠 Mission Run 閮?蝝??隢??啜??閮??憓?頛芥?/td></tr>';
  renderPracticeChart(rows);
  renderPracticeSummary(rows);
}

/**
 * 蝜芾ˊ蝺渡?頞典?? * @param {Array<object>} rows 蝺渡?蝝?? */
function renderPracticeChart(rows) {
  if (typeof Chart === 'undefined') return;
  chartInstances.practice?.destroy();
  chartInstances.practice = new Chart(document.getElementById('practice-chart'), {
    type: 'line',
    data: {
      labels: rows.map(r => r.run_date),
      datasets: [
        { label:'蝮賢?', data: rows.map(r => getMissionRunTotal(r)), borderColor:'#70AD47', tension:.25, yAxisID:'y' },
        { label:'摰???(蝘?', data: rows.map(r => Number(r.seconds)||0), borderColor:'#2F5496', tension:.25, yAxisID:'y1' },
        { label:'憭梯炊', data: rows.map(r => Number(r.faults)||0), borderColor:'#C00000', tension:.25, yAxisID:'y' },
        { label:'????%)', data: rows.map(r => Number(r.success_rate)||0), borderColor:'#7030A0', tension:.25, yAxisID:'y' }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      scales:{ y:{ beginAtZero:true }, y1:{ beginAtZero:true, position:'right', grid:{ drawOnChartArea:false } } },
      plugins:{ legend:{ position:'bottom' } }
    }
  });
}

/**
 * 皜脫?蝺渡????? * @param {Array<object>} rows 蝺渡?蝝?? */
function renderPracticeSummary(rows) {
  if (!rows.length) {
    document.getElementById('practice-summary').textContent = '撠鞈?嚗?????閮??憓?Mission Run??;
    return;
  }
  const latest = rows[rows.length - 1];
  const bestScore = Math.max(...rows.map(r => getMissionRunTotal(r)));
  const avgFaults = (rows.reduce((s,r)=>s+(Number(r.faults)||0),0) / rows.length).toFixed(1);
  const successRows = rows.map(r => Number(r.success_rate)).filter(n => Number.isFinite(n) && n > 0);
  const avgSuccess = successRows.length ? Math.round(successRows.reduce((s,n)=>s+n,0) / successRows.length) : 0;
  document.getElementById('practice-summary').innerHTML = `
    <span class="metric-mini">??啁蜇??${getMissionRunTotal(latest)}</span>
    <span class="metric-mini">?擃蜇??${bestScore}</span>
    <span class="metric-mini">撟喳?????${avgSuccess}%</span>
    <span class="metric-mini">撟喳?憭梯炊 ${avgFaults}</span>
    <span class="metric-mini">蝝??${rows.length} 甈?/span>
  `;
}

/**
 * ??蝺渡?頞典鞈?靘?嚗?蝙??Mission Run嚗?蝺渡?鞈??? fallback?? * @returns {Array<object>} 頞典蝝?? */
function getPracticeTrendRows() {
  if (state.missionRuns.length) {
    return [...state.missionRuns].sort((a,b) => String(a.run_date).localeCompare(String(b.run_date)));
  }
  return state.practiceRuns.map(run => ({
    ...run,
    round_name: '?毀蝧???,
    gross_score: Number(run.score) || 0,
    penalty: 0
  })).sort((a,b) => String(a.run_date).localeCompare(String(b.run_date)));
}

/**
 * ?臬蝺渡?蝝??CSV嚗靘輸蝺???鈭斤策??渡??? */
function exportPracticeCSV() {
  const rows = getPracticeTrendRows();
  if (!rows.length) {
    showToast('?? 撠頞典鞈??臬??);
    return;
  }
  const headers = ['?交?','頛芣活/?湔活','???蝯','??敺?','???','蝮賢?','摰???(蝘?','????%)','??/憭梯炊甈⊥','敶梁????','?酉','鞈賢迤'];
  const csvRows = rows.map(run => [
    csvCell(run.run_date || ''),
    csvCell(run.round_name || ''),
    csvCell(run.pilot || ''),
    Number(run.gross_score) || 0,
    Number(run.penalty) || 0,
    getMissionRunTotal(run),
    Number(run.seconds) || 0,
    Number(run.success_rate) || 0,
    Number(run.faults) || 0,
    csvCell(run.video_url || ''),
    csvCell(run.note || ''),
    csvCell(run.season || currentSeason)
  ]);
  downloadCsv([headers.join(','), ...csvRows.map(row => row.join(','))].join('\n'), 'ROV_Practice_Trends');
  showToast('??頞典 CSV 撌脣??);
}

// ????????????????????????????????????????????????????????// MISSION RUN SCOREBOARD
// ????????????????????????????????????????????????????????/**
 * ?? Mission Run 頛詨閬??? */
function openMissionRunModal() {
  const modal = document.getElementById('mission-run-modal');
  if (!modal) return;
  renderOwnerSelect('score-pilot', '?豢????/ 蝯');
  if (!document.getElementById('score-date').value) document.getElementById('score-date').value = new Date().toISOString().split('T')[0];
  renderMissionScoreItems();
  updateMissionScorePreview();
  modal.classList.add('open');
  setTimeout(() => document.getElementById('score-round')?.focus(), 50);
}

/**
 * 閮? Mission Run 蝮賢??? * @param {object} run Mission Run 蝝?? * @returns {number} ???敺蜇?? */
/**
 * 撠潸??箏撖怠 PostgreSQL `integer` 甈???賂??鈭嚗??踹??箇
 * `invalid input syntax for type integer: "50.55"` ???航炊?? * @param {unknown} value 隞餅??詨潭?摮葡?? * @returns {number} 摰?湔?? */
function toDbInteger(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

function getMissionRunTotal(run) {
  return toDbInteger(run.gross_score) - toDbInteger(run.penalty);
}

/**
 * 閫?? Mission Run ??敺?鞈??? * @param {object|string|Array<object>} value ??敺?鞈??? * @returns {Array<object>} ??敺?????? */
function parseMissionScoreItems(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) {
      return [];
    }
  }
  return [];
}

/**
 * ?澆????扳????? * @param {unknown} value ????潦? * @returns {string} ?曉?瘥?摮? */
function formatSuccessRate(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? `${Math.round(n)}%` : '-';
}

/**
 * ?湔銵典銝剔??單?蝮賢??汗?? */
function updateMissionScorePreview() {
  const total = (Number(document.getElementById('score-gross').value) || 0) - (Number(document.getElementById('score-penalty').value) || 0);
  const el = document.getElementById('score-preview-total');
  if (!el) return;
  el.textContent = Number.isInteger(total) ? total : total.toFixed(2);
  el.classList.toggle('negative', total < 0);
}

/**
 * 皜脫?隞餃???敺??暸?Ｘ?? */
function renderMissionScoreItems() {
  const el = document.getElementById('mission-score-items');
  if (!el) return;
  renderMissionScoreTemplateSelect();
  const template = getActiveMissionScoreTemplate();
  el.innerHTML = `
    <div style="font-size:.74rem;color:var(--muted);margin-bottom:8px">
      ??嚗?{escapeHtml(template.station || '?芣?摰?)}??銝蝯??亙??豢??典?詨??橘??踹???閮???    </div>
    ${getActiveMissionScoreItems().map(item => {
      const inputType = item.group ? 'radio' : 'checkbox';
      const inputName = item.group ? `mission-score-${item.group}` : `mission-score-${item.id}`;
      return `
    <label style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:7px 9px;margin-bottom:6px;border:1px solid var(--border);border-radius:8px;background:var(--white);cursor:pointer">
      <span><input type="${inputType}" name="${inputName}" class="mission-score-check" value="${item.id}" onchange="updateMissionItemScorePreview()" style="margin-right:7px"> ${escapeHtml(item.label)}</span>
      <strong style="color:${item.score >= 0 ? 'var(--green)' : 'var(--red)'}">${item.score >= 0 ? '+' : ''}${item.score}</strong>
    </label>`;
    }).join('')}
  `;
}

/**
 * 皜脫? 2026 隞餃?璅⊥?豢??? * @param {boolean} resetForStation ?臬??蝡??渲?閮剝?? */
function renderMissionScoreTemplateSelect(resetForStation = false) {
  const select = document.getElementById('mission-score-template');
  if (!select) return;
  const station = document.getElementById('mission-score-station')?.value || '';
  const entries = Object.entries(MISSION_SCORE_TEMPLATES)
    .filter(([, tpl]) => !station || tpl.station === station);
  const current = resetForStation ? '' : (select.value || 'mateFloats');
  select.innerHTML = entries
    .map(([key, tpl]) => `<option value="${key}">${escapeHtml(tpl.label)}</option>`)
    .join('');
  select.value = entries.some(([key]) => key === current) ? current : (entries[0]?.[0] || 'mateFloats');
}

/**
 * ???桀??詨????芋?踴? * @returns {object} 閮?璅⊥?? */
function getActiveMissionScoreTemplate() {
  const key = document.getElementById('mission-score-template')?.value || 'mateFloats';
  return MISSION_SCORE_TEMPLATES[key] || MISSION_SCORE_TEMPLATES.mateFloats;
}

/**
 * ???桀??詨???閮?璅⊥?? * @returns {Array<object>} 閮???? */
function getActiveMissionScoreItems() {
  return getActiveMissionScoreTemplate().items || MISSION_SCORE_TEMPLATES.general.items;
}

/**
 * ???桀??暸?遙??敺??? * @returns {Array<object>} 撌脣?賊??柴? */
function getSelectedMissionScoreItems() {
  return [...document.querySelectorAll('.mission-score-check:checked')]
    .map(input => getActiveMissionScoreItems().find(item => item.id === input.value))
    .filter(Boolean);
}

/**
 * ???寡???蝞?time bonus ????? * @returns {Array<object>} ?芸?????柴? */
function getOfficialAutoScoreItems() {
  const template = getActiveMissionScoreTemplate();
  const seconds = Number(document.getElementById('score-seconds')?.value) || 0;
  const penaltyCount = Number(document.getElementById('score-penalty-count')?.value) || 0;
  const items = [];
  if (template.station !== 'Ice Tank' && seconds > 0 && seconds < 900) {
    const remaining = 900 - seconds;
    const minutes = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const bonus = Number((minutes + secs * 0.01).toFixed(2));
    if (bonus > 0) items.push({ id:'time_bonus', label:`Time bonus (${minutes}m ${secs}s remaining)`, score:bonus, type:'score', auto:true });
  }
  if (penaltyCount > 0) {
    items.push({ id:'official_penalty', label:`Official penalty infractions x${penaltyCount}`, score:penaltyCount * -5, type:'penalty', auto:true });
  }
  return items;
}

/**
 * ??銵典?桀??????嚗??怠??寡??????? * @returns {Array<object>} 敺??? */
function getMissionRunScoreDetails() {
  return [...getSelectedMissionScoreItems(), ...getOfficialAutoScoreItems()];
}

/**
 * 靘?賊??株??啣????隞餃????? */
function updateMissionItemScorePreview() {
  const selected = getMissionRunScoreDetails();
  const gross = selected.filter(item => item.score > 0).reduce((sum, item) => sum + item.score, 0);
  const penalty = Math.abs(selected.filter(item => item.score < 0).reduce((sum, item) => sum + item.score, 0));
  const missions = selected.filter(item => item.score > 0 && !item.auto).map(item => item.label).join('??);
  document.getElementById('score-gross').value = gross ? (Number.isInteger(gross) ? gross : gross.toFixed(2)) : '';
  document.getElementById('score-penalty').value = penalty ? (Number.isInteger(penalty) ? penalty : penalty.toFixed(2)) : '';
  if (missions) document.getElementById('score-missions').value = missions;
  updateMissionScorePreview();
}

/**
 * 皜隞餃???敺??暸?? */
function clearMissionScoreItems() {
  document.querySelectorAll('.mission-score-check').forEach(input => { input.checked = false; });
  updateMissionItemScorePreview();
}

/**
 * 撠?雿萇? Mission Run ?酉?????酉?魚銝凋?隞塚?瘥魚璅∪?隞乓魚銝凋?隞塚???伐??? * @param {string|null|undefined} note ?? note 甈??? * @returns {{manual:string,events:string}} manual ?箔蝙?刻撓?伐?events ?箔?隞?log ?扳?嚗歇?駁?韌嚗? */
function splitMissionRunNote(note) {
  const raw = String(note ?? '').replace(/\r\n/g, '\n').trim();
  if (!raw) return { manual: '', events: '' };
  const marker = '鞈賭葉鈭辣嚗?;
  const idx = raw.indexOf(marker);
  if (idx === -1) return { manual: raw, events: '' };
  const manual = raw.slice(0, idx).trim();
  const events = raw.slice(idx + marker.length).replace(/^\s+/, '');
  return { manual, events };
}

/**
 * ?Ｙ?隞餃?/?酉甈??函? HTML嚗?憿舐內???酉嚗?憿舐內鞈賭葉鈭辣 log嚗? * @param {string|null|undefined} note ?? note?? * @returns {string} 摰 HTML ?挾?? */
function formatMissionRunNoteHtml(note) {
  const { manual } = splitMissionRunNote(note);
  if (manual) {
    return `<div class="mission-note-cell mission-run-note-manual" style="font-size:.76rem;color:var(--text);margin-top:4px"><span style="font-weight:800;color:var(--navy)">?酉</span><span style="color:var(--muted)">嚚?/span>${escapeHtml(manual)}</div>`;
  }
  return '';
}

/**
 * 皜脫? Mission Run 閮??踴? */
function renderMissionScoreboard() {
  const rows = [...state.missionRuns].sort((a,b) => {
    const dateSort = String(b.run_date || '').localeCompare(String(a.run_date || ''));
    return dateSort || Number(b.id || 0) - Number(a.id || 0);
  });
  renderMissionScoreSummary(rows);
  renderMissionScoreItems();
  renderPostRunReport(rows);
  document.getElementById('score-tbody').innerHTML = rows.map(run => {
    const total = getMissionRunTotal(run);
    const scoreItems = parseMissionScoreItems(run.score_items);
    return `<tr>
      <td>${escapeHtml(run.run_date || '')}</td>
      <td>${escapeHtml(run.round_name || '')}</td>
      <td>${escapeHtml(run.pilot || '')}</td>
      <td><span class="score-total ${total < 0 ? 'negative' : ''}" style="font-size:1.1rem">${total}</span></td>
      <td>${Number(run.gross_score)||0} / -${Number(run.penalty)||0}</td>
      <td>${Number(run.seconds)||0}s</td>
      <td>${formatSuccessRate(run.success_rate)}</td>
      <td>${Number(run.faults)||0}</td>
      <td>
        <div style="font-size:.78rem;color:var(--navy);font-weight:700">${escapeHtml(run.missions || '')}</div>
        ${scoreItems.length ? `<div style="font-size:.72rem;color:var(--green);margin-top:2px">${escapeHtml(scoreItems.map(item => `${item.label} ${item.score >= 0 ? '+' : ''}${item.score}`).join(' / '))}</div>` : ''}
        ${formatMissionRunNoteHtml(run.note)}
      </td>
      <td>${run.video_url ? `<a href="${escapeHtml(run.video_url)}" target="_blank">??</a>` : '-'}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteMissionRun(${run.id})">?芷</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="11" style="text-align:center;color:#999;padding:18px">撠 Mission Run 閮?蝝??/td></tr>';
  if (!document.getElementById('score-date').value) document.getElementById('score-date').value = new Date().toISOString().split('T')[0];
  updateMissionScorePreview();
  renderPracticeTrends();
}

/**
 * 皜脫?閮????～? * @param {Array<object>} rows Mission Run 蝝?? */
function renderMissionScoreSummary(rows) {
  const totals = rows.map(getMissionRunTotal);
  const best = totals.length ? Math.max(...totals) : 0;
  const latest = totals.length ? totals[0] : 0;
  const avg = totals.length ? Math.round(totals.reduce((s,n)=>s+n,0) / totals.length) : 0;
  const timeValues = rows.map(r => Number(r.seconds)).filter(n => Number.isFinite(n) && n > 0);
  const bestTime = timeValues.length ? Math.min(...timeValues) : 0;
  document.getElementById('score-summary').innerHTML = `
    <div class="stat-card"><div class="stat-num">${rows.length}</div><div class="stat-label">蝮質憚甈?/div></div>
    <div class="stat-card" style="border-top-color:var(--green)"><div class="stat-num" style="color:var(--green)">${best}</div><div class="stat-label">?擃蜇??/div></div>
    <div class="stat-card" style="border-top-color:var(--blue)"><div class="stat-num" style="color:var(--blue)">${avg}</div><div class="stat-label">撟喳?蝮賢?</div></div>
    <div class="stat-card" style="border-top-color:var(--orange)"><div class="stat-num" style="color:var(--orange)">${latest}</div><div class="stat-label">??啁蜇??/div></div>
    <div class="stat-card" style="border-top-color:#7030A0"><div class="stat-num" style="color:#7030A0">${bestTime || 0}s</div><div class="stat-label">?敹怠???/div></div>
  `;
}

/**
 * 皜脫?鞈賢?瑼Ｚ??勗????? * @param {Array<object>} rows Mission Run 蝝?? */
function renderPostRunReport(rows) {
  const el = document.getElementById('post-run-report');
  if (!el) return;
  if (!rows.length) {
    el.innerHTML = '<div style="color:#999;font-size:.9rem">撠 Mission Run嚗???頛芸?????炎閮?閬?/div>';
    return;
  }
  const totals = rows.map(run => ({ run, total:getMissionRunTotal(run) }));
  const best = totals.reduce((max, item) => item.total > max.total ? item : max, totals[0]);
  const worst = totals.reduce((min, item) => item.total < min.total ? item : min, totals[0]);
  const avgSuccess = getAverageMissionSuccessRate();
  const errorStats = getErrorCategoryStats();
  const topError = errorStats[0];
  const latest = totals[0];
  const previous = totals[1];
  const scoreDelta = previous ? latest.total - previous.total : 0;
  const timeDelta = previous ? Number(latest.run.seconds || 0) - Number(previous.run.seconds || 0) : 0;
  const weakItems = getWeakMissionScoreItems(rows).slice(0, 4);
  const qaMin = getLowestPresentationQaScore();
  const nextActions = buildPostRunActionItems(rows);
  el.innerHTML = `
    <div class="card-grid" style="margin-bottom:10px">
      <div class="stat-card" style="border-top-color:var(--green)"><div class="stat-num" style="color:var(--green)">${best.total}</div><div class="stat-label">?擃?嚗?{escapeHtml(best.run.round_name || '')}</div></div>
      <div class="stat-card" style="border-top-color:var(--red)"><div class="stat-num" style="color:var(--red)">${worst.total}</div><div class="stat-label">?雿?嚗?{escapeHtml(worst.run.round_name || '')}</div></div>
      <div class="stat-card" style="border-top-color:#7030A0"><div class="stat-num" style="color:#7030A0">${avgSuccess || 0}%</div><div class="stat-label">撟喳?????/div></div>
      <div class="stat-card" style="border-top-color:${scoreDelta >= 0 ? 'var(--green)' : 'var(--red)'}"><div class="stat-num" style="color:${scoreDelta >= 0 ? 'var(--green)' : 'var(--red)'}">${previous ? (scoreDelta >= 0 ? '+' : '') + scoreDelta : '-'}</div><div class="stat-label">頛?銝頛芸?撌?/div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:10px">
      <div style="border-left:4px solid ${Number(latest.run.penalty || 0) ? 'var(--red)' : 'var(--green)'};background:#F8FBFF;border-radius:8px;padding:10px">
        <div style="font-weight:900;color:var(--navy)">???閮?</div>
        <div style="font-size:.82rem;color:var(--muted);line-height:1.55">${Number(latest.run.penalty || 0) ? `??唬?頛芣 ${Number(latest.run.penalty || 0)} ??銝憚??撠??寞??蝣唳?? : '??唬?頛芰???嚗???憸券頝舐???}</div>
      </div>
      <div style="border-left:4px solid ${timeDelta > 0 ? 'var(--orange)' : 'var(--green)'};background:#F8FBFF;border-radius:8px;padding:10px">
        <div style="font-weight:900;color:var(--navy)">??閮?</div>
        <div style="font-size:.82rem;color:var(--muted);line-height:1.55">${previous ? `頛?銝頛?{timeDelta > 0 ? '?? : '敹?} ${Math.abs(timeDelta)} 蝘 : '撠銝?頛芸瘥?嚗?撱箇??箸?????}</div>
      </div>
      <div style="border-left:4px solid ${topError?.count ? 'var(--red)' : 'var(--green)'};background:#F8FBFF;border-radius:8px;padding:10px">
        <div style="font-weight:900;color:var(--navy)">憭梯炊銝餃?</div>
        <div style="font-size:.82rem;color:var(--muted);line-height:1.55">${topError?.count ? `${escapeHtml(topError.label)}嚗?{topError.count} 甈∠??? : '憭梯炊璅酉銝雲嚗魚敺?鋆???}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px">
      <div style="font-size:.86rem;line-height:1.7">
        <strong>銝活閮毀銵?嚗?/strong>
        ${nextActions.map((action, i) => `<label style="display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--border)"><input type="checkbox" style="margin-top:3px"> <span>${i + 1}. ${escapeHtml(action)}</span></label>`).join('')}
      </div>
      <div style="font-size:.86rem;line-height:1.7">
        <strong>雿帘摰???嚗?/strong>
        ${weakItems.length ? weakItems.map(item => `<div style="padding:6px 0;border-bottom:1px solid var(--border)">${escapeHtml(item.label)} <span style="color:var(--muted)">?賭葉 ${item.count}/${rows.length}</span></div>`).join('') : '<div style="color:var(--muted);padding:6px 0">?怎頞喳???敺?鞈???/div>'}
      </div>
    </div>
    <div style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="generatePostRaceAISummary()">?? ?? Post-Race AI ??銝西票?亙?敹?/button>
      <button class="btn" onclick="appendPostRunActionPlanToNotes()">鞎澆瑼Ｚ?銵?皜</button>
      <span id="post-race-ai-status" style="font-size:.82rem;color:var(--muted)">????Edge Function嚗仃??雿輻?砍????/span>
    </div>`;
}

function getWeakMissionScoreItems(rows) {
  const stats = {};
  rows.forEach(run => {
    parseMissionScoreItems(run.score_items)
      .filter(item => Number(item.score) > 0 && !item.auto)
      .forEach(item => {
        const key = item.id || item.label;
        stats[key] = stats[key] || { label:item.label, count:0 };
        stats[key].count += 1;
      });
  });
  return Object.values(stats).sort((a,b) => a.count - b.count || String(a.label).localeCompare(String(b.label)));
}

function buildPostRunActionItems(rows) {
  const latest = rows[0];
  const previous = rows[1];
  const avgSuccess = getAverageMissionSuccessRate();
  const topError = getErrorCategoryStats()[0];
  const weakItems = getWeakMissionScoreItems(rows);
  const actions = [];
  if (latest && Number(latest.penalty || 0) > 0) actions.push('銝憚?誑?嗅??寞??格?嚗?韏唳?閫貊????楝蝺?);
  if (previous && Number(latest.seconds || 0) > Number(previous.seconds || 0)) actions.push('???唬?頛芾??Ｙ?瘚??? 3 畾菔????曉?雿蔭??);
  actions.push(avgSuccess && avgSuccess < 70 ? '?毀?擃?隞餃?嚗璅???????70% 隞乩??? : '靽?摰閮?蝺渡?嚗?暺葬?剖?????);
  actions.push(topError && topError.count ? `????{topError.label}????15 ??撠?靽格迤? : '瘥憚鋆?憭梯炊??嚗敞蝛??鞈???);
  if (weakItems[0]) actions.push(`鋆毀雿帘摰???嚗?{weakItems[0].label}?);
  return [...new Set(actions)].slice(0, 5);
}

async function appendPostRunActionPlanToNotes() {
  const rows = [...state.missionRuns].sort((a,b) => String(b.run_date || '').localeCompare(String(a.run_date || '')) || Number(b.id || 0) - Number(a.id || 0));
  if (!rows.length) {
    showToast('?? 撠 Mission Run ?舐???????);
    return;
  }
  const latest = rows[0];
  const actions = buildPostRunActionItems(rows);
  const text = [
    `## Post-Run 銵?皜嚚?{latest.round_name || 'Mission Run'}嚚?{new Date().toLocaleString()}`,
    '',
    ...actions.map((action, i) => `${i + 1}. ${action}`)
  ].join('\n');
  await appendTextToNotes(text);
  showToast('??瑼Ｚ?銵?皜撌脰票?亙?敹?);
}

/**
 * 撱箇?鞈賢???頛詨鞈??? * @returns {object} 鞈賢? log payload?? */
function buildPostRaceLogPayload() {
  const rows = [...state.missionRuns].sort((a,b) => String(b.run_date || '').localeCompare(String(a.run_date || '')) || Number(b.id || 0) - Number(a.id || 0));
  const latest = rows[0];
  return {
    season: currentSeason,
    latestRun: latest ? {
      run_date: latest.run_date,
      round_name: latest.round_name,
      pilot: latest.pilot,
      total: getMissionRunTotal(latest),
      gross_score: latest.gross_score,
      penalty: latest.penalty,
      seconds: latest.seconds,
      faults: latest.faults,
      missions: latest.missions,
      note: latest.note,
      score_items: parseMissionScoreItems(latest.score_items)
    } : null,
    recentRuns: rows.slice(0, 5).map(run => ({
      round_name: run.round_name,
      total: getMissionRunTotal(run),
      seconds: run.seconds,
      faults: run.faults,
      note: run.note,
      missions: run.missions
    })),
    errors: getErrorCategoryStats().slice(0, 5),
    actionItems: buildPostRunActionItems(rows),
    weakItems: getWeakMissionScoreItems(rows).slice(0, 5),
    checklistOpen: state.prediveChecklist.flatMap(sec => sec.items.map(item => ({...item, secName:sec.secName}))).filter(item => !item.done).slice(0, 10)
  };
}

/**
 * ?砍 fallback嚗 Edge Function 銝?冽???鞈賢????? * @param {object} payload 鞈賢? log payload?? * @returns {string} ?????? */
function buildLocalPostRaceSummary(payload) {
  const run = payload.latestRun;
  if (!run) return '撠 Mission Run 蝝???芾??鞈賢?????;
  const topError = payload.errors.find(item => item.count > 0);
  const scoreItems = (run.score_items || []).filter(item => Number(item.score) > 0).slice(0, 6).map(item => item.label).join('??) || run.missions || '?芾???;
  const actions = (payload.actionItems || []).map((item, i) => `${i + 1}. ${item}`).join('\n');
  const weak = (payload.weakItems || []).map(item => `${item.label}嚗銝?${item.count} 甈∴?`).join('??) || '?怎頞喳???敺?鞈?';
  return [
    `## Post-Race ??嚚?{run.round_name || 'Mission Run'}嚚?{new Date().toLocaleString()}`,
    '',
    `??嚗頛芸????桀???${scoreItems}嚗蜇??${run.total}嚗?憪?${run.gross_score || 0}嚗??${run.penalty || 0}嚗??冽? ${run.seconds || 0} 蝘,
    `憭梯炊嚗?{topError ? `銝餉??葉?具?{topError.label}???賊?蝝??${topError.count} 甈～ : '?桀?憭梯炊璅酉銝雲嚗遣霅唳?頛芾?閮???}`,
    `雿帘摰???嚗?{weak}?,
    `銝憚銵?嚗n${actions || '1. 瘥憚鋆?憭梯炊??嚗敞蝛??鞈???}`,
    payload.checklistOpen.length ? `Pre-Dive Checklist嚗???${payload.checklistOpen.length} ?摰?嚗????${payload.checklistOpen[0].text}? : 'Pre-Dive Checklist嚗???桀歇摰?嚗?瘞游?隢?敹恍??訾?甈～?
  ].join('\n');
}

/**
 * ?澆 Edge Function ??鞈賢? AI ??嚗蒂鞎澆???? */
async function generatePostRaceAISummary() {
  const status = document.getElementById('post-race-ai-status');
  const payload = buildPostRaceLogPayload();
  if (!payload.latestRun) {
    showToast('?? 撠 Mission Run ?舐???閬?);
    return;
  }
  if (status) status.textContent = '??甇?????...';
  let summary = '';
  try {
    const { data, error } = await db.functions.invoke('post-race-summary', { body: payload });
    if (error) throw error;
    summary = data?.summary || data?.text || '';
    if (!summary) throw new Error('Edge Function ?芸???summary');
  } catch(e) {
    console.warn('Post-race Edge Function fallback:', e.message);
    summary = buildLocalPostRaceSummary(payload);
  }
  await appendTextToNotes(summary);
  if (status) status.textContent = '????撌脰票?亙?敹?;
  showToast('??Post-Race ??撌脰票?亙?敹?);
}

/**
 * 蝯梯?撣貉?憭梯炊???? * @returns {Array<{label:string,count:number}>} 憭梯炊蝯梯??? */
function getErrorCategoryStats() {
  const notes = [
    ...state.practiceRuns.map(r => `${r.note || ''} ${r.faults ? '憭梯炊' : ''}`),
    ...state.missionRuns.map(r => `${r.note || ''} ${r.missions || ''} ${parseMissionScoreItems(r.score_items).map(item => item.label).join(' ')}`)
  ];
  return [
    { label:'?∠? / 蝺?頝舐?', keys:['?∠?','蝺?,'蝺?','tether','?頝舐?'] },
    { label:'憭曆???/ ??銝帘', keys:['憭曆???,'憭?,'??,'?見','?','??] },
    { label:'閬?銝雲 / ????', keys:['閬?','??','camera','????,'?恍'] },
    { label:'??銝?', keys:['??','?','皞?,'?誘','YES','NO'] },
    { label:'?漲?翰 / 蝣唳?', keys:['?漲','?翰','蝣唳?','??,'憭望'] },
    { label:'頞? / 蝭憟', keys:['頞?','憭芣','??','蝭憟?] },
    { label:'甇餅? / 蝟餌絞銝帘', keys:['甇餅?','蝟餌絞','?瑞?','??','?⊥香'] }
  ].map(cat => ({ ...cat, count: notes.filter(note => matchAny([note], cat.keys)).length }))
    .sort((a,b) => b.count - a.count);
}

/**
 * 皜征閮??輯”?柴? */
function clearMissionScoreForm() {
  ['score-round','score-pilot','score-missions','score-gross','score-penalty','score-seconds','score-penalty-count','score-faults','score-success-rate','score-video-url','score-note'].forEach(id => {
    document.getElementById(id).value = '';
  });
  renderOwnerSelect('score-pilot', '?豢????/ 蝯');
  document.getElementById('score-date').value = new Date().toISOString().split('T')[0];
  clearMissionScoreItems();
  updateMissionScorePreview();
}

/**
 * ?啣?銝蝑?Mission Run 閮?蝝?? * @param {object} run Mission Run 蝝?? */
async function persistMissionRun(run) {
  run.gross_score = toDbInteger(run.gross_score);
  run.penalty = toDbInteger(run.penalty);
  run.seconds = toDbInteger(run.seconds);
  run.faults = toDbInteger(run.faults);
  run.success_rate = toDbInteger(run.success_rate);

  if (optionalSchema.missionRuns) {
    const payload = buildMissionRunDbPayload(run);
    const { data, error } = await db.from('mission_runs').insert([payload]).select().single();
    if (error) {
      let msg = '閮?蝝?摮仃??' + error.message;
      if (/row-level security|rls|policy/i.test(error.message || '')) {
        msg += '\n\n隢??銝????DB 閮剖??? 銴ˊ SQL 銝准LS??畾蛛???Supabase SQL Editor ?瑁?敺?閰艾?;
      }
      run = enqueuePendingMissionRun(run, error.message);
      showToast('?? Supabase ?急??芸摮?撌脫?交璈??郊雿?');
      console.warn(msg);
    } else if (data) {
      run.id = data.id;
    }
  }
  if (!optionalSchema.missionRuns) run.pending_sync = false;
  if (state.missionRuns.some(item => String(item.local_id || item.id) === String(run.local_id || run.id))) {
    state.missionRuns = state.missionRuns.map(item => String(item.local_id || item.id) === String(run.local_id || run.id) ? run : item);
  } else {
    state.missionRuns.push(run);
  }
  saveLocalMissionRuns();
  markDirty(['scoreboard','prep','competition']);
  if (currentPage === 'scoreboard') renderMissionScoreboard();
  if (currentPage === 'competition') renderCompetitionMode();
  showToast(run.pending_sync ? '?? Mission Run 撌脖?摮?祆?敺?甇? : '??Mission Run 閮?撌脣摮?);
  return run;
}

async function syncPendingMissionRuns(options = {}) {
  const silent = Boolean(options.silent);
  if (pendingMissionRunSyncing) {
    if (!silent) showToast('??敺?甇亦??迤?典?甇乩葉');
    return;
  }
  const pending = getPendingMissionRuns();
  if (!pending.length) {
    if (!silent) showToast('??瘝?敺?甇?Mission Run');
    return;
  }
  if (!optionalSchema.missionRuns) {
    if (!silent) alert('?桀? Supabase mission_runs 銵其??舐嚗??郊蝝??????祆???);
    return;
  }
  pendingMissionRunSyncing = true;
  setPendingMissionRunSyncButtons(true);
  let success = 0;
  const failed = [];
  try {
    for (const run of pending) {
      try {
        const cleanRun = { ...run, pending_sync:false };
        delete cleanRun.pending_error;
        delete cleanRun.queuedAt;
        const { data, error } = await db.from('mission_runs').insert([buildMissionRunDbPayload(cleanRun)]).select().single();
        if (error) throw error;
        const syncedRun = { ...cleanRun, id:data?.id || cleanRun.id };
        delete syncedRun.local_id;
        state.missionRuns = state.missionRuns.map(item => String(item.local_id || item.id) === String(run.local_id || run.id) ? syncedRun : item);
        success++;
      } catch(e) {
        failed.push({ ...run, pending_error:e.message || String(e) });
      }
    }
    savePendingMissionRuns(failed);
    state.missionRuns = state.missionRuns.filter(run => !run.pending_sync || failed.some(item => String(item.local_id || item.id) === String(run.local_id || run.id)));
    mergePendingMissionRunsIntoState();
    saveLocalMissionRuns();
    markDirty(['scoreboard','prep','competition']);
    if (currentPage === 'scoreboard') renderMissionScoreboard();
    if (currentPage === 'competition') renderCompetitionMode();
    if (!silent || success) showToast(failed.length ? `?? 撌脣?甇?${success} 蝑?隞? ${failed.length} 蝑??郊` : `??撌脣?甇?${success} 蝑?Mission Run`);
  } finally {
    pendingMissionRunSyncing = false;
    setPendingMissionRunSyncButtons(false);
  }
}

function setPendingMissionRunSyncButtons(isSyncing) {
  [
    ['competition-sync-pending-btn', '?郊敺?甇?],
    ['scoreboard-sync-pending-btn', '?郊敺?甇亦???]
  ].forEach(([id, label]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = isSyncing;
    btn.textContent = isSyncing ? '?郊銝?..' : label;
  });
}

/**
 * ?啣?銝蝑?Mission Run 閮?蝝?? */
async function addMissionRun() {
  const run = {
    id: Date.now(),
    run_date: document.getElementById('score-date').value || new Date().toISOString().split('T')[0],
    round_name: document.getElementById('score-round').value.trim(),
    pilot: document.getElementById('score-pilot').value.trim(),
    missions: document.getElementById('score-missions').value.trim(),
    gross_score: Number(document.getElementById('score-gross').value) || 0,
    penalty: Number(document.getElementById('score-penalty').value) || 0,
    seconds: Number(document.getElementById('score-seconds').value) || 0,
    faults: Number(document.getElementById('score-faults').value) || 0,
    success_rate: Number(document.getElementById('score-success-rate').value) || 0,
    video_url: document.getElementById('score-video-url').value.trim(),
    score_items: getMissionRunScoreDetails(),
    note: document.getElementById('score-note').value.trim(),
    season: currentSeason
  };
  if (!run.round_name) { alert('隢撓?亥憚甈?/ ?湔活'); return; }
  if (!run.pilot) { alert('隢撓?交??扳? / 蝯'); return; }
  await persistMissionRun(run);
  clearMissionScoreForm();
  closeModal('mission-run-modal');
}

/**
 * ?芷 Mission Run 閮?蝝?? * @param {number} id Mission Run ID?? */
async function deleteMissionRun(id) {
  if (!confirm('蝣箄??芷甇方?????')) return;
  if (optionalSchema.missionRuns) await db.from('mission_runs').delete().eq('id', id);
  state.missionRuns = state.missionRuns.filter(run => run.id !== id);
  saveLocalMissionRuns();
  markDirty(['scoreboard','prep']);
  renderMissionScoreboard();
}

/**
 * ?臬 Mission Run 閮? CSV?? */
function exportMissionRunsCSV() {
  const rows = [...state.missionRuns].sort((a,b) => String(a.run_date).localeCompare(String(b.run_date)));
  if (!rows.length) {
    showToast('?? 撠閮?蝝??臬');
    return;
  }
  const headers = ['?交?','頛芣活/?湔活','???蝯','摰?隞餃??','??敺?','??敺?','???','蝮賢?','?冽?(蝘?','????%)','憭梯炊甈⊥','敶梁????','?酉','鞈賢迤'];
  const csvRows = rows.map(run => [
    csvCell(run.run_date || ''),
    csvCell(run.round_name || ''),
    csvCell(run.pilot || ''),
    csvCell(run.missions || ''),
    csvCell(parseMissionScoreItems(run.score_items).map(item => `${item.label} ${item.score >= 0 ? '+' : ''}${item.score}`).join(' / ')),
    Number(run.gross_score) || 0,
    Number(run.penalty) || 0,
    getMissionRunTotal(run),
    Number(run.seconds) || 0,
    Number(run.success_rate) || 0,
    Number(run.faults) || 0,
    csvCell(run.video_url || ''),
    csvCell(run.note || ''),
    csvCell(run.season || currentSeason)
  ]);
  downloadCsv([headers.join(','), ...csvRows.map(row => row.join(','))].join('\n'), 'ROV_Mission_Runs');
  showToast('??Mission Run 閮? CSV 撌脣??);
}


// ????????????????????????????????????????????????????????// NAV BADGE ???暹?隞餃?閫?
// ????????????????????????????????????????????????????????function updateNavBadge() {
  const overdueTasks = state.tasks.filter(t => t.status !== '撌脣??? && isOverdue(t.due));
  const count = overdueTasks.length;
  const maxDays = overdueTasks.reduce((max, t) => Math.max(max, getOverdueDays(t.due)), 0);
  const badge = document.getElementById('badge-overdue');
  const navCount = document.getElementById('nav-overdue-count');
  const taskCount = document.getElementById('task-overdue-count');
  const title = count ? (maxDays > 3 ? `?遙?暹?頞? 3 憭抬????${maxDays} 憭抬?` : `?遙?暹? ${maxDays} 憭奈) : '?桀?瘝???隞餃?';
  [navCount, taskCount].forEach(el => {
    if (!el) return;
    el.textContent = `?? ${count}`;
    el.title = title;
    el.style.background = 'var(--red)';
  });
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.title = title;
    badge.classList.remove('hidden', 'warning', 'danger');
    badge.classList.add(maxDays > 3 ? 'danger' : 'warning');
  } else {
    badge.classList.add('hidden');
    badge.classList.remove('warning', 'danger');
    badge.removeAttribute('title');
  }
}

// ????????????????????????????????????????????????????????// CSV ?臬
// ????????????????????????????????????????????????????????/**
 * 撠遙??????CSV 銝虫?頛?靘?其遙???桀?蝭拚蝯??梁?? * @param {Array<object>} tasks 閬?箇?隞餃?皜?? * @param {string} filenamePrefix 瑼??韌?? * @param {string} toastLabel ?臬摰?閮銝剔?蝭??膩?? */
function downloadTasksCSV(tasks, filenamePrefix, toastLabel) {
  const headers = ['ID','隞餃??迂','憿','鞎痊鈭?,'????,'?芣迫??,'???,'?酉'];
  const rows = tasks.map(t => [
    t.id,
    csvCell(t.name),
    csvCell(t.cat),
    csvCell(t.owner),
    t.start_date || '',
    t.due || '',
    csvCell(t.status),
    csvCell(t.note)
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCsv(csv, filenamePrefix);
  showToast('??撌脣??' + tasks.length + ' 蝑遙??' + toastLabel + '嚗xcel ?舐?仿???');
}

/**
 * ?臬?券隞餃???CSV?? */
function exportTasksCSV() {
  downloadTasksCSV(state.tasks, 'ROV_Tasks', '?券隞餃?');
}

/**
 * ?臬?桀?隞餃????函祟?貉???敺?蝯??? */
function exportFilteredTasksCSV() {
  const filtered = getFilteredTasks(true);
  if (!filtered.length) {
    showToast('?? ?桀?蝭拚蝯?瘝?隞餃??臬??);
    return;
  }
  downloadTasksCSV(filtered, 'ROV_Tasks_Filtered', '?桀?蝭拚蝯?');
}

/**
 * ?臬?桀?蝭拚蝯???Excel xlsx?? */
function exportTasksXLSX() {
  if (typeof XLSX === 'undefined') {
    showToast('?? SheetJS 頛憭望?嚗?瑼Ｘ蝬脩窗敺?閰?);
    return;
  }
  const rows = getFilteredTasks(true).map(t => ({
    ID: t.id,
    隞餃??迂: t.name || '',
    憿: t.cat || '',
    鞎痊鈭? t.owner || '',
    ???? t.start_date || '',
    ?芣迫?? t.due || '',
    ??? t.status || '',
    ?蔭隞餃?: getDependencyTask(t)?.name || '',
    鞈賢迤: t.season || currentSeason,
    ?酉: t.note || ''
  }));
  if (!rows.length) { showToast('?? ?桀?瘝?隞餃??臬??); return; }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
  XLSX.writeFile(wb, `ROV_Tasks_${currentSeason}_${new Date().toISOString().split('T')[0]}.xlsx`);
  showToast('??Excel 撌脣??);
}

/**
 * ??隞餃??臬銝??詨?? * @param {string} type ?臬憿??? */
function handleTaskExport(type) {
  if (type === 'all-csv') exportTasksCSV();
  if (type === 'filtered-csv') exportFilteredTasksCSV();
  if (type === 'xlsx') exportTasksXLSX();
}

/**
 * 撠?CSV 摮葡銝???UTF-8 BOM 瑼?嚗Ⅱ靽?Excel ??銝剜?銝?蝣潦? * @param {string} csv CSV ?批捆?? * @param {string} filenamePrefix 瑼??韌?? */
function downloadCsv(csv, filenamePrefix) {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = filenamePrefix + '_' + today + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 撠?雿??箏???CSV ?脣??潦? * @param {unknown} value 甈??潦? * @returns {string} CSV ?脣??澆摰嫘? */
function csvCell(value) {
  return '"' + String(value ?? '').replace(/"/g,'""') + '"';
}

function showToast(msg) {
  let t = document.getElementById('export-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'export-toast';
    t.style.cssText = 'position:fixed;bottom:28px;right:28px;background:#217346;color:#fff;' +
      'padding:11px 22px;border-radius:9px;font-size:.88rem;font-weight:700;' +
      'box-shadow:0 4px 18px rgba(0,0,0,.25);z-index:9999;transition:opacity .35s;opacity:0;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

async function quickDone(id) {
  const t = state.tasks.find(t=>t.id===id);
  if(!t) return;
  if (isTaskLocked(t)) {
    showToast('?? ?蔭隞餃?撠摰?嚗???賢??迨隞餃?');
    return;
  }
  const before = {...t};
  await db.from('tasks').update({ status: '撌脣??? }).eq('id', id);
  t.status = '撌脣???;
  await writeAuditLog('quick_done', 'tasks', id, before, t);
  refreshAfterTaskChange();
}

/**
 * 皜脫??臬????隞餃????badge?? * @param {object} task 隞餃?鞈??? * @returns {string} ???badge HTML?? */
function renderTaskStatusBadge(task) {
  const classMap = { '敺齒':'urgent', '?脰?銝?:'inprog', '撌脣???:'done' };
  const cycle = { '敺齒':'?脰?銝?, '?脰?銝?:'撌脣???, '撌脣???:'敺齒' };
  const status = task.status || '敺齒';
  const next = cycle[status] || '敺齒';
  return `<span class="badge ${classMap[status] || 'urgent'}" onclick="quickToggleTaskStatus(${task.id});event.stopPropagation()" title="暺??? ??${next}">${escapeHtml(status)}</span>`;
}

/**
 * ?其遙??銵其葉敹恍儐?啣??遙???? * @param {number} id 隞餃? ID?? */
async function quickToggleTaskStatus(id) {
  const task = state.tasks.find(t => Number(t.id) === Number(id));
  if (!task) return;
  if (task.status !== '撌脣??? && isTaskLocked(task)) {
    showToast('?? ?蔭隞餃?撠摰?嚗???賢??迨隞餃?');
    return;
  }
  const before = { ...task };
  const cycle = { '敺齒':'?脰?銝?, '?脰?銝?:'撌脣???, '撌脣???:'敺齒' };
  const next = cycle[task.status] || '敺齒';
  task.status = next;
  try {
    await db.from('tasks').update({ status: next }).eq('id', id);
    await writeAuditLog('quick_status', 'tasks', id, before, task);
  } catch(e) {
    console.warn('Task status quick toggle saved locally only:', e.message);
  }
  refreshAfterTaskChange();
}

async function quickSetTaskStatus(id, status) {
  const allowed = ['敺齒', '?脰?銝?, '撌脣???];
  if (!allowed.includes(status)) return;
  const task = state.tasks.find(t => Number(t.id) === Number(id));
  if (!task) return;
  if (status === '撌脣??? && isTaskLocked(task)) {
    showToast('?? ?蔭隞餃?撠摰?嚗???賢??迨隞餃?');
    return;
  }
  if (task.status === status) {
    showToast(`?對? 隞餃?撌脫${status}`);
    return;
  }
  const before = { ...task };
  task.status = status;
  try {
    await db.from('tasks').update({ status }).eq('id', id);
    await writeAuditLog('quick_set_status', 'tasks', id, before, task);
  } catch(e) {
    console.warn('Task status quick set saved locally only:', e.message);
  }
  showToast(`??撌脫?隞餃?璅???{status}`);
  refreshAfterTaskChange();
}

// ????????????????????????????????????????????????????????// TASKS
// ????????????????????????????????????????????????????????/**
 * ???桀?隞餃??祟?豢?隞嗡??遙???柴? * @param {boolean} shouldSort ?臬憟?桀?銵冽???? * @returns {Array<object>} 蝭拚敺遙???柴? */
function getFilteredTasks(shouldSort = false) {
  const cat = (document.getElementById('filter-cat')||{}).value || '';
  const status = (document.getElementById('filter-status')||{}).value || '';
  const owner = (document.getElementById('filter-owner')||{}).value || '';
  const search = ((document.getElementById('search-task')||{}).value || '').toLowerCase();
  const filtered = state.tasks.filter(t=>
    (!cat||t.cat===cat) &&
    (!status||t.status===status) &&
    (!owner||t.owner===owner) &&
    (!search||(t.name||'').toLowerCase().includes(search)||(t.owner||'').toLowerCase().includes(search)) &&
    matchTaskQuickFilter(t)
  );
  return shouldSort ? sortTasks(filtered) : filtered;
}

function matchTaskQuickFilter(task) {
  if (!taskQuickFilter) return true;
  if (taskQuickFilter === 'open') return task.status !== '撌脣???;
  if (taskQuickFilter === 'overdue') return task.status !== '撌脣??? && isOverdue(task.due);
  if (taskQuickFilter === 'blocked') return task.status !== '撌脣??? && isTaskLocked(task);
  if (taskQuickFilter === 'unassigned') return task.status !== '撌脣??? && !String(task.owner || '').trim();
  if (taskQuickFilter === 'mine') {
    const me = localStorage.getItem('rov_actor_name') || '';
    return task.status !== '撌脣??? && me && String(task.owner || '').includes(me);
  }
  if (taskQuickFilter === 'week') {
    if (!task.due || task.status === '撌脣???) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(task.due); due.setHours(0,0,0,0);
    const diffDays = Math.ceil((due - today) / 86400000);
    return diffDays >= 0 && diffDays <= 7;
  }
  return true;
}

function setTaskQuickFilter(filter) {
  if (filter === 'mine' && !localStorage.getItem('rov_actor_name')) {
    const actor = prompt('隢撓?乩???蝔梧??冽蝭拚???遙??', '') || '';
    if (!actor.trim()) return;
    localStorage.setItem('rov_actor_name', actor.trim());
  }
  taskQuickFilter = filter === 'clear' ? '' : filter;
  if (filter === 'clear') {
    ['filter-cat','filter-status','filter-owner','search-task'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
  renderTasks();
}

/**
 * 靘?”?潭?雿身摰?摨遙?? * @param {Array<object>} tasks 閬?摨?隞餃?皜?? * @returns {Array<object>} ??敺??圈?? */
function sortTasks(tasks) {
  const catOrder = {'? 蝺?:0,'?? 擃??:1,'? 銝剖??:2,'? ??':3};
  const statusOrder = {'敺齒':0,'?脰?銝?:1,'撌脣???:2};
  return [...tasks].sort((a,b)=>{
    const doneSort = (a.status === '撌脣??? ? 1 : 0) - (b.status === '撌脣??? ? 1 : 0);
    if (doneSort) return doneSort;
    let va = a[taskSort.col]||''; let vb = b[taskSort.col]||'';
    if(taskSort.col==='sort_order') return ((Number(va)||0)-(Number(vb)||0))*taskSort.dir;
    if(taskSort.col==='cat') { va = catOrder[va]??9; vb = catOrder[vb]??9; return (va-vb)*taskSort.dir; }
    if(taskSort.col==='status') { va = statusOrder[va]??9; vb = statusOrder[vb]??9; return (va-vb)*taskSort.dir; }
    if(taskSort.col==='due') {
      if(!va && !vb) return 0; if(!va) return 1; if(!vb) return -1;
      return (new Date(va)-new Date(vb))*taskSort.dir;
    }
    return va.toString().localeCompare(vb.toString(), 'zh-HK')*taskSort.dir;
  });
}

function renderTasks() {
  populateTaskOwnerFilter();
  const owners = [...new Set(state.tasks.map(t=>t.owner).filter(Boolean))].sort();
  const ownerSel = document.getElementById('filter-owner');
  const curOwner = ownerSel.value;
  ownerSel.innerHTML = '<option value="">???鞎砌犖</option>' + owners.map(o=>`<option value="${escapeAttr(o)}" ${o===curOwner?'selected':''}>` + escapeHtml(o) + '</option>').join('');

  const filtered = getFilteredTasks(true);
  updateNavBadge();
  applySortIcons();
  updateTaskFilterSummary(filtered.length);
  renderTaskHealthPanel();
  renderTaskWorkbenchPanel();
  renderTaskPriorityPanel();
  renderTaskOwnerLoadPanel();
  renderUnassignedTaskHint();
  renderTaskBlockedPanel();
  positionTaskFilterToolbar();

  const catColor = {'? 蝺?:'#FFD6D6','?? 擃??:'#FCE4D6','? 銝剖??:'#FFF3CD','? ??':'#E2EFDA'};

  document.getElementById('task-tbody').innerHTML = filtered.map(t=>{
    const overdue = t.due && isOverdue(t.due) && t.status!=='撌脣???;
    const overdueDays = getOverdueDays(t.due);
    const overdueColor = overdueDays > 3 ? 'var(--red)' : 'var(--orange)';
    const locked = isTaskLocked(t);
    const dep = getDependencyTask(t);
    const rowCls = [t.status==='撌脣????'task-done':'', overdue?'task-overdue':'', locked?'task-locked':'', 'task-row-clickable'].filter(Boolean).join(' ');
    return `
    <tr class="${rowCls}" data-task-id="${t.id}" onclick="openTaskDetail(${t.id})">
      <td class="no-click drag-handle" onclick="event.stopPropagation()" title="???">??/td>
      <td class="no-click" onclick="event.stopPropagation()"><input type="checkbox" ${selectedTaskIds.has(t.id)?'checked':''} onchange="toggleTaskSelection(${t.id},this.checked)"></td>
      <td class="no-click" onclick="event.stopPropagation()"><input type="checkbox" ${t.status==='撌脣????'checked':''} ${locked?'disabled title="?蔭隞餃?撠摰?"':''} onchange="toggleTask(${t.id})"></td>
      <td style="font-size:.78rem;color:#888">${t.id}</td>
      <td>
        <div style="font-weight:600">${t.name}</div>
        ${t.note?`<div style="font-size:.75rem;color:#888;margin-top:2px">${t.note}</div>`:''}
        ${dep?`<div class="dep-pill">?? ?蔭嚗?{dep.status==='撌脣????'??:'??'} ${dep.name}</div>`:''}
        ${locked?'<div class="task-lock-note">?蔭隞餃??芸???撌脤?摰?/div>':''}
      </td>
      <td><span style="background:${catColor[t.cat]||'#eee'};padding:2px 8px;border-radius:99px;font-size:.75rem">${t.cat}</span></td>
      <td style="font-size:.85rem">${t.owner}</td>
      <td style="font-size:.82rem;color:#666">${t.start_date||'??}</td>
      <td style="font-size:.82rem;${overdue?`color:${overdueColor};font-weight:700`:''}">${t.due||'??}${overdue?` <span style="font-size:.72rem">?暹?${overdueDays}憭?/span>`:''}</td>
      <td class="no-click" onclick="event.stopPropagation()">${renderTaskStatusBadge(t)}</td>
      <td class="no-click" style="white-space:nowrap" onclick="event.stopPropagation()">
        <button class="btn btn-sm btn-primary" onclick="editTask(${t.id})" style="margin-right:4px" title="蝺刻摩">??</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTask(${t.id})" title="?芷">??</button>
      </td>
    </tr>`}).join('') || '<tr><td colspan="10" style="text-align:center;padding:20px;color:#aaa">?∠泵??隞嗥?隞餃?</td></tr>';
  updateBatchBar();
  initTaskSortable();
}

function positionTaskFilterToolbar() {
  const toolbar = document.getElementById('task-filter-toolbar');
  const blocked = document.getElementById('task-blocked-panel');
  if (!toolbar || !blocked) return;
  blocked.insertAdjacentElement('afterend', toolbar);
}

function updateTaskFilterSummary(visibleCount) {
  const el = document.getElementById('task-filter-summary');
  if (!el) return;
  const total = state.tasks.length;
  const open = state.tasks.filter(t => t.status !== '撌脣???).length;
  const labelMap = { open:'?芸???, overdue:'?暹?', week:'7?亙', blocked:'?餃?', unassigned:'?芸???, mine:'??' };
  el.textContent = `憿舐內 ${visibleCount} / ${total}嚚摰? ${open}${taskQuickFilter ? '嚚? + labelMap[taskQuickFilter] : ''}`;
}

function renderTaskWorkbenchPanel() {
  const el = document.getElementById('task-workbench-panel');
  if (!el) return;
  const openTasks = state.tasks.filter(t => t.status !== '撌脣???);
  const blocked = openTasks.filter(t => isTaskLocked(t));
  const overdue = openTasks.filter(t => isOverdue(t.due) && !blocked.some(b => Number(b.id) === Number(t.id)));
  const todo = openTasks.filter(t => t.status === '敺齒' && !isOverdue(t.due) && !isTaskLocked(t))
    .sort((a,b)=>getTaskPriorityScore(b)-getTaskPriorityScore(a) || String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31')))
    .slice(0, 4);
  const inprog = openTasks.filter(t => t.status === '?脰?銝? && !isOverdue(t.due) && !isTaskLocked(t))
    .sort((a,b)=>String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31')))
    .slice(0, 4);
  const risks = [...blocked, ...overdue]
    .sort((a,b)=>getTaskPriorityScore(b)-getTaskPriorityScore(a) || String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31')))
    .slice(0, 5);
  const card = (task, kind = '') => {
    const dep = getDependencyTask(task);
    const reason = isTaskLocked(task) && dep ? `?餃?嚗?蝵?#${dep.id} ${dep.name}` : (isOverdue(task.due) ? `?暹? ${getOverdueDays(task.due)} 憭奈 : (task.due ? `?芣迫嚗?{task.due}` : '?芾身摰甇?));
    return `
      <div class="task-workbench-card ${kind}" onclick="openTaskDetail(${task.id})">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
          <strong style="font-size:.88rem">${escapeHtml(task.name || '')}</strong>
          <span style="font-size:.72rem;color:var(--muted)">#${task.id}</span>
        </div>
        <div style="font-size:.78rem;color:var(--muted);margin-top:4px">${escapeHtml(task.owner || '?芸???)}嚚?{escapeHtml(reason)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:7px" onclick="event.stopPropagation()">
          <button class="btn btn-sm" onclick="goToTaskAndOpen(${task.id})">?亦?</button>
          ${task.status !== '?脰?銝? && !isTaskLocked(task) ? `<button class="btn btn-sm" onclick="quickSetTaskStatus(${task.id},'?脰?銝?)">?脰?銝?/button>` : ''}
          ${!isTaskLocked(task) ? `<button class="btn btn-sm btn-primary" onclick="quickSetTaskStatus(${task.id},'撌脣???)">摰?</button>` : ''}
        </div>
      </div>`;
  };
  const column = (title, items, empty, kind = '') => `
    <div class="task-workbench-column">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <strong style="color:var(--navy)">${title}</strong>
        <span class="badge ${kind === 'risk' ? 'urgent' : kind === 'blocked' ? 'mid' : 'inprog'}">${items.length}</span>
      </div>
      ${items.length ? items.map(t => card(t, kind)).join('') : `<div style="font-size:.8rem;color:var(--muted);padding:14px 4px">${empty}</div>`}
    </div>`;
  el.innerHTML = `
    <div style="display:flex;justify-content:flex-end;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
      <span style="font-size:.8rem;color:var(--muted);font-weight:800">瘥?券脣???甈?敺齒?脰?銝准憛?/ ?暹?嚗??游?銵其??銝??/span>
    </div>
    <div class="task-workbench-grid">
      ${column('敺齒', todo, '瘝?敺齒隞餃???)}
      ${column('?脰?銝?, inprog, '瘝??脰?銝剔?隞餃???)}
      ${column('?餃? / ?暹?', risks, '?桀?瘝??餃??暹???, risks.some(isTaskLocked) ? 'blocked' : 'risk')}
    </div>`;
}

function renderTaskHealthPanel() {
  const el = document.getElementById('task-health-panel');
  if (!el) return;
  const openTasks = state.tasks.filter(t => t.status !== '撌脣???);
  const overdue = openTasks.filter(t => isOverdue(t.due)).length;
  const blocked = openTasks.filter(t => isTaskLocked(t)).length;
  const unassigned = openTasks.filter(t => !String(t.owner || '').trim()).length;
  const week = openTasks.filter(matchWeekDueTask).length;
  el.innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between">
      <strong style="color:var(--navy)">隞餃??亙熒??</strong>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-sm" onclick="setTaskQuickFilter('overdue')" style="background:${overdue ? 'var(--red)' : 'var(--input-bg)'};color:${overdue ? '#fff' : 'var(--text)'}">?暹? ${overdue}</button>
        <button class="btn btn-sm" onclick="setTaskQuickFilter('blocked')" style="background:${blocked ? '#7030A0' : 'var(--input-bg)'};color:${blocked ? '#fff' : 'var(--text)'}">?餃? ${blocked}</button>
        <button class="btn btn-sm" onclick="setTaskQuickFilter('unassigned')" style="background:${unassigned ? 'var(--orange)' : 'var(--input-bg)'};color:${unassigned ? '#fff' : 'var(--text)'}">?芸???${unassigned}</button>
        <button class="btn btn-sm" onclick="setTaskQuickFilter('week')" style="background:${week ? 'var(--blue)' : 'var(--input-bg)'};color:${week ? '#fff' : 'var(--text)'}">7?亙 ${week}</button>
      </div>
    </div>`;
}

function renderTaskPriorityPanel() {
  const el = document.getElementById('task-priority-panel');
  if (!el) return;
  const items = getPriorityTasks().slice(0, 5);
  if (!items.length) {
    el.innerHTML = '<div style="font-size:.86rem;color:var(--muted);font-weight:800">?桀?瘝??閬?????芸??遙??/div>';
    return;
  }
  el.innerHTML = `
    <div style="display:flex;justify-content:flex-end;gap:10px;align-items:center;margin-bottom:8px">
      <button class="btn btn-sm" onclick="setTaskQuickFilter('open')">?亦??芸???/button>
    </div>
    <div style="display:grid;gap:6px">
      ${items.map(t => {
        const reason = getTaskPriorityReason(t);
        return `<button class="btn" onclick="openTaskDetail(${t.id})" style="text-align:left;background:var(--input-bg);color:var(--text);border:1px solid var(--border);display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center">
          <span style="font-weight:900;color:var(--red)">#${t.id}</span>
          <span><strong>${escapeHtml(t.name)}</strong><span style="font-size:.78rem;color:var(--muted);margin-left:6px">${escapeHtml(t.owner || '?芸???)}</span></span>
          <span class="badge ${reason.cls}">${reason.label}</span>
        </button>`;
      }).join('')}
    </div>`;
}

function getPriorityTasks() {
  return state.tasks
    .filter(t => t.status !== '撌脣???)
    .sort((a, b) => getTaskPriorityScore(b) - getTaskPriorityScore(a));
}

function getTaskPriorityScore(task) {
  const catScore = {'? 蝺?:60,'?? 擃??:40,'? 銝剖??:20,'? ??':5}[task.cat] || 0;
  const statusScore = task.status === '?脰?銝? ? 15 : 0;
  let dueScore = 0;
  if (task.due) {
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(task.due); due.setHours(0,0,0,0);
    const diff = Math.ceil((due - today) / 86400000);
    if (diff < 0) dueScore = 100 + Math.min(30, Math.abs(diff));
    else if (diff <= 1) dueScore = 70;
    else if (diff <= 7) dueScore = 45 - diff;
  }
  return catScore + statusScore + dueScore;
}

function getTaskPriorityReason(task) {
  if (isOverdue(task.due)) return { label:`?暹? ${getOverdueDays(task.due)}?匝, cls:'urgent' };
  if (task.due) {
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(task.due); due.setHours(0,0,0,0);
    const diff = Math.ceil((due - today) / 86400000);
    if (diff === 0) return { label:'隞?唳?', cls:'high' };
    if (diff > 0 && diff <= 7) return { label:`${diff}?亙`, cls:'mid' };
  }
  if (task.cat === '? 蝺?) return { label:'蝺?, cls:'urgent' };
  if (task.status === '?脰?銝?) return { label:'?脰?銝?, cls:'inprog' };
  return { label:'敺齒', cls:'mid' };
}

function renderTaskOwnerLoadPanel() {
  const el = document.getElementById('task-owner-load-panel');
  if (!el) return;
  const rows = getTaskOwnerLoadRows().slice(0, 8);
  if (!rows.length) {
    el.innerHTML = '<div style="font-size:.86rem;color:var(--muted);font-weight:800">撠?芸??遙??鞎砌犖蝯梯???/div>';
    return;
  }
  el.innerHTML = `
    <div style="display:flex;justify-content:flex-end;gap:10px;align-items:center;margin-bottom:8px">
      <span style="font-size:.78rem;color:var(--muted)">暺?鞎痊鈭箏蝭拚隞餃?</span>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${rows.map(row => `
        <button class="btn" onclick="filterTasksByOwner('${escapeAttr(row.owner)}')" style="background:var(--input-bg);color:var(--text);border:1px solid var(--border);display:flex;gap:7px;align-items:center">
          <strong>${escapeHtml(row.owner)}</strong>
          <span class="badge inprog">${row.open}</span>
          ${row.overdue ? `<span class="badge urgent">${row.overdue}?暹?</span>` : ''}
          ${row.week ? `<span class="badge mid">${row.week}?祇?/span>` : ''}
        </button>
      `).join('')}
    </div>`;
}

function getTaskOwnerLoadRows() {
  const map = new Map();
  state.tasks.filter(t => t.status !== '撌脣???).forEach(task => {
    const owner = task.owner || '?芸???;
    if (!map.has(owner)) map.set(owner, { owner, open:0, overdue:0, week:0, score:0 });
    const row = map.get(owner);
    row.open++;
    if (isOverdue(task.due)) row.overdue++;
    if (matchWeekDueTask(task)) row.week++;
    row.score += getTaskPriorityScore(task);
  });
  return [...map.values()].sort((a, b) => b.overdue - a.overdue || b.score - a.score || b.open - a.open);
}

function matchWeekDueTask(task) {
  if (!task.due || task.status === '撌脣???) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(task.due); due.setHours(0,0,0,0);
  const diff = Math.ceil((due - today) / 86400000);
  return diff >= 0 && diff <= 7;
}

function filterTasksByOwner(owner) {
  taskQuickFilter = 'open';
  const ownerSel = document.getElementById('filter-owner');
  if (ownerSel) ownerSel.value = owner === '?芸??? ? '' : owner;
  renderTasks();
}

function escapeAttr(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function renderTaskBlockedPanel() {
  const el = document.getElementById('task-blocked-panel');
  if (!el) return;
  const rows = state.tasks
    .filter(t => t.status !== '撌脣???)
    .map(task => ({ task, dep: getDependencyTask(task) }))
    .filter(row => row.dep && row.dep.status !== '撌脣???)
    .sort((a, b) => getTaskPriorityScore(b.task) - getTaskPriorityScore(a.task));
  if (!rows.length) {
    el.innerHTML = '';
    el.style.display = 'none';
    return;
  }
  el.style.display = '';
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px">
      <strong style="color:var(--navy)">?蔭隞餃??餃?</strong>
      <span class="badge urgent">${rows.length} ??/span>
    </div>
    <div style="display:grid;gap:6px">
      ${rows.slice(0, 6).map(({ task, dep }) => `
        <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--input-bg)">
          <button class="btn" onclick="openTaskDetail(${task.id})" style="text-align:left;background:transparent;color:var(--text);padding:0">
            <strong>#${task.id} ${escapeHtml(task.name)}</strong>
            <span style="display:block;font-size:.78rem;color:var(--muted)">蝑??蔭嚗?${dep.id} ${escapeHtml(dep.name)}</span>
          </button>
          <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
            <button class="btn btn-sm" onclick="openTaskDetail(${dep.id})">?亦??蔭</button>
            <button class="btn btn-sm btn-success" onclick="quickDone(${dep.id})">摰??蔭</button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderUnassignedTaskHint() {
  const el = document.getElementById('task-owner-load-panel');
  if (!el) return;
  const missing = state.tasks.filter(t => t.status !== '撌脣??? && !String(t.owner || '').trim()).length;
  if (!missing) return;
  const hint = `<div style="margin-top:8px;padding:8px 10px;border-radius:8px;background:#FFF3CD;color:#856404;font-weight:800;font-size:.84rem;display:flex;justify-content:space-between;gap:8px;align-items:center">
    <span>${missing} ?摰?隞餃?撠??鞎痊鈭?/span>
    <button class="btn btn-sm" onclick="setTaskQuickFilter('unassigned')">?亦??芸???/button>
  </div>`;
  el.insertAdjacentHTML('beforeend', hint);
}

/**
 * ?湔隞餃??銝???隞餃??詻? */
function updateTaskActiveCount() {
  updateNavBadge();
}

/**
 * ???遙?”?潭??單?摨? */
function initTaskSortable() {
  const tbody = document.getElementById('task-tbody');
  if (!tbody || typeof Sortable === 'undefined') return;
  sortableInstances.tasks?.destroy();
  sortableInstances.tasks = new Sortable(tbody, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: saveTaskOrderFromDom
  });
}

/**
 * 敺??DOM ??撖怠? sort_order?? */
async function saveTaskOrderFromDom() {
  const ids = [...document.querySelectorAll('#task-tbody tr[data-task-id]')].map(row => Number(row.dataset.taskId));
  if (!ids.length) return;
  taskSort = { col: 'sort_order', dir: 1 };
  ids.forEach((id, index) => {
    const t = state.tasks.find(x => x.id === id);
    if (t) t.sort_order = index + 1;
  });
  if (taskSchema.sort_order) {
    await Promise.all(ids.map((id, index) => db.from('tasks').update({ sort_order: index + 1 }).eq('id', id)));
    await writeAuditLog('reorder', 'tasks', null, null, { ids });
  } else {
    showToast('??撌脫?唳?恍嚗?閬偶銋?摮?隢??瑁? DB 閮剖? SQL嚗ort_order嚗?);
  }
  refreshAfterTaskChange();
}

/**
 * ???桃?隞餃??寥??詨??? * @param {number} id 隞餃? ID?? * @param {boolean} checked ?臬?詨??? */
function toggleTaskSelection(id, checked) {
  if (checked) selectedTaskIds.add(id); else selectedTaskIds.delete(id);
  updateBatchBar();
}

/**
 * ?券??瘨?貊?祟?貊??? * @param {boolean} checked ?臬?券?? */
function toggleSelectAllTasks(checked) {
  getFilteredTasks(true).forEach(t => checked ? selectedTaskIds.add(t.id) : selectedTaskIds.delete(t.id));
  renderTasks();
}

/**
 * 皜?寥??詨??? */
function clearTaskSelection() {
  selectedTaskIds.clear();
  renderTasks();
}

/**
 * ?湔?寥??????? */
function updateBatchBar() {
  const bar = document.getElementById('task-batch-bar');
  const count = document.getElementById('batch-count');
  const selectAll = document.getElementById('select-all-tasks');
  if (!bar || !count) return;
  count.textContent = `撌脤 ${selectedTaskIds.size} 蝑;
  bar.classList.toggle('show', selectedTaskIds.size > 0);
  if (selectAll) {
    const visible = getFilteredTasks(true);
    selectAll.checked = visible.length > 0 && visible.every(t => selectedTaskIds.has(t.id));
  }
}

/**
 * 憟?寥????鞎痊鈭箸?啜? */
async function applyBatchUpdate() {
  if (!selectedTaskIds.size) return;
  const status = document.getElementById('batch-status').value;
  const owner = document.getElementById('batch-owner').value.trim();
  if (!status && !owner) { showToast('隢????頛詨鞎痊鈭?); return; }
  const ids = [...selectedTaskIds];
  const patch = {};
  if (status) patch.status = status;
  if (owner) patch.owner = owner;
  const beforeMap = new Map(ids.map(id => [id, {...state.tasks.find(x => x.id === id)}]));
  await Promise.all(ids.map(id => db.from('tasks').update(patch).eq('id', id)));
  ids.forEach(id => {
    const t = state.tasks.find(x => x.id === id);
    if (t) {
      Object.assign(t, patch);
    }
  });
  await Promise.all(ids.map(id => {
    const t = state.tasks.find(x => x.id === id);
    return t ? writeAuditLog('batch_update', 'tasks', id, beforeMap.get(id), t) : Promise.resolve();
  }));
  selectedTaskIds.clear();
  document.getElementById('batch-status').value = '';
  document.getElementById('batch-owner').value = '';
  refreshAfterTaskChange();
  showToast('???寥??湔摰?');
}

/**
 * ?寥?頠?日?遙?? */
async function batchSoftDelete() {
  if (!selectedTaskIds.size || !confirm(`蝣箄?頠??${selectedTaskIds.size} 蝑遙??`)) return;
  const ids = [...selectedTaskIds];
  await Promise.all(ids.map(id => softDeleteTask(id)));
  selectedTaskIds.clear();
  refreshAfterTaskChange();
  showToast('?? 撌脫???芷');
}

function isOverdue(due) {
  if(!due) return false;
  const d = new Date(due); d.setHours(23,59,59);
  return d < new Date();
}

/**
 * 閮??芣迫?亙歇?暹?撟曉予嚗?暹?? 0?? * @param {string} due YYYY-MM-DD ?芣迫?交??? * @returns {number} ?暹?憭拇?? */
function getOverdueDays(due) {
  if(!due) return 0;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(due); d.setHours(0,0,0,0);
  return Math.max(0, Math.floor((today - d) / 86400000));
}

async function toggleTask(id) {
  const t = state.tasks.find(t=>t.id===id);
  if(!t) return;
  if (t.status !== '撌脣??? && isTaskLocked(t)) {
    showToast('?? ?蔭隞餃?撠摰?嚗???賢??迨隞餃?');
    renderTasks();
    return;
  }
  const before = {...t};
  const ns = t.status==='撌脣????'敺齒':'撌脣???;
  await db.from('tasks').update({ status: ns }).eq('id', id);
  t.status = ns;
  await writeAuditLog('toggle_status', 'tasks', id, before, t);
  refreshAfterTaskChange();
}

function openAddTask() {
  editingTaskId = null;
  const ownerSearch = document.getElementById('m-owner-search');
  if (ownerSearch) ownerSearch.value = '';
  rebuildTaskOwnerSelects('');
  document.getElementById('modal-title').textContent = '?啣?隞餃?';
  ['m-name','m-start','m-due','m-note'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('m-owner').value = '';
  document.getElementById('m-duration-label').textContent = '';
  renderDependencyOptions('m-depends');
  document.getElementById('m-cat').value='? 蝺?;
  document.getElementById('m-status').value='敺齒';
  document.getElementById('task-modal').classList.add('open');
}

function editTask(id) {
  const t = state.tasks.find(t=>t.id===id);
  if(!t) return;
  editingTaskId = id;
  const ownerSearch = document.getElementById('m-owner-search');
  if (ownerSearch) ownerSearch.value = '';
  rebuildTaskOwnerSelects(t.owner || '');
  document.getElementById('modal-title').textContent = '蝺刻摩隞餃?';
  document.getElementById('m-name').value = t.name;
  document.getElementById('m-cat').value = t.cat;
  document.getElementById('m-status').value = t.status;
  document.getElementById('m-owner').value = t.owner || '';
  document.getElementById('m-start').value = t.start_date||'';
  document.getElementById('m-due').value = t.due||'';
  document.getElementById('m-note').value = t.note;
  renderDependencyOptions('m-depends', id);
  document.getElementById('m-depends').value = t.depends_on || '';
  updateDurationLabel();
  document.getElementById('task-modal').classList.add('open');
}

async function saveTask() {
  const before = editingTaskId ? {...state.tasks.find(x=>x.id===editingTaskId)} : null;
  const t = {
    name: document.getElementById('m-name').value.trim(),
    cat: document.getElementById('m-cat').value,
    status: document.getElementById('m-status').value,
    owner: document.getElementById('m-owner').value.trim(),
    start_date: document.getElementById('m-start').value || null,
    due: document.getElementById('m-due').value || null,
    note: document.getElementById('m-note').value.trim(),
    depends_on: document.getElementById('m-depends').value ? Number(document.getElementById('m-depends').value) : null,
    season: currentSeason,
    sort_order: editingTaskId ? (before?.sort_order || 0) : nextTaskSortOrder(),
  };
  const validation = validateTaskForm(t);
  if(!validation.ok) { alert(validation.message); return; }
  if (t.depends_on && !taskSchema.depends_on) {
    alert('閬摮?蝵桐遙??隢??啜B 閮剖???鋆賭蒂?瑁??啁? SQL嚗asks.depends_on 甈?嚗?);
    return;
  }
  if (t.depends_on && editingTaskId && hasDependencyCycle(editingTaskId, t.depends_on)) {
    alert('?蔭隞餃?銝敶Ｘ?敺芰靘陷嚗??豢??嗡?隞餃???);
    return;
  }
  const payload = buildTaskPayload(t);
  if(editingTaskId) {
    await db.from('tasks').update(payload).eq('id', editingTaskId);
    const i = state.tasks.findIndex(x=>x.id===editingTaskId);
    if(i>=0) state.tasks[i] = {...state.tasks[i],...t};
    await writeAuditLog('update', 'tasks', editingTaskId, before, state.tasks[i]);
  } else {
    const { data } = await db.from('tasks').insert([payload]).select().single();
    if(data) {
      const row = normalizeTask({...data, depends_on: t.depends_on});
      state.tasks.push(row);
      await writeAuditLog('create', 'tasks', row.id, null, row);
    }
  }
  closeModal('task-modal'); refreshAfterTaskChange();
}

async function deleteTask(id) {
  if(!confirm('蝣箄??芷甇支遙??')) return;
  await softDeleteTask(id);
  refreshAfterTaskChange();
}

/**
 * ?垢隞餃?甈?撽??? * @param {object} task 隞餃?鞈??? * @returns {{ok:boolean,message:string}} 撽?蝯??? */
function validateTaskForm(task) {
  if (!task.name) return { ok:false, message:'隢撓?乩遙??蝔晞? };
  if (!task.owner) return { ok:false, message:'隢撓?亥?鞎砌犖?? };
  if (task.start_date && task.due && new Date(task.due) < new Date(task.start_date)) {
    return { ok:false, message:'?芣迫?乩??舀?潮?憪?? };
  }
  return { ok:true, message:'' };
}

/**
 * ????鈭箏?蝔梧?蝚砌??挾隞?localStorage 靽??? * @returns {string} ??鈭箝? */
function getActorName() {
  let actor = localStorage.getItem('rov_actor_name');
  if (!actor) {
    actor = prompt('隢撓?乩???蝔梧??冽??甇瑕蝝??', '?芸?蝙?刻?) || '?芸?蝙?刻?;
    localStorage.setItem('rov_actor_name', actor);
  }
  return actor;
}

/**
 * 撖怠??甇瑕嚗 audit_log 撠撱箇???暺歲?? * @param {string} action ??憿??? * @param {string} entityType 鞈?憿??? * @param {number|null} entityId 鞈? ID?? * @param {object|null} before 霈?? * @param {object|null} after 霈敺? */
async function writeAuditLog(action, entityType, entityId, before, after) {
  recordLocalChangeHistory(action, entityType, entityId, before, after);
  if (!optionalSchema.auditLog) return;
  try {
    await db.from('audit_log').insert([{
      actor: getActorName(),
      action,
      entity_type: entityType,
      entity_id: entityId,
      before_data: before,
      after_data: after
    }]);
  } catch(e) {
    console.warn('audit_log write skipped:', e.message);
  }
}

function getTaskChangeHistory() {
  const rows = safeJsonParse(localStorage.getItem(TASK_HISTORY_KEY), []);
  return Array.isArray(rows) ? rows : [];
}

function saveTaskChangeHistory(rows) {
  localStorage.setItem(TASK_HISTORY_KEY, JSON.stringify(rows.slice(0, 200)));
}

function recordLocalChangeHistory(action, entityType, entityId, before, after) {
  if (entityType !== 'tasks') return;
  const changes = getTaskChangeSet(before, after);
  if (!changes.length && !['create','delete','soft_delete','reorder'].includes(action)) return;
  const rows = getTaskChangeHistory();
  rows.unshift({
    ts:new Date().toISOString(),
    actor:getActorName(),
    action,
    taskId:entityId,
    taskName:(after || before || {}).name || '',
    changes
  });
  saveTaskChangeHistory(rows);
}

function getTaskChangeSet(before, after) {
  if (!before && after) return [{ field:'?啣?', before:'', after:after.name || `#${after.id || ''}` }];
  if (before && !after) return [{ field:'?芷', before:before.name || `#${before.id || ''}`, after:'' }];
  if (!before || !after) return [];
  const fields = [
    ['name','隞餃??迂'],
    ['cat','憿'],
    ['status','???],
    ['owner','鞎痊鈭?],
    ['start_date','韏瑕???],
    ['due','?芣迫??],
    ['depends_on','?蔭隞餃?'],
    ['note','?酉']
  ];
  return fields
    .filter(([key]) => String(before[key] ?? '') !== String(after[key] ?? ''))
    .map(([key, label]) => ({ field:label, before:formatTaskHistoryValue(key, before[key]), after:formatTaskHistoryValue(key, after[key]) }));
}

function formatTaskHistoryValue(key, value) {
  if (key === 'depends_on') {
    if (!value) return '??;
    const dep = state.tasks.find(t => Number(t.id) === Number(value));
    return dep ? `#${dep.id} ${dep.name}` : `#${value}`;
  }
  return String(value ?? '') || '蝛箇';
}

function getTaskHistoryRows(taskId) {
  return getTaskChangeHistory().filter(row => Number(row.taskId) === Number(taskId)).slice(0, 5);
}

function renderTaskChangeHistory(taskId) {
  const el = document.getElementById('dv-history');
  if (!el) return;
  const rows = getTaskHistoryRows(taskId);
  if (!rows.length) {
    el.innerHTML = '<div style="font-size:.8rem;color:#999">撠?祆?霈蝝??/div>';
    return;
  }
  el.innerHTML = rows.map(row => `
    <div style="border-left:3px solid var(--blue);padding:5px 8px;margin-bottom:5px;background:var(--input-bg);font-size:.78rem">
      <strong>${escapeHtml(getTaskHistoryActionLabel(row.action))}</strong>
      <span style="color:var(--muted);margin-left:6px">${escapeHtml(row.actor || '?芰')}嚚?{escapeHtml(new Date(row.ts).toLocaleString('zh-HK'))}</span>
      <div style="color:var(--muted);margin-top:3px">${escapeHtml(row.changes.map(c => `${c.field}: ${c.before} -> ${c.after}`).join('嚗?))}</div>
    </div>
  `).join('');
}

function getTaskHistoryActionLabel(action) {
  return ({ create:'?啣?', update:'?湔', toggle_status:'?????, soft_delete:'頠??, delete:'?芷', batch_update:'?寥??湔', reorder:'??' })[action] || action;
}

/**
 * 頠?支遙?????澈?芸?蝝???祕擃?扎? * @param {number} id 隞餃? ID?? */
async function softDeleteTask(id) {
  const before = state.tasks.find(t => t.id === id);
  if (!before) return;
  if (taskSchema.deleted_at) {
    const deleted_at = new Date().toISOString();
    await db.from('tasks').update({ deleted_at }).eq('id', id);
  } else {
    await db.from('tasks').delete().eq('id', id);
  }
  state.tasks = state.tasks.filter(t=>t.id!==id);
  state.tasks.forEach(t => { if (t.depends_on === id) t.depends_on = null; });
  await writeAuditLog(taskSchema.deleted_at ? 'soft_delete' : 'delete', 'tasks', id, before, null);
}

/**
 * 靘??澈?舀甈?撱箇?隞餃?撖怠 payload?? * @param {object} task 隞餃?鞈??? * @returns {object} ?臬神??Supabase ??payload?? */
function buildTaskPayload(task) {
  const payload = {
    name: task.name,
    cat: task.cat,
    status: task.status,
    owner: task.owner,
    start_date: task.start_date,
    due: task.due,
    note: task.note,
  };
  if (taskSchema.depends_on) payload.depends_on = task.depends_on || null;
  if (taskSchema.season) payload.season = task.season || currentSeason;
  if (taskSchema.sort_order) payload.sort_order = task.sort_order || nextTaskSortOrder();
  return payload;
}

/**
 * ??銝??遙??摨潦? * @returns {number} 銝???sort_order?? */
function nextTaskSortOrder() {
  return Math.max(0, ...state.tasks.map(t => Number(t.sort_order || 0))) + 1;
}

/**
 * 皜脫??蔭隞餃?銝??詨?? * @param {string} selectId select ?? ID?? * @param {number|null} currentTaskId ?桀?隞餃? ID嚗??啗撌晞? */
function renderDependencyOptions(selectId, currentTaskId = null) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const options = state.tasks
    .filter(t => t.id !== currentTaskId)
    .map(t => `<option value="${t.id}">#${t.id} ${t.status==='撌脣????'??:'漎?} ${escapeHtml(t.name)}</option>`)
    .join('');
  sel.innerHTML = '<option value="">?∪?蝵桐遙??/option>' + options;
}

/**
 * ??隞餃???蝵桐遙?? * @param {object} task 隞餃?鞈??? * @returns {object|null} ?蔭隞餃??? */
function getDependencyTask(task) {
  return task?.depends_on ? state.tasks.find(t => t.id === Number(task.depends_on)) || null : null;
}

/**
 * ?斗隞餃??臬??蝵桐遙?摰???摰? * @param {object} task 隞餃?鞈??? * @returns {boolean} ?臬???? */
function isTaskLocked(task) {
  const dep = getDependencyTask(task);
  return Boolean(dep && dep.status !== '撌脣??? && task.status !== '撌脣???);
}

/**
 * 瑼Ｘ隞餃?靘陷?臬敶Ｘ?敺芰?? * @param {number} taskId ?桀?隞餃? ID?? * @param {number} dependsOnId ?詨??蔭隞餃? ID?? * @returns {boolean} ?臬敶Ｘ?敺芰?? */
function hasDependencyCycle(taskId, dependsOnId) {
  let nextId = Number(dependsOnId);
  const seen = new Set([Number(taskId)]);
  while (nextId) {
    if (seen.has(nextId)) return true;
    seen.add(nextId);
    const next = state.tasks.find(t => t.id === nextId);
    nextId = next?.depends_on ? Number(next.depends_on) : null;
  }
  return false;
}

// ?? TASK DETAIL MODAL (click row) ??
let detailTaskId = null;

const statusBadgeMap = {
  '敺齒':'<span class="badge urgent">敺齒</span>',
  '?脰?銝?:'<span class="badge inprog">?脰?銝?/span>',
  '撌脣???:'<span class="badge done">撌脣???/span>',
};

function openTaskDetail(id) {
  const t = state.tasks.find(t=>t.id===id);
  if(!t) return;
  detailTaskId = id;
  // Fill view mode
  document.getElementById('detail-modal-title').textContent = t.name;
  const catColor = {'? 蝺?:'#FFD6D6','?? 擃??:'#FCE4D6','? 銝剖??:'#FFF3CD','? ??':'#E2EFDA'};
  document.getElementById('dv-cat').innerHTML = `<span style="background:${catColor[t.cat]||'#eee'};padding:2px 8px;border-radius:99px;font-size:.82rem">${t.cat||'??}</span>`;
  document.getElementById('dv-status').innerHTML = statusBadgeMap[t.status]||t.status;
  document.getElementById('dv-owner').textContent = t.owner||'??;
  document.getElementById('dv-start').textContent = t.start_date||'??;
  const overdue = t.due && isOverdue(t.due) && t.status!=='撌脣???;
  const overdueDays = getOverdueDays(t.due);
  const overdueColor = overdueDays > 3 ? 'var(--red)' : 'var(--orange)';
  document.getElementById('dv-due').innerHTML = t.due
    ? `<span style="${overdue?`color:${overdueColor};font-weight:700`:''}">${t.due}${overdue?` ?? 撌脤暹? ${overdueDays} 憭奈:''}</span>`
    : '??;
  const dep = getDependencyTask(t);
  document.getElementById('dv-depends').innerHTML = dep
    ? `<span class="dep-pill">${dep.status==='撌脣????'??撌脣???:'?? ?芸???} #${dep.id} ${dep.name}</span>`
    : '??;
  renderTaskAttachments(id);
  document.getElementById('dv-note').textContent = t.note||'嚗?酉嚗?;
  renderTaskChangeHistory(id);
  // Show view, hide edit
  document.getElementById('detail-view-mode').style.display='block';
  document.getElementById('detail-edit-mode').style.display='none';
  document.getElementById('task-detail-modal').classList.add('open');
}

function openAdjacentTaskDetail(direction) {
  const visibleTasks = getVisibleTaskListForDetail();
  if (!visibleTasks.length || detailTaskId === null) return;
  const index = visibleTasks.findIndex(t => t.id === detailTaskId);
  const nextIndex = index < 0 ? 0 : Math.max(0, Math.min(visibleTasks.length - 1, index + direction));
  if (visibleTasks[nextIndex]?.id && visibleTasks[nextIndex].id !== detailTaskId) openTaskDetail(visibleTasks[nextIndex].id);
}

function getVisibleTaskListForDetail() {
  const rows = [...document.querySelectorAll('#task-tbody tr[data-task-id]')];
  const ids = rows.map(row => Number(row.dataset.taskId)).filter(Number.isFinite);
  if (!ids.length) return state.tasks.filter(t => !t.deleted_at);
  return ids.map(id => state.tasks.find(t => t.id === id)).filter(Boolean);
}

function switchToEditMode() {
  const t = state.tasks.find(t=>t.id===detailTaskId);
  if(!t) return;
  const ownerSearch = document.getElementById('de-owner-search');
  if (ownerSearch) ownerSearch.value = '';
  rebuildTaskOwnerSelects(t.owner || '');
  document.getElementById('de-name').value = t.name;
  document.getElementById('de-cat').value = t.cat;
  document.getElementById('de-status').value = t.status;
  document.getElementById('de-owner').value = t.owner||'';
  document.getElementById('de-start').value = t.start_date||'';
  document.getElementById('de-due').value = t.due||'';
  document.getElementById('de-note').value = t.note||'';
  renderDependencyOptions('de-depends', detailTaskId);
  document.getElementById('de-depends').value = t.depends_on || '';
  updateDetailDurationLabel();
  document.getElementById('detail-view-mode').style.display='none';
  document.getElementById('detail-edit-mode').style.display='block';
}

function switchToViewMode() {
  document.getElementById('detail-view-mode').style.display='block';
  document.getElementById('detail-edit-mode').style.display='none';
  openTaskDetail(detailTaskId); // refresh view
}

function updateDetailDurationLabel() {
  const s = document.getElementById('de-start').value;
  const d = document.getElementById('de-due').value;
  const el = document.getElementById('de-duration-label');
  if(s && d) {
    const diff = Math.round((new Date(d)-new Date(s))/86400000);
    el.textContent = diff>=0 ? `????${diff} 憭奈 : '?? 韏瑕??交??潭甇Ｘ';
    el.style.color = diff<0?'var(--red)':'#555';
  } else { el.textContent=''; }
}

async function saveDetailTask() {
  const before = {...state.tasks.find(x=>x.id===detailTaskId)};
  const t = {
    name: document.getElementById('de-name').value.trim(),
    cat: document.getElementById('de-cat').value,
    status: document.getElementById('de-status').value,
    owner: document.getElementById('de-owner').value.trim(),
    start_date: document.getElementById('de-start').value||null,
    due: document.getElementById('de-due').value||null,
    note: document.getElementById('de-note').value.trim(),
    depends_on: document.getElementById('de-depends').value ? Number(document.getElementById('de-depends').value) : null,
    season: currentSeason,
    sort_order: before.sort_order || 0,
  };
  const validation = validateTaskForm(t);
  if(!validation.ok) { alert(validation.message); return; }
  if (t.depends_on && !taskSchema.depends_on) {
    alert('閬摮?蝵桐遙??隢??啜B 閮剖???鋆賭蒂?瑁??啁? SQL嚗asks.depends_on 甈?嚗?);
    return;
  }
  if (t.depends_on && hasDependencyCycle(detailTaskId, t.depends_on)) {
    alert('?蔭隞餃?銝敶Ｘ?敺芰靘陷嚗??豢??嗡?隞餃???);
    return;
  }
  await db.from('tasks').update(buildTaskPayload(t)).eq('id', detailTaskId);
  const i = state.tasks.findIndex(x=>x.id===detailTaskId);
  if(i>=0) state.tasks[i] = {...state.tasks[i],...t};
  await writeAuditLog('update', 'tasks', detailTaskId, before, state.tasks[i]);
  document.getElementById('detail-modal-title').textContent = t.name;
  refreshAfterTaskChange(false);
  switchToViewMode();
  showToast('??隞餃?撌脫??);
}

async function deleteTaskFromDetail() {
  if(!confirm('蝣箄??芷甇支遙??')) return;
  await softDeleteTask(detailTaskId);
  closeModal('task-detail-modal');
  refreshAfterTaskChange();
  showToast('?? 隞餃?撌脣??);
}

/**
 * 皜脫?隞餃?閰單?銝剔??辣?”?? * @param {number} taskId 隞餃? ID?? */
function renderTaskAttachments(taskId) {
  const el = document.getElementById('dv-attachments');
  if (!el) return;
  if (!attachmentsAvailable) {
    el.innerHTML = '<div style="font-size:.8rem;color:#888">撠??辣銵具??具B 閮剖??銵??SQL嚗蒂撱箇? Supabase Storage bucket嚗ask-attachments??/div>';
    return;
  }
  const files = state.attachments.filter(a => Number(a.task_id) === Number(taskId));
  el.innerHTML = files.length ? `<div class="attachment-list">${files.map(file => `
    <div class="attachment-item">
      <a href="${file.public_url}" target="_blank" title="${escapeHtml(file.file_name)}">?? ${escapeHtml(file.file_name)}</a>
      <button class="btn btn-sm btn-danger" onclick="deleteTaskAttachment(${file.id})">?芷</button>
    </div>
  `).join('')}</div>` : '<div style="font-size:.8rem;color:#999">撠?辣</div>';
}

/**
 * 銝?桀?閰單?隞餃???隞嗉 Supabase Storage?? */
async function uploadTaskAttachment() {
  const input = document.getElementById('task-attachment-file');
  const file = input?.files?.[0];
  if (!file || !detailTaskId) return;
  if (!attachmentsAvailable) {
    alert('?辣?撠????具B 閮剖??銵??SQL嚗蒂撱箇? Supabase Storage bucket嚗ask-attachments??);
    input.value = '';
    return;
  }
  const safeName = file.name.replace(/[^\w.\-\u4e00-\u9fa5]/g, '_');
  const path = `${detailTaskId}/${Date.now()}_${safeName}`;
  try {
    showToast('???辣銝銝凌?);
    const { error: uploadError } = await db.storage.from('task-attachments').upload(path, file, { upsert: false });
    if (uploadError) throw uploadError;
    const { data: urlData } = db.storage.from('task-attachments').getPublicUrl(path);
    const row = {
      task_id: detailTaskId,
      file_name: file.name,
      file_path: path,
      public_url: urlData.publicUrl,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream'
    };
    const { data, error } = await db.from('task_attachments').insert([row]).select().single();
    if (error) throw error;
    if (data) state.attachments.unshift(data);
    renderTaskAttachments(detailTaskId);
    showToast('???辣撌脖???);
  } catch(e) {
    alert('?辣銝憭望?嚗? + e.message + '\n\n隢Ⅱ隤?Storage bucket?ask-attachments?歇撱箇?銝 public嚗蒂撌脣銵?DB 閮剖? SQL??);
  } finally {
    input.value = '';
  }
}

/**
 * ?芷隞餃??辣??Storage 瑼??? * @param {number} attachmentId ?辣 ID?? */
async function deleteTaskAttachment(attachmentId) {
  const file = state.attachments.find(a => a.id === attachmentId);
  if (!file || !confirm('蝣箄??芷甇日?隞塚?')) return;
  try {
    await db.storage.from('task-attachments').remove([file.file_path]);
    const { error } = await db.from('task_attachments').delete().eq('id', attachmentId);
    if (error) throw error;
    state.attachments = state.attachments.filter(a => a.id !== attachmentId);
    renderTaskAttachments(detailTaskId);
    showToast('?? ?辣撌脣??);
  } catch(e) {
    alert('?芷?辣憭望?嚗? + e.message);
  }
}

// ????????????????????????????????????????????????????????// MEMBERS  ??CRUD
// ????????????????????????????????????????????????????????function setMemberDbStatus(type, msg='') {
  const el = document.getElementById('member-db-status');
  if (!el) return;
  if (type === 'ok') {
    el.style.display = 'none';
  } else {
    el.style.display = 'block';
    el.style.background = '#FFF3CD';
    el.style.border = '1px solid #FFCA28';
    el.style.color = '#7B5800';
    el.innerHTML = `?? <strong>members table ????啣虜</strong>嚗?＊蝷粹?閮剛???靽格銝??脣?嚗?br><small style="opacity:.8">?航炊嚗?{msg}</small><br><small>隢??喃?閫??DB 閮剖??遣蝡?table 敺??唳??/small>`;
  }
}

function renderMembers() {
  const search = (document.getElementById('member-search')||{}).value||'';
  const canadaFilter = (document.getElementById('member-filter-canada')||{}).value||'';

  let list = state.members.filter(m => {
    const matchSearch = !search || m.name.includes(search) || (m.role||''). includes(search);
    const matchCanada = !canadaFilter || (m.canada||'').includes(canadaFilter.trim());
    return matchSearch && matchCanada;
  });

  const canadaIcon = {'??蝣箄???':'ms-confirmed','??敺???:'ms-pending','???蝯?蝣箄?':'ms-pending','??銝銵?:'ms-no'};

  document.getElementById('member-count').textContent = `??${state.members.length} 雿??︶;
  const grid = document.getElementById('member-grid');
  const empty = document.getElementById('member-empty');

  if (list.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    renderMemberRoleView([]);
    renderHandoffCards();
    return;
  }
  empty.style.display = 'none';
  renderMemberRoleView(list);

  // Link tasks from state.tasks where owner matches member name
  const getLinkedTasks = (name) => {
    return state.tasks.filter(t => {
      const owners = (t.owner||'').split(/[+\/,?/).map(o=>o.trim());
      return owners.some(o => o.includes(name) || name.includes(o));
    });
  };

  grid.innerHTML = list.map(m => {
    const statusCls = canadaIcon[m.canada]||'ms-pending';
    const linked = getLinkedTasks(m.name);
    const doneCount = linked.filter(t=>t.status==='撌脣???).length;
    const progress = linked.length ? `${doneCount}/${linked.length} 摰?` : '';
    // Use member's own core tasks (from members.tasks) as primary list
    const coreList = Array.isArray(m.tasks) ? m.tasks : [];
    // Show linked tasks from tasks table grouped by status
    const pendingLinked = linked.filter(t=>t.status!=='撌脣???);
    const doneLinked = linked.filter(t=>t.status==='撌脣???);
    return `
    <div class="member-card">
      <div class="member-card-actions">
        <button class="btn btn-sm btn-primary" onclick="editMember(${m.id})" title="蝺刻摩?">??</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMember(${m.id})" title="?芷?">??</button>
      </div>
      <div class="member-name">? ${m.name}</div>
      <div class="member-role">${m.role||'嚗閮剖?閫嚗?}</div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span class="member-status ${statusCls}">?憭改?${m.canada||'?芰'}</span>
        ${progress ? `<span style="font-size:.72rem;background:#E3F2FD;color:#1565C0;padding:1px 7px;border-radius:10px">?? ${progress}</span>` : ''}
      </div>
      ${coreList.length ? `
      <div class="member-tasks-list" style="margin-top:8px">
        <div style="font-size:.75rem;color:#888;margin-bottom:4px">?? ?詨?隞餃?嚗?/div>
        ${coreList.map(t=>`<div class="task-item">??${t}</div>`).join('')}
      </div>` : ''}
      ${linked.length ? `
      <div style="margin-top:8px;border-top:1px solid #eee;padding-top:8px">
        <div style="font-size:.75rem;color:#888;margin-bottom:4px">?? 隞餃?銵刻?鞎祇??殷?${linked.length}??嚗?/div>
        ${pendingLinked.map(t=>`<div style="font-size:.75rem;padding:2px 0;color:#333">??${t.name}</div>`).join('')}
        ${doneLinked.map(t=>`<div style="font-size:.75rem;padding:2px 0;color:#aaa;text-decoration:line-through">??${t.name}</div>`).join('')}
      </div>` : ''}
      ${m.note ? `<div style="margin-top:6px;font-size:.75rem;color:var(--orange);background:#FFF3E0;padding:4px 8px;border-radius:4px">?? ${m.note}</div>` : ''}
    </div>`;
  }).join('');
  renderHandoffCards();
}

function getMemberRoleBucket(member) {
  const text = `${member.role || ''} ${(member.tasks || []).join(' ')}`.toLowerCase();
  if (/pilot|?|driver|rov/.test(text)) return 'Pilot';
  if (/撌亦?|mechanic|mechanical|electronic|?誡璈１|software|蝖砌辣|hardware|prop|motor|camera|bd|lp/.test(text)) return '撌亦?';
  if (/presentation|蝪∪|瞍?|speaker|ceo|poster|qa|q&a/.test(text)) return 'Presentation';
  if (/?湧?|onshore|offshore|coach|?|閮?|runner|contact|?矽/.test(text)) return '?湧?';
  return '敺?';
}

function renderMemberRoleView(list) {
  const el = document.getElementById('member-role-view');
  if (!el) return;
  const groups = ['Pilot','撌亦?','Presentation','?湧?','敺?'].map(label => ({ label, members:[] }));
  list.forEach(member => {
    const bucket = getMemberRoleBucket(member);
    const group = groups.find(g => g.label === bucket) || groups[groups.length - 1];
    group.members.push(member);
  });
  el.innerHTML = groups.map(group => `
    <div class="member-role-group">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:5px">
        <strong style="color:var(--navy)">${group.label}</strong>
        <span class="badge ${group.members.length ? 'done' : 'mid'}">${group.members.length}</span>
      </div>
      ${group.members.length ? group.members.map(member => `
        <button class="member-role-chip" onclick="editMember(${member.id})" title="蝺刻摩 ${escapeHtml(member.name)}">
          ${escapeHtml(member.name)}
        </button>
      `).join('') : '<div style="font-size:.8rem;color:var(--muted);font-weight:800">?芸???/div>'}
    </div>
  `).join('');
}

function openAddMember() {
  editingMemberId = null;
  memberTaskItems = [];
  document.getElementById('member-modal-title').textContent = '?啣??';
  ['mm-name','mm-role','mm-note'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('mm-canada').value = '??敺???;
  document.getElementById('mm-task-input').value = '';
  renderMemberTaskList();
  document.getElementById('member-modal').classList.add('open');
}

function editMember(id) {
  const m = state.members.find(x=>x.id===id);
  if (!m) return;
  editingMemberId = id;
  memberTaskItems = [...(m.tasks||[])];
  document.getElementById('member-modal-title').textContent = '蝺刻摩?嚗? + m.name;
  document.getElementById('mm-name').value = m.name;
  document.getElementById('mm-role').value = m.role||'';
  document.getElementById('mm-canada').value = m.canada||'??敺???;
  document.getElementById('mm-note').value = m.note||'';
  document.getElementById('mm-task-input').value = '';
  renderMemberTaskList();
  document.getElementById('member-modal').classList.add('open');
}

function renderMemberTaskList() {
  const el = document.getElementById('member-tasks-list-edit');
  if (!memberTaskItems.length) { el.innerHTML = '<div style="font-size:.78rem;color:#aaa;margin-bottom:6px">嚗??∩遙??</div>'; return; }
  el.innerHTML = memberTaskItems.map((t,i)=>`
    <div class="task-input-row" style="margin-bottom:4px">
      <input type="text" value="${t.replace(/"/g,'&quot;')}" onchange="memberTaskItems[${i}]=this.value">
      <button onclick="removeMemberTaskItem(${i})" title="?芷甇支遙??>??/button>
    </div>`).join('');
}

function addMemberTaskItem() {
  const inp = document.getElementById('mm-task-input');
  const val = inp.value.trim();
  if (!val) return;
  memberTaskItems.push(val);
  inp.value = '';
  renderMemberTaskList();
  inp.focus();
}

function removeMemberTaskItem(idx) {
  memberTaskItems.splice(idx, 1);
  renderMemberTaskList();
}

async function saveMember() {
  const name = document.getElementById('mm-name').value.trim();
  if (!name) { alert('隢撓?交??∪???); return; }
  const data = {
    name,
    role: document.getElementById('mm-role').value.trim(),
    canada: document.getElementById('mm-canada').value,
    tasks: JSON.stringify(memberTaskItems),
    note: document.getElementById('mm-note').value.trim(),
  };
  if (optionalSchema.membersSeason) data.season = currentSeason;

  if (editingMemberId) {
    const { error } = await db.from('members').update(data).eq('id', editingMemberId);
    if (error) {
      alert('???湔憭望?嚗? + error.message + '\n\n?亥??臬 RLS / policy嚗??????DB 閮剖??銵撋?SQL ??RLS policy 畾菔');
      return;
    }
    const idx = state.members.findIndex(x=>x.id===editingMemberId);
    if (idx>=0) state.members[idx] = parseMemberTasks({ ...state.members[idx], ...data });
  } else {
    const { data: row, error } = await db.from('members').insert([data]).select().single();
    if (error) {
      alert('???啣?憭望?嚗? + error.message + '\n\n隢Ⅱ隤?\n1. members table 撌脣遣蝡n2. ?亦 RLS嚗????DB 閮剖??銵?SQL ??RLS policy 畾菔\n\n隢????DB 閮剖???????單?閮箸??????底??);
      return;
    }
    if (row) state.members.push(parseMemberTasks(row));
  }
  closeModal('member-modal');
  markDirty('members');
  renderMembers();
  showToast(editingMemberId ? '???鞈?撌脫?? : '???唳??∪歇?啣?');
}

async function deleteMember(id) {
  const m = state.members.find(x=>x.id===id);
  if (!m) return;
  if (!confirm(`蝣箄??芷???{m.name}??甇斗?雿瘜儔?)) return;
  const { error } = await db.from('members').delete().eq('id', id);
  if (error) { alert('???芷憭望?嚗? + error.message); return; }
  if (!error) {
    state.members = state.members.filter(x=>x.id!==id);
    renderMembers();
    showToast('?? ?撌脣??);
  } else {
    alert('?芷憭望?嚗?蝔??岫');
  }
}

// ????????????????????????????????????????????????????????// CHECKLIST
// ????????????????????????????????????????????????????????function renderChecklist() {
  const total = state.checklist.reduce((s,sec)=>s+sec.items.length,0);
  const done = state.checklist.reduce((s,sec)=>s+sec.items.filter(i=>i.done).length,0);
  document.getElementById('check-progress-label').textContent = `${done} / ${total} 撌脣??;
  renderChecklistEditorSections();

  const secClass = {A:'sec-A',B:'sec-B',C:'sec-C',D:'sec-D',E:'sec-E',F:'sec-F'};
  document.getElementById('checklist-container').innerHTML = state.checklist.map(sec=>`
    <div class="check-section ${secClass[sec.sec]||''}">
      <h3>${sec.secName}</h3>
      <div class="check-items" data-sec="${sec.sec}">
      ${sec.items.map(item=>`
        <div class="check-item ${item.done?'checked':''}" id="ci-${item.id}" data-item-id="${item.id}">
          <span class="drag-handle" title="???">??/span>
          <input type="checkbox" ${item.done?'checked':''} onchange="toggleCheck('${item.id}')">
          <span class="check-qty" title="?賊?">?${normalizeChecklistQty(item.qty)}</span>
          <label for="cb-${item.id}" onclick="toggleCheck('${item.id}')">${escapeHtml(item.text)}</label>
          <span class="check-owner">? ${escapeHtml(item.owner || '')}</span>
          <span class="check-time">??${escapeHtml(item.time || '')}</span>
          <span style="margin-left:auto;display:flex;gap:5px">
            <button class="btn btn-sm" onclick="event.stopPropagation(); editChecklistItem('${item.id}')">蝺刻摩</button>
            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteChecklistItem('${item.id}')">?芷</button>
          </span>
        </div>`).join('')}
      </div>
    </div>`).join('');
  initChecklistSortables();
}

/**
 * 皜脫? Checklist 蝺刻摩?典?畾菟?? */
function renderChecklistEditorSections() {
  const select = document.getElementById('check-sec');
  if (!select) return;
  const current = select.value;
  select.innerHTML = state.checklist.map(sec => `<option value="${escapeHtml(sec.sec)}">${escapeHtml(sec.secName)}</option>`).join('');
  if (current && [...select.options].some(opt => opt.value === current)) select.value = current;
}

async function toggleCheck(id) {
  let newDone;
  state.checklist.forEach(sec=>sec.items.forEach(item=>{ if(item.id===id){ item.done=!item.done; newDone=item.done; } }));
  try {
    await db.from('checklist_items').update({ done: newDone }).eq('item_id', id);
  } catch(e) {
    console.warn('Checklist toggle saved locally only:', e.message);
  }
  saveLocalChecklist();
  markDirty(['checklist','prep']);
  renderChecklist();
}

async function resetChecklist() {
  if(!confirm('蝣箄??蔭???賊??殷?')) return;
  state.checklist.forEach(sec=>sec.items.forEach(item=>item.done=false));
  try {
    await db.from('checklist_items').update({ done: false }).gte('order_index', 0);
  } catch(e) {
    console.warn('Checklist reset saved locally only:', e.message);
  }
  saveLocalChecklist();
  markDirty(['checklist','prep']);
  renderChecklist();
}

/**
 * ?? Checklist 蝺刻摩?? */
function cancelChecklistEdit() {
  editingChecklistItemId = null;
  ['check-text','check-owner','check-time'].forEach(id => document.getElementById(id).value = '');
  const qtyEl = document.getElementById('check-qty');
  if (qtyEl) qtyEl.value = '1';
  document.getElementById('check-editor-title').textContent = '嚗??啣? / ?湔閮剖?皜?';
  document.getElementById('check-save-btn').textContent = '嚗??啣?';
}

/**
 * 銝?萄??交??湔 2026 MATE Float / Non-ROV Device ?抵?璅⊥?? */
async function applyFloatChecklistTemplate() {
  let sec = state.checklist.find(s => s.sec === FLOAT_CHECKLIST_TEMPLATE.sec);
  if (!sec) {
    sec = { sec:FLOAT_CHECKLIST_TEMPLATE.sec, secName:FLOAT_CHECKLIST_TEMPLATE.secName, items:[] };
    state.checklist.push(sec);
  }
  let added = 0;
  let updated = 0;
  for (const template of FLOAT_CHECKLIST_TEMPLATE.items) {
    const existing = sec.items.find(item => item.id === template.id);
    if (existing) {
      existing.text = template.text;
      existing.qty = normalizeChecklistQty(template.qty);
      existing.owner = template.owner;
      existing.time = template.time;
      updated++;
      await persistChecklistItem({
        item_id:existing.id,
        sec:sec.sec,
        sec_name:sec.secName,
        text:existing.text,
        qty:normalizeChecklistQty(existing.qty),
        owner:existing.owner,
        time:existing.time,
        done:Boolean(existing.done),
        order_index:getChecklistOrderIndex(existing.id)
      }, true);
      continue;
    }
    const item = { ...template, done:false };
    sec.items.push(item);
    added++;
    await persistChecklistItem({
      item_id:item.id,
      sec:sec.sec,
      sec_name:sec.secName,
      text:item.text,
      qty:normalizeChecklistQty(item.qty),
      owner:item.owner,
      time:item.time,
      done:false,
      order_index:getChecklistFlatItems().length - 1
    }, false);
  }
  saveLocalChecklist();
  markDirty(['checklist','prep']);
  renderChecklist();
  showToast(added || updated ? `??2026 Float ?抵?撌脣?甇伐??啣? ${added} ???湔 ${updated} ? : '?對? 2026 Float ?抵?璅⊥撌脣???);
}

/**
 * ?曉 Checklist ???撅砍?畾萸? * @param {string} id Checklist item_id?? * @returns {{sec:object,item:object}|null} ?交蝯??? */
function findChecklistItem(id) {
  for (const sec of state.checklist) {
    const item = sec.items.find(x => x.id === id);
    if (item) return { sec, item };
  }
  return null;
}

/**
 * 撠?Checklist ?頛蝺刻摩?具? * @param {string} id Checklist item_id?? */
function editChecklistItem(id) {
  const found = findChecklistItem(id);
  if (!found) return;
  editingChecklistItemId = id;
  document.getElementById('check-sec').value = found.sec.sec;
  document.getElementById('check-text').value = found.item.text || '';
  document.getElementById('check-owner').value = found.item.owner || '';
  document.getElementById('check-time').value = found.item.time || '';
  const qtyEl = document.getElementById('check-qty');
  if (qtyEl) qtyEl.value = String(normalizeChecklistQty(found.item.qty));
  document.getElementById('check-editor-title').textContent = '?? ?湔閮剖?皜?';
  document.getElementById('check-save-btn').textContent = '?脣??湔';
  document.getElementById('check-text').focus();
}

/**
 * ?啣????Checklist ??? */
async function saveChecklistItem() {
  const secId = document.getElementById('check-sec').value;
  const targetSec = state.checklist.find(sec => sec.sec === secId) || state.checklist[0];
  const text = document.getElementById('check-text').value.trim();
  const owner = document.getElementById('check-owner').value.trim();
  const time = document.getElementById('check-time').value.trim();
  const qty = normalizeChecklistQty(document.getElementById('check-qty')?.value);
  if (!text) { showToast('隢撓?亥身???桅???); return; }
  if (!targetSec) { showToast('?曆??啗身???桀?畾?); return; }

  if (editingChecklistItemId) {
    const found = findChecklistItem(editingChecklistItemId);
    if (!found) return;
    found.sec.items = found.sec.items.filter(item => item.id !== editingChecklistItemId);
    const updated = { ...found.item, text, owner, time, qty };
    targetSec.items.push(updated);
    await persistChecklistItem({
      item_id: updated.id,
      sec: targetSec.sec,
      sec_name: targetSec.secName,
      text,
      qty,
      owner,
      time,
      done: updated.done,
      order_index: getChecklistOrderIndex(updated.id)
    }, true);
  } else {
    const item = { id: `${targetSec.sec.toLowerCase()}-${Date.now()}`, text, qty, owner, time, done:false };
    targetSec.items.push(item);
    await persistChecklistItem({
      item_id: item.id,
      sec: targetSec.sec,
      sec_name: targetSec.secName,
      text,
      qty,
      owner,
      time,
      done:false,
      order_index: getChecklistFlatItems().length - 1
    }, false);
  }
  saveLocalChecklist();
  cancelChecklistEdit();
  markDirty(['checklist','prep']);
  renderChecklist();
  showToast('???魚閮剖?皜撌脫??);
}

/**
 * 撠?Checklist ?撖怠 Supabase嚗仃??靽??砍?湔?? * @param {object} row checklist_items row?? * @param {boolean} isUpdate ?臬?箸?啜? */
async function persistChecklistItem(row, isUpdate) {
  try {
    if (isUpdate) {
      const { error } = await db.from('checklist_items').update({
        sec: row.sec, sec_name: row.sec_name, text: row.text, qty: normalizeChecklistQty(row.qty), owner: row.owner, time: row.time, done: row.done, order_index: row.order_index
      }).eq('item_id', row.item_id);
      if (error) throw error;
    } else {
      const payload = { ...row, qty: normalizeChecklistQty(row.qty) };
      const { error } = await db.from('checklist_items').insert([payload]);
      if (error) throw error;
    }
  } catch(e) {
    console.warn('Checklist item saved locally only:', e.message);
    showToast('?? 閮剖?皜撌脫?唳?堆??亥??脩垢靽?隢炎??DB/RLS');
  }
}

/**
 * ?芷 Checklist ??? * @param {string} id Checklist item_id?? */
async function deleteChecklistItem(id) {
  const found = findChecklistItem(id);
  if (!found) return;
  if (!confirm(`蝣箄??芷??{found.item.text}??`)) return;
  found.sec.items = found.sec.items.filter(item => item.id !== id);
  try {
    const { error } = await db.from('checklist_items').delete().eq('item_id', id);
    if (error) throw error;
  } catch(e) {
    console.warn('Checklist delete saved locally only:', e.message);
    showToast('?? 閮剖?皜撌脫?啣?歹??亥??脩垢靽?隢炎??DB/RLS');
  }
  saveLocalChecklist();
  if (editingChecklistItemId === id) cancelChecklistEdit();
  markDirty(['checklist','prep']);
  renderChecklist();
}

/**
 * 撅像 Checklist ??? * @returns {Array<object>} 撅像??? */
function getChecklistFlatItems() {
  return state.checklist.flatMap(sec => sec.items.map(item => ({ sec, item })));
}

/**
 * ?? Checklist ????摨揣撘? * @param {string} id Checklist item_id?? * @returns {number} ??蝝Ｗ??? */
function getChecklistOrderIndex(id) {
  return Math.max(0, getChecklistFlatItems().findIndex(row => row.item.id === id));
}

/**
 * ????Checklist ????? */
function initChecklistSortables() {
  sortableInstances.checklist.forEach(s => s.destroy());
  sortableInstances.checklist = [];
  if (typeof Sortable === 'undefined') return;
  document.querySelectorAll('.check-items').forEach(container => {
    sortableInstances.checklist.push(new Sortable(container, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: saveChecklistOrderFromDom
    }));
  });
}

/**
 * 靘?DOM ??靽? Checklist order_index?? */
async function saveChecklistOrderFromDom() {
  const updates = [];
  let order = 0;
  document.querySelectorAll('.check-items').forEach(container => {
    const sec = state.checklist.find(s => s.sec === container.dataset.sec);
    if (!sec) return;
    const ids = [...container.querySelectorAll('.check-item')].map(el => el.dataset.itemId);
    sec.items = ids.map(id => sec.items.find(item => item.id === id)).filter(Boolean);
    ids.forEach(id => updates.push({ id, order_index: order++ }));
  });
  try {
    await Promise.all(updates.map(u => db.from('checklist_items').update({ order_index: u.order_index }).eq('item_id', u.id)));
  } catch(e) {
    console.warn('Checklist order saved locally only:', e.message);
  }
  saveLocalChecklist();
  markDirty(['checklist','prep']);
  showToast('??閮剖?皜??撌脫??);
}

/**
 * 撠?Checklist 撅像??鞈?嚗? CSV ???啁??梁?? * @returns {Array<object>} Checklist ???? */
function getOwnerUsageRows() {
  const rows = new Map();
  const ensure = (name, source = '') => {
    const key = String(name || '').trim();
    if (!key) return null;
    if (!rows.has(key)) rows.set(key, { name:key, source:new Set(), tasks:0, open:0, overdue:0, blocked:0, checklist:0, predive:0, gear:0, runs:0, pressure:0 });
    const row = rows.get(key);
    if (source) row.source.add(source);
    return row;
  };
  getOwnerSettings().forEach(name => ensure(name, '閮剖?'));
  (state.members || []).forEach(member => {
    ensure(member.name, '?');
    ensure(member.role, '閫');
  });
  (state.tasks || []).forEach(task => {
    const row = ensure(task.owner, '隞餃?');
    if (!row) return;
    const isDone = String(task.status || '').includes('摰?');
    row.tasks++;
    if (!isDone) {
      row.open++;
      row.pressure += 1;
      if (String(task.cat || '').includes('蝺?)) row.pressure += 3;
      else if (String(task.cat || '').includes('擃?)) row.pressure += 2;
    }
    if (!isDone && isOverdue(task.due)) { row.overdue++; row.pressure += 4; }
    if (!isDone && isTaskLocked(task)) { row.blocked++; row.pressure += 3; }
  });
  (state.checklist || []).flatMap(sec => sec.items || []).forEach(item => {
    const row = ensure(item.owner, 'Checklist');
    if (row) row.checklist++;
  });
  (state.prediveChecklist || []).flatMap(sec => sec.items || []).forEach(item => {
    const row = ensure(item.owner, 'Pre-Dive');
    if (row) row.predive++;
  });
  (state.gearItems || []).forEach(item => {
    const row = ensure(item.owner, '?抵?');
    if (row) row.gear++;
  });
  (state.missionRuns || []).forEach(run => {
    const row = ensure(run.pilot, 'Run');
    if (row) row.runs++;
  });
  return [...rows.values()].sort((a, b) => b.pressure - a.pressure || a.name.localeCompare(b.name, 'zh-Hant'));
}

function renderOwnerSettingsPanel() {
  const list = document.getElementById('owner-settings-list');
  const compare = document.getElementById('owner-settings-compare');
  const count = document.getElementById('owner-settings-count');
  if (!list || !compare) return;
  const configured = getOwnerSettings();
  list.innerHTML = configured.length
    ? configured.map(name => `<span class="owner-chip">${escapeHtml(name)} <button onclick="removeOwnerSetting('${escapeAttr(name)}')" title="蝘駁">x</button></span>`).join('')
    : '<span style="font-size:.82rem;color:var(--muted)">撠撱箇??箏?鞎痊鈭箝???啣?嚗?敺????乓?/span>';
  const rows = getOwnerUsageRows();
  if (count) count.textContent = `${configured.length} ?摰??/ ${rows.length} ?歇?菜葫?賊?`;
  compare.innerHTML = rows.length ? `
    <table>
      <thead><tr><th>鞎痊鈭?/th><th>憯?</th><th>靘?</th><th>隞餃?</th><th>?脰?銝?/th><th>?暹?</th><th>?餃?</th><th>皜</th><th>?抵?</th><th>Run</th></tr></thead>
      <tbody>${rows.map(row => `
        <tr>
          <td style="font-weight:900">${escapeHtml(row.name)}</td>
          <td style="font-weight:900;color:${row.pressure >= 12 ? 'var(--red)' : row.pressure >= 7 ? 'var(--orange)' : 'var(--green)'}">${row.pressure}</td>
          <td>${[...row.source].map(src => `<span class="owner-source-badge">${escapeHtml(src)}</span>`).join(' ')}</td>
          <td>${row.tasks}</td>
          <td>${row.open}</td>
          <td style="color:${row.overdue ? 'var(--red)' : 'inherit'};font-weight:900">${row.overdue}</td>
          <td style="color:${row.blocked ? '#7030A0' : 'inherit'};font-weight:900">${row.blocked}</td>
          <td>${row.checklist + row.predive}</td>
          <td>${row.gear}</td>
          <td>${row.runs}</td>
        </tr>`).join('')}</tbody>
    </table>` : '<div style="padding:12px;color:var(--muted)">撠鞎痊鈭箄???/div>';
}

function addOwnerSetting() {
  const input = document.getElementById('owner-setting-input');
  const value = String(input?.value || '').trim();
  if (!value) return;
  saveOwnerSettings([...getOwnerSettings(), value]);
  if (input) input.value = '';
  renderOwnerSettingsPanel();
  refreshOwnerSettingsConsumers();
  showToast('鞎痊鈭箏歇?銝??詨');
}

function addCurrentTaskOwnerToSettings(targetId = 'm-owner') {
  const el = document.getElementById(targetId);
  const value = String(el?.value || '').trim();
  if (!value) {
    showToast('隢?頛詨???鞎砌犖');
    return;
  }
  saveOwnerSettings([...getOwnerSettings(), value]);
  refreshOwnerSettingsConsumers();
  renderOwnerSelect(targetId, '?豢?鞎痊鈭?, value);
  showToast('撌脣??亥?鞎砌犖閮剖??”');
}

function isInvalidOwnerValue(value) {
  const text = String(value || '').trim();
  return !text || /^\d+$/.test(text);
}

function cleanInvalidOwnerData() {
  if (!confirm('??隞餃??hecklist?re-Dive?鞈葉?征?賣?蝝摮?鞎砌犖皜征嚗?衣匱蝥?')) return;
  let changed = 0;
  const clean = item => {
    if (item && isInvalidOwnerValue(item.owner)) {
      item.owner = '';
      changed++;
    }
  };
  (state.tasks || []).forEach(clean);
  (state.gearItems || []).forEach(clean);
  (state.checklist || []).flatMap(sec => sec.items || []).forEach(clean);
  (state.prediveChecklist || []).flatMap(sec => sec.items || []).forEach(clean);
  saveLocalGearItems();
  saveLocalChecklist();
  saveLocalPrediveChecklist();
  normalizeOwnerSettings();
  markDirty(['tasks','checklist','predive-checklist','prep','competition','members']);
  renderPageIfNeeded(currentPage, true);
  showToast(`撌脫???${changed} ?撣貉?鞎砌犖`);
}

function mergeOwnerData() {
  const from = String(document.getElementById('owner-merge-from')?.value || '').trim();
  const to = String(document.getElementById('owner-merge-to')?.value || '').trim();
  if (!from || !to) {
    showToast('隢‵撖怠?雿萎?皞??格?鞎痊鈭?);
    return;
  }
  if (from === to) {
    showToast('靘??璅??銝?閬?雿?);
    return;
  }
  if (!confirm(`????{from}??冽?箝?{to}???臬蝜潛?嚗)) return;
  let changed = 0;
  const merge = item => {
    if (item && String(item.owner || '').trim() === from) {
      item.owner = to;
      changed++;
    }
  };
  (state.tasks || []).forEach(merge);
  (state.gearItems || []).forEach(merge);
  (state.checklist || []).flatMap(sec => sec.items || []).forEach(merge);
  (state.prediveChecklist || []).flatMap(sec => sec.items || []).forEach(merge);
  const nextSettings = getOwnerSettings().map(value => value === from ? to : value);
  saveOwnerSettings([...nextSettings, to]);
  saveLocalGearItems();
  saveLocalChecklist();
  saveLocalPrediveChecklist();
  document.getElementById('owner-merge-from').value = '';
  document.getElementById('owner-merge-to').value = '';
  refreshOwnerSettingsConsumers();
  markDirty(['tasks','checklist','predive-checklist','prep','competition','members']);
  renderPageIfNeeded(currentPage, true);
  showToast(`撌脣?雿?${changed} 蝑?鞎砌犖鞈?`);
}

function removeOwnerSetting(name) {
  saveOwnerSettings(getOwnerSettings().filter(value => value !== name));
  renderOwnerSettingsPanel();
  refreshOwnerSettingsConsumers();
}

function seedOwnerSettingsFromCurrentData() {
  const values = getOwnerOptionValues();
  saveOwnerSettings([...getOwnerSettings(), ...values]);
  renderOwnerSettingsPanel();
  refreshOwnerSettingsConsumers();
  showToast('撌脣??暹?鞈??臬鞎痊鈭粹??);
}

function getChecklistRows() {
  const rows = [];
  state.checklist.forEach(sec => {
    sec.items.forEach((item, index) => {
      rows.push({
        section: sec.secName,
        order: index + 1,
        text: item.text,
        qty: normalizeChecklistQty(item.qty),
        owner: item.owner,
        time: item.time,
        done: item.done ? '撌脣??? : '?芸???
      });
    });
  });
  return rows;
}

/**
 * ?臬?魚閮剖?皜??CSV嚗靘踵?鞈賜?湧蝺撠?鈭活?渡??? */
function exportChecklistCSV() {
  const headers = ['?畾?,'摨?','?','?賊?','鞎痊鈭?,'??','???];
  const rows = getChecklistRows().map(row => [
    csvCell(row.section),
    row.order,
    csvCell(row.text),
    row.qty,
    csvCell(row.owner),
    csvCell(row.time),
    csvCell(row.done)
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCsv(csv, 'ROV_Competition_Gear_List');
  showToast('???魚閮剖?皜 CSV 撌脣??);
}

/**
 * ???魚閮剖?皜????函汗?典??啗?蝒?豢??摮 PDF?? */
function exportChecklistPDF() {
  const total = state.checklist.reduce((s,sec)=>s+sec.items.length,0);
  const done = state.checklist.reduce((s,sec)=>s+sec.items.filter(i=>i.done).length,0);
  const today = new Date().toISOString().split('T')[0];
  const sectionsHtml = state.checklist.map(sec => `
    <section>
      <h2>${escapeHtml(sec.secName)}</h2>
      <table>
        <thead><tr><th style="width:28px">??/th><th>?</th><th style="width:44px">?賊?</th><th style="width:90px">鞎痊鈭?/th><th style="width:90px">??</th><th style="width:70px">???/th></tr></thead>
        <tbody>
          ${sec.items.map(item => `
            <tr>
              <td class="box">${item.done ? '?? : ''}</td>
              <td>${escapeHtml(item.text)}</td>
              <td style="text-align:center;font-weight:800">${normalizeChecklistQty(item.qty)}</td>
              <td>${escapeHtml(item.owner || '')}</td>
              <td>${escapeHtml(item.time || '')}</td>
              <td>${item.done ? '撌脣??? : '?芸???}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `).join('');
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast('?? ?汗?典????閬?嚗??迂敶閬?敺?閰?);
    return;
  }
  printWindow.document.write(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<title>ROV ?魚閮剖?皜 ${today}</title>
<style>
  body { font-family: 'Segoe UI', 'PingFang TC', sans-serif; color:#111; margin:24px; }
  h1 { color:#1F3864; font-size:22px; margin:0 0 6px; }
  .meta { color:#666; font-size:12px; margin-bottom:18px; }
  h2 { font-size:15px; color:#2F5496; border-left:4px solid #2F5496; padding-left:8px; margin:18px 0 8px; }
  table { width:100%; border-collapse:collapse; font-size:12px; page-break-inside:auto; }
  tr { page-break-inside:avoid; page-break-after:auto; }
  th { background:#1F3864; color:#fff; text-align:left; padding:6px; }
  td { border:1px solid #D0D7E3; padding:6px; vertical-align:top; }
  .box { text-align:center; font-weight:700; font-size:14px; }
  @media print {
    body { margin:12mm; }
    button { display:none; }
  }
</style>
</head>
<body>
  <button onclick="window.print()" style="float:right;padding:8px 14px;background:#2F5496;color:#fff;border:0;border-radius:6px;cursor:pointer">? / ?血???PDF</button>
  <h1>ROV ?魚閮剖?皜</h1>
  <div class="meta">?臬?交?嚗?{today}?摰??脣漲嚗?{done} / ${total}</div>
  ${sectionsHtml}
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 200); }<\/script>
</body>
</html>`);
  printWindow.document.close();
}

// ????????????????????????????????????????????????????????// PRE-DIVE CHECKLIST嚗?鞈賣芋撘?
// ????????????????????????????????????????????????????????
/**
 * 蝜芾ˊ Pre-Dive Checklist ???交偌?炎?伐??? */
function renderPrediveChecklist() {
  const total = state.prediveChecklist.reduce((s,sec)=>s+sec.items.length,0);
  const done = state.prediveChecklist.reduce((s,sec)=>s+sec.items.filter(i=>i.done).length,0);
  const labelEl = document.getElementById('predive-check-progress-label');
  if (labelEl) labelEl.textContent = `${done} / ${total} 撌脣??;
  renderPrediveChecklistEditorSections();

  const secClass = {A:'sec-A',B:'sec-B',C:'sec-C',D:'sec-D',E:'sec-E',F:'sec-F'};
  const container = document.getElementById('predive-checklist-container');
  if (!container) return;
  container.innerHTML = state.prediveChecklist.map(sec=>`
    <div class="check-section ${secClass[sec.sec]||''}">
      <h3>${sec.secName}</h3>
      <div class="predive-check-items" data-sec="${sec.sec}">
      ${sec.items.map(item=>`
        <div class="check-item ${item.done?'checked':''}" id="pci-${item.id}" data-item-id="${item.id}">
          <span class="drag-handle" title="???">??/span>
          <input type="checkbox" id="cb-pd-${item.id}" ${item.done?'checked':''} onchange="togglePrediveCheck('${item.id}')">
          <span class="check-qty" title="?賊?">?${normalizeChecklistQty(item.qty)}</span>
          <label for="cb-pd-${item.id}" onclick="togglePrediveCheck('${item.id}')">${escapeHtml(item.text)}</label>
          <span class="check-owner">? ${escapeHtml(item.owner || '')}</span>
          <span class="check-time">??${escapeHtml(item.time || '')}</span>
          <span style="margin-left:auto;display:flex;gap:5px">
            <button class="btn btn-sm" onclick="event.stopPropagation(); editPrediveChecklistItem('${item.id}')">蝺刻摩</button>
            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deletePrediveChecklistItem('${item.id}')">?芷</button>
          </span>
        </div>`).join('')}
      </div>
    </div>`).join('');
  initPrediveChecklistSortables();
}

/**
 * 皜脫? Pre-Dive 蝺刻摩?典?畾萎???柴? */
function renderPrediveChecklistEditorSections() {
  const select = document.getElementById('predive-check-sec');
  if (!select) return;
  const current = select.value;
  select.innerHTML = state.prediveChecklist.map(sec => `<option value="${escapeHtml(sec.sec)}">${escapeHtml(sec.secName)}</option>`).join('');
  if (current && [...select.options].some(opt => opt.value === current)) select.value = current;
}

/**
 * ?? Pre-Dive ??暸銝血?甇?predive_checklist_items?? * @param {string} id item_id?? */
async function togglePrediveCheck(id) {
  let newDone;
  state.prediveChecklist.forEach(sec=>sec.items.forEach(item=>{ if(item.id===id){ item.done=!item.done; newDone=item.done; } }));
  try {
    await db.from('predive_checklist_items').update({ done: newDone }).eq('item_id', id);
  } catch(e) {
    console.warn('Predive checklist toggle saved locally only:', e.message);
  }
  saveLocalPrediveChecklist();
  markDirty(['predive-checklist','competition']);
  renderPrediveChecklist();
}

/**
 * ?蔭 Pre-Dive ???賂?銝??批捆嚗? */
async function resetPrediveChecklist() {
  if(!confirm('蝣箄??蔭 Pre-Dive ???賊??殷?')) return;
  state.prediveChecklist.forEach(sec=>sec.items.forEach(item=>item.done=false));
  try {
    await db.from('predive_checklist_items').update({ done: false }).gte('order_index', 0);
  } catch(e) {
    console.warn('Predive checklist reset saved locally only:', e.message);
  }
  saveLocalPrediveChecklist();
  markDirty(['predive-checklist','competition']);
  renderPrediveChecklist();
}

/**
 * ?ａ? Pre-Dive 蝺刻摩璅∪?銝行?蝛箄”?柴? */
function cancelPrediveChecklistEdit() {
  editingPrediveChecklistItemId = null;
  ['predive-check-text','predive-check-owner','predive-check-time'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const qtyEl = document.getElementById('predive-check-qty');
  if (qtyEl) qtyEl.value = '1';
  const titleEl = document.getElementById('predive-check-editor-title');
  if (titleEl) titleEl.textContent = '嚗??啣? / ?湔 Pre-Dive ?';
  const btnEl = document.getElementById('predive-check-save-btn');
  if (btnEl) btnEl.textContent = '嚗??啣?';
}

/**
 * ?蔥 Float 鞈賢?閬瑼Ｘ璅⊥??Pre-Dive嚗?畾?F嚗? */
async function applyPrediveFloatChecklistTemplate() {
  let sec = state.prediveChecklist.find(s => s.sec === FLOAT_PREDIVE_CHECKLIST_TEMPLATE.sec);
  if (!sec) {
    sec = { sec:FLOAT_PREDIVE_CHECKLIST_TEMPLATE.sec, secName:FLOAT_PREDIVE_CHECKLIST_TEMPLATE.secName, items:[] };
    state.prediveChecklist.push(sec);
  }
  let added = 0;
  let updated = 0;
  for (const template of FLOAT_PREDIVE_CHECKLIST_TEMPLATE.items) {
    const existing = sec.items.find(item => item.id === template.id);
    if (existing) {
      existing.text = template.text;
      existing.qty = normalizeChecklistQty(template.qty);
      existing.owner = template.owner;
      existing.time = template.time;
      updated++;
      await persistPrediveChecklistItem({
        item_id:existing.id,
        sec:sec.sec,
        sec_name:sec.secName,
        text:existing.text,
        qty:normalizeChecklistQty(existing.qty),
        owner:existing.owner,
        time:existing.time,
        done:Boolean(existing.done),
        order_index:getPrediveChecklistOrderIndex(existing.id)
      }, true);
      continue;
    }
    const item = { ...template, done:false };
    sec.items.push(item);
    added++;
    await persistPrediveChecklistItem({
      item_id:item.id,
      sec:sec.sec,
      sec_name:sec.secName,
      text:item.text,
      qty:normalizeChecklistQty(item.qty),
      owner:item.owner,
      time:item.time,
      done:false,
      order_index:getPrediveChecklistFlatItems().length - 1
    }, false);
  }
  saveLocalPrediveChecklist();
  markDirty(['predive-checklist','competition']);
  renderPrediveChecklist();
  showToast(added || updated ? `??Float 鞈賢?瑼Ｘ撌脣?甇伐??啣? ${added} ???湔 ${updated} ? : '?對? Float 鞈賢?瑼Ｘ璅⊥撌脣???);
}

/**
 * 靘?item_id 撠 Pre-Dive ??? * @param {string} id item_id?? * @returns {{sec:object,item:object}|null} ?畾菔???? */
function findPrediveChecklistItem(id) {
  for (const sec of state.prediveChecklist) {
    const item = sec.items.find(x => x.id === id);
    if (item) return { sec, item };
  }
  return null;
}

/**
 * 撠???株???Pre-Dive 蝺刻摩銵典?? * @param {string} id item_id?? */
function editPrediveChecklistItem(id) {
  const found = findPrediveChecklistItem(id);
  if (!found) return;
  editingPrediveChecklistItemId = id;
  document.getElementById('predive-check-sec').value = found.sec.sec;
  document.getElementById('predive-check-text').value = found.item.text || '';
  document.getElementById('predive-check-owner').value = found.item.owner || '';
  document.getElementById('predive-check-time').value = found.item.time || '';
  const qtyEl = document.getElementById('predive-check-qty');
  if (qtyEl) qtyEl.value = String(normalizeChecklistQty(found.item.qty));
  document.getElementById('predive-check-editor-title').textContent = '?? ?湔 Pre-Dive ?';
  document.getElementById('predive-check-save-btn').textContent = '?脣??湔';
  document.getElementById('predive-check-text').focus();
}

/**
 * ?啣????Pre-Dive ?銝血神??predive_checklist_items?? */
async function savePrediveChecklistItem() {
  const secId = document.getElementById('predive-check-sec').value;
  const targetSec = state.prediveChecklist.find(sec => sec.sec === secId) || state.prediveChecklist[0];
  const text = document.getElementById('predive-check-text').value.trim();
  const owner = document.getElementById('predive-check-owner').value.trim();
  const time = document.getElementById('predive-check-time').value.trim();
  const qty = normalizeChecklistQty(document.getElementById('predive-check-qty')?.value);
  if (!text) { showToast('隢撓??Pre-Dive ?'); return; }
  if (!targetSec) { showToast('?曆???Pre-Dive ?畾?); return; }

  if (editingPrediveChecklistItemId) {
    const found = findPrediveChecklistItem(editingPrediveChecklistItemId);
    if (!found) return;
    found.sec.items = found.sec.items.filter(item => item.id !== editingPrediveChecklistItemId);
    const updated = { ...found.item, text, owner, time, qty };
    targetSec.items.push(updated);
    await persistPrediveChecklistItem({
      item_id: updated.id,
      sec: targetSec.sec,
      sec_name: targetSec.secName,
      text,
      qty,
      owner,
      time,
      done: updated.done,
      order_index: getPrediveChecklistOrderIndex(updated.id)
    }, true);
  } else {
    const item = { id: `${targetSec.sec.toLowerCase()}-pd-${Date.now()}`, text, qty, owner, time, done:false };
    targetSec.items.push(item);
    await persistPrediveChecklistItem({
      item_id: item.id,
      sec: targetSec.sec,
      sec_name: targetSec.secName,
      text,
      qty,
      owner,
      time,
      done:false,
      order_index: getPrediveChecklistFlatItems().length - 1
    }, false);
  }
  saveLocalPrediveChecklist();
  cancelPrediveChecklistEdit();
  markDirty(['predive-checklist','competition']);
  renderPrediveChecklist();
  showToast('??Pre-Dive Checklist 撌脫??);
}

/**
 * 撠?Pre-Dive ?神??Supabase?? * @param {object} row predive_checklist_items ?? * @param {boolean} isUpdate ?臬?箸?啜? */
async function persistPrediveChecklistItem(row, isUpdate) {
  try {
    if (isUpdate) {
      const { error } = await db.from('predive_checklist_items').update({
        sec: row.sec, sec_name: row.sec_name, text: row.text, qty: normalizeChecklistQty(row.qty), owner: row.owner, time: row.time, done: row.done, order_index: row.order_index
      }).eq('item_id', row.item_id);
      if (error) throw error;
    } else {
      const payload = { ...row, qty: normalizeChecklistQty(row.qty) };
      const { error } = await db.from('predive_checklist_items').insert([payload]);
      if (error) throw error;
    }
  } catch(e) {
    console.warn('Predive checklist item saved locally only:', e.message);
    showToast('?? Pre-Dive 撌脫?唳?堆??亥??脩垢靽?隢炎??DB/RLS');
  }
}

/**
 * ?芷 Pre-Dive ??? * @param {string} id item_id?? */
async function deletePrediveChecklistItem(id) {
  const found = findPrediveChecklistItem(id);
  if (!found) return;
  if (!confirm(`蝣箄??芷??{found.item.text}??`)) return;
  found.sec.items = found.sec.items.filter(item => item.id !== id);
  try {
    const { error } = await db.from('predive_checklist_items').delete().eq('item_id', id);
    if (error) throw error;
  } catch(e) {
    console.warn('Predive checklist delete saved locally only:', e.message);
    showToast('?? Pre-Dive 撌脫?啣?歹??亥??脩垢靽?隢炎??DB/RLS');
  }
  saveLocalPrediveChecklist();
  if (editingPrediveChecklistItemId === id) cancelPrediveChecklistEdit();
  markDirty(['predive-checklist','competition']);
  renderPrediveChecklist();
}

/**
 * 撅像 Pre-Dive ?嚗?畾萄??改??? * @returns {Array<{sec:object,item:object}>} 撅像蝯??? */
function getPrediveChecklistFlatItems() {
  return state.prediveChecklist.flatMap(sec => sec.items.map(item => ({ sec, item })));
}

/**
 * ????函??摨葉??order_index?? * @param {string} id item_id?? * @returns {number} 敺?0 韏瑞?蝝Ｗ??? */
function getPrediveChecklistOrderIndex(id) {
  return Math.max(0, getPrediveChecklistFlatItems().findIndex(row => row.item.id === id));
}

/**
 * ????Pre-Dive ??畾萇? Sortable ????? */
function initPrediveChecklistSortables() {
  sortableInstances.prediveChecklist.forEach(s => s.destroy());
  sortableInstances.prediveChecklist = [];
  if (typeof Sortable === 'undefined') return;
  document.querySelectorAll('.predive-check-items').forEach(container => {
    sortableInstances.prediveChecklist.push(new Sortable(container, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: savePrediveChecklistOrderFromDom
    }));
  });
}

/**
 * 靘?DOM ???神 predive_checklist_items.order_index?? */
async function savePrediveChecklistOrderFromDom() {
  const updates = [];
  let order = 0;
  document.querySelectorAll('.predive-check-items').forEach(container => {
    const sec = state.prediveChecklist.find(s => s.sec === container.dataset.sec);
    if (!sec) return;
    const ids = [...container.querySelectorAll('.check-item')].map(el => el.dataset.itemId);
    sec.items = ids.map(id => sec.items.find(item => item.id === id)).filter(Boolean);
    ids.forEach(id => updates.push({ id, order_index: order++ }));
  });
  try {
    await Promise.all(updates.map(u => db.from('predive_checklist_items').update({ order_index: u.order_index }).eq('item_id', u.id)));
  } catch(e) {
    console.warn('Predive checklist order saved locally only:', e.message);
  }
  saveLocalPrediveChecklist();
  markDirty(['predive-checklist','competition']);
  showToast('??Pre-Dive ??撌脫??);
}

/**
 * 撠?Pre-Dive 撅像?箏?箏??? * @returns {Array<object>} ???? */
function getPrediveChecklistRows() {
  const rows = [];
  state.prediveChecklist.forEach(sec => {
    sec.items.forEach((item, index) => {
      rows.push({
        section: sec.secName,
        order: index + 1,
        text: item.text,
        qty: normalizeChecklistQty(item.qty),
        owner: item.owner,
        time: item.time,
        done: item.done ? '撌脣??? : '?芸???
      });
    });
  });
  return rows;
}

/**
 * ?臬 Pre-Dive Checklist ??CSV?? */
function exportPrediveChecklistCSV() {
  const headers = ['?畾?,'摨?','?','?賊?','鞎痊鈭?,'??','???];
  const rows = getPrediveChecklistRows().map(row => [
    csvCell(row.section),
    row.order,
    csvCell(row.text),
    row.qty,
    csvCell(row.owner),
    csvCell(row.time),
    csvCell(row.done)
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCsv(csv, 'ROV_PreDive_Checklist');
  showToast('??Pre-Dive Checklist CSV 撌脣??);
}

/**
 * ?? Pre-Dive Checklist ?閬?嚗?血? PDF嚗? */
function exportPrediveChecklistPDF() {
  const total = state.prediveChecklist.reduce((s,sec)=>s+sec.items.length,0);
  const done = state.prediveChecklist.reduce((s,sec)=>s+sec.items.filter(i=>i.done).length,0);
  const today = new Date().toISOString().split('T')[0];
  const sectionsHtml = state.prediveChecklist.map(sec => `
    <section>
      <h2>${escapeHtml(sec.secName)}</h2>
      <table>
        <thead><tr><th style="width:28px">??/th><th>?</th><th style="width:44px">?賊?</th><th style="width:90px">鞎痊鈭?/th><th style="width:90px">??</th><th style="width:70px">???/th></tr></thead>
        <tbody>
          ${sec.items.map(item => `
            <tr>
              <td class="box">${item.done ? '?? : ''}</td>
              <td>${escapeHtml(item.text)}</td>
              <td style="text-align:center;font-weight:800">${normalizeChecklistQty(item.qty)}</td>
              <td>${escapeHtml(item.owner || '')}</td>
              <td>${escapeHtml(item.time || '')}</td>
              <td>${item.done ? '撌脣??? : '?芸???}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `).join('');
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast('?? ?汗?典????閬?嚗??迂敶閬?敺?閰?);
    return;
  }
  printWindow.document.write(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<title>ROV Pre-Dive Checklist ${today}</title>
<style>
  body { font-family: 'Segoe UI', 'PingFang TC', sans-serif; color:#111; margin:24px; }
  h1 { color:#1F3864; font-size:22px; margin:0 0 6px; }
  .meta { color:#666; font-size:12px; margin-bottom:18px; }
  h2 { font-size:15px; color:#2F5496; border-left:4px solid #2F5496; padding-left:8px; margin:18px 0 8px; }
  table { width:100%; border-collapse:collapse; font-size:12px; page-break-inside:auto; }
  tr { page-break-inside:avoid; page-break-after:auto; }
  th { background:#1F3864; color:#fff; text-align:left; padding:6px; }
  td { border:1px solid #D0D7E3; padding:6px; vertical-align:top; }
  .box { text-align:center; font-weight:700; font-size:14px; }
  @media print {
    body { margin:12mm; }
    button { display:none; }
  }
</style>
</head>
<body>
  <button onclick="window.print()" style="float:right;padding:8px 14px;background:#2F5496;color:#fff;border:0;border-radius:6px;cursor:pointer">? / ?血???PDF</button>
  <h1>ROV Pre-Dive Checklist</h1>
  <div class="meta">?臬?交?嚗?{today}?摰??脣漲嚗?{done} / ${total}</div>
  ${sectionsHtml}
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 200); }<\/script>
</body>
</html>`);
  printWindow.document.close();
}

/**
 * ?箸 HTML 頧儔嚗???啁??批捆?游?璅??? * @param {unknown} value 閬＊蝷箇??批捆?? * @returns {string} 摰 HTML 摮葡?? */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ????????????????????????????????????????????????????????// GANTT
// ????????????????????????????????????????????????????????function renderGantt() {
  const start = getGanttStartDate();
  const end = getGanttEndDate(start);
  const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
  const dates = Array.from({length:days},(_,i)=>{ const d=new Date(start); d.setDate(start.getDate()+i); return d; });
  const dayAbbr = ['??,'銝','鈭?,'銝?,'??,'鈭?,'??];
  const weekColors = ['#31849B','#375623','#7F6000','#833C00','#76024F','#2F5597','#548235'];
  const endInput = document.getElementById('gantt-end-date');
  if (endInput) endInput.value = toDateInputValue(end);
  const rangeLabel = document.getElementById('gantt-range-label');
  if (rangeLabel) rangeLabel.textContent = `憿舐內蝭?嚗?{toDateInputValue(start)}嚗曹?嚗 ${toDateInputValue(end)}嚗 ${days} 憭奈;

  function catToCls(cat) {
    if (!cat) return 'g-eng';
    if (cat.includes('蝺?)) return 'g-exam';
    if (cat.includes('擃??)) return 'g-eng';
    if (cat.includes('銝剖??)) return 'g-pres';
    if (cat.includes('??')) return 'g-green';
    return 'g-admin';
  }

  const rows = state.tasks
    .filter(t => t.due)
    .sort((a, b) => (a.due > b.due ? 1 : -1))
    .map(t => {
      const taskStart = new Date(t.start_date || toDateInputValue(start)); taskStart.setHours(0, 0, 0, 0);
      const due = new Date(t.due); due.setHours(23, 59, 59);
      return {
        label: t.name || '嚗璅?嚗?,
        cls: catToCls(t.cat),
        done: t.status === '撌脣???,
        spans: dates.map(d => d >= taskStart && d <= due)
      };
    });

  const weekGroups = buildGanttWeekGroups(dates);

  const wrap = document.getElementById('gantt-wrap');
  wrap.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'gantt-table';
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr><th style="min-width:180px;text-align:left;padding:6px 10px">隞餃?</th>${weekGroups.map((w,i)=>`<th colspan="${w.count}" style="background:${weekColors[i % weekColors.length]}">${w.label}</th>`).join('')}</tr>
    <tr><th></th>${dates.map(d=>{
      const isWE = d.getDay()===0||d.getDay()===6;
      return `<th class="gantt-cell ${isWE?'g-weekend':''}" style="${isWE?'background:#D9EAD3;color:#1F4E2A':''}"><div>${d.getMonth()+1}/${d.getDate()}</div><div>${dayAbbr[d.getDay()]}</div></th>`;
    }).join('')}</tr>`;
  const tbody = document.createElement('tbody');
  const frag = document.createDocumentFragment();
  if (rows.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="${days+1}" style="text-align:center;padding:20px;color:#aaa">撠閮剜??芣迫?交??遙??/td>`;
    frag.appendChild(tr);
  } else {
    rows.forEach(row => {
      const tr = document.createElement('tr');
      const label = document.createElement('td');
      label.textContent = row.label;
      label.style.cssText = `padding:4px 8px;font-size:.8rem;font-weight:600;background:#F8F8F8;${row.done?'opacity:.45;text-decoration:line-through;':''}`;
      tr.appendChild(label);
      row.spans.forEach((active, i) => {
        const d = dates[i];
        const isWE = d.getDay()===0||d.getDay()===6;
        const td = document.createElement('td');
        td.className = 'gantt-cell';
        td.style.background = isWE ? '#E8F5E9' : (active ? '' : 'white');
        if (active) {
          const bar = document.createElement('div');
          bar.className = `${row.cls} g-bar`;
          bar.style.cssText = `height:14px;width:100%;${row.done?'opacity:.4':''}`;
          td.appendChild(bar);
        }
        tr.appendChild(td);
      });
      frag.appendChild(tr);
    });
  }
  tbody.appendChild(frag);
  table.appendChild(thead);
  table.appendChild(tbody);
  wrap.appendChild(table);
}

/**
 * ????絲憪嚗摰?朣遙?????????? * @returns {Date} ??銝韏瑕??乓? */
function getGanttStartDate() {
  const dates = state.tasks.flatMap(t => [t.start_date, t.due].filter(Boolean)).map(v => new Date(v)).filter(d => !Number.isNaN(d.getTime()));
  const base = dates.length ? new Date(Math.min(...dates)) : new Date('2026-04-28');
  base.setHours(0,0,0,0);
  const offset = (base.getDay() + 6) % 7; // Monday = 0
  base.setDate(base.getDate() - offset);
  return base;
}

/**
 * ?????甇Ｘ嚗?蝙?其蝙?刻身摰? * @param {Date} start ??絲憪?? * @returns {Date} 蝯迫?乓? */
function getGanttEndDate(start) {
  const saved = localStorage.getItem('rov_gantt_end_' + currentSeason);
  const dueDates = state.tasks.map(t => t.due).filter(Boolean).map(v => new Date(v)).filter(d => !Number.isNaN(d.getTime()));
  const fallback = dueDates.length ? new Date(Math.max(...dueDates)) : new Date(start);
  if (!dueDates.length) fallback.setDate(start.getDate() + 34);
  const end = saved ? new Date(saved) : fallback;
  if (Number.isNaN(end.getTime()) || end < start) {
    const adjusted = new Date(start);
    adjusted.setDate(start.getDate() + 34);
    return adjusted;
  }
  end.setHours(0,0,0,0);
  return end;
}

/**
 * 閮剖????甇Ｘ?? * @param {string} value YYYY-MM-DD?? */
function setGanttEndDate(value) {
  if (value) localStorage.setItem('rov_gantt_end_' + currentSeason, value);
  markDirty('gantt');
  renderGantt();
}

/**
 * ?身???甇Ｘ?箔遙???甇Ｘ?? */
function resetGanttEndDate() {
  localStorage.removeItem('rov_gantt_end_' + currentSeason);
  markDirty('gantt');
  renderGantt();
}

/**
 * 靘???????唳???望?憿? * @param {Date[]} dates ?交?????? * @returns {Array<{label:string,count:number}>} ?望?憿? colspan?? */
function buildGanttWeekGroups(dates) {
  const groups = [];
  for (let i = 0; i < dates.length; i += 7) {
    const from = dates[i];
    const to = dates[Math.min(i + 6, dates.length - 1)];
    groups.push({ label: `${from.getMonth()+1}/${from.getDate()}??{to.getMonth()+1}/${to.getDate()}`, count: Math.min(7, dates.length - i) });
  }
  return groups;
}

/**
 * 撠?Date 頧 date input ?澆??? * @param {Date} date ?交??? * @returns {string} YYYY-MM-DD?? */
function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ????????????????????????????????????????????????????????// INTEL
// ????????????????????????????????????????????????????????function renderIntel() {
  const filter = document.getElementById('intel-filter-cat').value;
  const items = state.intel.filter(i=>!filter||i.cat===filter);
  const statusColor = {'敺???:'#FFD6D6','?脰?銝?:'#FFF3CD','撌脣???:'#D5F5E3','銝??:'#F0F0F0'};
  renderIntelRadarControls();
  renderIntelRadarChart();

  document.getElementById('intel-cards').innerHTML = items.map(i=>`
    <div class="card" style="margin-bottom:12px;border-left:4px solid var(--blue)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <span style="font-weight:700;font-size:1rem">?? ${i.team}</span>
          <span class="badge inprog" style="margin-left:8px">${i.cat}</span>
          ${i.inspiration ? `<span class="badge" style="margin-left:6px;background:#E2F0D9;color:#375623">?臬?嚗?{escapeHtml(i.inspiration)}</span>` : ''}
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <span style="background:${statusColor[i.status]};padding:2px 10px;border-radius:99px;font-size:.75rem;font-weight:700">${i.status}</span>
          <button class="btn btn-sm" style="background:var(--orange);color:#fff" onclick="cycleStatus(${i.id})">?????/button>
          <button class="btn btn-sm btn-danger" onclick="deleteIntel(${i.id})">??</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:.85rem">
        <div><div style="font-weight:700;color:var(--navy);margin-bottom:3px">?? What</div>${escapeHtml(i.what || '??)}</div>
        <div><div style="font-weight:700;color:var(--navy);margin-bottom:3px">? Why</div>${escapeHtml(i.why || '??)}</div>
        <div><div style="font-weight:700;color:var(--navy);margin-bottom:3px">? How to Apply</div>${escapeHtml(i.how || '??)}</div>
      </div>
      ${(i.tags || i.photo_url) ? `<div style="margin-top:8px;font-size:.78rem;color:var(--muted)">${i.tags ? `? ${escapeHtml(i.tags)}` : ''} ${i.photo_url ? ` 繚 ? <a href="${escapeHtml(i.photo_url)}" target="_blank">?抒?/敶梁?</a>` : ''}</div>` : ''}
      ${renderIntelScoreBadges(i)}
      ${i.action?`<div style="margin-top:8px;font-size:.82rem;background:#F0F8FF;padding:6px 10px;border-radius:6px">??頝脰???${escapeHtml(i.action)} <span style="color:#888">嚗??犖嚗?{escapeHtml(i.recorder)}嚗?/span></div>`:''}
    </div>`).join('') || '<div class="card" style="text-align:center;color:#aaa;padding:30px">撠閫?抵???暺??憓?憪???/div>';
}

/**
 * 皜脫?閫?抵?????badges?? * @param {object} intel 閫?抵??? * @returns {string} HTML?? */
function renderIntelScoreBadges(intel) {
  const scores = parseIntelScores(intel);
  if (!Object.keys(scores).length) return '';
  return `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
    ${COMPETITOR_SCORE_AXES.map(axis => Number.isFinite(scores[axis.key])
      ? `<span class="metric-mini">${axis.key} ${Math.round(scores[axis.key])}/${axis.max}</span>` : '').join('')}
  </div>`;
}

/**
 * 皜 tags ?扳??scores 璅??? * @param {string} tags ??璅惜?? * @returns {string} 皜?敺?蝐扎? */
function stripIntelScoreTag(tags) {
  return String(tags || '').replace(/(?:^|[;,嚗s])scores:T1=[^;,嚗s]*(?:[;,嚗s]*T2=[^;,嚗s]*)?(?:[;,嚗s]*T3=[^;,嚗s]*)?(?:[;,嚗s]*T4=[^;,嚗s]*)?/i, '').trim();
}

/**
 * 撱箇?閫?抵?????tags?? * @returns {string} ? tag?? */
function buildIntelScoreTag() {
  const parts = [
    ['T1', document.getElementById('i-score-t1')?.value],
    ['T2', document.getElementById('i-score-t2')?.value],
    ['T3', document.getElementById('i-score-t3')?.value],
    ['T4', document.getElementById('i-score-t4')?.value]
  ].filter(([, value]) => value !== '' && Number.isFinite(Number(value)))
    .map(([key, value]) => `${key}=${Number(value)}`);
  return parts.length ? `scores:${parts.join(';')}` : '';
}

/**
 * 敺??抵???摮圾??Task 1-4 ??? * @param {object} intel 閫?抵??? * @returns {Record<string, number>} ??? */
function parseIntelScores(intel) {
  const text = [intel.tags, intel.what, intel.why, intel.how, intel.action].filter(Boolean).join(' ');
  const scores = {};
  COMPETITOR_SCORE_AXES.forEach(axis => {
    const re = new RegExp(`${axis.key}\\s*=\\s*(\\d+(?:\\.\\d+)?)`, 'i');
    const match = text.match(re);
    if (match) scores[axis.key] = Math.min(axis.max, Number(match[1]));
  });
  return scores;
}

/**
 * 皜脫?撠??琿???隡?柴? */
function renderIntelRadarControls() {
  const select = document.getElementById('intel-radar-team');
  if (!select) return;
  const teams = [...new Set(state.intel.map(item => item.team).filter(Boolean))].sort();
  const current = select.value;
  select.innerHTML = teams.map(team => `<option value="${escapeHtml(team)}">${escapeHtml(team)}</option>`).join('');
  if (teams.includes(current)) select.value = current;
}

/**
 * ???芷??遙??雿喳???撣? * @returns {number[]} ?????? */
function getOwnTeamTaskScores() {
  const itemTemplateMap = {};
  Object.entries(MISSION_SCORE_TEMPLATES).forEach(([templateKey, tpl]) => {
    (tpl.items || []).forEach(item => { itemTemplateMap[item.id] = templateKey; });
  });
  return COMPETITOR_SCORE_AXES.map(axis => {
    const bestByTemplate = axis.templates.map(templateKey => {
      const values = state.missionRuns.map(run => {
        const items = parseMissionScoreItems(run.score_items);
        const matched = items.filter(item => itemTemplateMap[item.id] === templateKey);
        return matched.reduce((sum, item) => sum + Math.max(0, Number(item.score) || 0), 0);
      });
      return Math.max(0, ...values);
    });
    return Math.min(axis.max, bestByTemplate.reduce((sum, score) => sum + score, 0));
  });
}

/**
 * ????撠??遙??撣? * @param {string} team 撠??迂?? * @returns {number[]} ?????? */
function getOpponentTaskScores(team) {
  const records = state.intel.filter(item => item.team === team);
  return COMPETITOR_SCORE_AXES.map(axis => Math.max(0, ...records.map(item => parseIntelScores(item)[axis.key] || 0)));
}

/**
 * 皜脫??芷?????????? */
function renderIntelRadarChart() {
  if (typeof Chart === 'undefined') return;
  const canvas = document.getElementById('intel-radar-chart');
  if (!canvas) return;
  const select = document.getElementById('intel-radar-team');
  const team = select?.value || select?.options?.[0]?.value || '';
  chartInstances.intelRadar?.destroy();
  const own = getOwnTeamTaskScores();
  const opponent = team ? getOpponentTaskScores(team) : COMPETITOR_SCORE_AXES.map(() => 0);
  chartInstances.intelRadar = new Chart(canvas, {
    type:'radar',
    data:{
      labels:COMPETITOR_SCORE_AXES.map(axis => axis.label),
      datasets:[
        { label:'?芷??雿?, data:own, borderColor:'#2F75B5', backgroundColor:'rgba(47,117,181,.16)', pointBackgroundColor:'#2F75B5' },
        { label:team || '撠?', data:opponent, borderColor:'#C00000', backgroundColor:'rgba(192,0,0,.12)', pointBackgroundColor:'#C00000' }
      ]
    },
    options:{ responsive:true, maintainAspectRatio:false, scales:{ r:{ beginAtZero:true, suggestedMax:135 } }, plugins:{ legend:{ position:'bottom' } } }
  });
  const summary = document.getElementById('intel-radar-summary');
  if (summary) {
    const gaps = COMPETITOR_SCORE_AXES.map((axis, i) => ({ axis, gap:opponent[i] - own[i] })).sort((a,b) => b.gap - a.gap);
    summary.textContent = team ? `?憭批榆頝?${gaps[0].axis.label}嚗??? ${Math.max(0, Math.round(gaps[0].gap))} ????潸矽?港?銝頛芯遙???乓 : '撠?豢?撠??頛詨 Task ???;
  }
}

async function cycleStatus(id) {
  const order = ['敺???,'?脰?銝?,'撌脣???,'銝??];
  const item = state.intel.find(i=>i.id===id);
  if(!item) return;
  const next = order[(order.indexOf(item.status)+1)%order.length];
  await db.from('intel').update({ status: next }).eq('id', id);
  item.status = next;
  renderIntel();
}

async function deleteIntel(id) {
  if(!confirm('蝣箄??芷甇方???')) return;
  await db.from('intel').delete().eq('id', id);
  state.intel = state.intel.filter(i=>i.id!==id);
  renderIntel();
}

function openAddIntel() {
  ['i-team','i-recorder','i-what','i-why','i-how','i-action','i-tags','i-photo','i-score-t1','i-score-t2','i-score-t3','i-score-t4'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('i-cat').value='ROV璈１閮剛?';
  document.getElementById('i-inspiration').value='擃?;
  document.getElementById('i-status').value='敺???;
  document.getElementById('intel-modal').classList.add('open');
}

async function saveIntel() {
  const scoreTag = buildIntelScoreTag();
  const cleanTags = stripIntelScoreTag(document.getElementById('i-tags').value.trim());
  const item = {
    team: document.getElementById('i-team').value.trim(),
    recorder: document.getElementById('i-recorder').value.trim(),
    cat: document.getElementById('i-cat').value,
    what: document.getElementById('i-what').value.trim(),
    why: document.getElementById('i-why').value.trim(),
    how: document.getElementById('i-how').value.trim(),
    action: document.getElementById('i-action').value.trim(),
    tags: [cleanTags, scoreTag].filter(Boolean).join(' '),
    photo_url: document.getElementById('i-photo').value.trim(),
    inspiration: document.getElementById('i-inspiration').value,
    status: document.getElementById('i-status').value,
  };
  const payload = { ...item };
  if (!optionalSchema.intelExtras) {
    delete payload.tags;
    delete payload.photo_url;
    delete payload.inspiration;
  }
  if (optionalSchema.intelSeason) payload.season = currentSeason;
  if(!item.team) return;
  const { data, error } = await db.from('intel').insert([payload]).select().single();
  if (error) { alert('閫撖翰閮摮仃??' + error.message); return; }
  if(data) state.intel.push({ ...data, tags:item.tags, photo_url:item.photo_url, inspiration:item.inspiration });
  closeModal('intel-modal'); markDirty('intel'); renderIntel();
}

// ????????????????????????????????????????????????????????// MODAL
// ????????????????????????????????????????????????????????async function runDiag() {
  const el = document.getElementById('diag-result');
  el.innerHTML = '<div style="color:#888;font-size:.83rem">??皜祈岫銝凌?/div>';
  const tables = ['tasks','members','intel','checklist_items','predive_checklist_items','notes','quotes','task_attachments','audit_log','strategy_items','practice_runs','mission_runs'];
  const results = [];
  for (const tbl of tables) {
    try {
      const { data, error } = await db.from(tbl).select('id').limit(1);
      if (error) {
        const msg = error.message || '';
        if (msg.includes('does not exist') || msg.includes('relation')) {
          results.push({ tbl, status: 'missing', msg: 'Table 銝??? });
        } else if (msg.includes('row-level security') || msg.includes('policy') || msg.includes('permission')) {
          results.push({ tbl, status: 'rls', msg: 'RLS ?餅?霈?? });
        } else {
          results.push({ tbl, status: 'error', msg });
        }
      } else {
        results.push({ tbl, status: 'ok', msg: `??甇?虜嚗?{data?.length ?? 0} 蝑?` });
      }
    } catch(e) {
      results.push({ tbl, status: 'error', msg: e.message });
    }
  }
  const seasonResults = await diagnoseSeasonSchema(results);
  const icons = { ok:'??, missing:'??, rls:'??', error:'??' };
  const colors = { ok:'#2e7d32', missing:'#c62828', rls:'#e65100', error:'#6a1b9a' };
  const counts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  let html = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px">
    <div style="padding:8px 10px;background:#E8F5E9;border-radius:8px;color:#2e7d32;font-weight:800">??甇?虜 ${counts.ok || 0}</div>
    <div style="padding:8px 10px;background:#FFEBEE;border-radius:8px;color:#c62828;font-weight:800">??蝻箄” ${counts.missing || 0}</div>
    <div style="padding:8px 10px;background:#FFF3E0;border-radius:8px;color:#e65100;font-weight:800">?? RLS ${counts.rls || 0}</div>
    <div style="padding:8px 10px;background:#F3E5F5;border-radius:8px;color:#6a1b9a;font-weight:800">?? ?嗡? ${counts.error || 0}</div>
  </div>`;
  html += '<div style="border:1px solid #ddd;border-radius:6px;overflow:hidden;font-size:.82rem">';
  results.forEach((r,i) => {
    html += `<div style="display:flex;justify-content:space-between;padding:7px 12px;background:${i%2?'#f9f9f9':'#fff'}">
      <span style="font-weight:600;font-family:monospace">${r.tbl}</span>
      <span style="color:${colors[r.status]}">${icons[r.status]} ${r.msg}</span>
    </div>`;
  });
  html += '</div>';
  const hasRls = results.some(r=>r.status==='rls');
  const hasMissing = results.some(r=>r.status==='missing');
  if (hasRls) {
    html += '<div style="margin-top:8px;padding:8px 12px;background:#FFF3E0;border-radius:6px;font-size:.8rem;color:#e65100">?? <b>RLS ?餅?</b> ??隢?鋆賭??嫘耨敺?SQL??摰撱箄” SQL 銝剔? <b>RLS policy</b> 畾菔嚗 Supabase ??SQL Editor ?瑁?</div>';
  }
  if (hasMissing) {
    html += '<div style="margin-top:8px;padding:8px 12px;background:#FFEBEE;border-radius:6px;font-size:.8rem;color:#c62828">??<b>Table 銝???/b> ??隢銵??孵???SQL 撱箇????table</div>';
  }
  if (!hasRls && !hasMissing) {
    html += '<div style="margin-top:8px;padding:8px 12px;background:#E8F5E9;border-radius:6px;font-size:.8rem;color:#2e7d32">?????table ???甇?虜嚗??迨閬?銝阡??唳???Ｕ?/div>';
  }
  html += renderSeasonSchemaDiagnostics(seasonResults);
  const fixSql = buildDiagFixSql(results, seasonResults);
  if (fixSql) {
    html += `<div style="margin-top:10px;padding:10px 12px;background:#F7F9FC;border:1px solid #D8E2F0;border-radius:8px">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:6px">
        <strong style="font-size:.86rem;color:var(--navy)">?? ?芯耨敺拍??憿?SQL</strong>
        <button class="btn btn-sm btn-primary" onclick="copyDiagFixSql()">?? 銴ˊ靽桀儔 SQL</button>
      </div>
      <textarea id="diag-fix-sql" readonly style="width:100%;height:120px;font-family:monospace;font-size:.76rem;padding:8px;border:1px solid #ccd6e3;border-radius:6px;background:#fff;resize:vertical">${escapeHtml(fixSql)}</textarea>
      <div style="font-size:.76rem;color:#666;margin-top:6px">??Supabase SQL Editor ?瑁?敺???渡???喳??/div>
    </div>`;
  }
  el.innerHTML = html;
}

/**
 * 瑼Ｘ??table ?臬?瑕?摮詨僑??甈??? * @param {Array<{tbl:string,status:string,msg:string}>} tableResults ?箸 table 閮箸蝯??? * @returns {Promise<Array<object>>} 摮詨僑甈?閮箸蝯??? */
async function diagnoseSeasonSchema(tableResults) {
  const tableStatus = Object.fromEntries(tableResults.map(r => [r.tbl, r.status]));
  const results = [];
  for (const config of SEASON_SCHEMA_TABLES) {
    if (tableStatus[config.tbl] === 'missing') {
      results.push({ ...config, status:'missing_table', msg:'Table 銝??? });
      continue;
    }
    try {
      const { error } = await db.from(config.tbl).select('season').limit(1);
      if (error) {
        const msg = error.message || '';
        const missingColumn = msg.includes('season') || msg.includes('column') || msg.includes('Could not find');
        results.push({ ...config, status: missingColumn ? 'missing_column' : 'error', msg: missingColumn ? '蝻箏? season 甈?' : msg });
      } else {
        results.push({ ...config, status:'ok', msg:'?舀摮詨僑??' });
      }
    } catch(e) {
      results.push({ ...config, status:'error', msg:e.message });
    }
  }
  return results;
}

/**
 * 撠飛撟湔?雿那?瑞??葡? DB 閮剖?閬??? * @param {Array<object>} seasonResults 摮詨僑甈?閮箸蝯??? * @returns {string} HTML 摮葡?? */
function renderSeasonSchemaDiagnostics(seasonResults) {
  const counts = seasonResults.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  let html = `<div style="margin-top:12px;padding:10px 12px;background:#F7FBFF;border:1px solid #D8E8F8;border-radius:8px">
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
      <strong style="font-size:.88rem;color:var(--navy)">?? 摮詨僑?????/strong>
      <span style="font-size:.76rem;color:#666">??${counts.ok || 0}??? 蝻箸?雿?${counts.missing_column || 0}???蝻箄” ${counts.missing_table || 0}</span>
    </div>
    <div style="font-size:.76rem;color:#666;margin-bottom:8px">?歇?冽?恍?誨銵典??飛撟湔??桀??祕?祟?貉府 table嚗遣霅啗?甈??誨銵刻????摮詨僑靽?嚗??恍隞?敺???飛撟渲?撖怒?/div>
    <div style="border:1px solid #DDE6F2;border-radius:6px;overflow:hidden;font-size:.8rem">`;
  seasonResults.forEach((r, i) => {
    const bg = i % 2 ? '#fbfdff' : '#fff';
    const statusColor = r.status === 'ok' ? '#2e7d32' : (r.status === 'missing_column' ? '#e65100' : '#c62828');
    const statusText = r.status === 'ok' ? '????season' : (r.status === 'missing_column' ? '?? 蝻?season' : (r.status === 'missing_table' ? '??蝻箄”' : '?? 瑼Ｘ憭望?'));
    const usage = r.active ? '撌脩?潛?? : (r.recommended ? '撱箄降鋆?雿? : '?舐雁???);
    html += `<div style="display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:8px;padding:7px 10px;background:${bg};align-items:center">
      <span><b style="font-family:monospace">${r.tbl}</b><span style="color:#777">嚚?{r.label}</span></span>
      <span style="color:${statusColor};font-weight:700">${statusText}</span>
      <span style="color:#555">${usage}</span>
    </div>`;
  });
  html += '</div></div>';
  return html;
}

/**
 * ?Ｙ?鋆?摮詨僑甈???SQL?? * @param {Array<object>} seasonResults 摮詨僑甈?閮箸蝯??? * @returns {string[]} SQL 銵? */
function buildSeasonSchemaFixSqlLines(seasonResults) {
  const missing = seasonResults.filter(r => r.recommended && r.status === 'missing_column');
  if (!missing.length) return [];
  return [
    '',
    '-- 鋆?摮詨僑??甈?嚗eason嚗?,
    ...missing.map(r => `alter table ${r.tbl} add column if not exists season text default '2025-2026';`)
  ];
}

/**
 * ?Ｙ?? RLS 銝血?閮?anon嚗汗?函垢 key嚗?撖怎? policy SQL?? * @param {string[]} tableNames 鞈?銵典?蝔晞? * @returns {string} ?航票??Supabase SQL Editor ??銝脯? */
function buildRlsPoliciesForTables(tableNames) {
  const lines = [
    '-- ??????????????????????????????????????????????',
    '-- RLS嚗nable + ?車 policy嚗??祇? Supabase anon key ?剝?嚗?,
    '-- ?臭耨敺抬?new row violates row-level security policy',
    '-- ??????????????????????????????????????????????',
    ''
  ];
  for (const tbl of tableNames) {
    const p = 'rov_anon_' + tbl;
    lines.push('alter table ' + tbl + ' enable row level security;');
    lines.push('drop policy if exists "' + p + '_select" on ' + tbl + ';');
    lines.push('drop policy if exists "' + p + '_insert" on ' + tbl + ';');
    lines.push('drop policy if exists "' + p + '_update" on ' + tbl + ';');
    lines.push('drop policy if exists "' + p + '_delete" on ' + tbl + ';');
    lines.push('create policy "' + p + '_select" on ' + tbl + ' for select using (true);');
    lines.push('create policy "' + p + '_insert" on ' + tbl + ' for insert with check (true);');
    lines.push('create policy "' + p + '_update" on ' + tbl + ' for update using (true) with check (true);');
    lines.push('create policy "' + p + '_delete" on ' + tbl + ' for delete using (true);');
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * ?寞??單?閮箸蝯??Ｙ??撠耨敺?SQL?? * @param {Array<{tbl:string,status:string,msg:string}>} results 閮箸蝯??? * @param {Array<object>} seasonResults 摮詨僑甈?閮箸蝯??? * @returns {string} ?航?鋆賜?靽桀儔 SQL?? */
function buildDiagFixSql(results, seasonResults = []) {
  const missing = results.filter(r => r.status === 'missing').map(r => r.tbl);
  const rls = results.filter(r => r.status === 'rls').map(r => r.tbl);
  const lines = ['-- ROV Task Manager嚗靽桀儔?桀?閮箸?啁? DB ??'];
  if (missing.length) {
    lines.push('-- ?菜葫?啁撩撠?table嚗? + missing.join(', '));
    lines.push('-- 蝻箄”?閬遣蝡?雿??嚗誑銝????桀?蝟餌絞摰撱箄” SQL??);
    lines.push('');
    lines.push(document.getElementById('sql-content')?.value || '');
    return lines.join('\n');
  }
  if (rls.length) {
    lines.push('');
    lines.push('-- 隞乩?鞈?銵刻??◤ RLS ?餅?嚗?銝撖怠??policy');
    lines.push(buildRlsPoliciesForTables(rls));
  }
  lines.push(...buildSeasonSchemaFixSqlLines(seasonResults));
  if (lines.length === 1) return '';
  return lines.join('\n');
}

/**
 * 銴ˊ?單?閮箸?Ｙ??耨敺?SQL?? */
function copyDiagFixSql() {
  const el = document.getElementById('diag-fix-sql');
  if (!el) return;
  el.select();
  document.execCommand('copy');
  showToast('??靽桀儔 SQL 撌脰?鋆賢?芾票??);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
document.querySelectorAll('.modal-bg').forEach(bg=>{
  bg.addEventListener('click',e=>{ if(e.target===bg) bg.classList.remove('open'); });
});

/**
 * ????文翰?琿嚗 ?啣?隞餃??sc ??閬??? ??Ctrl+K ?隞餃????? */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    const activeTag = document.activeElement?.tagName?.toLowerCase();
    const isTyping = ['input', 'textarea', 'select'].includes(activeTag);
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.modal-bg.open');
      if (openModal) {
        openModal.classList.remove('open');
        e.preventDefault();
      }
      return;
    }
    if (isTyping) return;
    if (currentPage === 'competition') {
      if (e.code === 'Space') {
        toggleCompetitionClock();
        e.preventDefault();
        return;
      }
    }
    const detailModal = document.getElementById('task-detail-modal');
    if (detailModal?.classList.contains('open') && document.getElementById('detail-view-mode')?.style.display !== 'none') {
      if (e.code === 'ArrowLeft') { openAdjacentTaskDetail(-1); e.preventDefault(); return; }
      if (e.code === 'ArrowRight') { openAdjacentTaskDetail(1); e.preventDefault(); return; }
    }
    if (e.key.toLowerCase() === 'n') {
      showMode('prep', document.querySelector('nav .tab-btn[data-mode="prep"]'));
      showPage('tasks');
      openAddTask();
      e.preventDefault();
      return;
    }
    if (e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) {
      showMode('prep', document.querySelector('nav .tab-btn[data-mode="prep"]'));
      showPage('tasks');
      const search = document.getElementById('search-task');
      search?.focus();
      search?.select();
      e.preventDefault();
    }
  });
}

/**
 * 敺?CCC 敹恍???DOM ?園??阮?? * @returns {object|null} 敹恍???蝔踴? */
function getCompetitionQuickDraftFromDom() {
  if (!document.getElementById('cq-round')) return null;
  return {
    station: document.getElementById('cq-station')?.value || '',
    template: document.getElementById('cq-template')?.value || '',
    round: document.getElementById('cq-round')?.value || '',
    pilot: document.getElementById('cq-pilot')?.value || '',
    seconds: document.getElementById('cq-seconds')?.value || '',
    penaltyCount: document.getElementById('cq-penalty-count')?.value || '',
    note: document.getElementById('cq-note')?.value || '',
    selected: [...document.querySelectorAll('.cq-score-check:checked')].map(input => input.value),
    savedAt: new Date().toISOString()
  };
}

/**
 * 靽? CCC ?祆?敹怎嚗?雿魚?渡雯蝯∩?蝛拇????◢?芥? */
function saveCompetitionSnapshot() {
  const draft = getCompetitionQuickDraftFromDom();
  if (draft) localStorage.setItem('rov_competition_score_draft_' + currentSeason, JSON.stringify(draft));
  const savedDraft = safeJsonParse(localStorage.getItem('rov_competition_score_draft_' + currentSeason), null);
  const snapshot = {
    runState: competitionRunState,
    targetScore: getCompetitionTargetScore(),
    flowStep: getCompetitionFlowStep(),
    scoreDraft: draft || savedDraft,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem('rov_competition_snapshot_' + currentSeason, JSON.stringify(snapshot));
  updateCompetitionAutosaveStatus(snapshot.savedAt);
  renderCompetitionReadinessPanel();
  setCompetitionQuickScoreDirty(false);
}

function manualSaveCompetitionSnapshot() {
  saveCompetitionSnapshot();
  showToast('??瘥魚敹怎撌脫???摮?);
}

function exportCompetitionSnapshot() {
  saveCompetitionSnapshot();
  const snapshot = safeJsonParse(localStorage.getItem('rov_competition_snapshot_' + currentSeason), null);
  if (!snapshot) {
    showToast('?? 撠??臬??鞈賢翰??);
    return;
  }
  const payload = {
    type: 'rov_competition_snapshot',
    version: 1,
    season: currentSeason,
    exportedAt: new Date().toISOString(),
    snapshot
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rov-competition-snapshot-${currentSeason}-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('??瘥魚敹怎撌脣??);
}

function importCompetitionSnapshot(event) {
  const input = event?.target;
  const file = input?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result || '{}'));
      const snapshot = payload.type === 'rov_competition_snapshot' ? payload.snapshot : payload;
      if (!snapshot || typeof snapshot !== 'object' || !snapshot.savedAt) throw new Error('invalid snapshot');
      localStorage.setItem('rov_competition_snapshot_' + currentSeason, JSON.stringify(snapshot));
      if (snapshot.runState) {
        competitionRunState = snapshot.runState;
        saveCompetitionRunState();
      }
      if (snapshot.scoreDraft) localStorage.setItem('rov_competition_score_draft_' + currentSeason, JSON.stringify(snapshot.scoreDraft));
      if (snapshot.targetScore) localStorage.setItem('rov_competition_target_score_' + currentSeason, String(snapshot.targetScore));
      if (Number.isFinite(Number(snapshot.flowStep))) localStorage.setItem('rov_competition_flow_' + currentSeason, String(snapshot.flowStep));
      const savedAt = new Date(snapshot.savedAt);
      const timeText = Number.isNaN(savedAt.getTime()) ? '?芰??' : savedAt.toLocaleTimeString('zh-HK');
      competitionSnapshotRestoreInfo = `撌脣??${timeText} ???典翰?呎;
      updateCompetitionAutosaveStatus(snapshot.savedAt);
      renderCompetitionMode();
      setCompetitionQuickScoreDirty(false);
      showToast('??瘥魚敹怎撌脣??);
    } catch(e) {
      alert('敹怎瑼??澆?銝迤蝣綽?隢? CCC ?臬??JSON??);
    } finally {
      if (input) input.value = '';
    }
  };
  reader.readAsText(file);
}

function updateCompetitionAutosaveStatus(savedAt) {
  const el = document.getElementById('competition-autosave-status');
  if (!el) return;
  const date = savedAt ? new Date(savedAt) : null;
  const age = getCompetitionSnapshotAgeSeconds({ savedAt });
  const ageText = age === null ? '' : (age < 60 ? `嚗?{age}蝘?嚗 : `嚗?{Math.floor(age / 60)}??{age % 60}蝘?嚗);
  el.textContent = date && !Number.isNaN(date.getTime())
    ? `撌脖?摮頛芸翰?改?${date.toLocaleTimeString('zh-HK')}${ageText}`
    : '撠靽??祈憚敹怎';
}

/**
 * 敺?甈?CCC ?祆?敹怎?Ｗ儔鞈??? */
function restoreCompetitionSnapshot() {
  try {
    const snapshot = safeJsonParse(localStorage.getItem('rov_competition_snapshot_' + currentSeason), null);
    if (!snapshot) {
      competitionSnapshotRestoreInfo = null;
      return;
    }
    const restored = [];
    if (snapshot.runState && !localStorage.getItem('rov_competition_run_state_' + currentSeason)) {
      competitionRunState = snapshot.runState;
      saveCompetitionRunState();
      restored.push('閮????);
    }
    if (snapshot.scoreDraft && !localStorage.getItem('rov_competition_score_draft_' + currentSeason)) {
      localStorage.setItem('rov_competition_score_draft_' + currentSeason, JSON.stringify(snapshot.scoreDraft));
      restored.push('敹恍???蝔?);
    }
    if (snapshot.targetScore && !localStorage.getItem('rov_competition_target_score_' + currentSeason)) {
      localStorage.setItem('rov_competition_target_score_' + currentSeason, String(snapshot.targetScore));
      restored.push('?格??');
    }
    const savedAt = snapshot.savedAt ? new Date(snapshot.savedAt) : null;
    const timeText = savedAt && !Number.isNaN(savedAt.getTime()) ? savedAt.toLocaleTimeString('zh-HK') : '?芰??';
    competitionSnapshotRestoreInfo = restored.length
      ? `撌脣? ${timeText} ?璈翰?扳敺?${restored.join('??)}`
      : `撌脣皜砍 ${timeText} ?璈翰?改??桀?鞈?撌脫??躬;
    updateCompetitionAutosaveStatus(snapshot.savedAt);
  } catch(e) {
    competitionSnapshotRestoreInfo = '敹怎霈?仃??撌脩?敺?;
    console.warn('Competition snapshot restore skipped:', e.message);
  }
}

/**
 * ??瘥魚璅∪??芸??阮?遢?? */
function initCompetitionAutosave() {
  loadMissionEventLog();
  restoreCompetitionSnapshot();
  window.addEventListener('beforeunload', (event) => {
    if (!shouldWarnCompetitionUnsavedChanges()) return;
    saveCompetitionSnapshot();
    event.preventDefault();
    event.returnValue = '';
  });
  setInterval(() => {
    if (currentPage === 'competition') saveCompetitionSnapshot();
  }, 30000);
}

/**
 * ???蜓憿?鞈賢迤 UI?? */
function initUserPreferences() {
  const theme = localStorage.getItem('rov_theme') || 'auto';
  applyTheme(theme);
  const seasonSelect = document.getElementById('season-select');
  if (seasonSelect) seasonSelect.value = currentSeason;
}

function initNetworkStatusMonitor() {
  const update = () => {
    renderSystemHealthPanel();
    showToast(navigator.onLine === false ? '?? ?桀??Ｙ?嚗?????摮?祆?' : '??蝬脩窗撌脫敺抬?隢Ⅱ隤???甇亦???, 2600);
  };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
}

/**
 * 憟銝駁??? * @param {string} theme light?ark ??auto?? */
function applyTheme(theme) {
  if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('rov_theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '?儭? : (theme === 'light' ? '??' : '??');
}

/**
 * ?刻?楛?脯滓?脤????? */
function toggleTheme() {
  const cur = localStorage.getItem('rov_theme') || 'auto';
  const next = cur === 'auto' ? 'dark' : (cur === 'dark' ? 'light' : 'auto');
  applyTheme(next);
}

/**
 * ???桀?鞈賢迤銝阡??啗??亥??? * @param {string} season 鞈賢迤?迂?? */
async function switchSeason(season) {
  currentSeason = season || '2025-2026';
  localStorage.setItem('rov_current_season', currentSeason);
  competitionRunState = safeJsonParse(localStorage.getItem('rov_competition_run_state_' + currentSeason), {});
  loadMissionEventLog();
  restoreCompetitionSnapshot();
  selectedTaskIds.clear();
  showSkeleton('dashboard');
  await loadFromSupabase();
  currentPage = 'dashboard';
  showMode('review', document.querySelector('nav .tab-btn[data-mode="review"]'));
  showToast('??撌脣??魚摮??' + currentSeason);
}

// NOTES
/**
 * ????敹?摮??舀銝?????湔?湔?? * @param {string} content ???批捆?? */
async function persistNotesContent(content) {
  state.notes = content;
  const notesArea = document.getElementById('notes-area');
  if (notesArea) notesArea.value = content.split('\n\n__QUOTES__')[0];
  const { error } = await db.from('notes').upsert({ id: 1, content: state.notes });
  if (error) throw error;
}

/**
 * 撠?摮????嚗???蝺湧???JSON suffix?? * @param {string} text 閬??????? */
async function appendTextToNotes(text) {
  const raw = state.notes || '';
  const sep = raw.indexOf('\n\n__QUOTES__');
  const body = sep !== -1 ? raw.substring(0, sep) : raw;
  const suffix = sep !== -1 ? raw.substring(sep) : '';
  const next = `${body.trim() ? body.trim() + '\n\n' : ''}${text.trim()}${suffix}`;
  await persistNotesContent(next);
  markDirty('notes');
}

async function saveNotes() {
  try {
    await persistNotesContent(document.getElementById('notes-area').value);
  } catch(error) {
    alert('?????脣?憭望?嚗? + error.message + '\n\n?亦 RLS嚗??????DB 閮剖??銵?SQL ?批? notes ??RLS policy 畾菔');
    return;
  }
  const el = document.getElementById('notes-saved');
  el.style.display='inline';
  setTimeout(()=>el.style.display='none',2000);
}

// ?? ?毀? (stored in notes table as JSON suffix) ??
const DEFAULT_QUOTES = [
  '??韐犖嚗?摰??單??雁嚗I ?臭誑撟怠?釵?踝?雿瘜??雁閬??撌勗??,
  '雿憭??圾瘙箏???憿?雿??蜀撠梯?嗆?銝嚗銝蝔格迤?賊???,
  '蝺渡????嗡?瘥魚嚗?鞈賣?閬雿毀蝧???嗡葉嚗?榆銝???敹???
];
if (!state.quotes) state.quotes = DEFAULT_QUOTES.map((t,i)=>({id:i+1, text:t}));

function renderQuotes() {
  const list = document.getElementById('quotes-list');
  if (!list) return;
  list.innerHTML = state.quotes.map((q, i) => `
    <div class="quote-item">
      <span class="quote-text">??{q.text}??/span>
      <div class="quote-actions">
        <button class="btn btn-sm btn-primary" onclick="editQuote(${i})" title="蝺刻摩">??</button>
        <button class="btn btn-sm btn-danger" onclick="deleteQuote(${i})" title="?芷">??</button>
      </div>
    </div>`).join('') || '<div style="color:#aaa;font-size:.85rem">撠?</div>';
}

async function addQuote() {
  const text = prompt('頛詨?圈??伐?');
  if (!text || !text.trim()) return;
  const { data, error } = await db.from('quotes').insert([{ text:text.trim(), order_index: state.quotes.length }]).select();
  if (error) {
    alert('???啣??憭望?嚗? + error.message + '\n\n隢Ⅱ隤?quotes 銵典歇撱箇?嚗??RLS嚗????DB 閮剖??銵?SQL ?批? quotes ??RLS policy 畾菔');
    return;
  }
  state.quotes.push({ id: data[0].id, text: text.trim() });
  renderQuotes();
  showToast('? ?撌脫憓?);
}

async function editQuote(i) {
  const q = state.quotes[i];
  const text = prompt('靽格?嚗?, q.text);
  if (text === null) return;
  if (!text.trim()) { deleteQuote(i); return; }
  const { error } = await db.from('quotes').update({ text: text.trim() }).eq('id', q.id);
  if (error) { showToast('???湔憭望?嚗? + error.message); return; }
  state.quotes[i].text = text.trim();
  renderQuotes();
  showToast('? ?撌脫??);
}

async function deleteQuote(i) {
  if (!confirm('蝣箏??芷??嚗?)) return;
  const q = state.quotes[i];
  const { error } = await db.from('quotes').delete().eq('id', q.id);
  if (error) { showToast('???芷憭望?嚗? + error.message); return; }
  state.quotes.splice(i, 1);
  renderQuotes();
  showToast('?? ?撌脣??);
}

// ?? TOAST ??
function showToast(msg, duration=2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function openChangelogModal() {
  renderChangelogLatestSummary();
  document.getElementById('changelog-modal').classList.add('open');
}

function renderChangelogLatestSummary() {
  const el = document.getElementById('changelog-latest-summary');
  if (!el) return;
  el.innerHTML = CHANGELOG_ITEMS.map(item => `
    <div style="border-left:4px solid var(--blue);padding:10px 14px;margin-bottom:12px;background:#eef6ff;border-radius:0 8px 8px 0">
      <div style="font-weight:700;color:var(--blue);font-size:.95rem">${escapeHtml(item.version)} ${escapeHtml(item.title)} <span style="font-size:.78rem;color:#888;font-weight:400">${escapeHtml(item.date)}</span></div>
      <ul style="margin:6px 0 0 16px;font-size:.85rem;line-height:1.8;color:#333">
        ${item.items.map(text => `<li>${escapeHtml(text)}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function initFrontendErrorTracking() {
  window.addEventListener('error', event => {
    logFrontendError('error', event.message, `${event.filename || ''}:${event.lineno || ''}:${event.colno || ''}`);
  });
  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason;
    logFrontendError('unhandledrejection', reason?.message || reason, reason?.stack || '');
  });
}


// ?? duration label helper ??
function updateDurationLabel() {
  const s = document.getElementById('m-start').value;
  const e = document.getElementById('m-due').value;
  const lbl = document.getElementById('m-duration-label');
  if (!lbl) return;
  if (s && e) {
    const days = Math.round((new Date(e)-new Date(s))/(1000*60*60*24));
    lbl.textContent = days >= 0 ? `?? ??${days} 憭抬?${s} ??${e}嚗 : '?? ?芣迫?乩??賣?潸絲憪';
    lbl.style.color = days < 0 ? 'var(--red)' : '#666';
  } else { lbl.textContent = ''; }
}

// ????????????????????????????????????????????????????????// BATCH IMPORT
// ????????????????????????????????????????????????????????let importMode = 'auto';
let importParsed = [];

function openImportModal() {
  importParsed = [];
  document.getElementById('import-textarea').value = '';
  document.getElementById('import-preview').innerHTML = '';
  document.getElementById('import-count').textContent = '';
  const confirmBtn = document.getElementById('import-confirm-btn');
  confirmBtn.style.display = 'none';
  confirmBtn.disabled = false;
  confirmBtn.textContent = '??蝣箄??券皛';
  switchImportTab('auto');
  document.getElementById('import-modal').classList.add('open');
}

function switchImportTab(mode) {
  importMode = mode;
  document.getElementById('import-tab-auto').style.cssText = mode==='auto' ? 'background:var(--blue);color:#fff' : 'background:#eee;color:#333';
  document.getElementById('import-tab-csv').style.cssText  = mode==='csv'  ? 'background:var(--blue);color:#fff' : 'background:#eee;color:#333';
  document.getElementById('import-auto-hint').style.display = mode==='auto' ? '' : 'none';
  document.getElementById('import-csv-hint').style.display  = mode==='csv'  ? '' : 'none';
  document.getElementById('import-csv-upload').style.display = mode==='csv' ? '' : 'none';
  document.getElementById('import-textarea').placeholder = mode==='auto'
    ? '鞎澆蝢斤?撠店閮?嚗?憒?\n隞予摰?鈭?CB閮剛??吒n?予摰?皜祈岫\nPoster Abstract?神??
    : 'name,cat,owner,due,status,note\nPoster Abstract?神,? 蝺??萄???2026-05-07,敺齒,AI閰?敺之撟?撖俞n45摨西?隞餃?皜祈岫,?? 擃??璇???2026-05-02,?脰?銝?';
}

function loadCsvFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  document.getElementById('csv-file-name').textContent = '?? ' + file.name;
  const reader = new FileReader();
  reader.onload = function(e) {
    // Strip BOM if present
    let text = e.target.result;
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    document.getElementById('import-textarea').value = text;
    showToast('??瑼?撌脰??伐?暺??閫???汗?Ⅱ隤?);
  };
  reader.readAsText(file, 'UTF-8');
}

function parseImport() {
  const raw = document.getElementById('import-textarea').value.trim();
  if (!raw) { showToast('隢?鞎澆?批捆'); return; }
  importParsed = importMode === 'csv' ? parseCsvTasks(raw) : parseAutoTasks(raw);
  importParsed = importParsed.map(t => ({ ...t, _errors: validateImportedTask(t) }));
  renderImportPreview();
}

/**
 * AI 閫?????亙嚗洵銝?挾銝?亙?垢?澆憭 API?? * @returns {Promise<Array<object>>} 隞餃?皜?? */
async function parseTasksWithAI() {
  showToast('AI 閫??撠敺? Edge Function ??亙');
  return [];
}

function parseCsvTasks(raw) {
  const catMap = {
    '蝺?:'? 蝺?,'?':'? 蝺?,'? 蝺?:'? 蝺?,
    '擃??:'?? 擃??,'擃?:'?? 擃??,'??':'?? 擃??,'?? 擃??:'?? 擃??,
    '銝剖??:'? 銝剖??,'銝?:'? 銝剖??,'?':'? 銝剖??,'? 銝剖??:'? 銝剖??,
    '??':'? ??','?':'? ??','? ??':'? ??'
  };
  const statusMap = {'敺齒':'敺齒','?脰?銝?:'?脰?銝?,'撌脣???:'撌脣???,
    'done':'撌脣???,'todo':'敺齒','in_progress':'?脰?銝?,'inprog':'?脰?銝?,'completed':'撌脣???};

  const lines = raw.split('\n').map(l=>l.trim()).filter(Boolean);
  // Detect if first row is header (name/cat/owner/due/status/note)
  let dataLines = lines;
  if (lines.length > 0) {
    const h = lines[0].toLowerCase();
    if (h.startsWith('name') || h.startsWith('隞餃?') || h.startsWith('task')) {
      dataLines = lines.slice(1); // skip header row
    }
  }

  return dataLines.map(line => {
    // Handle quoted CSV fields
    const cols = [];
    let cur = '', inQ = false;
    for (let i=0;i<line.length;i++) {
      const c = line[i];
      if (c==='"') { inQ=!inQ; }
      else if (c===',' && !inQ) { cols.push(cur.trim()); cur=''; }
      else { cur+=c; }
    }
    cols.push(cur.trim());

    // Map to exact Supabase columns: name, cat, owner, due, status, note
    const rawCat = cols[1] || '';
    const cat = catMap[rawCat.trim()] || (rawCat.match(/[?????]/) ? rawCat.trim() : '? 銝剖??);
    const rawStatus = (cols[4]||'').trim().toLowerCase();
    const due = cols[3] ? cols[3].trim() : null;
    return {
      name:   (cols[0]||'').trim(),
      cat,
      owner:  (cols[2]||'').trim(),
      due:    (due && due.match(/^\d{4}-\d{2}-\d{2}$/)) ? due : null,
      status: statusMap[rawStatus] || (cols[4]||'敺齒').trim() || '敺齒',
      note:   (cols[5]||'').trim()
    };
  }).filter(t => t.name && t.name.length > 0);
}

function parseAutoTasks(raw) {
  const tasks = [];
  const lines = raw.split('\n');

  const actionPatterns = [
    /隞憭拇]摰?[鈭?]?(.{4,50})/,
    /隞憭拇].*?摰?(.{4,50})/,
    /隞憭拇].*?([摰靽株身?矽皜祆][???寡??啗岫皞.{3,35})/,
    /?憭拇].*?摰?(.{4,40})/,
    /?憭拇][閮?閮???]?[:嚗?(.{4,40})/,
    /撌脣???.{4,40})/,
    /甇?(.{4,40})/,
    /?閬?.{4,40})/,
    /隢?.{3,30})[????鈭支??單?/,
    /^[-?Ⅹ愍\s*(.{4,50})/,
    /^([A-Za-z\u4e00-\u9fff].{4,55})[?閬?][閬齒]/,
  ];

  const urgentKW = ['蝺?,'蝡','隞予','隞','ASAP','撽砌?','擐砌?'];
  const highKW   = ['?予','?','?祇?,'?砍','?翰','?∪翰','?芸?'];
  const doneKW   = ['撌脣???,'摰?鈭?,'done','撌脖???,'撌脩??,'撌脩??,'撌脫??,'撌脫???];
  const inProgKW = ['甇?','?脰?銝?,'蝜潛?','continuing','皜祈岫銝?,'??'];

  const ownerMap = {
    '?萄???:'?萄???,'摰':'?萄???,
    '?其誑頠?:'?其誑頠?,'隞亥?':'?其誑頠?,
    '瘣芸?瞈?:'瘣芸?瞈?,'??':'瘣芸?瞈?,
    '璇???:'璇???,'閫??:'璇???,
    '頝舀??:'頝舀??,'?輸?':'頝舀??,
    '璇?頠?:'璇?頠?,'??':'璇?頠?,
    '??蝧?:'??蝧?,'?蕨':'??蝧?,
    '雿???:'雿???,'?':'雿???,
    '?扯姥頠?:'?扯姥頠?,'隢曇?':'?扯姥頠?,
  };

  function detectOwner(text) {
    for (const [k,v] of Object.entries(ownerMap)) {
      if (text.includes(k)) return v;
    }
    const m = text.match(/@([\u4e00-\u9fff]{2,4})/);
    return m ? m[1] : '';
  }

  function detectCat(text) {
    if (urgentKW.some(k=>text.includes(k))) return '? 蝺?;
    if (highKW.some(k=>text.includes(k)))   return '?? 擃??;
    if (text.includes('??')||text.includes('瘥')||text.includes('瘥予')) return '? ??';
    return '? 銝剖??;
  }

  function detectStatus(text) {
    if (doneKW.some(k=>text.includes(k)))   return '撌脣???;
    if (inProgKW.some(k=>text.includes(k))) return '?脰?銝?;
    return '敺齒';
  }

  function extractDate(text) {
    const m1 = text.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (m1) return `${m1[1]}-${m1[2].padStart(2,'0')}-${m1[3].padStart(2,'0')}`;
    const m2 = text.match(/(\d{1,2})[?/](\d{1,2})[?亙]?/);
    if (m2) return `2026-${m2[1].padStart(2,'0')}-${m2[2].padStart(2,'0')}`;
    return null;
  }

  function cleanTask(text) {
    return text.replace(/[嚗???:!.]+$/, '').replace(/^[鈭??啣?嚗?]/, '').trim();
  }

  const seen = new Set();
  lines.forEach(line => {
    line = line.trim();
    if (!line || line.length < 5) return;
    if (line.startsWith('http') || line.startsWith('@')) return;

    for (const pat of actionPatterns) {
      const m = line.match(pat);
      if (m) {
        const raw = (m[1] || m[0]).trim();
        const taskName = cleanTask(raw.substring(0, 60));
        if (taskName.length < 4 || seen.has(taskName)) continue;
        seen.add(taskName);
        tasks.push({
          name: taskName,
          cat: detectCat(line),
          owner: detectOwner(line),
          due: extractDate(line),
          status: detectStatus(line),
          note: line.substring(0, 120)
        });
        break;
      }
    }
  });

  if (tasks.length === 0) {
    lines.filter(l=>l.trim().length>4 && !l.startsWith('http') && !l.startsWith('@'))
      .slice(0,30).forEach(line=>{
        const taskName = cleanTask(line.trim().substring(0,60));
        if (taskName.length<4 || seen.has(taskName)) return;
        seen.add(taskName);
        tasks.push({ name:taskName, cat:'? 銝剖??, owner:detectOwner(line), due:extractDate(line), status:detectStatus(line), note:'' });
      });
  }
  return tasks;
}

function renderImportPreview() {
  const count = importParsed.length;
  document.getElementById('import-count').textContent = count > 0 ? `撌脰圾??${count} 璇遙? : '?芾閫??隞餃?嚗?蝣箄??澆?';
  document.getElementById('import-confirm-btn').style.display = count > 0 ? '' : 'none';

  if (count === 0) {
    document.getElementById('import-preview').innerHTML = '<p style="color:#999;font-size:.85rem;padding:10px">?芾霅隞颱?隞餃????岫 CSV ?澆?嚗?蝣箄???銝剜??Ⅱ???膩??/p>';
    return;
  }

  const catColor = {'? 蝺?:'#FFD6D6','?? 擃??:'#FCE4D6','? 銝剖??:'#FFF3CD','? ??':'#D5F5E3'};

  let html = `<table style="width:100%;font-size:.8rem;border-collapse:collapse">
    <thead><tr style="background:var(--navy);color:#fff">
      <th style="padding:5px 7px">??/th>
      <th style="padding:5px 7px;text-align:left">隞餃??迂</th>
      <th style="padding:5px 7px;text-align:left">憿</th>
      <th style="padding:5px 7px;text-align:left">鞎痊鈭?/th>
      <th style="padding:5px 7px;text-align:left">??</th>
      <th style="padding:5px 7px;text-align:left">???/th>
    </tr></thead><tbody>`;

  importParsed.forEach((t, i) => {
    const bg = catColor[t.cat] || '#fff';
    const errors = t._errors || [];
    html += `<tr style="background:${i%2===0?'#fafbff':'#fff'};border-bottom:1px solid #eee">
      <td style="padding:4px 7px;text-align:center"><input type="checkbox" checked id="imp-chk-${i}" style="width:14px;height:14px"></td>
      <td style="padding:4px 7px;font-weight:600;max-width:200px">${t.name}${errors.length?`<div style="color:var(--red);font-size:.72rem;margin-top:2px">${errors.join('??)}</div>`:''}</td>
      <td style="padding:4px 7px"><span style="background:${bg};padding:1px 6px;border-radius:99px;font-size:.75rem">${t.cat}</span></td>
      <td style="padding:4px 7px"><input type="text" value="${t.owner||''}" id="imp-owner-${i}" style="width:80px;padding:2px 5px;font-size:.78rem;border:1px solid #ddd;border-radius:4px"></td>
      <td style="padding:4px 7px"><input type="date" value="${t.due||''}" id="imp-due-${i}" style="width:120px;padding:2px 5px;font-size:.78rem;border:1px solid #ddd;border-radius:4px"></td>
      <td style="padding:4px 7px">
        <select id="imp-status-${i}" style="padding:2px 5px;font-size:.78rem;border:1px solid #ddd;border-radius:4px">
          <option ${t.status==='敺齒'?'selected':''}>敺齒</option>
          <option ${t.status==='?脰?銝??'selected':''}>?脰?銝?/option>
          <option ${t.status==='撌脣????'selected':''}>撌脣???/option>
        </select>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('import-preview').innerHTML = html;
}

async function confirmImport() {
  const toInsert = importParsed
    .filter((t,i) => { const chk = document.getElementById('imp-chk-'+i); return chk && chk.checked; })
    .map((t,i) => ({
      name: t.name,
      cat: t.cat,
      owner: (document.getElementById('imp-owner-'+i)?.value || t.owner || '').trim(),
      due: document.getElementById('imp-due-'+i)?.value || t.due || null,
      status: document.getElementById('imp-status-'+i)?.value || t.status,
      note: t.note || ''
    }));

  if (!toInsert.length) { showToast('隢撠?訾?璇遙??); return; }
  const invalid = toInsert.map((t, i) => ({ i, errors: validateImportedTask(t) })).filter(x => x.errors.length);
  if (invalid.length) {
    alert('?臬鞈?隞??航炊嚗?靽格迤敺??臬嚗n' + invalid.map(x => `蝚?${x.i + 1} 蝑?${x.errors.join('??)}`).join('\n'));
    return;
  }

  const btn = document.getElementById('import-confirm-btn');
  btn.textContent = '??皛銝凌?; btn.disabled = true;

  try {
    const payload = toInsert.map((t, i) => buildTaskPayload({ ...t, start_date: null, depends_on: null, season: currentSeason, sort_order: nextTaskSortOrder() + i }));
    const { data, error } = await db.from('tasks').insert(payload).select();
    if (error) throw error;
    if (data) {
      state.tasks.push(...data.map(normalizeTask));
      await writeAuditLog('import', 'tasks', null, null, { count: data.length, ids: data.map(t=>t.id) });
    }
    closeModal('import-modal');
    refreshAfterTaskChange();
    showToast('????皛 ' + toInsert.length + ' 璇遙??');
  } catch(e) {
    btn.textContent = '??蝣箄??券皛'; btn.disabled = false;
    alert('??皛憭望?嚗? + (e.message||e) + '\n\n隢Ⅱ隤?Supabase ?????RLS 閮剖?');
  }
}

/**
 * 撽??寥??臬隞餃??? * @param {object} task ?臬隞餃??? * @returns {string[]} ?航炊閮?? */
function validateImportedTask(task) {
  const errors = [];
  if (!task.name) errors.push('蝻箔遙??蝔?);
  if (!task.owner) errors.push('蝻箄?鞎砌犖');
  if (task.due && !/^\d{4}-\d{2}-\d{2}$/.test(task.due)) errors.push('???澆??航炊');
  if (!['敺齒','?脰?銝?,'撌脣???].includes(task.status)) errors.push('?????');
  return errors;
}

// ????????????????????????????????????????????????????????// INIT
// ????????????????????????????????????????????????????????(async function init() {
  initFrontendErrorTracking();
  initUserPreferences();
  initKeyboardShortcuts();
  initCompetitionAutosave();
  initNetworkStatusMonitor();
  const initialMode = getRoleView() === 'team' ? 'competition' : 'review';
  const cached = restoreBootCache();
  if (cached) {
    isInitialLoading = false;
    showMode(initialMode, document.querySelector(`nav .tab-btn[data-mode="${initialMode}"]`));
    showToast('撌脣?頛?祆?敹怠?嚗迤?典?甇亥??澈...', 1800);
  } else {
    showSkeleton('dashboard');
    isInitialLoading = false;
    showMode(initialMode, document.querySelector(`nav .tab-btn[data-mode="${initialMode}"]`));
    isInitialLoading = true;
  }
  try {
    await loadFromSupabase();
    logSystemEvent('info', '鞈?摨怠?甇亙???, `${Math.round(performance.now())}ms since page start`);
    initAutoSystemBackup();
  } finally {
    isInitialLoading = false;
    showMode(initialMode, document.querySelector(`nav .tab-btn[data-mode="${initialMode}"]`));
  }
})();
