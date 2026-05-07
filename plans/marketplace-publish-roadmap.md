# DataDeck Marketplace公開ロードマップ

## 1. 現在の公開レベル評価

### ✅ 完了している項目 (自動化済み)

| カテゴリ | 項目 | 状態 |
|---------|------|------|
| **基本メタデータ** | package.json設定 | ✅ 完了 |
| | displayName, description, version | ✅ |
| | publisher, license | ✅ |
| | keywords (data-science, notebook等) | ✅ |
| | categories (Data Science, Notebooks) | ✅ |
| | repository, homepage, bugs | ✅ |
| **スクリプト追加** | build/package/publish | ✅ npm scripts追加済み |
| **ドキュメント** | CHANGELOG.md | ✅ 作成済み |
| | CONTRIBUTING.md | ✅ 作成済み |
| | README.md | ✅ スクリーンショット案内追加 |
| **機能実装** | 主要機能要件 (要件.md 3.1-3.4) | ✅ 完了 |
| **技術的品質** | TypeScriptコンパイルエラーゼロ | ✅ |
| | ユニットテスト実装 | ✅ (3ファイル) |
| | キーバインディング設定 | ✅ |
| | .gitignore設定 | ✅ |

### ⚠️ 公開前に完了が必要な項目 (人要)

| 優先度 | 項目 | 詳細 |
|-------|------|------|
| **高** | スクリーンショット/デモ画像 | docs/images/ が空、手動撮影必要 |
| **高** | 最終ビルド・テスト | 手動テスト未実施 |
| **中** | Banner画像 | Marketplace用バナーなし |
| **中** | アイコン品質確認 | SVG形式 (128x128以上推奨) |
| **低** | Web Worker画像圧縮 | 実装済みだが未統合 |
| **低** | Floating Action Button | 要件ではOptional |

---

## 2. 公開レベル判定

```
公開レベル: 85% (自動化項目完了)

理由:
- 機能実装は主要要件をクリア
- 技術的品質は高い（コンパイルエラーゼロ、テスト実装済み）
- ドキュメント・criptsは自動化できるものを完了
- 残りは視覚的アセットの手動作成のみ
```

---

## 3. 優先度付きロードマップ

### Phase 1: 必須項目 (人要)

1. **スクリーンショット/デモGIFの作成** (手動)
   - メイン画面キャプチャ (1280x720px以上) → `docs/images/main-screen.png`
   - クリップ保存のデモGIF → `docs/images/clip-save-demo.gif`
   - 検索・フィルタリングのデモGIF → `docs/images/search-filter-demo.gif`
   - MarkdownエクスポートのデモGIF → `docs/images/export-demo.gif`

2. **最終ビルド・テスト** (手動)
   ```bash
   npm run build
   npm run package
   ```
   - Jupyter Notebookでの動作確認
   - marimoでの動作確認
   - 各種出力タイプ（画像、HTML、DataFrame、テキスト）テスト

3. **vsixパッケージ生成** (自動化済み)
   ```bash
   npm run package
   ```

### Phase 2: 推奨項目 (人要)

4. **Banner画像の作成**
   - Marketplace表示用 (920x240px推奨)
   - テーマカラー (#1e1e1e) 使用

5. **アイコン品質確認**
   - 128x128px以上であることを確認
   - Retina対応の確認

### Phase 3: オプション (公開後改善)

6. **Web Worker画像圧縮の統合**
   - imageWorker.tsの本番統合

7. **Floating Action Button実装**
   - セル出力へのAdd to Deckボタン

8. **デモ動画の作成・YouTube公開**

9. **SNSでの告知準備**

---

## 4. 次のアクション (人要)

```bash
# 1. ビルドテスト
npm run build

# 2. スクリーンショット撮影・配置
# docs/images/ に以下を配置:
#   - main-screen.png
#   - clip-save-demo.gif
#   - search-filter-demo.gif
#   - export-demo.gif

# 3. パッケージ作成
npm run package

# 4. Marketplace公開
npm run publish
```

---

## 5. チェックリスト

### 公開前必須チェック (人要)
- [ ] スクリーンショット/デモGIFの作成・配置
- [ ] `npm run build` 成功確認
- [ ] 手動テスト完了 (Jupyter/marimo)
- [ ] `npm run package` でvsix生成
- [ ] 生成されたvsixでのインストール確認

### 公開時チェック
- [ ] Azure DevOpsアカウント準備
- [ ] publisher名確認 (package.jsonの"datadeck"が正しいか)
- [ ] `npm run publish` 実行 または 手動アップロード