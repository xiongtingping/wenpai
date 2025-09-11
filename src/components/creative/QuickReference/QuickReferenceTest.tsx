/**
 * 快速引用Dialog测试组件
 * 用于测试和调试Dialog的显示问题
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickReferenceTrigger } from './QuickReferenceTrigger';
import { QuickReferenceDialog } from './QuickReferenceDialog';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function QuickReferenceTest() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState('');
  const [debugMode, setDebugMode] = useState(false);

  const handleSelect = (content: string) => {
    setSelectedContent(content);
    console.log('选择的内容:', content);
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    // 添加或移除调试CSS类
    if (!debugMode) {
      document.body.classList.add('dialog-debug');
    } else {
      document.body.classList.remove('dialog-debug');
    }
  };

  const checkPortalContainer = () => {
    const portalRoot = document.getElementById('dialog-portal-root');
    const radixPortals = document.querySelectorAll('[data-radix-portal]');
    
    console.log('Portal容器检查:');
    console.log('- #dialog-portal-root:', portalRoot);
    console.log('- Radix Portal数量:', radixPortals.length);
    console.log('- Body子元素:', Array.from(document.body.children).map(el => el.tagName + (el.id ? `#${el.id}` : '')));
    
    if (portalRoot) {
      console.log('- Portal容器样式:', getComputedStyle(portalRoot));
      console.log('- Portal容器子元素:', Array.from(portalRoot.children));
    }
  };

  const checkDialogElements = () => {
    const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
    const contents = document.querySelectorAll('[data-radix-dialog-content]');

    console.log('Dialog元素检查:');
    console.log('- Overlay数量:', overlays.length);
    console.log('- Content数量:', contents.length);

    overlays.forEach((overlay, index) => {
      const styles = getComputedStyle(overlay);
      const rect = overlay.getBoundingClientRect();
      console.log(`- Overlay ${index}:`, {
        position: styles.position,
        top: styles.top,
        left: styles.left,
        width: styles.width,
        height: styles.height,
        zIndex: styles.zIndex,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        boundingRect: rect,
        transform: styles.transform,
        contain: styles.contain
      });
    });

    contents.forEach((content, index) => {
      const styles = getComputedStyle(content);
      const rect = content.getBoundingClientRect();
      console.log(`- Content ${index}:`, {
        position: styles.position,
        top: styles.top,
        left: styles.left,
        width: styles.width,
        height: styles.height,
        zIndex: styles.zIndex,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        boundingRect: rect,
        transform: styles.transform,
        contain: styles.contain,
        isolation: styles.isolation
      });
    });
  };

  // 添加视口中心标记
  const addViewportCenterMarker = () => {
    // 移除已存在的标记
    const existingMarker = document.getElementById('viewport-center-marker');
    if (existingMarker) existingMarker.remove();

    const marker = document.createElement('div');
    marker.id = 'viewport-center-marker';
    marker.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: var(--spacing-5) !important;
      height: var(--spacing-5) !important;
      background: red !important;
      border: var(--spacing-0-5) solid white !important;
      border-radius: var(--radius-full) !important;
      z-index: 9999 !important;
      pointer-events: none !important;
      box-shadow: 0 0 var(--spacing-2-5) rgba(255, 0, 0, 0.5) !important;
    `;
    document.body.appendChild(marker);

    // 添加十字线
    const crosshairV = document.createElement('div');
    crosshairV.id = 'viewport-crosshair-v';
    crosshairV.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 50% !important;
      width: var(--spacing-0-5) !important;
      height: 100vh !important;
      background: rgba(255, 0, 0, 0.5) !important;
      z-index: 9998 !important;
      pointer-events: none !important;
      transform: translateX(-50%) !important;
    `;
    document.body.appendChild(crosshairV);

    const crosshairH = document.createElement('div');
    crosshairH.id = 'viewport-crosshair-h';
    crosshairH.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      left: 0 !important;
      width: 100vw !important;
      height: var(--spacing-0-5) !important;
      background: rgba(255, 0, 0, 0.5) !important;
      z-index: 9998 !important;
      pointer-events: none !important;
      transform: translateY(-50%) !important;
    `;
    document.body.appendChild(crosshairH);
  };

  // 移除视口中心标记
  const removeViewportCenterMarker = () => {
    const marker = document.getElementById('viewport-center-marker');
    const crosshairV = document.getElementById('viewport-crosshair-v');
    const crosshairH = document.getElementById('viewport-crosshair-h');
    if (marker) marker.remove();
    if (crosshairV) crosshairV.remove();
    if (crosshairH) crosshairH.remove();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            快速引用Dialog测试
            <Badge variant={debugMode ? "destructive" : "secondary"}>
              {debugMode ? "调试模式" : "正常模式"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基础测试按钮 */}
          <div className="flex flex-wrap gap-3">
            <QuickReferenceTrigger
              onSelect={handleSelect}
              multiSelect={false}
            />
            
            <QuickReferenceTrigger
              onSelect={handleSelect}
              multiSelect={true}
              variant="default"
            />
            
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
            >
              直接打开Dialog
            </Button>
          </div>

          {/* 调试工具 */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">调试工具</h3>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={debugMode ? "destructive" : "outline"}
                onClick={toggleDebugMode}
              >
                {debugMode ? "关闭调试模式" : "开启调试模式"}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  addViewportCenterMarker();
                  setTimeout(removeViewportCenterMarker, 5000);
                }}
              >
                显示视口中心
              </Button>

              <Button
                variant="outline"
                onClick={checkPortalContainer}
              >
                检查Portal容器
              </Button>

              <Button
                variant="outline"
                onClick={checkDialogElements}
              >
                检查Dialog元素
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const portalRoot = document.getElementById('dialog-portal-root');
                  if (portalRoot) {
                    portalRoot.style.border = '3px solid red';
                    portalRoot.style.background = 'rgba(255, 0, 0, 0.1)';
                    setTimeout(() => {
                      portalRoot.style.border = '';
                      portalRoot.style.background = '';
                    }, 3000);
                  }
                }}
              >
                高亮Portal容器
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  console.log('🔍 视口信息:', {
                    viewport: {
                      width: window.innerWidth,
                      height: window.innerHeight,
                      scrollX: window.scrollX,
                      scrollY: window.scrollY
                    },
                    center: {
                      x: window.innerWidth / 2,
                      y: window.innerHeight / 2
                    }
                  });
                }}
              >
                获取视口信息
              </Button>
            </div>
          </div>

          {/* 选择的内容显示 */}
          {selectedContent && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">选择的内容:</h4>
              <pre className="text-sm whitespace-pre-wrap">{selectedContent}</pre>
            </div>
          )}

          {/* 当前状态信息 */}
          <div className="mt-4 p-4 bg-background border rounded-lg">
            <h4 className="font-medium mb-2">当前状态:</h4>
            <div className="text-sm space-y-1">
              <div>调试模式: {debugMode ? '开启' : '关闭'}</div>
              <div>Dialog状态: {isDialogOpen ? '打开' : '关闭'}</div>
              <div>Portal容器: {document.getElementById('dialog-portal-root') ? '存在' : '不存在'}</div>
              <div>Body类名: {document.body.className}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 直接控制的Dialog */}
      <QuickReferenceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSelect={handleSelect}
        multiSelect={true}
      />
    </div>
  );
}
