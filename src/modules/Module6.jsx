import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rawWikiData from '../wiki-data.json';

const wikiPages = rawWikiData.pages;
const wikiEdges = rawWikiData.edges;

// ── Constants ────────────────────────────────────────────────────────────────

const TYPE_ORDER = ['overview', 'concept', 'entity', 'source', 'synthesis', 'index', 'log'];
const TYPE_LABELS = {
  overview: 'Overview', concept: 'Concepts', entity: 'Entities',
  source: 'Sources', synthesis: 'Syntheses', index: 'Index', log: 'Log',
};
const TYPE_COLORS = {
  overview: '#3b82f6', concept: '#a855f7', entity: '#10b981',
  source: '#f59e0b', synthesis: '#ef4444', index: '#6b7280', log: '#6b7280',
};

// ── Search scoring ───────────────────────────────────────────────────────────

function tokenize(text) {
  return text.toLowerCase().match(/[a-z0-9_]+/g) || [];
}

function scoreResult(page, queryTokens) {
  if (!queryTokens.length) return 1;
  const titleTokens = new Set(tokenize(page.title));
  const tagSet = new Set((page.tags || []).map(t => t.toLowerCase()));
  const contentTokens = new Set(tokenize(page.content));
  let score = 0;
  for (const q of queryTokens) {
    if (titleTokens.has(q)) score += 5;
    if (tagSet.has(q)) score += 3;
    if (contentTokens.has(q)) score += 1;
  }
  return score;
}

function groupByType(pages) {
  const groups = {};
  for (const p of pages) {
    const t = p.type || 'unknown';
    if (!groups[t]) groups[t] = [];
    groups[t].push(p);
  }
  return groups;
}

// ── Markdown components ──────────────────────────────────────────────────────

const mdComponents = {
  h1: ({ children }) => <h1 className="text-xl font-serif text-text mt-6 mb-3 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-serif text-text mt-5 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-medium text-text mt-4 mb-1.5">{children}</h3>,
  p: ({ children }) => <p className="text-xs text-text-secondary leading-relaxed mb-2">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-outside ml-4 mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="text-xs text-text-secondary leading-relaxed">{children}</li>,
  a: ({ children }) => <span className="text-blue-400 hover:text-blue-300 cursor-pointer">{children}</span>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-bg-border-light pl-3 my-2 text-text-muted italic">{children}</blockquote>
  ),
  code: ({ inline, children }) =>
    inline !== false && typeof children === 'string' && !children.includes('\n') ? (
      <code className="bg-bg-hover px-1 py-0.5 rounded text-2xs font-mono text-text-secondary">{children}</code>
    ) : (
      <pre className="bg-bg-hover rounded-md p-3 my-2 overflow-x-auto">
        <code className="text-2xs font-mono text-text-secondary">{children}</code>
      </pre>
    ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-3"><table className="w-full text-xs border-collapse">{children}</table></div>
  ),
  thead: ({ children }) => <thead className="border-b border-bg-border">{children}</thead>,
  th: ({ children }) => <th className="text-left text-2xs uppercase tracking-wider text-text-ghost font-medium px-2 py-1.5">{children}</th>,
  td: ({ children }) => <td className="text-xs text-text-secondary px-2 py-1.5 border-b border-bg-border/50">{children}</td>,
  strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
  hr: () => <hr className="border-bg-border my-4" />,
};

// ── Force-directed graph (canvas-based, zero deps) ───────────────────────────

function GraphView({ onSelectNode, activeSlug }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const animRef = useRef(null);
  const dragRef = useRef(null);

  // Build nodes + edges once
  const graph = useMemo(() => {
    const contentPages = wikiPages.filter(p => p.type !== 'index' && p.type !== 'log');
    const slugSet = new Set(contentPages.map(p => p.slug));

    // Count inbound links for sizing
    const inbound = {};
    for (const e of wikiEdges) {
      if (slugSet.has(e.source) && slugSet.has(e.target)) {
        inbound[e.target] = (inbound[e.target] || 0) + 1;
      }
    }

    const nodes = contentPages.map((p, i) => ({
      id: p.slug,
      label: p.title.length > 25 ? p.title.slice(0, 23) + '…' : p.title,
      type: p.type,
      color: TYPE_COLORS[p.type] || '#6b7280',
      radius: Math.min(6 + (inbound[p.slug] || 0) * 1.5, 18),
      x: 300 + Math.cos(i * 2.4) * (120 + Math.random() * 80),
      y: 250 + Math.sin(i * 2.4) * (120 + Math.random() * 80),
      vx: 0, vy: 0,
    }));

    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const edges = wikiEdges
      .filter(e => nodeMap[e.source] && nodeMap[e.target] && e.source !== e.target)
      .map(e => ({ source: nodeMap[e.source], target: nodeMap[e.target] }));

    // Deduplicate edges
    const edgeSet = new Set();
    const dedupedEdges = [];
    for (const e of edges) {
      const key = [e.source.id, e.target.id].sort().join('|');
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        dedupedEdges.push(e);
      }
    }

    return { nodes, edges: dedupedEdges, nodeMap };
  }, []);

  // Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    stateRef.current = { nodes: graph.nodes, edges: graph.edges };
    let cooling = 1.0;

    function tick() {
      const { nodes, edges } = stateRef.current;
      const dt = 0.3;

      // Center gravity
      const cx = W / 2, cy = H / 2;
      for (const n of nodes) {
        n.vx += (cx - n.x) * 0.001;
        n.vy += (cy - n.y) * 0.001;
      }

      // Repulsion (all pairs)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1200 / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }

      // Attraction (edges)
      for (const e of edges) {
        const { source: a, target: b } = e;
        let dx = b.x - a.x, dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 80) * 0.005;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }

      // Apply velocity with damping
      for (const n of nodes) {
        if (dragRef.current?.node === n) continue;
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx * dt * cooling;
        n.y += n.vy * dt * cooling;
        // Bounds
        n.x = Math.max(n.radius, Math.min(W - n.radius, n.x));
        n.y = Math.max(n.radius, Math.min(H - n.radius, n.y));
      }

      cooling = Math.max(0.05, cooling * 0.998);
    }

    function draw() {
      const { nodes, edges } = stateRef.current;
      const isDark = document.documentElement.classList.contains('dark');

      ctx.clearRect(0, 0, W, H);

      // Edges
      for (const e of edges) {
        const isHighlight = activeSlug && (e.source.id === activeSlug || e.target.id === activeSlug);
        ctx.beginPath();
        ctx.moveTo(e.source.x, e.source.y);
        ctx.lineTo(e.target.x, e.target.y);
        ctx.strokeStyle = isHighlight
          ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)')
          : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)');
        ctx.lineWidth = isHighlight ? 1.5 : 0.5;
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        const isActive = n.id === activeSlug;
        const isConnected = activeSlug && edges.some(
          e => (e.source.id === activeSlug && e.target.id === n.id) ||
               (e.target.id === activeSlug && e.source.id === n.id)
        );
        const dimmed = activeSlug && !isActive && !isConnected;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = dimmed ? (isDark ? 'rgba(60,60,70,0.5)' : 'rgba(200,200,210,0.5)') : n.color;
        ctx.globalAlpha = dimmed ? 0.4 : (isActive ? 1 : 0.85);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (isActive) {
          ctx.strokeStyle = isDark ? '#fff' : '#000';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        if (n.radius >= 5) {
          ctx.font = `${isActive ? 'bold ' : ''}${isActive ? 11 : 9}px Inter, system-ui, sans-serif`;
          ctx.fillStyle = dimmed
            ? (isDark ? 'rgba(130,130,140,0.5)' : 'rgba(160,160,170,0.5)')
            : (isDark ? 'rgba(220,220,230,0.9)' : 'rgba(30,30,40,0.9)');
          ctx.textAlign = 'center';
          ctx.fillText(n.label, n.x, n.y + n.radius + 12);
        }
      }
    }

    function loop() {
      tick();
      draw();
      animRef.current = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [graph, activeSlug]);

  // Mouse interaction
  const getNode = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    for (const n of graph.nodes) {
      const dx = mx - n.x, dy = my - n.y;
      if (dx * dx + dy * dy < (n.radius + 4) ** 2) return { node: n, ox: dx, oy: dy };
    }
    return null;
  }, [graph]);

  const onMouseDown = useCallback((e) => {
    const hit = getNode(e);
    if (hit) {
      dragRef.current = hit;
      canvasRef.current.style.cursor = 'grabbing';
    }
  }, [getNode]);

  const onMouseMove = useCallback((e) => {
    if (dragRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      dragRef.current.node.x = (e.clientX - rect.left) * (canvas.width / rect.width) - dragRef.current.ox;
      dragRef.current.node.y = (e.clientY - rect.top) * (canvas.height / rect.height) - dragRef.current.oy;
      dragRef.current.node.vx = 0;
      dragRef.current.node.vy = 0;
    } else {
      const hit = getNode(e);
      canvasRef.current.style.cursor = hit ? 'pointer' : 'default';
    }
  }, [getNode]);

  const onMouseUp = useCallback((e) => {
    if (dragRef.current) {
      // If barely moved, treat as click
      const hit = getNode(e);
      if (hit && hit.node === dragRef.current.node) {
        onSelectNode(hit.node.id);
      }
      dragRef.current = null;
      canvasRef.current.style.cursor = 'default';
    }
  }, [getNode, onSelectNode]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={500}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { dragRef.current = null; }}
      className="w-full h-auto rounded-lg border border-bg-border bg-bg-surface/30"
      style={{ maxHeight: '500px' }}
    />
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Module6() {
  const [query, setQuery] = useState('');
  const [activePage, setActivePage] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'graph'

  const results = useMemo(() => {
    const queryTokens = tokenize(query);
    let scored = wikiPages
      .filter(p => p.type !== 'index' && p.type !== 'log')
      .map(p => ({ ...p, score: scoreResult(p, queryTokens) }))
      .filter(p => p.score > 0);
    if (filterType) scored = scored.filter(p => p.type === filterType);
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [query, filterType]);

  const grouped = useMemo(() => groupByType(results), [results]);
  const typeOrder = TYPE_ORDER.filter(t => grouped[t]?.length);

  const stats = useMemo(() => {
    const all = wikiPages.filter(p => p.type !== 'index' && p.type !== 'log');
    const types = {};
    for (const p of all) types[p.type] = (types[p.type] || 0) + 1;
    return { total: all.length, types, edges: wikiEdges.length };
  }, []);

  const currentPage = activePage ? wikiPages.find(p => p.slug === activePage) : null;

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-serif text-text">Knowledge Base</h2>
          <p className="text-2xs text-text-ghost mt-1">
            {stats.total} pages &middot; {stats.edges} links &middot;{' '}
            {Object.entries(stats.types).map(([t, n]) => `${n} ${TYPE_LABELS[t]?.toLowerCase() || t}`).join(' · ')}
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center border border-bg-border rounded-md overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-2xs font-medium transition-all ${
              view === 'list' ? 'bg-bg-hover text-text' : 'text-text-ghost hover:text-text-muted'
            }`}
          >
            <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            List
          </button>
          <button
            onClick={() => setView('graph')}
            className={`px-3 py-1.5 text-2xs font-medium transition-all border-l border-bg-border ${
              view === 'graph' ? 'bg-bg-hover text-text' : 'text-text-ghost hover:text-text-muted'
            }`}
          >
            <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" />
              <path strokeLinecap="round" d="M8 6h8M6 8v8M18 8v8M8 18h8" />
            </svg>
            Graph
          </button>
        </div>
      </div>

      {/* Graph view */}
      {view === 'graph' && (
        <div className="mb-5">
          <GraphView onSelectNode={setActivePage} activeSlug={activePage} />
          {/* Legend */}
          <div className="flex items-center gap-4 mt-2 px-1">
            {TYPE_ORDER.filter(t => t !== 'index' && t !== 'log' && stats.types[t]).map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[t] }} />
                <span className="text-2xs text-text-ghost">{TYPE_LABELS[t]}</span>
              </div>
            ))}
            <span className="text-2xs text-text-ghost ml-auto">Click a node to view · Drag to rearrange</span>
          </div>
        </div>
      )}

      <div className="flex gap-6" style={{ minHeight: view === 'graph' ? '40vh' : '70vh' }}>
        {/* Left sidebar */}
        <div className="w-72 flex-shrink-0">
          <div className="relative mb-4">
            <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search wiki..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-bg-surface border border-bg-border rounded-md text-xs text-text placeholder:text-text-ghost focus:outline-none focus:border-bg-border-light"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => setFilterType(null)}
              className={`px-2 py-1 rounded text-2xs font-medium transition-all ${
                !filterType ? 'bg-bg-hover text-text border border-bg-border-light' : 'text-text-ghost border border-bg-border hover:text-text-muted'
              }`}
            >All</button>
            {TYPE_ORDER.filter(t => stats.types[t]).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(filterType === t ? null : t)}
                className={`px-2 py-1 rounded text-2xs font-medium transition-all ${
                  filterType === t ? 'text-text border border-bg-border-light' : 'text-text-ghost border border-bg-border hover:text-text-muted'
                }`}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: TYPE_COLORS[t] || '#6b7280' }} />
                {TYPE_LABELS[t] || t}
              </button>
            ))}
          </div>

          <div className="space-y-1 overflow-y-auto" style={{ maxHeight: view === 'graph' ? 'calc(40vh - 7rem)' : 'calc(70vh - 7rem)' }}>
            {typeOrder.map(type => (
              <div key={type} className="mb-3">
                <div className="text-2xs uppercase tracking-[0.1em] text-text-ghost font-medium mb-1 px-1">
                  {TYPE_LABELS[type] || type}
                </div>
                {grouped[type].map(page => (
                  <button
                    key={page.slug}
                    onClick={() => setActivePage(page.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all ${
                      activePage === page.slug ? 'bg-bg-hover text-text' : 'text-text-muted hover:text-text hover:bg-bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[page.type] || '#6b7280' }} />
                      <span className="truncate">{page.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
            {results.length === 0 && <p className="text-xs text-text-ghost px-2 py-4">No matches.</p>}
          </div>
        </div>

        {/* Right: page content */}
        <div className="flex-1 min-w-0">
          {currentPage ? (
            <div className="border border-bg-border rounded-lg p-6 bg-bg-surface/50">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-2 py-0.5 rounded text-2xs font-medium"
                  style={{
                    backgroundColor: `${TYPE_COLORS[currentPage.type] || '#6b7280'}20`,
                    color: TYPE_COLORS[currentPage.type] || '#6b7280',
                  }}
                >{TYPE_LABELS[currentPage.type] || currentPage.type}</span>
                {(currentPage.tags || []).slice(0, 5).map(tag => (
                  <span
                    key={tag}
                    onClick={() => { setQuery(tag); setActivePage(null); }}
                    className="px-1.5 py-0.5 rounded text-2xs text-text-ghost border border-bg-border hover:text-text-muted hover:border-bg-border-light cursor-pointer transition-all"
                  >{tag}</span>
                ))}
              </div>

              <div className="wiki-content">
                <Markdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {currentPage.content}
                </Markdown>
              </div>

              {/* Backlinks */}
              {(() => {
                const backlinks = wikiEdges
                  .filter(e => e.target === currentPage.slug && e.source !== currentPage.slug)
                  .map(e => wikiPages.find(p => p.slug === e.source))
                  .filter(Boolean);
                if (!backlinks.length) return null;
                return (
                  <div className="mt-5 pt-3 border-t border-bg-border/50">
                    <p className="text-2xs uppercase tracking-[0.1em] text-text-ghost font-medium mb-2">
                      Backlinks ({backlinks.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {backlinks.map(bl => (
                        <button
                          key={bl.slug}
                          onClick={() => setActivePage(bl.slug)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-2xs text-text-muted border border-bg-border hover:text-text hover:border-bg-border-light transition-all"
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[bl.type] || '#6b7280' }} />
                          {bl.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="mt-4 pt-3 border-t border-bg-border/50">
                <p className="text-2xs text-text-ghost font-mono">{currentPage.path}</p>
              </div>
            </div>
          ) : (
            <div className="border border-bg-border/50 border-dashed rounded-lg p-12 flex items-center justify-center" style={{ minHeight: view === 'graph' ? '30vh' : '50vh' }}>
              <div className="text-center">
                <p className="text-xs text-text-ghost mb-1">{view === 'graph' ? 'Click a node or' : 'Select a page to view'}</p>
                <p className="text-2xs text-text-ghost">{view === 'graph' ? 'select from the sidebar' : 'or search for a topic'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
