#!/usr/bin/env python3
"""
Coral Garden 图像识别系统
MATE ROV 2026 World Championship - Task 1.2

功能：
1. 珊瑚物种识别（基于YOLOv8或传统CV方法）
2. 珊瑚覆盖度分析
3. 目标板检测与定位
4. 珊瑚礁健康状态评估
5. 批量图像分析

依赖安装：
pip install opencv-python numpy ultralytics tqdm pillow matplotlib
"""

import cv2
import numpy as np
from pathlib import Path
from tqdm import tqdm
import json
import argparse
from datetime import datetime
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg


class CoralDetector:
    """珊瑚检测器（支持YOLOv8和传统CV方法）"""
    
    def __init__(self, method='yolo', model_path=None, confidence=0.5):
        """
        Args:
            method: 检测方法 'yolo' 或 'traditional'
            model_path: YOLO模型路径（如果使用yolo方法）
            confidence: 检测置信度阈值
        """
        self.method = method
        self.confidence = confidence
        self.model = None
        
        if method == 'yolo':
            try:
                from ultralytics import YOLO
                if model_path:
                    self.model = YOLO(model_path)
                else:
                    # 使用预训练模型或自定义珊瑚检测模型
                    print("警告: 未提供YOLO模型路径，将使用传统CV方法")
                    self.method = 'traditional'
            except ImportError:
                print("警告: 未安装ultralytics，将使用传统CV方法")
                print("安装命令: pip install ultralytics")
                self.method = 'traditional'
        
        # 珊瑚颜色范围（用于传统CV方法）
        self.coral_color_ranges = {
            'brown': ((10, 50, 50), (25, 255, 255)),
            'green': ((40, 50, 50), (70, 255, 255)),
            'pink': ((140, 50, 50), (170, 255, 255)),
            'purple': ((125, 50, 50), (155, 255, 255)),
        }
    
    def detect_coral(self, image):
        """检测图像中的珊瑚"""
        if self.method == 'yolo' and self.model:
            return self._detect_yolo(image)
        else:
            detections, mask = self._detect_traditional(image)
            return detections
    
    def _detect_yolo(self, image):
        """使用YOLO检测珊瑚"""
        results = self.model(image, conf=self.confidence)
        
        detections = []
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                
                detections.append({
                    'bbox': [x1, y1, x2, y2],
                    'confidence': confidence,
                    'class_id': class_id,
                    'class_name': result.names.get(class_id, 'unknown')
                })
        
        return detections
    
    def _detect_traditional(self, image):
        """使用传统CV方法检测珊瑚（基于颜色和纹理）"""
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        coral_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
        
        # 合并所有珊瑚颜色范围
        for color_name, (lower, upper) in self.coral_color_ranges.items():
            lower = np.array(lower, dtype=np.uint8)
            upper = np.array(upper, dtype=np.uint8)
            mask = cv2.inRange(hsv, lower, upper)
            coral_mask = cv2.bitwise_or(coral_mask, mask)
        
        # 形态学操作
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        coral_mask = cv2.morphologyEx(coral_mask, cv2.MORPH_CLOSE, kernel)
        coral_mask = cv2.morphologyEx(coral_mask, cv2.MORPH_OPEN, kernel)
        
        # 查找轮廓
        contours, _ = cv2.findContours(coral_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        detections = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:  # 最小面积阈值
                x, y, w, h = cv2.boundingRect(contour)
                confidence = min(area / 10000.0, 1.0)  # 基于面积的置信度
                
                detections.append({
                    'bbox': [float(x), float(y), float(x + w), float(y + h)],
                    'confidence': float(confidence),
                    'area': float(area),
                    'method': 'traditional_cv'
                })
        
        return detections, coral_mask
    
    def visualize_detections(self, image, detections, output_path=None):
        """可视化检测结果"""
        output = image.copy()
        
        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            confidence = det['confidence']
            
            # 绘制边界框
            color = (0, 255, 0) if confidence > 0.7 else (0, 255, 255)
            cv2.rectangle(output, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
            
            # 标注置信度
            label = f"Coral {confidence:.2f}"
            if 'class_name' in det:
                label = f"{det['class_name']} {confidence:.2f}"
            
            cv2.putText(output, label, (int(x1), int(y1) - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        if output_path:
            cv2.imwrite(output_path, output)
        
        return output


class CoralCoverageAnalyzer:
    """珊瑚覆盖度分析器"""
    
    def __init__(self):
        pass
    
    def analyze_coverage(self, image, coral_mask=None):
        """分析图像中的珊瑚覆盖度"""
        if coral_mask is None:
            # 如果没有提供mask，使用简单的颜色分割
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # 珊瑚颜色范围（可调整）
            lower_coral = np.array([0, 50, 50])
            upper_coral = np.array([30, 255, 255])
            coral_mask = cv2.inRange(hsv, lower_coral, upper_coral)
        
        # 计算覆盖度
        total_pixels = image.shape[0] * image.shape[1]
        coral_pixels = cv2.countNonZero(coral_mask)
        coverage_percentage = (coral_pixels / total_pixels) * 100
        
        return {
            'coverage_percentage': coverage_percentage,
            'coral_pixels': coral_pixels,
            'total_pixels': total_pixels,
            'mask': coral_mask
        }
    
    def plot_coverage(self, coverage_data, output_path=None):
        """绘制覆盖度分析图"""
        fig, axes = plt.subplots(1, 2, figsize=(12, 5))
        
        # 原始mask
        axes[0].imshow(coverage_data['mask'], cmap='gray')
        axes[0].set_title(f'Coral Mask (Coverage: {coverage_data["coverage_percentage"]:.2f}%)')
        axes[0].axis('off')
        
        # 覆盖度饼图
        labels = ['Coral', 'Non-Coral']
        sizes = [coverage_data['coverage_percentage'], 
                100 - coverage_data['coverage_percentage']]
        colors = ['#FF6B6B', '#4ECDC4']
        
        axes[1].pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', 
                   startangle=90)
        axes[1].set_title('Coral Coverage Distribution')
        
        plt.tight_layout()
        
        if output_path:
            plt.savefig(output_path, dpi=150, bbox_inches='tight')
        else:
            plt.show()
        
        plt.close()


class ArUcoGridDetector:
    """ArUco网格检测器（用于比例尺）"""
    
    def __init__(self, dict_type=cv2.aruco.DICT_4X4_50, marker_size_cm=5.0):
        self.marker_size_cm = marker_size_cm
        self.dictionary = cv2.aruco.getPredefinedDictionary(dict_type)
        self.parameters = cv2.aruco.DetectorParameters()
        self.detector = cv2.aruco.ArucoDetector(self.dictionary, self.parameters)
    
    def detect_grid(self, image):
        """检测ArUco网格并计算比例"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        corners, ids, rejected = self.detector.detectMarkers(gray)
        
        if ids is None:
            return None
        
        # 确保ids是一维列表
        ids_list = ids.flatten().tolist()
        
        # 计算marker之间的距离（用于比例尺）
        distances = []
        for i in range(len(ids_list)):
            for j in range(i + 1, len(ids_list)):
                center_i = np.mean(corners[i][0], axis=0)
                center_j = np.mean(corners[j][0], axis=0)
                distance = np.linalg.norm(center_i - center_j)
                distances.append({
                    'id1': int(ids_list[i]),
                    'id2': int(ids_list[j]),
                    'pixel_distance': float(distance)
                })
        
        return {
            'num_markers': len(ids_list),
            'marker_ids': [int(id_) for id_ in ids_list],
            'distances': distances
        }


def batch_analyze_directory(input_dir, output_dir, method='traditional', confidence=0.5):
    """批量分析目录中的图像"""
    input_path = Path(input_dir)
    image_files = list(input_path.glob("*.jpg")) + list(input_path.glob("*.png"))
    
    if not image_files:
        print(f"❌ 在 {input_dir} 中未找到图像文件")
        return
    
    print(f" 找到 {len(image_files)} 个图像文件\n")
    
    detector = CoralDetector(method=method, confidence=confidence)
    analyzer = CoralCoverageAnalyzer()
    
    results = []
    
    for i, image_file in enumerate(image_files, 1):
        print(f"\n{'='*60}")
        print(f"分析图像 {i}/{len(image_files)}: {image_file.name}")
        print(f"{'='*60}\n")
        
        try:
            image = cv2.imread(str(image_file))
            if image is None:
                print(f"❌ 无法读取图像: {image_file}")
                continue
            
            # 检测珊瑚
            detections = detector.detect_coral(image)
            
            # 分析覆盖度
            coverage = analyzer.analyze_coverage(image)
            
            # 保存可视化结果
            output_path = Path(output_dir) / f"analyzed_{image_file.name}"
            output_path.parent.mkdir(parents=True, exist_ok=True)
            detector.visualize_detections(image, detections, str(output_path))
            
            # 保存覆盖度图
            coverage_path = Path(output_dir) / f"coverage_{image_file.stem}.png"
            analyzer.plot_coverage(coverage, str(coverage_path))
            
            result = {
                'image': image_file.name,
                'num_detections': len(detections),
                'coverage_percentage': coverage['coverage_percentage'],
                'timestamp': datetime.now().isoformat()
            }
            results.append(result)
            
            print(f"✅ 检测完成:")
            print(f"   珊瑚数量: {len(detections)}")
            print(f"   覆盖度: {coverage['coverage_percentage']:.2f}%")
            
        except Exception as e:
            print(f"❌ 分析失败: {e}")
            continue
    
    # 保存汇总结果
    summary_path = Path(output_dir) / "analysis_summary.json"
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump({
            'total_images': len(image_files),
            'analyzed_images': len(results),
            'results': results,
            'timestamp': datetime.now().isoformat()
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f" 批量分析完成!")
    print(f"{'='*60}")
    print(f"汇总结果已保存: {summary_path}")
    
    return results


def main():
    """主程序入口"""
    parser = argparse.ArgumentParser(description='Coral Garden 图像识别系统')
    parser.add_argument('mode', choices=['detect', 'coverage', 'aruco', 'batch'], 
                       help='运行模式: detect(珊瑚检测) / coverage(覆盖度分析) / aruco(目标板检测) / batch(批量分析)')
    parser.add_argument('-i', '--input', required=True, help='输入图像/目录路径')
    parser.add_argument('-o', '--output', default='./output', help='输出目录')
    parser.add_argument('--method', choices=['yolo', 'traditional'], default='traditional',
                       help='检测方法 (默认: traditional)')
    parser.add_argument('--confidence', type=float, default=0.5, 
                       help='检测置信度阈值 (默认: 0.5)')
    parser.add_argument('--marker-size', type=float, default=5.0, 
                       help='ArUco marker尺寸cm (默认: 5.0)')
    
    args = parser.parse_args()
    
    output_path = Path(args.output)
    output_path.mkdir(parents=True, exist_ok=True)
    
    if args.mode == 'detect':
        # 珊瑚检测（单图像）
        print(" 模式: 珊瑚检测\n")
        image = cv2.imread(args.input)
        if image is None:
            print(f"❌ 无法读取图像: {args.input}")
            return
        
        detector = CoralDetector(method=args.method, confidence=args.confidence)
        detections = detector.detect_coral(image)
        
        print(f"检测到 {len(detections)} 个珊瑚对象:")
        for i, det in enumerate(detections):
            print(f"  {i+1}. 置信度: {det['confidence']:.2f}, 位置: {det['bbox']}")
        
        # 可视化
        output_image = detector.visualize_detections(image, detections)
        output_file = output_path / "detection_result.jpg"
        cv2.imwrite(str(output_file), output_image)
        print(f"\n✅ 可视化结果已保存: {output_file}")
        
    elif args.mode == 'coverage':
        # 覆盖度分析
        print("📊 模式: 珊瑚覆盖度分析\n")
        image = cv2.imread(args.input)
        if image is None:
            print(f" 无法读取图像: {args.input}")
            return
        
        analyzer = CoralCoverageAnalyzer()
        coverage = analyzer.analyze_coverage(image)
        
        print(f"珊瑚覆盖度分析:")
        print(f"  覆盖度: {coverage['coverage_percentage']:.2f}%")
        print(f"  珊瑚像素: {coverage['coral_pixels']}")
        print(f"  总像素: {coverage['total_pixels']}")
        
        # 可视化
        coverage_path = output_path / "coverage_analysis.png"
        analyzer.plot_coverage(coverage, str(coverage_path))
        print(f"\n✅ 覆盖度分析图已保存: {coverage_path}")
        
    elif args.mode == 'aruco':
        # ArUco检测
        print(" 模式: ArUco目标板检测\n")
        image = cv2.imread(args.input)
        if image is None:
            print(f" 无法读取图像: {args.input}")
            return
        
        detector = ArUcoGridDetector(marker_size_cm=args.marker_size)
        grid_info = detector.detect_grid(image)
        
        if grid_info:
            print(f"检测到 {grid_info['num_markers']} 个ArUco markers:")
            print(f"  Marker IDs: {grid_info['marker_ids']}")
            print(f"  找到 {len(grid_info['distances'])} 个距离对")
            
            for dist in grid_info['distances'][:5]:  # 显示前5个
                print(f"    ID {dist['id1']} ↔ ID {dist['id2']}: {dist['pixel_distance']:.1f} pixels")
        else:
            print("❌ 未检测到ArUco markers")
        
    elif args.mode == 'batch':
        # 批量分析
        print("📦 模式: 批量图像分析\n")
        batch_analyze_directory(
            args.input, 
            args.output, 
            method=args.method,
            confidence=args.confidence
        )


if __name__ == '__main__':
    main()
