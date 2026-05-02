import * as fs from 'fs/promises';
import * as path from 'path';
import { Deck } from '../types/index.js';

const CURRENT_VERSION = '1.0.0';

export async function migrateDeck(deck: Deck): Promise<Deck> {
  if (!deck.version) {
    // バージョン情報がない場合は初期バージョンとして扱う
    deck.version = '0.0.1';
  }

  if (deck.version === '0.0.1') {
    // 0.0.1から1.0.0への移行
    deck = await migrateFrom001To100(deck);
  }

  return deck;
}

async function migrateFrom001To100(deck: Deck): Promise<Deck> {
  // 各クリップに新しいフィールドを追加
  for (const clip of deck.clips) {
    if (!clip.metadata) {
      clip.metadata = {};
    }
    if (clip.order === undefined) {
      clip.order = Date.now();
    }
  }

  // バージョンを更新
  deck.version = CURRENT_VERSION;
  return deck;
}

export async function checkAndMigrate(storagePath: string): Promise<void> {
  const clipsJsonPath = path.join(storagePath, 'clips.json');
  try {
    const data = await fs.readFile(clipsJsonPath, 'utf-8');
    const deck: Deck = JSON.parse(data);
    const migratedDeck = await migrateDeck(deck);
    await fs.writeFile(clipsJsonPath, JSON.stringify(migratedDeck, null, 2), 'utf-8');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}