export interface Clip {
  id: string;
  timestamp: number;
  type: 'image' | 'html' | 'dataframe' | 'text';
  title?: string;
  memo?: string;
  tags: string[];
  source: {
    notebookUri: string;
    cellId?: string;
    executionCount?: number;
  };
  content: {
    imagePath?: string;
    imageWebviewUri?: string;
    htmlContent?: string;
    textContent?: string;
    mimeType?: string;
  };
  codeSnippet?: string;
  pinned: boolean;
  order: number;
  metadata: {
    fileSize?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

export interface Deck {
  version: string;
  lastUpdated: number;
  clips: Clip[];
  settings: {
    autoSave: boolean;
    maxClips: number;
    imageQuality: number;
  };
}

export interface NotebookCell {
  id: string;
  outputs?: NotebookCellOutput[];
  executionCount?: number;
  document: {
    uri: string;
  };
}

export interface NotebookCellOutput {
  items: NotebookCellOutputItem[];
}

export interface NotebookCellOutputItem {
  mime: string;
  data: Uint8Array | string;
}