import React, { useCallback, useRef, useState } from 'react';
import ClipCard from './ClipCard';
import { Clip } from '../../../src/types';

interface DeckProps {
  clips: Clip[];
  onDelete: (clipId: string) => void;
  onTogglePin: (clipId: string) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  onOpenImage?: (clip: Clip) => void;
  onOpenClip?: (clip: Clip) => void;
  onReorderRecent?: (type: string, startIndex: number, endIndex: number) => void;
}

function Deck({ clips, onDelete, onTogglePin, onReorder, onOpenImage, onOpenClip, onReorderRecent }: DeckProps) {
  const sortedClips = [...clips].sort((a, b) => (a.order ?? a.timestamp) - (b.order ?? b.timestamp));
  const pinnedClips = sortedClips.filter(clip => clip.pinned);
  const recentClips = sortedClips
    .filter(clip => !clip.pinned)
    .sort((a, b) => b.timestamp - a.timestamp);
  
  // For pinned clips drag-and-drop
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

  // For carousel items drag-and-drop
  const [carouselDragState, setCarouselDragState] = useState<{
    type: string;
    dragIndex: number | null;
    overIndex: number | null;
  }>({ type: '', dragIndex: null, overIndex: null });

  const handleCarouselDragStart = useCallback((type: string, index: number) => {
    setCarouselDragState({ type, dragIndex: index, overIndex: null });
  }, []);

  const handleCarouselDragEnter = useCallback((type: string, index: number) => {
    setCarouselDragState(prev => {
      // Keep the original type from dragStart, but update overIndex
      return { ...prev, overIndex: index };
    });
  }, []);

  const handleCarouselDragEnd = useCallback(() => {
    if (carouselDragState.dragIndex !== null && carouselDragState.overIndex !== null && onReorderRecent) {
      onReorderRecent(carouselDragState.type, carouselDragState.dragIndex, carouselDragState.overIndex);
    }
    setCarouselDragState({ type: '', dragIndex: null, overIndex: null });
  }, [carouselDragState, onReorderRecent]);

  const renderClipList = (clipList: Clip[], isPinned: boolean = false) => {
    if (isPinned) {
      return (
        <section className="deck-section pinned-section">
          <div className="section-header">
            <div>
              <h2>Pinned</h2>
              <p>Keep key outputs visible.</p>
            </div>
            <span className="count-badge">{clipList.length}</span>
          </div>
          {clipList.length === 0 && (
            <div className="empty-state">
              Pin important clips to keep them here.
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
                  onOpenClip={onOpenClip}
                />
              </div>
            );
          })}
        </section>
      );
    } else {
      const groupedByType = clipList.reduce((acc, clip) => {
        const type = clip.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(clip);
        return acc;
      }, {} as Record<string, Clip[]>);

      const typeLabels: Record<string, string> = {
        image: 'Image',
        html: 'HTML',
        dataframe: 'DataFrame',
        text: 'Text',
      };

      return (
        <section className="deck-section recent-section">
          <div className="section-header">
            <div>
              <h2>Recent Clips</h2>
              <p>Saved outputs in timeline order.</p>
            </div>
            <span className="count-badge">{clipList.length}</span>
          </div>
          {clipList.length === 0 && (
            <div className="empty-state">
              Add a notebook cell output to start the deck.
            </div>
          )}
          {Object.entries(groupedByType).map(([type, typeClips]) => (
            <div key={type} className="carousel-section">
              <h3 className="carousel-type-header">{typeLabels[type] || type} ({typeClips.length})</h3>
              <div className="carousel">
                {typeClips.map((clip, index) => (
                  <div
                    key={clip.id}
                    className="carousel-item"
                    draggable
                    onDragStart={() => handleCarouselDragStart(type, index)}
                    onDragEnter={() => handleCarouselDragEnter(type, index)}
                    onDragEnd={() => handleCarouselDragEnd()}
                    onDragOver={(e) => e.preventDefault()}
                    style={{ cursor: 'grab' }}
                  >
                    <ClipCard
                      clip={clip}
                      onDelete={onDelete}
                      onTogglePin={onTogglePin}
                      onOpenImage={onOpenImage}
                      onOpenClip={onOpenClip}
                      isCarousel={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      );
    }
  };

  return (
    <div className="deck">
      {renderClipList(pinnedClips, true)}
      {renderClipList(recentClips)}
    </div>
  );
}

export default Deck;
