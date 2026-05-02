export interface ClipMetadata {
  id: string;
  title?: string;
  tags: string[];
  pinned: boolean;
  order: number;
}

export interface CaptureResult {
  success: boolean;
  clipId?: string;
  error?: string;
}