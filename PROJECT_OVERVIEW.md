# TheResetCompany — Project Overview

## 1. 目的

TheResetCompany は、AIコーディングサービスの利用枠、不定期RESET、障害補償、競合サービスへの移動などを題材にした、軽量なブラウザ向けパロディ／経営シミュレーションゲームです。

基本姿勢は次のとおりです。

> 真面目な技術でくだらないものを作る。

本格的な商用ゲーム開発ではなく、短期間で公開可能な小規模Web作品として作り、公開後に段階的に育てます。

## 2. 現在地

現在は **v0.1.0初回公開候補の準備中** です。公開GitHubリポジトリは作成済みで、承認済みソースのpushを進めています。GitHub Pagesとitch.ioの公開、人間による最終プレイ確認は別途完了が必要です。

統合元としてChatGPT Project側で次の独立成果物が作成・検証され、既存との差分確認後に必要な範囲をローカル統合しました。

- Employee Mode用 Logic / Balance reference engine
- `balance.json` / `events.json`
- seed再現可能なRNG
- scoring / Mr. Som評価
- Logic自動テスト
- GLOBAL RESET独立prototype
- GLOBAL RESET prototype自動テスト
- RESET SequenceのGame Engine接続境界

LogicとGLOBAL RESETのprepare/commit境界は維持しています。R1採用値、Final UI polish、会計項目、UI表示、save schemaの更新内容は `docs/INTEGRATION_CONTRACT_V0_1.md` とRevision 1 addendumを参照してください。Pages構成、itch.io package、page copy、cover、screenshots、release checklistは `release/` にまとめます。

## 3. v0.1の最優先目標

短期間で「公開して遊べる状態」にします。

v0.1の中心はEmployee Modeです。

### v0.1に含める

- Employee Mode
- 30日、1 Day = 1 Player Action
- `WAIT`
- `BANKED_RESET`
- `GLOBAL_RESET`
- Banked Reset
- Global Reset
- Krog X Monitor
- 少数のRandom Events
- Final Score
- Mr. Som評価コメント
- JUST RESET
- CRT風通常UI
- GLOBAL RESET演出
- 簡易BGM / Audio state system
- localStorage
- 最低限のレスポンシブ対応
- 自動テスト
- README

### v0.1に含めない

- Client Mode
- 本格的な気送管演出
- 本格的なパンチカード演出
- Executive Floor
- Mr. Som署名アニメーション
- 複雑な研究部門イベント
- 実X投稿取得
- 外部API
- サーバーDB
- ログイン
- ランキング
- マルチプレイ
- 高度なBalance Lab
- DOE / Taguchi-style S/N
- Controlled Instability

面白いという理由だけでv0.1の範囲を増やさないでください。

## 4. 技術方針

基本技術は次だけです。

- HTML
- CSS
- Vanilla JavaScript
- JSON
- localStorage
- 必要に応じてWeb Audio API

必要性が明確でない限り、フレームワーク、バックエンド、DB、認証、外部API、build stepを導入しません。

最終公開先はまだ確定していませんが、静的ホスティングで公開可能な構造を維持します。

## 5. Game Logicの確定事項

Canonical flow:

```text
Pressure
→ Player Decision
→ Settlement
```

Player Action:

```text
WAIT
BANKED_RESET
GLOBAL_RESET
```

v0.1はDay 30終了のみで、早期Game Overはありません。

主要Game Stateのcanonical name:

```text
day
activeUsers
paidUsers
exhaustedUsers
satisfaction
frustration
expectation
resetEnergy
grossLostToKlaude
returnedFromKlaude
```

必須Invariant:

```text
0 <= exhaustedUsers <= paidUsers <= activeUsers
```

具体式・採用balance値は `docs/INTEGRATION_CONTRACT_V0_1_R1.md` と `data/balance.json` を参照してください。

## 6. GLOBAL RESETの接続方針

GLOBAL RESETは二段階です。

```text
GLOBAL_RESET選択
→ Game Engineが利用可能性を確認しPREPARE
→ runGlobalResetSequence(...)
→ HOLD 100%
→ CODE-X RESET
→ onTrigger()
→ Game EngineがcommitGlobalReset(...)
→ Propagation
→ Complete
→ Promise resolve
→ Settlement / Day++
```

選択した瞬間にはGame Stateを変更しません。

HOLD 100% / CODE-X RESETがGame Engine側のRESET effect適用地点です。

詳細は `docs/INTEGRATION_CONTRACT_V0_1.md` とRevision 1 addendumを参照してください。

## 7. 巨大RESETボタンの表示原則

巨大な赤い物理RESETボタンと透明Safety Coverは、通常画面では表示しません。

通常画面では地味なCRT UI上の操作として `PREPARE GLOBAL RESET` 等を提示し、GLOBAL RESET SequenceのConsole Deploymentで初めてRESET Unitを出現させます。

> 通常画面は地味に。RESET時だけ制作費を間違える。

この落差は作品の重要なジョーク構造です。

## 8. Audio方針

v0.1では完全無音を避け、簡易BGMを追加します。

基本状態:

- `NORMAL`: 低音量の地味なレトロ電子BGM
- `ATTENTION`: 判断・警告時に同系統の音を少し緊張させる
- `GLOBAL_RESET`: 明確に別の雰囲気へ移行し、CODE-X RESET直前に一瞬の無音を使う

第一候補はWeb Audio APIによる単純なオリジナル生成音です。既存曲の模倣や権利確認が必要な外部素材をv0.1の前提にしません。

詳細は `docs/AUDIO_SPEC_V0_1.md` を参照してください。

## 9. 開発責任の分担

### ChatGPT Project

- 仕様
- release scope
- Logic / Balance設計
- UI / Visual Effects設計
- 独立prototype
- Integration Contract
- イベント文章
- 解析設計
- Codex handoff

### ローカルPython / CPU

- Monte Carlo
- 仮想プレイヤー
- パラメータサーベイ
- 感度解析
- DOE等の大量数値計算

### Codex

- repository全体への統合
- 既存部品の接続
- 本編UI
- 実ブラウザ確認
- responsive調整
- regression対応
- バグ修正
- 最終的な公開作業（公開が明示的に指示された場合のみ）

### Project Control

- v0.1採用範囲
- 専門成果物の承認
- Integration Contract
- Codexへのhandoff
- 公開判定

詳細は `docs/DEVELOPMENT_WORKFLOW.md` を参照してください。

## 10. Balance研究の記録

将来、品質工学・DOE・Monte Carlo等の解析を、格調高くクソ真面目な論文風パロディとしてまとめる予定です。

そのため、Balance実験は使い捨てにせず、再現可能な形で以下を残します。

- experiment ID
- engine / balance version
- 仮説
- 因子・水準
- 固定条件
- seed規則
- 試行回数
- 仮想戦略
- raw data
- processed data
- figures
- interpretation
- 採用判断
- limitations

詳細は `docs/BALANCE_LAB_PROTOCOL.md` を参照してください。

## 11. 正本の優先順位

矛盾がある場合は次の順で扱います。

1. ユーザーの最新の明示的な指示
2. `docs/spec/V0_1_IMPLEMENTATION_PLAN.md`
3. 分野別仕様書
   - `docs/spec/RESET_SEQUENCE_SPEC.md`
   - `docs/spec/VISUAL_STYLE_GUIDE.md`
   - `docs/spec/BALANCE_DESIGN.md`
4. `docs/spec/PRODUCT_SPEC.md`
5. `docs/spec/ROADMAP.md`

v0.1の具体的な実装境界については、Project Controlで確定した `docs/INTEGRATION_CONTRACT_V0_1.md` も参照してください。

## 12. Codex初回作業

最初のCodex統合作業では、GitHub公開やremote repository作成まで行いません。

まずローカルでv0.1を統合し、一周遊べる状態と実ブラウザ検証を目標にします。

初回作業は `docs/CODEX_START.md` を参照してください。
