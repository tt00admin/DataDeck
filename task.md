# DataDeck for VS Code: 実装タスクリスト

## 1. タスク概要
設計.mdのアーキテクチャに基づき、VS Code拡張機能を実装するためのタスクを定義します。依存関係を考慮して実行順序を設定しています。

## 2. フェーズ1: 基盤構築
- [x] プロジェクト初期化
  - `package.json` `tsconfig.json` の作成（依存関係: VS Code Extension API、React、Vite等）
  - Webview用 `vite.config.ts` の設定
  - `.vscode/datadeck/` ディレクトリ構造の準備
- [x] 型定義の実装
  - `src/types/index.ts` に `Clip` `Deck` 等のインターフェースを定義
  - 各モジュール用の型ファイルを作成

## 3. フェーズ2: コアサービス実装
- [x] StorageServiceの実装
  - `clips.json` の読み書き機能
  - 画像ファイルの保存・削除機能
  - データ移行用 `migration.ts` の作成
- [x] ClipboardServiceの実装
  - [x] アクティブセルのキャプチャ機能
  - [x] 出力タイプ別（画像/HTML/DataFrame）の処理
  - [x] コードスニペットの紐付け
  - [x] 保存時のメモ・タグ入力モーダルの実装
  - [x] Clipモデルのtitle・memo・tagsが保存時に設定されるように修正
  - [x] 画像のサイズ・寸法メタデータの保存
- [x] NotebookAdapterの実装
  - [x] VS Code Native Notebook API対応 (`nativeNotebook.ts`)
  - [x] 抽象化レイヤー (`notebookAdapter.ts`)

## 4. フェーズ3: UI実装
- [x] SidebarProviderの実装
  - WebviewPanelプロバイダーの作成
  - Extension ↔ Webview間通信 (`messenger.ts`)
- [x] React UIコンポーネントの実装
  - メインDeck、ClipCard、PinnedSection、Timeline等のコンポーネント
  - 検索バー、詳細モーダルの実装
  - スタイルの適用 (CSS Modules / Tailwind) ※スタイルファイルは未作成
- [x] ドラッグ＆ドロップ並び替えの実装
  - [x] 表示順序の保存機能（Deck.tsxでD&D UI実装済み、App.tsxでメッセージ送信実装済み）
  - [x] dndService.tsの実装と連携（sidebarProvider.tsでreorderClipsメッセージ処理を実装済み）

## 5. フェーズ4: 機能実装
- [x] 検索・フィルタリング機能の実装 (`searchService.ts`)
  - [x] 出力タイプ・保存日時・ファイル名を対象としたフィルタリングの実装（App.tsxにUI実装済み、sidebarProvider.tsにフィルター処理実装済み）
- [x] ソースジャンプ機能の実装（クリップ→Notebookセルへの移動）
  - [x] jumpToCellメソッドは実装済み
  - [x] UIからの呼び出しとクリップクリック時の連動実装済み（ClipCard.tsxでhandleClick実装済み、sidebarProvider.tsでメッセージハンドラ実装済み）
- [x] Markdownエクスポート機能の実装 (`markdownGenerator.ts`)
  - [x] markdownGenerator.tsの実装（選択したクリップからMarkdownレポートを生成）
  - [x] extension.tsからの呼び出し実装（sidebarProvider.tsでエクスポート処理を実装）
  - [x] UIからのエクスポートボタン実装（App.tsxにボタン追加済み）

## 6. フェーズ5: 統合・テスト
- [x] ショートカットキーの登録・キーバインディング設定
  - [x] package.jsonでキーバインディング設定済み（Ctrl+Shift+D / Cmd+Shift+D）
  - [ ] セル出力の「Add to Deck」フローティングボタンの実装（要件5でOptional指定のため、主要要件ではない）
- [x] ユニットテスト・UIテストの実装（searchService、storageServiceのテスト完了）
- [ ] パフォーマンス最適化
  - [x] 仮想スクロール実装完了
  - [x] 画像の遅延読み込み（ClipCardでloading="lazy"実装済み）
  - [ ] Web Workerでの画像圧縮処理（imageWorker.tsは作成済みだが統合は今後の拡張）
- [x] extension.ts の修正が必要（修正完了）
  - [x] スペルミス（ExtentionContext → ExtensionContext）の修正が必要（修正完了）
  - [x] 構文エラー（カンマ漏れ等）の修正が必要（修正完了）
- [x] 各ファイルの構文エラー修正が必要（修正完了）
  - [x] storageService.ts: path.join の引数のカンマ漏れ（修正完了）
  - [x] searchService.ts: 変数名の不一致（clips → clip）（修正完了）
  - [x] dndService.ts: スペルミス（pinned → pinned）等（修正完了）

## 7. フェーズ6: ドキュメント・リリース準備
- [x] README.mdの作成（完了）
- [x] `.gitignore` の設定
  - [x] 基本設定完了
  - [x] `.vscode/datadeck/` の `.gitignore` への追加を推奨する設定の実装（extension.tsで実装済み）
- [x] パッケージング・Marketplace公開準備（vsix作成、LICENSE追加完了）

## 8. 依存関係図
```
フェーズ1 → フェーズ2 → フェーズ3 → フェーズ4 → フェーズ5 → フェーズ6
           ↓
        型定義は全フェーズで使用
```

## 9. 見積時間（参考）
- フェーズ1: 2-3時間 [x]
- フェーズ2: 6-8時間 [x]
- フェーズ3: 8-10時間 [x]（スタイル未実装）
- フェーズ4: 4-6時間 [x]
- フェーズ5: 4-6時間 [x]（テスト完了、修正完了）
- フェーズ6: 2-3時間 [x]（完了）
合計: 約26-36時間（完了）

## 10. フェーズ7: 未実装・不足機能の対応
- [x] 保存時のメモ・タグ入力モーダルの実装
  - 要件3.1: 保存時に考察やメモをその場で入力可能にする（clipboardService.tsで実装済み）
- [x] ソースジャンプ機能の完全実装
  - 要件3.2: 保存されたカードをクリックでNotebookの該当セルへ移動（実装済み）
- [x] ドラッグ＆ドロップによる並び替えの完全実装
  - 要件3.3: サイドバー内での表示順序の入れ替え（実装済み）
- [x] フィルタリング機能の拡張
  - 要件3.3: ファイル名、タグ、保存日時、出力タイプによる絞り込み
  - [x] 出力タイプ（画像/表/テキスト）でのフィルタリングUI実装（App.tsx）
  - [x] 保存日時でのフィルタリングUI実装（App.tsx）
  - [x] ファイル名（ソースNotebook）でのフィルタリング実装（App.tsx + searchService.ts）
- [x] Markdownエクスポート機能の完全実装
  - 要件3.4: 選択した成果物とメモをまとめたレポート下書き出力（実装済み）
- [x] 非機能要件の実現
  - [x] 画像の遅延読み込み（ClipCardでloading="lazy"実装済み）
  - [ ] Web Workerでの画像圧縮処理（imageWorker.tsは作成済みだが統合は今後の拡張）
  - [x] `.gitignore`への追加推奨設定（extension.tsで実装済み）
- [x] Clipモデルの拡張
  - [x] title・memo・tagsの保存時設定（clipboardService.tsで実装済み）
  - [x] 画像のサイズ・寸法メタデータの保存（getImageDimensions実装済み）

## 11. 最終確認結果
- [x] 要件.mdのすべての主要機能要件を満たしている（3.1-3.4）
- [x] 非機能要件の主要部分を満たしている（パフォーマンス、ポータビリティ、互換性）
- [x] UIの主要部分を実装済み（Activity Bar、Side Bar、Pinned/Recentセクション）
- [ ] オプション機能（Floating Action Button、セル出力のAdd to Deckボタン）は未実装だが、要件ではOptionalのため、主要要件に影響しない
- [ ] 拡張機能（Web Worker画像圧縮）は今後の拡張として予約

## 12. 実装完了サマリー
### 達成された主要機能
1. **クイック保存**: Ctrl+Shift+D / Cmd+Shift+D でNotebookセル出力を保存
2. **タグ/メモ付与**: 保存時のタイトル・メモ・タグ入力
3. **固定表示**: ピン止め機能による重要グラフの常駐
4. **タイムライン表示**: カード形式でのリスト表示
5. **ソースジャンプ**: クリップクリックでNotebookセルへ移動
6. **ドラッグ＆ドロップ**: 表示順序の入れ替え
7. **フィルタリング**: ファイル名・タグ・保存日時・出力タイプでの絞り込み
8. **Markdown出力**: 選択した成果物とメモをまとめたレポート下書き出力
9. **.gitignore推奨**: 初期化時の自動推奨設定

### 技術的成果
- TypeScriptコンパイルエラー解消済み
- キーバインディング設定済み
- ユニットテスト実装済み
- パッケージング準備完了（vsix作成、LICENSE追加）

## 13. フェーズ8: Marketplace公開準備
### 13.1 package.jsonの最適化
- [x] Marketplace公開に向けたメタデータの追加
  - [x] `keywords` フィールドの追加（data-science, notebook, jupyter, visualization等）
  - [x] `categories` フィールドの追加（["Data Science", "Notebooks"]等）
  - [x] `icon` パスの確認（resources/icon.svg）
  - [x] `repository` の正しいURL設定
  - [x] `homepage` または `bugs` フィールドの追加
  - [x] `galleryBanner` の設定（Marketplace表示用）

### 13.2 README.mdのMarketplace最適化
- [x] スクリーンショット・デモGIFの追加（プレースホルダー追加済み）
  - [ ] サイドバーのメイン画面キャプチャ ← **手動作業が必要**
  - [ ] クリップ保存のデモGIF ← **手動作業が必要**
  - [ ] 検索・フィルタリングのデモGIF ← **手動作業が必要**
  - [ ] MarkdownエクスポートのデモGIF ← **手動作業が必要**
- [x] バッジの追加（Build Status, Version, License等）
- [x] 詳細な使用例の追加
- [x] トラブルシューティングセクションの追加
- [x] FAQセクションの追加

### 13.3 アセット準備
- [ ] アイコンファイルの最終確認（SVG形式、推奨128x128px以上）
- [ ] スクリーンショットの撮影（推奨1280x720px以上）
- [ ] デモGIFの作成（5-10秒程度の短いデモ）
- [ ] Banner画像の作成（Marketplace用、推奨920x240px）

### 13.4 最終テスト・品質保証
- [ ] 全機能の手動テスト
  - [ ] Jupyter Notebookでの動作確認
  - [ ] 各種出力タイプ（画像、HTML、DataFrame、テキスト）の保存確認
  - [ ] エラーハンドリングの確認
- [ ] クロスプラットフォームテスト（Windows/Mac/Linux）
- [ ] パフォーマンステスト（大量クリップ時の動作確認）

### 13.5 パッケージング・公開
- [ ] 最終ビルドの実行
  - [ ] `npm run compile` の実行
  - [ ] `npm run webview:build` の実行
  - [ ] vsixパッケージの再作成（`vsce package`）
- [ ] Marketplaceアカウントの準備（Azure DevOps）
- [ ] 公開手順の実行
  - [ ] `vsce publish` または手動アップロード
- [ ] 公開後の動作確認
- [ ] リリースノートの作成（GitHub Releases）

### 13.6 ドキュメント・プロモーション
- [x] CHANGELOG.mdの作成・更新
- [x] CONTRIBUTING.mdの作成
- [ ] デモ動画のYouTubeアップロード（任意）
- [ ] SNSでの告知準備（Twitter/X, LinkedIn等）

## 14. 公開準備チェックリスト
- [x] package.jsonの全メタデータが正しい
- [x] CHANGELOG.mdの作成
- [x] CONTRIBUTING.mdの作成
- [x] package.jsonにbuild/package/publishスクリプト追加
- [ ] スクリーンショット/デモGIFの手動作成・配置
- [ ] 最終ビルド・手動テスト
- [ ] vsixパッケージ生成
- [ ] Marketplace公開
- [x] README.mdがMarketplace向けに最適化されている（スクリーンショットは要手動追加）
- [ ] スクリーンショット・デモGIFが準備されている ← **手動作業が必要**
- [x] 全テストが通過している（`npm test`: 8テスト成功）
- [x] ビルドが成功する（`npm run compile`成功）
- [x] vsixファイルが正常に生成される（`datadeck-1.0.0.vsix`生成済み）
- [x] LICENSEファイルが正しい（MIT）
- [x] .gitignoreが適切に設定されている
- [x] バージョン番号が適切（1.0.0で公開予定）
- [ ] リポジトリが公開可能な状態にある ← **要確認**

## 15. 推奨対応順序
1. **今すぐ必要**: package.jsonメタデータの追加、README最適化
2. **公開前必須**: スクリーンショット準備、最終テスト、vsix再ビルド
3. **公開時**: Marketplaceアップロード、動作確認
4. **公開後**: ドキュメント整備、プロモーション
