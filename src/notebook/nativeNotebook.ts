import * as vscode from 'vscode';
import { INotebookAdapter } from './notebookAdapter.js';

export class NativeNotebookAdapter implements INotebookAdapter {
  getActiveCell(): vscode.NotebookCell | undefined {
    const activeEditor = vscode.window.activeNotebookEditor;
    if (!activeEditor) {
      return undefined;
    }
    const selection = activeEditor.selections[0];
    if (!selection) {
      return undefined;
    }
     return activeEditor.notebook.cellAt(selection.start);
  }

  getCellOutput(cell: vscode.NotebookCell): vscode.NotebookCellOutput | undefined {
    const outputs = cell.outputs;
    if (!outputs || outputs.length === 0) {
      return undefined;
    }
    return outputs[outputs.length - 1];
  }

  getCellCode(cell: vscode.NotebookCell): string | undefined {
    return cell.document?.getText();
  }

  async jumpToCell(notebookUri: string, cellId: string): Promise<void> {
    try {
      const uri = vscode.Uri.parse(notebookUri);
      const document = await vscode.workspace.openNotebookDocument(uri);
      const editor = await vscode.window.showNotebookDocument(document);

      const cellIndex = document.getCells().findIndex(cell => cell.document.uri.toString() === cellId);
      if (cellIndex >= 0) {
         const cell = document.cellAt(cellIndex);
         const range = new vscode.NotebookRange(cellIndex, cellIndex);
         (editor as any).revealRange(range, (vscode as any).NotebookEditorRevealType?.InCenter || 1);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to jump to cell: ${error}`);
    }
  }
}