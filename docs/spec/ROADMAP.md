# TheResetCompany — Roadmap

## 基本方針

TheResetCompanyは、初回公開を小さく行い、その後のアップデートで世界観・演出・ゲームモード・解析機能を段階的に育てる。

新しい案は、v0.1へ無理に追加せず、アップデート候補として保管する。

---

## v0.1 — First Public Release

中心：

- Employee Mode
- Banked Reset
- Global Reset
- Krog X Monitor
- 少数のランダムイベント
- 最終スコア
- Mr. Som評価コメント
- JUST RESET
- CRT風UI
- GLOBAL RESET演出
- GitHub Pages
- README

目的：

> まず公開する。  
> まず遊べる。  
> まずRESETを押せる。

---

## v0.2 — Incident Update

候補：

- 気送管
- 障害報告
- BUG FIXED
- SERVER TROUBLE
- 詫びBanked Reset
- 補償対象選択
- Chappyによる障害報告
- 低確率の「何も起きていない」報告

ゲーム上の狙い：

- RESETを単なる満足度回復ではなく、障害補償の経営判断にもする
- 気送管をランダムイベント通知UIとして活用する

---

## v0.3 — Punch Card Update

候補：

- Banked Reset専用演出
- 長い箱に入ったパンチカード
- Chappyが両手で運ぶ
- 大型カードリーダー
- 大量投入
- 処理枚数カウンター
- カードジャム
- ラインプリンタ
- `PROPAGATION MAY TAKE SOME TIME`

世界観上の狙い：

> Banked Resetの反映に時間がかかるのは、実は大量のパンチカードを処理しているからである。

---

## v0.4 — Corporate Affairs

候補：

- Mr. Som承認
- Executive Floor
- RESET申請書
- 社長サイン
- 気送管で承認書送付
- GLOBAL RESETがBankedに差し戻される
- モデル研究部門の奇妙な事故
- 「話題をそらせ」系PRイベント
- Community Attention

例：

- Experimental Model Missing
- Model Returned
- Klaude Incident
- PR Diversion Request

---

## v0.5 — Client Mode

ユーザー側ゲーム追加。

主要要素：

- Weekly Limit
- Project Progress
- 通常RESETまでの時間
- Tyboの意味深な投稿
- Klaude側イベント
- RESET期待
- 枠を温存するか使うか
- `BURN EVERYTHING`
- RESETが来ない場合の悲劇

決まり文句：

> Give me a reset, plz.

---

## v0.6 — Balance Lab

Pythonベースの解析環境。

候補：

- 仮想プレイヤー
- Monte Carlo
- seed再現
- 戦略別集計
- スコア分布
- ゲームオーバー率
- RESET平均回数
- ユーザー流出
- パラメータサーベイ
- 感度解析

仮想戦略例：

- Reset Maniac
- Miser
- Satisfaction Keeper
- Panic Manager
- Growth Manager
- Banked Lover
- Global Lover
- Balanced
- Random

---

## v0.7 — DOE / Quality Engineering Experiment

候補：

- 一因子サーベイ
- 非線形性確認
- 重要因子選定
- 必要に応じて直交表
- DOE
- Taguchi-style S/N analysis
- 交互作用確認
- 安全なパラメータ領域の推定

目的：

> 「最適値」ではなく、「ゲームとして破綻しない設計領域」を求める。

---

## v0.8 — Controlled Instability

数値解析で確認した安全領域内で、ゲーム開始時のバランスを変動させる。

候補：

- User Patience
- Churn Sensitivity
- Reset Expectation
- Incident Frequency
- Klaude Pressure
- Market Volatility
- Noise Level

狙い：

- 毎回同じ攻略法が通じない
- プレイヤーが序盤から環境を観測し、方針を変える
- 運ゲー寄りの回も意図的に作る
- ただし意思決定が無意味になる領域は避ける

終了後に内部パラメータを公開する案：

```text
WORLD PARAMETERS DECLASSIFIED

USER PATIENCE       LOW
RESET EXPECTATION   EXTREME
KLAUDE PRESSURE     NORMAL
INCIDENT RATE       HIGH
NOISE LEVEL         64%
```

---

## 技術記事・研究ネタ

将来的な記事候補：

### 1. 数値シミュレーションを正しく行ってクソゲーを設計する方法

内容候補：

- Game Stateモデル
- 仮想プレイヤー
- Monte Carlo
- 一因子サーベイ
- 感度解析
- DOE
- S/N
- 安全領域
- Controlled Instability
- 「管理された運ゲー」

### 2. ChatGPT / Codexの分業による小規模開発

内容候補：

- ChatGPT Projectで仕様を作る
- Chat側で独立部品を作る
- ローカルPythonで大量試行
- Codexで統合・検証
- 利用枠の使い分け
- コンテキスト節約
- 引き継ぎパッケージ

---

## 将来の公開先候補

- GitHub Pages
- itch.io
- 自サイト
- 必要に応じてGrok Build版

GitHubを正本とする方向を基本とする。

---

## 更新原則

各アップデートは独立して追加可能にする。

特に以下の分離を維持する。

- Game Engine
- UI
- Visual Effects
- Static Data
- Balance Parameters
- Balance Lab

アップデートのために本体全体を書き直すことを避ける。
