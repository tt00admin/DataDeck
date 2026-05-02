import React, { useCallback, useRef } from 'react';
import ClipCard from './ClipCard';
import { Clip } from '../../../src/types';

interface DeckProps {
  clips: Clip[];
  onDelete: (clipId: string) => void;
  onTogglePin: (clipId: string) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  onOpenImage?: (clip: Clip) => void;
}

function Deck({ clips, onDelete, onTogglePin, onReorder, onOpenImage }: DeckProps) {
  const sortedClips = [...clips].sort((a, b) => (a.order ?? a.timestamp) - (b.order ?? b.timestamp));
  const pinnedClips = sortedClips.filter(clip => clip.pinned);
  const recentClips = sortedClips
    .filter(clip => !clip.pinned)
    .sort((a, b) => b.timestamp - a.timestamp);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    dragItem.current = index;
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragOverItem.current = index;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragItem.current !== null && dragOverItem.current !== null && onReorder) {
      onReorder(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  }, [onReorder]);

  const getDeckIndex = (clipId: string) => clips.findIndex((item) => item.id === clipId);

  const renderClipList = (clipList: Clip[], isPinned: boolean = false) => {
    return (
      <section className={isPinned ? "deck-section pinned-section" : "deck-section recent-section"}>
        <div className="section-header">
          <div>
            <h2>{isPinned ? 'Pinned' : 'Recent Clips'}</h2>
            <p>{isPinned ? 'Keep key outputs visible.' : 'Saved outputs in timeline order.'}</p>
          </div>
          <span className="count-badge">{clipList.length}</span>
        </div>
        {clipList.length === 0 && (
          <div className="empty-state">
            {isPinned ? 'Pin important clips to keep them here.' : 'Add a notebook cell output to start the deck.'}
          </div>
        )}
        {clipList.map((clip) => {
          const deckIndex = getDeckIndex(clip.id);

          return (
          <div
            key={clip.id}
            draggable
            onDragStart={() => handleDragStart(deckIndex)}
            onDragEnter={() => handleDragEnter(deckIndex)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            style={{ cursor: 'grab' }}
          >
            <ClipCard
              clip={clip}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              onOpenImage={onOpenImage}
            />
          </div>
          );
        })}
      </section>
    );
  };

  return (
    <div className="deck">
      {renderClipList(pinnedClips, true)}
      {renderClipList(recentClips)}
    </div>
  );
}

export default Deck;
