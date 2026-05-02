import React from 'react';
import { Clip } from '../../../src/types';

interface ClipCardProps {
  clip: Clip;
  onDelete: (clipId: string) => void;
  onTogglePin: (clipId: string) => void;
  onOpenImage?: (clip: Clip) => void;
}

function ClipCard({ clip, onDelete, onTogglePin, onOpenImage }: ClipCardProps) {
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
        if (clip.content.imagePath) {
          return (
            <div className="clip-image-container">
              <img 
                src={clip.content.imageWebviewUri || clip.content.imagePath} 
                alt={clip.title || 'clip image'}
                loading="lazy"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <button
                className="image-expand-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenImage?.(clip);
                }}
              >
                Expand
              </button>
              {clip.metadata?.dimensions?.width && clip.metadata?.dimensions?.height && (
                <span className="image-dimensions">
                  {clip.metadata.dimensions.width} x {clip.metadata.dimensions.height}
                </span>
              )}
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
        <span className="clip-type">{clip.type}</span>
        <div className="clip-actions">
          <button onClick={(event) => {
            event.stopPropagation();
            onTogglePin(clip.id);
          }}>
            {clip.pinned ? 'Unpin' : 'Pin'}
          </button>
          <button onClick={(event) => {
            event.stopPropagation();
            onDelete(clip.id);
          }}>Delete</button>
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
