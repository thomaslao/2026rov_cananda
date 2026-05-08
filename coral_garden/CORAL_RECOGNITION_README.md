# 🪸 Coral Garden 图像识别系统

> MATE ROV 2026 World Championship - Task 1.2 Seabed 2030  
> 功能：珊瑚物种识别、覆盖度分析、目标板检测

---

## 📦 安装依赖

```bash
# 基础依赖
pip install opencv-python numpy matplotlib tqdm Pillow

# YOLOv8支持（可选，用于高级检测）
pip install ultralytics
```

---

## 🚀 快速开始

### 1. 珊瑚检测（单图像）

```bash
# 使用传统CV方法（基于颜色）
python coral_recognition.py detect -i coral_image.jpg -o ./output

# 使用YOLOv8方法（需要预训练模型）
python coral_recognition.py detect -i coral_image.jpg -o ./output --method yolo --model coral_model.pt
```

**输出：**
- 可视化图像（标注检测到的珊瑚）
- 控制台输出检测结果

### 2. 珊瑚覆盖度分析

```bash
# 分析单张图像的珊瑚覆盖度
python coral_recognition.py coverage -i coral_image.jpg -o ./output
```

**输出：**
- 覆盖度百分比
- 可视化饼图和mask

### 3. ArUco目标板检测

```bash
# 检测图像中的ArUco markers
python coral_recognition.py aruco -i frame_with_targets.jpg -o ./output --marker-size 5.0
```

**输出：**
- 检测到的marker数量
- Marker IDs
- marker之间的距离（像素）

### 4. 批量分析

```bash
# 批量分析目录中的所有图像
python coral_recognition.py batch -i ./coral_images -o ./output --method traditional
```

**输出：**
- 每张图像的分析结果
- 可视化结果
- 汇总JSON文件

---

##  功能详解

### 功能1：珊瑚检测

支持两种检测方法：

#### 方法A：传统CV（基于颜色）
```python
# 检测原理：
# 1. 转换到HSV色彩空间
# 2. 应用珊瑚颜色范围
#    - 棕色: (10-25, 50-255, 50-255)
#    - 绿色: (40-70, 50-255, 50-255)
#    - 粉色: (140-170, 50-255, 50-255)
#    - 紫色: (125-155, 50-255, 50-255)
# 3. 形态学操作（闭运算+开运算）
# 4. 轮廓检测（面积>1000像素）
```

**优点：**
- ✅ 无需训练模型
- ✅ 快速部署
- ✅ 适合常见珊瑚颜色

**缺点：**
- ❌ 对颜色变化敏感
- ❌ 可能误检相似颜色物体

#### 方法B：YOLOv8（深度学习）
```python
# 需要先训练珊瑚检测模型
# 或使用预训练的水下物体检测模型
```

**优点：**
- ✅ 高准确率
- ✅ 可识别多种珊瑚物种
- ✅ 适应复杂环境

**缺点：**
- ❌ 需要训练数据
- ❌ 需要GPU加速
- ❌ 部署复杂

### 功能2：覆盖度分析

```python
# 分析流程：
# 1. 颜色分割获取珊瑚mask
# 2. 计算珊瑚像素数
# 3. 计算覆盖度百分比 = (珊瑚像素 / 总像素) × 100
# 4. 生成可视化报告
```

**输出指标：**
- 覆盖度百分比（%）
- 珊瑚像素数量
- 总像素数量
- Mask图像
- 饼图分布

### 功能3：ArUco网格检测

```python
# 检测流程：
# 1. 检测所有ArUco markers
# 2. 计算marker中心点
# 3. 计算marker之间的距离
# 4. 用于比例尺校准
```

**用途：**
- ✅ 验证目标板数量（≥8个）
- ✅ 计算实际距离（像素→厘米）
- ✅ 提供Photogrammetry比例尺

### 功能4：批量分析

```python
# 批量处理流程：
# 1. 遍历目录中所有图像
# 2. 对每张图像执行检测+覆盖度分析
# 3. 保存可视化结果
# 4. 生成汇总JSON
```

**输出结构：**
```
output/
── analyzed_image1.jpg        # 检测可视化
├── coverage_image1.png        # 覆盖度分析图
├── analyzed_image2.jpg
├── coverage_image2.png
└── analysis_summary.json      # 汇总报告
```

---

## 🎯 实际应用示例

### 示例1：扫描后快速评估

```bash
# 1. 视频拆幀（使用frame_extractor.py）
python frame_extractor.py extract -i scan_video.mp4 -o ./frames --fps 5

# 2. 批量分析珊瑚覆盖度
python coral_recognition.py batch -i ./frames/good -o ./analysis

# 3. 查看结果
# 检查 analysis/analysis_summary.json
```

### 示例2：目标板验证

```bash
# 检测目标板
python coral_recognition.py aruco -i frame_with_targets.jpg -o ./verify

# 输出示例：
# 检测到 8 个ArUco markers:
#   Marker IDs: [1, 2, 3, 4, 5, 6, 7, 8]
#   找到 28 个距离对
#     ID 1 ↔ ID 2: 245.3 pixels
#     ID 1 ↔ ID 3: 412.7 pixels
#     ...

# 确认≥8个目标板都可见 ✅
```

### 示例3：珊瑚健康评估

```bash
# 分析多张图像的平均覆盖度
python coral_recognition.py batch -i ./coral_survey -o ./health_report

# 分析结果：
# {
#   "total_images": 50,
#   "analyzed_images": 48,
#   "results": [
#     {
#       "image": "frame_001.jpg",
#       "num_detections": 12,
#       "coverage_percentage": 23.5
#     },
#     ...
#   ]
# }

# 计算平均覆盖度：22.8%
# 珊瑚健康状态：良好 ✅
```

---

##  参数调优

### 珊瑚检测参数

| 参数 | 默认值 | 建议范围 | 说明 |
|------|--------|----------|------|
| `--confidence` | 0.5 | 0.3-0.8 | 检测置信度阈值 |
| `--method` | traditional | yolo/traditional | 检测方法 |

**调优建议：**
- 水下环境浑浊：降低confidence到0.3-0.4
- 清晰环境：提高到0.6-0.7
- 需要高准确率：使用YOLO方法

### 颜色范围调整

在 `coral_recognition.py` 中修改：

```python
self.coral_color_ranges = {
    'brown': ((10, 50, 50), (25, 255, 255)),    # 棕色珊瑚
    'green': ((40, 50, 50), (70, 255, 255)),    # 绿色珊瑚
    'pink': ((140, 50, 50), (170, 255, 255)),   # 粉色珊瑚
    'purple': ((125, 50, 50), (155, 255, 255)), # 紫色珊瑚
}
```

**如何确定颜色范围？**
1. 使用OpenCV的 `cv2.cvtColor()` 转换到HSV
2. 使用工具查看珊瑚区域的HSV值
3. 调整范围以匹配实际颜色

---

## 📈 输出数据格式

### JSON汇总文件

```json
{
  "total_images": 50,
  "analyzed_images": 48,
  "results": [
    {
      "image": "frame_001.jpg",
      "num_detections": 12,
      "coverage_percentage": 23.5,
      "timestamp": "2026-05-06T10:30:00"
    }
  ],
  "timestamp": "2026-05-06T10:35:00"
}
```

### 可视化输出

1. **检测结果图**
   - 绿色框：高置信度检测（>0.7）
   - 黄色框：低置信度检测（≤0.7）
   - 标注：类别名称 + 置信度

2. **覆盖度分析图**
   - 左侧：珊瑚mask（黑白）
   - 右侧：覆盖度饼图

---

## 🧪 测试与验证

### 测试检测准确性

```bash
# 1. 准备测试集（已知结果的图像）
# 2. 运行检测
python coral_recognition.py batch -i ./test_set -o ./test_results

# 3. 对比结果
# - 检测数量是否准确？
# - 覆盖度是否合理？
# - 边界框是否精确？
```

### 验证ArUco检测

```bash
# 使用已知marker配置测试
python coral_recognition.py aruco -i test_aruco_grid.jpg -o ./verify

# 验证：
# ✅ 检测到正确数量的markers
# ✅ ID识别正确
# ✅ 距离计算准确
```

---

## 🎓 使用建议

### 赛场应用

1. **扫描前**
   - 准备测试图像验证检测参数
   - 确认ArUco检测正常工作

2. **扫描后**
   - 快速批量分析覆盖度
   - 验证目标板可见性
   - 生成报告给评分官

3. **紧急备案**
   - 如果检测失败，使用手动标注
   - 准备CAD建模作为备用

### 训练建议

- [ ] 收集不同光照条件下的珊瑚图像
- [ ] 标注测试集验证检测准确率
- [ ] 测试不同水质条件下的表现
- [ ] 优化颜色范围以适应实际环境

---

##  参考资源

- **OpenCV文档**: https://docs.opencv.org/
- **YOLOv8文档**: https://docs.ultralytics.com/
- **ArUco教程**: https://docs.opencv.org/4.x/d5/dae/tutorial_aruco_detection.html
- **珊瑚颜色分析**: 根据实际珊瑚种类调整HSV范围

---

## ⚠️ 注意事项

1. **水下环境影响**
   - 光线衰减会影响颜色识别
   - 悬浮物会降低图像质量
   - 建议配合frame_extractor的模糊筛选

2. **颜色范围限制**
   - 当前只支持4种常见颜色
   - 如需检测其他颜色，手动添加范围

3. **YOLO模型**
   - 需要自定义训练珊瑚检测模型
   - 或使用公开的水下物体检测模型

4. **性能优化**
   - 大批量处理时考虑GPU加速
   - 使用多线程/多进程

---

*最后更新：2026-05-06 | 版本：v1.0*
