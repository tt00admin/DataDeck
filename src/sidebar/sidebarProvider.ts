import * as vscode from 'vscode';
import { StorageService } from '../storage/storageService.js';
import { ClipboardService } from '../clipboard/clipboardService.js';
import { NativeNotebookAdapter } from '../notebook/nativeNotebook.js';
import { MarimoAdapter } from '../notebook/marimoAdapter.js';
import { SearchService } from '../search/searchService.js';
import { DnDService } from '../sidebar/components/dndService.js';
import { MarkdownGenerator } from '../export/markdownGenerator.js';

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly storageService: StorageService,
    private readonly clipboardService: ClipboardService
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    try {
      console.log('DataDeck: Resolving webview view...');
      this._view = webviewView;

      webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this._extensionUri, 'out', 'webview'),
          this.storageService.getStorageUri(),
          this._extensionUri
        ]
      };

      const html = this._getHtmlForWebview(webviewView.webview);
      console.log('DataDeck: Webview HTML generated, length:', html.length);
      webviewView.webview.html = html;
      console.log('DataDeck: Webview HTML set successfully');

      // メッセージハンドラ
      webviewView.webview.onDidReceiveMessage(async (message) => {
        switch (message.type) {
          case 'clipActiveCell':
            await this.clipboardService.clipActiveCell();
            this._refreshDeck();
            break;
          case 'requestDeck':
            await this._sendDeck();
            break;
          case 'filterDeck':
            await this._sendFilteredDeck(message);
            break;
          case 'exportMarkdown':
            await this._exportMarkdown();
            break;
          case 'deleteClip':
            await this._deleteClip(message.clipId);
            break;
          case 'togglePin':
            await this._togglePin(message.clipId);
            this._refreshDeck();
            break;
          case 'jumpToCell':
            await this._jumpToCell(message.notebookUri, message.cellId);
            break;
          case 'reorderClips':
            await this._reorderClips(message.startIndex, message.endIndex);
            this._refreshDeck();
            break;
          case 'openImage':
            await this._openImageInNewWindow(message.clip);
            break;
        }
      });
      console.log('DataDeck: Webview view resolved successfully');
    } catch (error) {
      console.error('DataDeck: Error in resolveWebviewView:', error);
      throw error;
    }
  }

  private async _sendDeck() {
    if (!this._view) {
      return;
    }
    const deck = await this.storageService.loadDeck();
    const webview = this._view.webview;
      const convertedClips = this._convertClipsForWebview(deck.clips as any[], webview);
    const convertedDeck = { ...deck, clips: convertedClips };
    this._view.webview.postMessage({ type: 'deckUpdate', deck: convertedDeck });
  }

  private async _sendFilteredDeck(message: any) {
    if (!this._view) {
      return;
    }
    const deck = await this.storageService.loadDeck();
    const filteredClips = SearchService.searchClips(deck.clips, message.query || '', {
      type: message.clipType,
      dateFrom: message.dateFrom,
      dateTo: message.dateTo,
      notebookFileName: message.notebookFileName
    });

    const webview = this._view.webview;
    const convertedClips = this._convertClipsForWebview(filteredClips as any[], webview);
    const convertedDeck = { ...deck, clips: convertedClips };
    this._view.webview.postMessage({ type: 'deckUpdate', deck: convertedDeck });
  }

  private _convertClipsForWebview(clips: any[], webview: vscode.Webview) {
    return clips.map((clip: any) => {
      if (clip.type === 'image' && clip.content.imagePath) {
        try {
          const fileUri = this.storageService.getImageUri(clip.content.imagePath);
          const webviewUri = webview.asWebviewUri(fileUri);
          return {
            ...clip,
            content: { ...clip.content, imageWebviewUri: webviewUri.toString() }
          };
        } catch {
          return clip;
        }
      }
      return clip;
    });
  }

  private async _exportMarkdown() {
    try {
      const deck = await this.storageService.loadDeck();
      if (deck.clips.length === 0) {
        vscode.window.showInformationMessage('エクスポートするクリップがありません');
        return;
      }
      const outputUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file('datadeck-export.md'),
        filters: { 'Markdown': ['md'] }
      });
      if (outputUri) {
        await MarkdownGenerator.generateMarkdown(deck.clips, outputUri.fsPath);
        vscode.window.showInformationMessage(`Markdownをエクスポートしました: ${outputUri.fsPath}`);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`エクスポートに失敗しました: ${error}`);
    }
  }

  private async _deleteClip(clipId: string) {
    const deck = await this.storageService.loadDeck();
        const clip = deck.clips.find((c: any) => c.id === clipId);
    if (clip) {
      await this.storageService.deleteClip(clip);
    }
    this._refreshDeck();
  }

  private async _refreshDeck() {
    await this._sendDeck();
  }

  private async _togglePin(clipId: string) {
    const deck = await this.storageService.loadDeck();
      const clip = deck.clips.find((c: any) => c.id === clipId);
    if (clip) {
      clip.pinned = !clip.pinned;
      await this.storageService.saveDeck(deck);
    }
  }

  private async _reorderClips(startIndex: number, endIndex: number) {
    const deck = await this.storageService.loadDeck();
    deck.clips = DnDService.reorderClips(deck.clips, startIndex, endIndex);
    await this.storageService.saveDeck(deck);
  }

  private async _jumpToCell(notebookUri: string, cellId: string): Promise<void> {
    try {
      const uri = vscode.Uri.parse(notebookUri);
      const document = await vscode.workspace.openTextDocument(uri);
      // Check if it's a marimo file
      if (document.languageId === 'python' && 
          (document.getText().includes('import marimo') || document.getText().includes('from marimo'))) {
        const marimoAdapter = new MarimoAdapter();
        await marimoAdapter.jumpToCell(notebookUri, cellId);
      } else {
        // Assume native notebook
        const nativeAdapter = new NativeNotebookAdapter();
        await nativeAdapter.jumpToCell(notebookUri, cellId);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to jump to cell: ${error}`);
    }
  }

  private async _openImageInNewWindow(clip: any) {
    if (!clip || clip.type !== 'image' || !clip.content.imagePath) {
      return;
    }

    // 新しいWebviewパネルを作成
    const panel = vscode.window.createWebviewPanel(
      'imagePreview',
      clip.title || 'Image Preview',
      vscode.ViewColumn.Beside, // 現在のエディタの横に開く
      {
        enableScripts: false,
        retainContextWhenHidden: true,
        localResourceRoots: [
          this.storageService.getStorageUri(),
          this._extensionUri
        ]
      }
    );

    // 画像のURIを取得（クリップのimagePathから）
    let imageUri: vscode.Uri;
    try {
      // クリップのimagePathは元のファイル名（パス）なので、ストレージからURIを取得
      imageUri = this.storageService.getImageUri(clip.content.imagePath);
    } catch (error) {
      console.error('Failed to get image URI:', error);
      // フォールバック: imagePathをそのままURIとして使用
      imageUri = vscode.Uri.parse(clip.content.imagePath);
    }

    // Webviewパネル内で画像を全画面表示するHTML
    panel.webview.html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${clip.title || 'Image Preview'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            background-color: #1e1e1e; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            overflow: hidden;
          }
          .image-container {
            max-width: 100%;
            max-height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          img {
            max-width: 100%;
            max-height: 100vh;
            object-fit: contain;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="image-container">
          <img src="${panel.webview.asWebviewUri(imageUri)}" alt="${clip.title || 'Image'}" />
        </div>
      </body>
      </html>
    `;

    // パネルが閉じられた時の処理
    panel.onDidDispose(() => {
      // クリーンアップが必要な場合はここに記述
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'assets', 'main.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'assets', 'main.css')
    );

    const nonce = getNonce();
    // 最小限のCSP - 問題の切り分けのため
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; script-src 'nonce-${nonce}' ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline';">
        <link href="${styleUri}" rel="stylesheet">
        <title>DataDeck</title>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
