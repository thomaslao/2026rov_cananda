#!/usr/bin/env python3
"""
Coral Garden 图像识别系统 - GUI版本
MATE ROV 2026 World Championship - Task 1.2

功能：
- 图形界面选择图片
- 一键检测珊瑚
- 覆盖度分析
- ArUco目标板检测
- 实时预览结果

依赖安装：
pip install opencv-python numpy matplotlib customtkinter Pillow
"""

import customtkinter as ctk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import cv2
import numpy as np
from pathlib import Path
import threading
import os
import sys

# 导入识别模块
import importlib
import sys

# 清除缓存，强制重新加载
if 'coral_recognition' in sys.modules:
    del sys.modules['coral_recognition']

sys.path.append(str(Path(__file__).parent))
import coral_recognition
importlib.reload(coral_recognition)
from coral_recognition import CoralDetector, CoralCoverageAnalyzer, ArUcoGridDetector


class CoralGardenGUI(ctk.CTk):
    """Coral Garden 图像识别图形界面"""
    
    def __init__(self):
        super().__init__()
        
        # 窗口设置
        self.title("Coral Garden 图像识别系统 - MATE ROV 2026")
        self.geometry("1200x800")
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # 变量
        self.selected_image_path = None
        self.output_dir = Path(__file__).parent / "gui_output"
        self.output_dir.mkdir(exist_ok=True)
        
        # 检测器
        self.coral_detector = CoralDetector(method='traditional', confidence=0.5)
        self.coverage_analyzer = CoralCoverageAnalyzer()
        self.aruco_detector = ArUcoGridDetector(marker_size_cm=5.0)
        
        # 构建界面
        self.setup_ui()
    
    def setup_ui(self):
        """构建用户界面"""
        
        # 主框架
        self.grid_columnconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=2)
        self.grid_rowconfigure(0, weight=1)
        
        # 左侧控制面板
        self.create_control_panel()
        
        # 右侧显示区域
        self.create_display_area()
    
    def create_control_panel(self):
        """创建左侧控制面板"""
        control_frame = ctk.CTkFrame(self, corner_radius=10)
        control_frame.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)
        control_frame.grid_rowconfigure(10, weight=1)
        
        # 添加内边距
        control_frame.configure(fg_color=("#2b2b2b", "#1a1a1a"))
        
        # 标题
        title_label = ctk.CTkLabel(
            control_frame, 
            text="🪸 Coral Garden 图像识别",
            font=ctk.CTkFont(size=20, weight="bold")
        )
        title_label.grid(row=0, column=0, pady=(20, 10), padx=20)
        
        # 副标题
        subtitle_label = ctk.CTkLabel(
            control_frame,
            text="MATE ROV 2026 - Task 1.2",
            font=ctk.CTkFont(size=12)
        )
        subtitle_label.grid(row=1, column=0, pady=(0, 15), padx=20)
        
        # 分隔线
        separator = ctk.CTkFrame(control_frame, height=2, fg_color="gray")
        separator.grid(row=2, column=0, sticky="ew", pady=(0, 20), padx=20)
        
        # 选择图片按钮
        select_btn = ctk.CTkButton(
            control_frame,
            text="📁 选择图片",
            command=self.select_image,
            font=ctk.CTkFont(size=14),
            height=40
        )
        select_btn.grid(row=3, column=0, pady=10, sticky="ew", padx=20)
        
        # 当前文件显示
        self.file_label = ctk.CTkLabel(
            control_frame,
            text="未选择文件",
            font=ctk.CTkFont(size=11),
            text_color="gray"
        )
        self.file_label.grid(row=4, column=0, pady=5, padx=20)
        
        # 分隔线
        separator2 = ctk.CTkFrame(control_frame, height=2, fg_color="gray")
        separator2.grid(row=5, column=0, sticky="ew", pady=(10, 20), padx=20)
        
        # 功能按钮区域
        functions_label = ctk.CTkLabel(
            control_frame,
            text="选择功能:",
            font=ctk.CTkFont(size=14, weight="bold")
        )
        functions_label.grid(row=6, column=0, pady=(0, 10), sticky="w", padx=20)
        
        # 珊瑚检测按钮
        detect_btn = ctk.CTkButton(
            control_frame,
            text="🪸 珊瑚检测",
            command=lambda: self.run_detection('detect'),
            fg_color="#11998e",
            hover_color="#0d7a6e",
            font=ctk.CTkFont(size=13),
            height=35
        )
        detect_btn.grid(row=7, column=0, pady=5, sticky="ew", padx=20)
        
        # 覆盖度分析按钮
        coverage_btn = ctk.CTkButton(
            control_frame,
            text="📊 覆盖度分析",
            command=lambda: self.run_detection('coverage'),
            fg_color="#4ECDC4",
            hover_color="#3db8b0",
            font=ctk.CTkFont(size=13),
            height=35
        )
        coverage_btn.grid(row=8, column=0, pady=5, sticky="ew", padx=20)
        
        # ArUco检测按钮
        aruco_btn = ctk.CTkButton(
            control_frame,
            text="🎯 ArUco目标板检测",
            command=lambda: self.run_detection('aruco'),
            fg_color="#FF6B6B",
            hover_color="#e55a5a",
            font=ctk.CTkFont(size=13),
            height=35
        )
        aruco_btn.grid(row=9, column=0, pady=5, sticky="ew", padx=20)
        
        # 状态标签
        self.status_label = ctk.CTkLabel(
            control_frame,
            text="就绪",
            font=ctk.CTkFont(size=12),
            text_color="green"
        )
        self.status_label.grid(row=10, column=0, pady=(20, 10), sticky="s", padx=20)
        
        # 参数设置区域
        settings_label = ctk.CTkLabel(
            control_frame,
            text="参数设置:",
            font=ctk.CTkFont(size=12, weight="bold")
        )
        settings_label.grid(row=11, column=0, pady=(30, 5), sticky="w", padx=20)
        
        # 置信度设置
        conf_frame = ctk.CTkFrame(control_frame)
        conf_frame.grid(row=12, column=0, sticky="ew", pady=5, padx=20)
        
        ctk.CTkLabel(conf_frame, text="置信度:", font=ctk.CTkFont(size=11)).pack(side="left", padx=5)
        self.confidence_var = ctk.DoubleVar(value=0.5)
        conf_slider = ctk.CTkSlider(
            conf_frame,
            from_=0.1,
            to=1.0,
            variable=self.confidence_var,
            number_of_steps=9
        )
        conf_slider.pack(side="left", fill="x", expand=True, padx=5)
        self.conf_label = ctk.CTkLabel(conf_frame, text="0.5", font=ctk.CTkFont(size=11), width=30)
        self.conf_label.pack(side="left", padx=5)
        conf_slider.configure(command=self.update_confidence_label)
        
        # 方法选择
        method_frame = ctk.CTkFrame(control_frame)
        method_frame.grid(row=13, column=0, sticky="ew", pady=(5, 20), padx=20)
        
        ctk.CTkLabel(method_frame, text="方法:", font=ctk.CTkFont(size=11)).pack(side="left", padx=5)
        self.method_var = ctk.StringVar(value="traditional")
        method_menu = ctk.CTkOptionMenu(
            method_frame,
            variable=self.method_var,
            values=["traditional", "yolo"],
            font=ctk.CTkFont(size=11)
        )
        method_menu.pack(side="left", fill="x", expand=True, padx=5)
    
    def create_display_area(self):
        """创建右侧显示区域"""
        display_frame = ctk.CTkFrame(self, corner_radius=10)
        display_frame.grid(row=0, column=1, sticky="nsew", padx=10, pady=10)
        display_frame.configure(fg_color=("#2b2b2b", "#1a1a1a"))
        
        # 标签页
        self.tabview = ctk.CTkTabview(display_frame)
        self.tabview.pack(fill="both", expand=True)
        
        # 原始图片标签页
        self.original_tab = self.tabview.add("原始图片")
        self.original_label = ctk.CTkLabel(
            self.original_tab,
            text="请选择图片开始分析",
            font=ctk.CTkFont(size=14)
        )
        self.original_label.pack(expand=True)
        
        # 检测结果标签页
        self.result_tab = self.tabview.add("检测结果")
        self.result_label = ctk.CTkLabel(
            self.result_tab,
            text="检测结果将显示在这里",
            font=ctk.CTkFont(size=14)
        )
        self.result_label.pack(expand=True)
        
        # 覆盖度分析标签页
        self.coverage_tab = self.tabview.add("覆盖度分析")
        self.coverage_label = ctk.CTkLabel(
            self.coverage_tab,
            text="覆盖度分析结果将显示在这里",
            font=ctk.CTkFont(size=14)
        )
        self.coverage_label.pack(expand=True)
        
        # 信息标签页
        self.info_tab = self.tabview.add("检测信息")
        self.info_text = ctk.CTkTextbox(self.info_tab, width=400, height=500)
        self.info_text.pack(fill="both", expand=True, padx=10, pady=10)
    
    def update_confidence_label(self, value):
        """更新置信度标签"""
        self.conf_label.configure(text=f"{value:.1f}")
    
    def select_image(self):
        """选择图片文件"""
        file_path = filedialog.askopenfilename(
            title="选择珊瑚图像",
            filetypes=[
                ("图像文件", "*.jpg *.jpeg *.png *.bmp"),
                ("所有文件", "*.*")
            ]
        )
        
        if file_path:
            self.selected_image_path = file_path
            self.file_label.configure(text=Path(file_path).name, text_color="white")
            self.display_original_image(file_path)
            self.update_status("已加载图片", "green")
    
    def display_original_image(self, image_path):
        """显示原始图片"""
        try:
            image = Image.open(image_path)
            
            # 调整大小以适应显示
            max_size = (600, 500)
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            photo = ImageTk.PhotoImage(image)
            self.original_label.configure(image=photo, text="")
            self.original_label.image = photo
        except Exception as e:
            self.update_status(f"加载图片失败: {e}", "red")
    
    def run_detection(self, mode):
        """运行检测（在后台线程）"""
        if not self.selected_image_path:
            messagebox.showwarning("警告", "请先选择图片！")
            return
        
        # 在后台线程运行检测
        thread = threading.Thread(target=self._run_detection_thread, args=(mode,))
        thread.daemon = True
        thread.start()
    
    def _run_detection_thread(self, mode):
        """后台检测线程"""
        try:
            self.update_status("处理中...", "orange")
            
            # 读取图像
            image = cv2.imread(self.selected_image_path)
            if image is None:
                self.update_status("无法读取图像", "red")
                return
            
            output_path = self.output_dir / f"result_{mode}.jpg"
            
            if mode == 'detect':
                self._run_coral_detection(image, output_path)
            elif mode == 'coverage':
                self._run_coverage_analysis(image, output_path)
            elif mode == 'aruco':
                self._run_aruco_detection(image, output_path)
            
            self.update_status("完成！", "green")
            
        except Exception as e:
            self.update_status(f"错误: {e}", "red")
            import traceback
            traceback.print_exc()
    
    def _run_coral_detection(self, image, output_path):
        """运行珊瑚检测"""
        # 更新检测器参数
        self.coral_detector.confidence = self.confidence_var.get()
        if self.method_var.get() == 'yolo':
            self.coral_detector.method = 'yolo'
        else:
            self.coral_detector.method = 'traditional'
        
        # 检测
        detections = self.coral_detector.detect_coral(image)
        
        # 可视化
        output_image = self.coral_detector.visualize_detections(image, detections, str(output_path))
        
        # 显示结果
        self.display_result_image(output_path)
        
        # 显示信息
        info_text = f"珊瑚检测结果\n{'='*50}\n\n"
        info_text += f"检测方法: {self.coral_detector.method}\n"
        info_text += f"置信度阈值: {self.confidence_var.get():.2f}\n"
        info_text += f"检测到珊瑚数量: {len(detections)}\n\n"
        
        for i, det in enumerate(detections, 1):
            info_text += f"珊瑚 #{i}:\n"
            info_text += f"  置信度: {det['confidence']:.2f}\n"
            info_text += f"  位置: {det['bbox']}\n"
            if 'class_name' in det:
                info_text += f"  类别: {det['class_name']}\n"
            info_text += "\n"
        
        self.info_text.delete("1.0", "end")
        self.info_text.insert("1.0", info_text)
    
    def _run_coverage_analysis(self, image, output_path):
        """运行覆盖度分析"""
        # 分析
        coverage = self.coverage_analyzer.analyze_coverage(image)
        
        # 保存mask
        mask_path = self.output_dir / "coverage_mask.jpg"
        cv2.imwrite(str(mask_path), coverage['mask'])
        
        # 显示结果
        self.display_result_image(mask_path)
        
        # 显示信息
        info_text = f"珊瑚覆盖度分析\n{'='*50}\n\n"
        info_text += f"覆盖度: {coverage['coverage_percentage']:.2f}%\n"
        info_text += f"珊瑚像素: {coverage['coral_pixels']:,}\n"
        info_text += f"总像素: {coverage['total_pixels']:,}\n\n"
        
        if coverage['coverage_percentage'] > 30:
            info_text += "状态: 高覆盖度 🟢\n"
        elif coverage['coverage_percentage'] > 15:
            info_text += "状态: 中等覆盖度 \n"
        else:
            info_text += "状态: 低覆盖度 \n"
        
        self.info_text.delete("1.0", "end")
        self.info_text.insert("1.0", info_text)
    
    def _run_aruco_detection(self, image, output_path):
        """运行ArUco检测"""
        # 检测
        grid_info = self.aruco_detector.detect_grid(image)
        
        # 可视化
        if grid_info:
            output_image = image.copy()
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            corners, ids, _ = self.aruco_detector.detector.detectMarkers(gray)
            
            if ids is not None:
                cv2.aruco.drawDetectedMarkers(output_image, corners, ids)
                cv2.imwrite(str(output_path), output_image)
                self.display_result_image(output_path)
        
        # 显示信息
        info_text = f"ArUco目标板检测\n{'='*50}\n\n"
        
        if grid_info:
            info_text += f"检测到Marker数量: {grid_info['num_markers']}\n"
            info_text += f"Marker IDs: {grid_info['marker_ids']}\n"
            info_text += f"距离对数量: {len(grid_info['distances'])}\n\n"
            
            if len(grid_info['distances']) > 0:
                info_text += "距离测量（前5个）:\n"
                for dist in grid_info['distances'][:5]:
                    info_text += f"  ID {dist['id1']} ↔ ID {dist['id2']}: {dist['pixel_distance']:.1f} pixels\n"
            
            if grid_info['num_markers'] >= 8:
                info_text += "\n✅ 所有目标板都可见！"
            else:
                info_text += f"\n⚠️ 仅检测到 {grid_info['num_markers']}/8 个目标板"
        else:
            info_text += " 未检测到ArUco markers\n"
            info_text += "请确保图像中包含ArUco目标板"
        
        self.info_text.delete("1.0", "end")
        self.info_text.insert("1.0", info_text)
    
    def display_result_image(self, image_path):
        """显示结果图片"""
        try:
            image = Image.open(image_path)
            max_size = (600, 500)
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            photo = ImageTk.PhotoImage(image)
            
            self.result_label.configure(image=photo, text="")
            self.result_label.image = photo
        except Exception as e:
            self.update_status(f"显示结果失败: {e}", "red")
    
    def update_status(self, message, color):
        """更新状态标签"""
        self.status_label.configure(text=message, text_color=color)
        self.update()


def main():
    """主函数"""
    app = CoralGardenGUI()
    app.mainloop()


if __name__ == '__main__':
    main()
