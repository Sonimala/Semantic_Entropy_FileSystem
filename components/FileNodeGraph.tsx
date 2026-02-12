
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FileNode, SemanticCluster } from '../types';

interface Props {
  files: FileNode[];
  clusters: SemanticCluster[];
  onNodeClick: (id: string) => void;
}

const FileNodeGraph: React.FC<Props> = ({ files, clusters, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);

  // Fix: Line 16 error. The useEffect cleanup should not return the d3.Simulation object. 
  // Wrapped simulation.stop() in a void returning arrow function.
  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Setup Defs for Gradients and Filters
    const defs = svg.append('defs');

    // Soft Shadow Filter
    const filter = defs.append('filter')
      .attr('id', 'soft-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', '0')
      .attr('dy', '4')
      .attr('result', 'offsetBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'offsetBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background Dot Grid
    const pattern = defs.append('pattern')
      .attr('id', 'dotGrid')
      .attr('width', 30)
      .attr('height', 30)
      .attr('patternUnits', 'userSpaceOnUse');
    pattern.append('circle')
      .attr('cx', 1.5)
      .attr('cy', 1.5)
      .attr('r', 1)
      .attr('fill', '#e2e8f0');

    // Create Gradients for each cluster
    clusters.forEach((cluster, i) => {
      const gradientId = `grad-${cluster.name.replace(/\s+/g, '-')}`;
      const radialGrad = defs.append('radialGradient')
        .attr('id', gradientId)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
      radialGrad.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', cluster.color)
        .attr('stop-opacity', 0.15);
      radialGrad.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', cluster.color)
        .attr('stop-opacity', 0);
    });

    // Layered Background
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', '#f8fafc');

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#dotGrid)');

    const mainContainer = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => mainContainer.attr('transform', event.transform));
    svg.call(zoom);

    // Initial simulation setup
    // Fix: Explicitly type fileNodes as any[] to permit D3's internal property injection (vx, vy, etc.)
    const fileNodes: any[] = files.map((f) => ({
      ...f,
      x: (f.x !== undefined ? f.x : width / 2) + (Math.random() - 0.5) * 100,
      y: (f.y !== undefined ? f.y : height / 2) + (Math.random() - 0.5) * 100,
    }));

    const simulation = d3.forceSimulation<any>(fileNodes)
      .force('charge', d3.forceManyBody().strength(-1200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(110))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04));

    // Force to pull cluster members together
    simulation.force('cluster', (alpha) => {
      clusters.forEach(cluster => {
        const nodes = fileNodes.filter(d => d.category === cluster.name);
        if (nodes.length === 0) return;
        const avgX = d3.mean(nodes, d => d.x!)!;
        const avgY = d3.mean(nodes, d => d.y!)!;
        nodes.forEach(d => {
          // Fix: Errors on lines 118 & 119. Accessing vx/vy on simulation nodes.
          d.vx = (d.vx || 0) + (avgX - d.x!) * alpha * 0.15;
          d.vy = (d.vy || 0) + (avgY - d.y!) * alpha * 0.15;
        });
      });
    });

    const hullGroup = mainContainer.append('g').attr('class', 'hulls');
    const nodesGroup = mainContainer.append('g').attr('class', 'nodes');
    const labelGroup = mainContainer.append('g').attr('class', 'labels');

    const nodeElements = nodesGroup.selectAll('g')
      .data(fileNodes, (d: any) => d.id)
      .enter()
      .append('g')
      .attr('class', 'file-node-container')
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => setHoveredCluster(d.category))
      .on('mouseleave', () => setHoveredCluster(null))
      .on('click', (event, d) => onNodeClick(d.id))
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Render Elegant Cards
    nodeElements.append('rect')
      .attr('x', -85)
      .attr('y', -35)
      .attr('width', 170)
      .attr('height', 70)
      .attr('rx', 16)
      .attr('fill', 'white')
      .attr('filter', 'url(#soft-shadow)');

    // Category Accent bar
    nodeElements.append('rect')
      .attr('x', -85)
      .attr('y', -35)
      .attr('width', 6)
      .attr('height', 70)
      .attr('rx', 3)
      .attr('fill', d => clusters.find(c => c.name === d.category)?.color || '#64748b');

    // Text Content inside Card
    nodeElements.append('foreignObject')
      .attr('x', -70)
      .attr('y', -30)
      .attr('width', 150)
      .attr('height', 60)
      .append('xhtml:div')
      .style('font-family', "'Inter', sans-serif")
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('justify-content', 'center')
      .style('height', '100%')
      .html(d => `
        <div style="font-size: 11px; font-weight: 800; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">
          ${d.name}
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
           <span style="font-size: 9px; font-weight: 600; color: ${clusters.find(c => c.name === d.category)?.color || '#64748b'}; text-transform: uppercase; letter-spacing: 0.05em;">
             ${d.category}
           </span>
        </div>
        <div style="font-size: 8px; color: #94a3b8; font-weight: 500; margin-top: 4px;">
          ${(d.size / 1024).toFixed(1)} KB • ${new Date(d.lastModified).toLocaleDateString()}
        </div>
      `);

    simulation.on('tick', () => {
      nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);

      // Compute Hulls for each cluster
      const hullsData = clusters.map(cluster => {
        const nodes = fileNodes.filter(d => d.category === cluster.name);
        if (nodes.length < 1) return null;
        
        // Pad the points to make the hull larger than the nodes
        const points: [number, number][] = nodes.flatMap(d => [
          [d.x! - 110, d.y! - 60], [d.x! + 110, d.y! - 60],
          [d.x! - 110, d.y! + 60], [d.x! + 110, d.y! + 60]
        ]);
        const hull = d3.polygonHull(points);
        if (!hull) return null;

        return {
          name: cluster.name,
          color: cluster.color,
          path: d3.line().curve(d3.curveBasisClosed)(hull),
          center: { 
            x: d3.mean(nodes, d => d.x!)!, 
            y: d3.mean(nodes, d => d.y!)!
          },
          top: d3.min(nodes, d => d.y!)! - 120,
          count: nodes.length
        };
      }).filter(Boolean);

      // Update Hulls
      const hulls = hullGroup.selectAll('path').data(hullsData, (d: any) => d.name);
      hulls.exit().remove();
      hulls.enter().append('path')
        .attr('stroke-width', 2)
        .attr('fill-opacity', 0.6)
        .merge(hulls as any)
        .attr('d', (d: any) => d.path)
        .attr('stroke', (d: any) => d.color)
        .attr('stroke-opacity', 0.3)
        .attr('fill', (d: any) => `url(#grad-${d.name.replace(/\s+/g, '-')})`)
        .style('transition', 'opacity 0.3s ease')
        .style('opacity', (d: any) => hoveredCluster && hoveredCluster !== d.name ? 0.2 : 1);

      // Update Cluster Labels with floating badges
      const labels = labelGroup.selectAll('g').data(hullsData, (d: any) => d.name);
      labels.exit().remove();
      const labelsEnter = labels.enter().append('g');
      
      const labelBackground = labelsEnter.append('rect')
        .attr('rx', 12)
        .attr('height', 24)
        .attr('fill', 'white')
        .attr('filter', 'url(#soft-shadow)');

      const labelText = labelsEnter.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '16px')
        .style('font-family', "'Inter', sans-serif")
        .style('font-weight', '800')
        .style('font-size', '11px')
        .style('text-transform', 'uppercase')
        .style('letter-spacing', '0.1em');

      const labelsMerged = labelsEnter.merge(labels as any);
      labelsMerged.attr('transform', (d: any) => `translate(${d.center.x},${d.top})`);
      
      labelsMerged.select('text')
        .text((d: any) => `${d.name} • ${d.count}`)
        .attr('fill', (d: any) => d.color);

      // Auto-size the background rect based on text length
      labelsMerged.each(function(d: any) {
        const textNode = d3.select(this).select('text').node() as SVGTextElement;
        const textWidth = textNode?.getComputedTextLength() || 100;
        d3.select(this).select('rect')
          .attr('width', textWidth + 30)
          .attr('x', -(textWidth + 30) / 2);
      });
      
      labelsMerged.style('transition', 'opacity 0.3s ease')
        .style('opacity', (d: any) => hoveredCluster && hoveredCluster !== d.name ? 0.3 : 1);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Fix: Ensure the cleanup function does not return the simulation object to satisfy EffectCallback type
    return () => {
      simulation.stop();
    };
  }, [files, clusters, onNodeClick, hoveredCluster]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Legend / Overlay */}
      <div className="absolute bottom-8 left-8 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl pointer-events-none flex flex-col gap-2">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Semantic Groups</div>
        {clusters.map(c => (
          <div key={c.name} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></div>
            <span className="text-[11px] font-bold text-slate-700">{c.name}</span>
          </div>
        ))}
      </div>

      {/* Viewport controls hint */}
      <div className="absolute top-8 right-8 flex items-center gap-4 text-slate-400">
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold">
          <i className="fas fa-mouse text-[12px]"></i>
          <span>PAN & ZOOM</span>
        </div>
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold">
          <i className="fas fa-hand-pointer text-[12px]"></i>
          <span>DRAG NODES</span>
        </div>
      </div>
    </div>
  );
};

export default FileNodeGraph;
