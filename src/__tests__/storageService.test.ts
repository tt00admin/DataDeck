import { StorageService } from '../storage/storageService.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';

// Mock vscode module
jest.mock('vscode', () => ({
  workspace: {
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }]
  },
  ExtensionContext: jest.fn()
}));

jest.mock('fs/promises');

describe('StorageService', () => {
  let storageService: StorageService;
  const mockContext = {
    extensionPath: '/test/extension'
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    storageService = new StorageService(mockContext);
  });

  test('initialize should create directories and initial deck', async () => {
    (fs.access as jest.Mock).mockRejectedValueOnce(new Error('File not found'));
    (fs.mkdir as jest.Mock).mockResolvedValueOnce(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValueOnce(undefined);

    await storageService.initialize();

    expect(fs.mkdir).toHaveBeenCalledTimes(2);
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
  });

  test('loadDeck should return deck with clips', async () => {
    const mockDeck = {
      version: '1.0.0',
      lastUpdated: Date.now(),
      clips: [],
      settings: { autoSave: true, maxClips: 100, imageQuality: 85 }
    };
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockDeck));

    const deck = await storageService.loadDeck();
    expect(deck.version).toBe('1.0.0');
    expect(deck.clips).toEqual([]);
  });

  test('saveDeck should write deck to file', async () => {
    const deck = {
      version: '1.0.0',
      lastUpdated: Date.now(),
      clips: [{ id: 'test' }] as any,
      settings: { autoSave: true, maxClips: 100, imageQuality: 85 }
    };
    (fs.writeFile as jest.Mock).mockResolvedValueOnce(undefined);

    await storageService.saveDeck(deck);
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
  });
});