import React, { useState, useEffect, useCallback } from 'react';
import Deck from './components/Deck';
import { Clip } from '../../src/types';

// VS Code APIの型定義
declare global {
  interface Window {
    acquireVsCodeApi?: () => {
      postMessage: (message: any) => void;
    };
    vscode: {
      postMessage: (message: any) => void;
    } | undefined;
  }
}

function App() {
  const [deck, setDeck] = useState<{ clips: Clip[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterFileName, setFilterFileName] = useState<string>('');

  useEffect(() => {
    // VS Code APIを取得
    const vscode = window.acquireVsCodeApi?.();
    if (vscode) {
      window.vscode = vscode;
    }

    // メッセージリスナー
    const handler = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'deckUpdate') {
        setDeck(message.deck);
      }
    };
    window.addEventListener('message', handler);

    // 初期デッキ要求
    if (window.vscode) {
      window.vscode.postMessage({ type: 'requestDeck' });
    }

    return () => window.removeEventListener('message', handler);
  }, []);

  // フィルター条件変更時に拡張機能に通知
  useEffect(() => {
    if (window.vscode) {
      window.vscode.postMessage({
        type: 'filterDeck',
        query: searchQuery,
        clipType: filterType || undefined,
        dateFrom: filterDateFrom ? new Date(filterDateFrom).getTime() : undefined,
        dateTo: filterDateTo ? new Date(filterDateTo).getTime() : undefined,
        notebookFileName: filterFileName || undefined
      });
    }
  }, [searchQuery, filterType, filterDateFrom, filterDateTo, filterFileName]);

  const handleClip = useCallback(() => {
    if (window.vscode) {
      window.vscode.postMessage({ type: 'clipActiveCell' });
    }
  }, []);

  const handleDelete = useCallback((clipId: string) => {
    if (window.vscode) {
      window.vscode.postMessage({ type: 'deleteClip', clipId });
    }
  }, []);

  const handleTogglePin = useCallback((clipId: string) => {
    if (window.vscode) {
      window.vscode.postMessage({ type: 'togglePin', clipId });
    }
  }, []);

  const handleExport = useCallback(() => {
    if (window.vscode) {
      window.vscode.postMessage({ type: 'exportMarkdown' });
    }
  }, []);

  const handleReorder = useCallback((startIndex: number, endIndex: number) => {
    if (window.vscode) {
      window.vscode.postMessage({ type: 'reorderClips', startIndex, endIndex });
    }
  }, []);

  const handleOpenImage = useCallback((clip: Clip) => {
    if (window.vscode) {
      window.vscode.postMessage({ type: 'openImage', clip });
    }
  }, []);

  if (!deck) {
    return <div className="loading-state">Loading DataDeck...</div>;
  }

  const totalClips = deck.clips.length;
  const pinnedCount = deck.clips.filter((clip) => clip.pinned).length;

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <div className="eyebrow">DataDeck</div>
          <h1>Deck</h1>
        </div>
        <div className="stats" aria-label="Clip totals">
          <span>{pinnedCount} pinned</span>
          <span>{totalClips} total</span>
        </div>
      </header>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search clips, tags, memo, code"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="toolbar-actions">
          <button className="primary-button" onClick={handleClip}>Add</button>
          <button onClick={handleExport}>Export</button>
        </div>
      </div>

      <div className="filters">
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          <option value="image">Image</option>
          <option value="html">HTML</option>
          <option value="dataframe">DataFrame</option>
          <option value="text">Text</option>
        </select>

        <input
          type="date"
          placeholder="From"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          aria-label="Filter from date"
        />

        <input
          type="date"
          placeholder="To"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          aria-label="Filter to date"
        />

        <input
          type="text"
          placeholder="Notebook file name"
          value={filterFileName}
          onChange={(e) => setFilterFileName(e.target.value)}
          aria-label="Filter by notebook file name"
        />
      </div>

      <Deck
        clips={deck?.clips || []}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
        onReorder={handleReorder}
        onOpenImage={handleOpenImage}
      />
    </div>
  );
}

export default App;
