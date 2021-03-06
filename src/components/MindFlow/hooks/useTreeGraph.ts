import { useEffect, useState } from 'react';
import G6, { TreeGraph } from '@antv/g6';
import { GraphOptions } from '@antv/g6/lib/types';
import { defaultConfig } from '../config';
import { registerShapes } from '../shapes';
import { transformData } from '../../../utils';
import { useStore } from '../../../models';

export const useTreeGraph = (config: Partial<GraphOptions>) => {
  const { settings } = useStore();
  const [treeGraph, setTreeGraph] = useState<TreeGraph>(null);

  const { container, width, height } = config;

  // 当配置变更时,自动更新 treeGraph
  useEffect(() => {
    if (!container) return;
    // 如果没有初始化 那么注册图形
    if (!treeGraph) {
      registerShapes();
    }
    setTreeGraph(
      new G6.TreeGraph({
        container,
        ...defaultConfig,
        ...config,
      })
    );
  }, [container]);

  useEffect(() => {
    treeGraph?.changeSize(width, height);
  }, [width, height]);
  // 当 treeGraph 更新时,重新渲染图
  useEffect(() => {
    if (!treeGraph) return;

    // 获取缩放倍数
    const zoomRatio = treeGraph.getZoom();
    //在拉取新数据重新渲染页面之前先获取点（0， 0）在画布上的位置
    const lastPoint = treeGraph.getCanvasByPoint(0, 0);

    transformData(settings).then((data) => {
      treeGraph.data(data);
      treeGraph.render();

      // 进行缩放
      treeGraph.zoomTo(zoomRatio);

      //获取重新渲染之后点（0， 0）在画布的位置
      const newPoint = treeGraph.getCanvasByPoint(0, 0);
      treeGraph.translate(lastPoint.x - newPoint.x, lastPoint.y - newPoint.y);
    });
  }, [treeGraph, settings]);

  return treeGraph;
};
