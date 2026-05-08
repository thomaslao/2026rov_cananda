# Task 1.2 — Coral Garden Modelling 技術棧

> MATE ROV 2026 World Championship | Task 1 Seabed 2030  
> 最高得分：**40 分** | 場地：Flume Tank（有水流）

---

## 1. 任務規格速覽

| 方法 | 最高分 | 核心要求 |
|------|--------|----------|
| **攝影測量 Photogrammetry（自動）** | 40 | 彩色目標方塊可見、長度已量測驗證、比例正確、高度誤差 ≤5 cm |
| 手工 CAD 建模 | 30 | 長度與高度誤差各 ≤5 cm，可旋轉 3D 模型 |
| 紙面三視圖 | 20 | 長度與高度誤差各 ≤5 cm，正、俯、側三視圖 |

> ⚠️ 三種方法可同時進行，但只計最高分一種。

---

## 2. 推薦技術棧（Photogrammetry 路線，目標滿分 40 分）

### 2.1 硬體層

| 元件 | 規格 / 說明 | 用途 |
|------|-------------|------|
| **主攝影機** | 1080p@30fps USB / CSI 廣角鏡頭（FoV ≥ 90°）| 珊瑚礁主體拍攝 |
| **比例尺目標板** | 打印彩色 ArUco marker（≥4×4 cm），防水護貝 | 提供已知尺寸基準 |
| **燈光** | 2×LED 水下燈（至少 1000 lm），左右對稱安裝 | 均勻補光，減少陰影 |
| **ROV 本體** | 6 推進器配置（5自由度以上）| Flume Tank 水流中穩定懸停 |
| **深度感測器** | MS5837-30BA（I2C）| 記錄掃描深度 |

### 2.2 軟體層 — 影像採集

```
主控端（Surface Laptop）
  ├── GStreamer / OpenCV VideoCapture
  ├── 即時畫面顯示（GUI）
  └── 影片錄製：H.264 MP4，≥30fps，解析度 1080p

ROV 端（Raspberry Pi 4 / 5）
  ├── libcamera / Pi Camera 驅動
  ├── UDP 串流 → 5600 port
  └── 時間戳記同步（NTP 或 PPS）
```

### 2.3 軟體層 — 3D 建模（Photogrammetry）

| 工具 | 類型 | 用途 | 備註 |
|------|------|------|------|
| **Meshroom (AliceVision)** | 免費開源 | 離線 SfM + MVS 建模 | **首選**，支援 GPU 加速 |
| **COLMAP** | 免費開源 | 純 SfM 重建 + 稠密點雲 | 備用，CLI 友好 |
| **OpenDroneMap (ODM)** | 免費開源 | 自動化 Photogrammetry 管線 | Docker 部署可 |
| **Metashape (Agisoft)** | 商業（有學術版）| 高品質，GCP 支援強 | 備選 |
| **CloudCompare** | 免費開源 | 點雲量測、長度/高度計算 | 必裝，賽場量測用 |

```
標準處理管線：
影片幀提取（ffmpeg）
  → 影像品質篩選（模糊偵測）
  → Meshroom SfM → 稠密點雲 → Mesh
  → CloudCompare 量測（長度 L、高度 H）
  → 導出 OBJ / PLY
  → 賽場電腦展示（旋轉 3D 模型）
```

### 2.4 軟體層 — CAD 備案（目標 30 分）

| 工具 | 說明 |
|------|------|
| **FreeCAD** | 免費，跨平台，匯出 STEP/STL |
| **Fusion 360**（教育版）| 功能完整，快速建模 |
| **Tinkercad** | 最快上手，適合賽場緊急備案 |

> CAD 路線只需量好長度 L 和高度 H（各 ≤5 cm 誤差），建出可旋轉的縮比 3D 模型即可得 30 分。

### 2.5 賽場展示環境

```
賽場筆記型電腦
  ├── 作業系統：Ubuntu 22.04 LTS（建議）或 Windows 11
  ├── Meshroom / CloudCompare（預裝，離線使用）
  ├── FreeCAD / Fusion 360（CAD 備案）
  ├── Python 3.10+
  │     ├── opencv-python（影片拆幀、模糊篩選）
  │     ├── numpy, matplotlib（量測資料視覺化）
  │     └── open3d（點雲瀏覽備用）
  └── ffmpeg（影片處理 CLI）
```

---

## 3. 目標方塊（Photogrammetry 必要條件）

| 參數 | 建議值 |
|------|--------|
| 類型 | ArUco DICT_4X4_50 或彩色編碼圓形標靶 |
| 尺寸 | 5×5 cm（實體），防水護貝或防水打印 |
| 數量 | ≥8 個（分布於珊瑚礁前、中、後、左、右、頂部）|
| 固定方式 | 磁吸底座 / 吸盤，賽前由操作員擺放 |
| 已知距離 | 兩個標靶間距需事先量測記錄（作為比例尺）|

---

## 4. 操作 SOP（賽場 15 分鐘內完成）

```
階段 0：賽前準備（入水前）
  □ 確認目標板已擺放，記錄兩板間已知距離
  □ 確認攝影機白平衡鎖定（避免曝光變化）
  □ 開始錄影（1080p@30fps）

階段 1：掃描飛行（入水後 ~3 分鐘）
  □ Z 字形掃描：從左→右，前→後，覆蓋所有目標板
  □ 補充環繞掃描：圍繞珊瑚礁頂部一圈（確保覆蓋高度）
  □ 確認每個目標板至少出現 3 次以上畫面

階段 2：離水後建模（~8 分鐘）
  □ ffmpeg 拆幀（每秒取 5 幀）
  □ 模糊偵測，刪除低品質幀
  □ Meshroom 建模（GPU 模式 ~5 分鐘）
  □ CloudCompare 量測 L 和 H，驗證誤差 ≤5 cm

階段 3：賽場交付
  □ 旋轉展示 3D 模型給評分官
  □ 報告 L（長度）和 H（高度）量測值
```

---

## 5. 降級策略（Plan B / C）

| 情境 | 降級方案 | 預期得分 |
|------|----------|----------|
| Photogrammetry 建模失敗 | 切換 CAD 手工建模（FreeCAD / Tinkercad）| 30 分 |
| CAD 軟體故障 | 紙面三視圖（帶比例尺手繪）| 20 分 |
| 時間不足 | 優先完成長度 L 量測（不管高度 H）| 可部分得分 |
| 目標板被衝走 | 改用 ROV 本體已知尺寸作比例參考 | 維持嘗試 |

---

## 6. 參考 Repos（其他隊伍技術）

| 隊伍 | Repo | 技術重點 |
|------|------|----------|
| ABfathy | [mate-rov-2026/task-roadmap.md](https://github.com/ABfathy/mate-rov-2026/blob/main/docs/planning/task-roadmap.md) | 任務規劃含 coral-garden workflow 開發項 |
| v0idk-dev | [MATE2026/tasks.json](https://github.com/v0idk-dev/MATE2026/blob/main/app/tasks.json) | 完整任務 1.2 規格 JSON |
| Gyrodos HK | [gyrodos-crab-detection](https://github.com/GyrodosRobotics/gyrodos-crab-detection) | YOLOv11 水下視覺（Task 2 技術可借鑑）|

---

## 7. 待辦清單（Backlog）

- [ ] 採購並防水處理 ArUco 目標板（≥8 個）
- [ ] 測試 Meshroom GPU 模式在賽場筆電上的建模時間
- [ ] 建立 ffmpeg 一鍵拆幀 + 模糊篩選腳本
- [ ] 訓練操控員完成 Z 字形掃描路徑（目標：3 分鐘內）
- [ ] 製作 CloudCompare 量測 SOP 錄影
- [ ] 驗證 CAD 備案流程（FreeCAD）可在 5 分鐘內完成基本模型
- [ ] 在 Flume Tank 水流環境中測試懸停穩定性

---

*最後更新：2026-05-06 | 參考：MATE ROV 2026 官方規則手冊*
