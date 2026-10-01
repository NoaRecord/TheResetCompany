# TheResetCompany — v0.1 Implementation Plan

## 1. 目的

v0.1の最優先目標は、短期間で「公開して遊べる状態」にすること。

完成度を追いすぎず、TheResetCompanyの核となるゲーム性とGLOBAL RESET演出を体験できる最小構成を作る。

v0.1ではEmployee編を中心とし、Client編、高度なBalance Lab、複雑な社内演出は原則として後回しにする。

---

## 2. v0.1の必須要素

### 2.1 Employeeゲーム

短時間で一周できる経営シミュレーション。

想定：

- ゲーム内30日
- 実時間5～8分程度を目安
- 状態値は数値とゲージ中心

主要状態値：

- Active Users
- Paid Users
- Satisfaction
- Frustration
- Expectation
- Reset Energy / Reset Cost
- Users Lost to Competitors

基本ループ：

1. ユーザーが利用枠を消費する
2. 枠切れユーザーが増える
3. Frustrationが増加する
4. 満足度が低下すると他社へ流出する
5. 満足度が高いと新規ユーザーが増える
6. RESET Energyが蓄積する
7. Banked / Global Resetを適切なタイミングで使用する
8. RESET後はSatisfactionが上がるがExpectationも上がる

---

## 3. RESET

### 3.1 Banked Reset

v0.1では機能優先。

最低限：

- コストを消費
- 一部または対象ユーザーの状態を改善
- Satisfaction上昇
- Frustration低下
- ExpectationはGlobalより小さく上昇

パンチカードの本格演出はv0.1必須ではない。

### 3.2 Global Reset

v0.1から代表的な演出を入れる。

最低限：

- PREPARE GLOBAL RESET
- RESET CORE充填
- 120%表示
- Safety Lock解除
- ターゲット確認
- コンソール開放
- 透明カバー付き赤ボタン
- カバー解除
- HOLD TO RESET
- CODE-X RESET
- フラッシュ
- 世界へのPropagation
- GLOBAL RESET COMPLETE

この演出はv0.1の見せ場として優先する。

---

## 4. JUST RESET

v0.1に含める。

特徴：

- ゲームバランス無視
- RESETコストなし
- GAME OVERなし
- 何度でもGLOBAL RESETを実行可能
- 可能なら連打対応
- 押下回数に応じたジョークメッセージ

例：

- `PLEASE, TYBO. THEY'RE ALREADY RESET.`
- `THEY HAVE MORE CODE-X THAN THEY CAN POSSIBLY USE.`

---

## 5. Krog X Monitor

v0.1に含める。

実際のX APIは使わない。

ゲーム状態に応じて架空の投稿を表示する。

カテゴリ例：

- calm
- frustration_medium
- frustration_high
- after_global_reset
- klaude_event
- bug_incident
- tybo_posted

例：

- Give us a reset, plz.
- TYBO 👀
- BANKED RESET WHEN
- Klaude just reset everyone.
- I'M OUT.
- WE'RE BACK.

---

## 6. ランダムイベント

v0.1では少数に絞る。

候補：

- BUG FIXED
- SERVER TROUBLE
- KLAUDE RESET EVERYONE
- TYBO POSTED 👀
- USER MILESTONE
- NEW MODEL RELEASED

イベントはデータ駆動にし、後から追加しやすくする。

---

## 7. 終了条件

通常終了：

- Day 30終了

早期終了候補：

- Paid UsersまたはActive Usersが極端に減少

v0.1では早期終了条件を複雑にしすぎない。

---

## 8. 最終スコア

スコアは「少ないRESETコストでユーザー数と満足度を維持・増加させる」ことを反映する。

表示候補：

- Final Paid Users
- User Growth
- Satisfaction
- Global Reset count
- Banked Reset count
- Users Lost to Klaude
- Reset Efficiency
- Final Score

Mr. Somによる短い評価コメントを付ける。

例：

- RESETを乱発した場合
- RESETをほとんど使わなかった場合
- 高満足度・高Expectationの場合
- Klaude流出が多い場合
- 高得点の場合

---

## 9. 視覚デザイン

通常画面は地味なCRT風。

必須要素：

- 黒背景
- 緑／赤／琥珀色の発光文字
- CRT走査線
- モノスペース
- 数値
- ゲージ
- テキストログ
- 警告表示

画像を多用しない。

GLOBAL RESETだけ明確に派手にする。

---

## 10. 技術構成

原則：

- HTML
- CSS
- Vanilla JavaScript
- JSON
- localStorage

バックエンド不要。

GitHub Pagesで公開可能にする。

---

## 11. 推奨ファイル構成

```text
TheResetCompany/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  ├─ main.js
│  ├─ engine/
│  │  ├─ game-state.js
│  │  ├─ game-engine.js
│  │  ├─ scoring.js
│  │  └─ rng.js
│  ├─ ui/
│  │  ├─ crt-ui.js
│  │  ├─ reset-sequence.js
│  │  └─ krog-monitor.js
│  └─ data/
│     └─ loader.js
├─ data/
│  ├─ balance.json
│  ├─ events.json
│  └─ x-messages.json
├─ prototypes/
│  └─ reset-sequence/
├─ tools/
│  └─ balance-lab/
├─ README.md
└─ LICENSE
```

実際の構成はCodex統合時に最小限調整してよい。

---

## 12. 実装順序

1. Game State定義
2. Game Engine最小実装
3. Employeeゲーム最小ループ
4. CRTテキストUI
5. Banked / Global Resetロジック
6. GLOBAL RESET演出
7. JUST RESET
8. Krog Monitor
9. ランダムイベント
10. スコア・エンディング
11. localStorage
12. 最低限のレスポンシブ対応
13. 自動テスト
14. GitHub Pages公開
15. README整備

---

## 13. v0.1で実装しないもの

明示的に後回しとする。

- Client Mode
- 本格的な気送管演出
- 本格的なパンチカード演出
- Executive Floor
- Mr. Somのサインアニメーション
- モデル研究部門の複雑なイベント
- 実X投稿取得
- 外部API
- サーバーDB
- ログイン
- ランキング
- マルチプレイ
- 高度なBalance Lab
- DOE
- Taguchi-style S/N analysis
- Controlled Instability

---

## 14. v0.1公開判定

以下を満たせば公開候補とする。

- Employeeゲームを最後まで一周できる
- Banked / Global Resetが機能する
- スコアが計算される
- Krog Monitorが状態に応じて変化する
- GLOBAL RESET演出が明確な見せ場になっている
- JUST RESETが動作する
- 明らかな必勝法・即破綻がない
- PCブラウザで正常動作
- スマホで最低限操作可能
- GitHub Pagesで公開できる
- READMEがある

「完全なバランス」はv0.1公開条件に含めない。
