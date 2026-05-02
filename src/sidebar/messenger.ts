import * as vscode from 'vscode';

export interface Message {
  type: string;
  [key: string]: any;
}

export class Messenger {
  private _webview?: vscode.Webview;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  setWebview(webview: vscode.Webview) {
    this._webview = webview;
  }

  async postMessage(message: Message): Promise<boolean> {
    if (!this._webview) {
      return false;
    }
    return await this._webview.postMessage(message);
  }

  onMessage(callback: (message: Message) => void | Promise<void>) {
    if (!this._webview) {
      return;
    }
    return this._webview.onDidReceiveMessage(callback);
  }

  // デッキ更新を通知
  async sendDeckUpdate(deck: any): Promise<void> {
    await this.postMessage({ type: 'deckUpdate', deck });
  }

  // クリップ保存完了を通知
  async sendClipSaved(clipId: string): Promise<void> {
    await this.postMessage({ type: 'clipSaved', clipId });
  }

  // エラー通知
  async sendError(message: string): Promise<void> {
    await this.postMessage({ type: 'error', message });
  }
}