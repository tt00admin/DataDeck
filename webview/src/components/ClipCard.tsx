import React from 'react';
import { Clip } from '../../../src/types';

// VS Code APIの型定義
declare global {
  interface Window {
    vscode: {
      postMessage: (message: any) => void;
    } | undefined;
  }
}

interface ClipCardProps {
  clip: Clip;
  onDelete: (clipId: string) => void;
  onTogglePin: (clipId: string) => void;
  onOpenImage?: (clip: Clip) => void;
  onOpenClip?: (clip: Clip) => void;
  isCarousel?: boolean;
}

function ClipCard({ clip, onDelete, onTogglePin, onOpenImage, onOpenClip, isCarousel }: ClipCardProps) {
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const renderContent = () => {
    switch (clip.type) {
      case 'image':
        if (clip.content.imageWebviewUri) {
          return (
            <div className="clip-image-container">
              <img
                src={clip.content.imageWebviewUri}
                alt={clip.title || 'clip image'}
                loading="lazy"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          );
        }
        if (clip.content.imagePath) {
          return (
            <div className="clip-image-container">
              <img
                src={clip.content.imagePath}
                alt={clip.title || 'clip image'}
                loading="lazy"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          );
        }
        return <div>No image</div>;
      case 'html':
        return <div dangerouslySetInnerHTML={{ __html: clip.content.htmlContent || '' }} />;
      case 'dataframe':
      case 'text':
        return <pre>{clip.content.textContent || clip.content.htmlContent || ''}</pre>;
      default:
        return <div>Unknown type</div>;
    }
  };

  const handleClick = () => {
    if (window.vscode && clip.source.notebookUri && clip.source.cellId) {
      window.vscode.postMessage({
        type: 'jumpToCell',
        notebookUri: clip.source.notebookUri,
        cellId: clip.source.cellId
      });
    }
  };

  return (
    <div className={`clip-card ${clip.pinned ? 'pinned' : ''}`} onClick={handleClick}>
      <div className="clip-header">
        <span className="drag-handle" style={{ cursor: 'grab', marginRight: '4px', fontSize: '14px' }}>☰</span>
        {!isCarousel && <span className="clip-type">{clip.type}</span>}
        <div className="clip-actions">
          <button
            className="icon-button"
            onClick={(event) => {
              event.stopPropagation();
              onTogglePin(clip.id);
            }}
            title={clip.pinned ? 'Unpin' : 'Pin'}
          >
            <span className={`codicon ${clip.pinned ? 'codicon-pinned' : 'codicon-pin'}`}></span>
          </button>
          <button
            className="icon-button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(clip.id);
            }}
            title="Delete"
          >
            <span className="codicon codicon-trash"></span>
          </button>
          <button
            className="icon-button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenClip?.(clip);
            }}
            title="Expand"
          >
            <span className="codicon codicon-unfold"></span>
          </button>
        </div>
      </div>
      
      {clip.title && <h4 className="clip-title">{clip.title}</h4>}
      
      <div className="clip-content">
        {renderContent()}
      </div>
      
      {clip.memo && <p className="clip-memo">{clip.memo}</p>}
      
      {(clip.tags?.length ?? 0) > 0 && (
        <div className="clip-tags">
          {clip.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}
      
      <div className="clip-footer">
        <span className="clip-time">{formatDate(clip.timestamp)}</span>
      </div>
    </div>
  );
}

export default ClipCard;
