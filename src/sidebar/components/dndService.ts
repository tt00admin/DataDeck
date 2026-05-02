import { Deck, Clip } from '../../types/index.js';
import { StorageService } from '../../storage/storageService.js';

export class DnDService {
  // クリップの順序を更新
  static reorderClips(clips: Clip[], startIndex: number, endIndex: number): Clip[] {
    const result = Array.from(clips);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // 順序を更新
    return result.map((clip, index) => ({
      ...clip,
      order: index
    }));
  }

  // ピン留め状態の変更
  static togglePin(clips: Clip[], clipId: string): Clip[] {
    return clips.map((clip: any) => 
       clip.id === clipId ? { ...clip, pinned: !clip.pinned } : clip
    );
  }

  // クリップの削除
  static deleteClip(clips: Clip[], clipId: string): Clip[] {
    return clips.filter((clip: any) => clip.id !== clipId);
  }

  // デッキの保存（ストレージサービスを使用）
  static async saveDeck(deck: Deck, storageService: StorageService): Promise<void> {
    deck.lastUpdated = Date.now();
    await storageService.saveDeck(deck);
  }
}