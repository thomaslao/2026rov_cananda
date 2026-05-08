#!/usr/bin/env python3
"""
Coral Garden 摄影测量工具集
MATE ROV 2026 World Championship - Task 1.2

功能：
1. 视频拆幀 + 模糊检测筛选
2. ArUco marker检测与定位
3. 图像质量评估
4. 批量处理管线

依赖安装：
pip install opencv-python numpy tqdm pillow
"""

import cv2
import numpy as np
from pathlib import Path
from tqdm import tqdm
import json
import argparse
from datetime import datetime


class VideoFrameExtractor:
    """视频拆幀与质量筛选器"""
    
    def __init__(self, video_path, output_dir, fps_extract=5, blur_threshold=100.0):
        """
        Args:
            video_path: 输入视频路径
            output_dir: 输出目录
            fps_extract: 每秒提取幀数（默认5）
            blur_threshold: 模糊阈值（Laplacian方差，默认100）
        """
        self.video_path = Path(video_path)
        self.output_dir = Path(output_dir)
        self.fps_extract = fps_extract
        self.blur_threshold = blur_threshold
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        (self.output_dir / "good").mkdir(exist_ok=True)
        (self.output_dir / "rejected").mkdir(exist_ok=True)
        
    def extract_frames(self):
        """提取视频幀并进行质量筛选"""
        cap = cv2.VideoCapture(str(self.video_path))
        
        if not cap.isOpened():
            raise ValueError(f"无法打开视频: {self.video_path}")
        
        # 获取视频信息
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps
        
        print(f"📹 视频信息:")
        print(f"   解析度: {cap.get(cv2.CAP_PROP_FRAME_WIDTH)}x{cap.get(cv2.CAP_PROP_FRAME_HEIGHT)}")
        print(f"   幀率: {fps:.2f} fps")
        print(f"   总幀数: {total_frames}")
        print(f"   时长: {duration:.2f} 秒")
        print(f"   提取频率: 每秒 {self.fps_extract} 幀")
        print(f"   预计提取: {int(duration * self.fps_extract)} 幀")
        print()
        
        # 计算跳幀间隔
        skip_frames = int(fps / self.fps_extract)
        
        frame_count = 0
        good_count = 0
        rejected_count = 0
        frame_number = 0
        
        with tqdm(total=total_frames, desc="处理中") as pbar:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # 按间隔提取
                if frame_count % skip_frames == 0:
                    # 评估图像质量
                    blur_score = self._calculate_blur_score(frame)
                    
                    # 保存幀
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"frame_{frame_number:06d}_score{blur_score:.1f}.jpg"
                    
                    if blur_score >= self.blur_threshold:
                        # 清晰幀
                        output_path = self.output_dir / "good" / filename
                        cv2.imwrite(str(output_path), frame)
                        good_count += 1
                    else:
                        # 模糊幀
                        output_path = self.output_dir / "rejected" / filename
                        cv2.imwrite(str(output_path), frame)
                        rejected_count += 1
                    
                    frame_number += 1
                
                frame_count += 1
                pbar.update(1)
        
        cap.release()
        
        # 输出统计
        print(f"\n✅ 处理完成!")
        print(f"   总提取幀数: {good_count + rejected_count}")
        print(f"   清晰幀 (good): {good_count}")
        print(f"   模糊幀 (rejected): {rejected_count}")
        print(f"   通过率: {good_count/(good_count+rejected_count)*100:.1f}%")
        print(f"\n📁 输出目录: {self.output_dir}")
        
        return good_count, rejected_count
    
    def _calculate_blur_score(self, image):
        """计算图像模糊度（Laplacian方差）"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        return laplacian_var


class ArUcoDetector:
    """ArUco marker检测器"""
    
    def __init__(self, dict_type=cv2.aruco.DICT_4X4_50, marker_size_cm=5.0):
        """
        Args:
            dict_type: ArUco字典类型
            marker_size_cm: marker实际尺寸（厘米）
        """
        self.dict_type = dict_type
        self.marker_size_cm = marker_size_cm
        self.dictionary = cv2.aruco.getPredefinedDictionary(dict_type)
        self.parameters = cv2.aruco.DetectorParameters()
        self.detector = cv2.aruco.ArucoDetector(self.dictionary, self.parameters)
    
    def detect_markers(self, image):
        """检测图像中的ArUco markers"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        corners, ids, rejected = self.detector.detectMarkers(gray)
        
        results = []
        if ids is not None:
            for i, corner in enumerate(corners):
                marker_id = ids[i][0]
                corner_points = corner[0]  # 4个角点
                
                # 计算中心点
                center = np.mean(corner_points, axis=0)
                
                results.append({
                    'id': int(marker_id),
                    'corners': corner_points.tolist(),
                    'center': center.tolist(),
                    'area': cv2.contourArea(corner_points)
                })
        
        return results
    
    def draw_markers(self, image, results):
        """在图像上绘制检测到的markers"""
        output = image.copy()
        
        for marker in results:
            corners = np.array(marker['corners'], dtype=np.int32).reshape((-1, 1, 2))
            center = tuple(map(int, marker['center']))
            
            # 绘制边框
            cv2.polylines(output, [corners], True, (0, 255, 0), 2)
            
            # 绘制中心点
            cv2.circle(output, center, 5, (0, 0, 255), -1)
            
            # 标注ID
            cv2.putText(output, f"ID:{marker['id']}", 
                       (center[0] - 20, center[1] - 20),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        return output


def batch_process_directory(input_dir, output_dir, fps_extract=5, blur_threshold=100.0):
    """批量处理目录中的所有视频"""
    input_path = Path(input_dir)
    video_files = list(input_path.glob("*.mp4")) + list(input_path.glob("*.avi"))
    
    if not video_files:
        print(f"❌ 在 {input_dir} 中未找到视频文件")
        return
    
    print(f" 找到 {len(video_files)} 个视频文件\n")
    
    for i, video_file in enumerate(video_files, 1):
        print(f"\n{'='*60}")
        print(f"处理视频 {i}/{len(video_files)}: {video_file.name}")
        print(f"{'='*60}\n")
        
        video_output_dir = Path(output_dir) / video_file.stem
        
        extractor = VideoFrameExtractor(
            video_file, 
            video_output_dir, 
            fps_extract=fps_extract,
            blur_threshold=blur_threshold
        )
        
        try:
            extractor.extract_frames()
        except Exception as e:
            print(f"❌ 处理失败: {e}")
            continue
    
    print(f"\n{'='*60}")
    print("✅ 所有视频处理完成!")
    print(f"{'='*60}")


def main():
    """主程序入口"""
    parser = argparse.ArgumentParser(description='Coral Garden 摄影测量工具集')
    parser.add_argument('mode', choices=['extract', 'detect', 'batch'], 
                       help='运行模式: extract(拆幀) / detect(检测ArUco) / batch(批量处理)')
    parser.add_argument('-i', '--input', required=True, help='输入视频/目录路径')
    parser.add_argument('-o', '--output', default='./output', help='输出目录')
    parser.add_argument('--fps', type=int, default=5, help='每秒提取幀数 (默认5)')
    parser.add_argument('--blur-threshold', type=float, default=100.0, 
                       help='模糊阈值 (默认100)')
    parser.add_argument('--marker-size', type=float, default=5.0, 
                       help='ArUco marker尺寸cm (默认5.0)')
    
    args = parser.parse_args()
    
    if args.mode == 'extract':
        # 单视频拆幀
        print("🎬 模式: 视频拆幀 + 质量筛选\n")
        extractor = VideoFrameExtractor(
            args.input, 
            args.output, 
            fps_extract=args.fps,
            blur_threshold=args.blur_threshold
        )
        extractor.extract_frames()
        
    elif args.mode == 'detect':
        # ArUco检测（单图像示例）
        print(" 模式: ArUco Marker检测\n")
        image = cv2.imread(args.input)
        if image is None:
            print(f"❌ 无法读取图像: {args.input}")
            return
        
        detector = ArUcoDetector(marker_size_cm=args.marker_size)
        results = detector.detect_markers(image)
        
        print(f"检测到 {len(results)} 个ArUco markers:")
        for marker in results:
            print(f"  - ID: {marker['id']}, 中心: ({marker['center'][0]:.1f}, {marker['center'][1]:.1f})")
        
        # 可视化
        output_image = detector.draw_markers(image, results)
        output_path = Path(args.output) / "aruco_detection.jpg"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(output_path), output_image)
        print(f"\n✅ 可视化结果已保存: {output_path}")
        
    elif args.mode == 'batch':
        # 批量处理
        print("📦 模式: 批量处理目录\n")
        batch_process_directory(
            args.input, 
            args.output, 
            fps_extract=args.fps,
            blur_threshold=args.blur_threshold
        )


if __name__ == '__main__':
    main()
