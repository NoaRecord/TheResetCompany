# TheResetCompany — Product Specification

## 1. 概要

TheResetCompany は、AIコーディングサービス利用者の「利用枠」「不定期リセット」「障害補償」「他社サービスへの移動」などを題材にした、軽量なブラウザ向けパロディ／経営シミュレーションゲームである。

本格的な商用ゲーム開発を目的とはせず、短期間で公開可能な状態を作り、公開後に段階的なバージョンアップで育てる。

主な目的は以下のとおり。

1. Codex / AI開発者コミュニティ向けの軽いジョーク作品として公開する。
2. GitHubで公開する小規模Web作品・mini tools群への入口として利用する。
3. HTML/CSS/Vanilla JavaScriptによる小規模ブラウザゲームの実験場とする。
4. 将来的にはMonte Carlo、感度解析、DOE、品質工学などを使ったゲームバランス研究の題材とする。
5. 「真面目な技術でくだらないものを作る」という作品全体の方向性を維持する。

---

## 2. 基本コンセプト

Employee側ゲームの基本目的は、

> できるだけ少ないRESETコストで、ユーザー数と満足度を維持・増加させる

ことである。

RESETは無料の万能ボタンではなく、コストを持つ重要な経営資源として扱う。

RESETを配ると短期的には満足度が上がるが、同時にExpectationが上昇し、将来のRESET要求が強くなる。

単純な「RESET連打」が常に最適解にならず、逆に「絶対にRESETしない」戦略も常に最適にならないことを目指す。

---

## 3. 想定ゲームモード

### 3.1 Employee Mode

初回公開版の中心モード。

プレイヤーはTheResetCompanyのRESET Operations担当として、ユーザー数、満足度、不満、期待値、RESETコスト等を管理する。

主要状態値候補：

- Active Users
- Paid Users
- Satisfaction
- Frustration
- Expectation
- Reset Energy / Reset Cost
- Users Lost to Competitors
- Community Attention

プレイヤーはBanked Reset、Global Reset、待機などを選びながら一定期間を運営する。

### 3.2 Client Mode

将来追加予定。

ユーザー側からWeekly Limitを管理する。

- 利用枠を温存する
- 普通に使う
- 意味深なTyboの投稿等を信じて使い切る
- 不定期RESETを期待する

といった判断を行う。

### 3.3 JUST RESET

ゲームバランスやコストを無視し、GLOBAL RESET演出を何度でも楽しむモード。

目的は純粋なジョークと爽快感。

連打も許容候補とする。

---

## 4. 世界観

「2026年のAI企業を1970年代の人が想像して作ったような会社」を基本的な視覚・世界観イメージとする。

最新のAIサービスを運営しているにもかかわらず、

- CRT
- 穿孔テープ
- パンチカード
- 大型カードリーダー
- 気送管
- アナログメーター
- 大量の警告灯
- 物理的な巨大RESETボタン

などが現役で使われている。

通常業務は妙に事務的かつ古臭いが、GLOBAL RESET時のみ最終兵器発射シーケンスのように異常に大げさになる。

---

## 5. 登場人物・固有名詞

原則として、実在人物・企業・サービスをそのままキャラクター化せず、明らかなパロディ名を用いる。

現時点の候補：

- Sam → **Mr. Som**
- Tibo → **Tybo**
- Claude → **Klaude**
- Codex → **Code-X**
- AI / Super Intelligence系企業 → **OpenSI** 等
- Operations Assistant → **Chappy**
- X Monitor Operator → **Krog**

### Chappy

社内状況の説明・報告・軽いツッコミ担当。

主な役割：

- Banked Reset処理
- 気送管から届く報告
- 障害報告
- RESET準備
- 社内イベント通知

過剰に感情的ではなく、真面目におかしな会社で働いている人物として扱う。

### Krog

X Monitor担当。

ゲーム状態に応じて、架空のユーザー投稿をCRT上に流す。

例：

- Give us a reset, plz.
- TYBO 👀
- BANKED RESET WHEN
- Klaude just reset everyone.
- I'M OUT.
- WE'RE BACK.

実在するX投稿を直接取得・転載せず、初期版では完全な架空データを使用する。

---

## 6. 決まり文句

作品全体：

> **Give us a reset, plz.**

Client個人視点では必要に応じて：

> **Give me a reset, plz.**

---

## 7. 視覚デザイン

通常画面は意図的に地味なレトロゲーム／古いコンピュータ端末風とする。

基本要素：

- 黒背景
- 緑、赤、琥珀色などの発光文字
- CRT風走査線
- モノスペース／ドット風表示
- 数値
- ゲージ
- 警告灯
- テキストログ
- 軽いフリッカー

通常時を地味にすることで、RESET時の演出を際立たせる。

画像に依存しすぎず、CSS・HTML・簡単なアニメーションを優先する。

---

## 8. RESETシステム

### 8.1 Banked Reset

比較的日常的・事務的なRESET。

将来的には以下の演出を検討する。

- Chappyが長い箱に入ったパンチカードを運ぶ
- 大型カードリーダーへ大量投入
- バッチ処理
- `PROPAGATION MAY TAKE SOME TIME`
- 処理枚数カウンター
- ラインプリンタ出力

GLOBAL RESETと対照的に、地味で大量事務処理的な演出とする。

### 8.2 Global Reset

TheResetCompanyの代表的な見せ場。

初回公開時から一定以上の演出を入れる。

概要：

1. GLOBAL RESET準備開始
2. RESET CORE充填
3. 120%表示
4. ターゲット確認
5. Safety Lock解除
6. Anti-Shock / Anti-Flash確認
7. コンソール開放
8. 透明カバー付き巨大赤ボタン出現
9. カバー解除
10. HOLD TO RESET
11. CODE-X RESET
12. 強い画面フラッシュ
13. 世界へのPropagation
14. GLOBAL RESET COMPLETE

特定作品の台詞・デザイン・演出を直接複製せず、「古典的SFの最終兵器発射シーケンス」全般の雰囲気に留める。

---

## 9. ランダムイベント

初期版から少数を導入し、将来拡張しやすい構造にする。

候補：

- BUG FIXED
- SERVER TROUBLE
- NEW MODEL RELEASED
- USER MILESTONE
- KLAUDE NEW MODEL
- KLAUDE RESET EVERYONE
- TYBO POSTED 👀
- RESET TRACKER DETECTED
- REDDIT IS ANGRY
- MYSTERIOUS TUESDAY

将来的には、障害・バグ修正に伴う「詫びBanked Reset」、モデル研究部門の奇妙な事故、社内広報イベント等も追加する。

---

## 10. 技術方針

原則：

- HTML
- CSS
- Vanilla JavaScript
- JSON
- localStorage

必要性が明確でない限り、大規模フレームワーク、バックエンド、DB、認証、外部API等を導入しない。

GitHub Pagesでそのまま公開できる静的構成を第一候補とする。

将来的に必要な場合のみCloudflare等を追加する。

---

## 11. アーキテクチャ方針

以下を可能な限り分離する。

- Game Engine
- Game State
- Balance Parameters
- Random Events
- Player / NPC Strategies
- UI
- Visual Effects
- Audio
- Balance Simulation
- Static Data

ゲームロジックにDOM操作やアニメーションを直接混在させない。

乱数は可能な限りseedで再現可能とする。

将来的にPython等から同じルールを大量試行できる構造を意識する。

---

## 12. 公開・配布

第一候補：

- GitHub repository
- GitHub Pages

将来的に同じHTML5版をitch.io等へ掲載することも検討する。

READMEには以下を含める。

- 非公式パロディ作品であること
- 遊べるURL
- スクリーンショット
- ソースコード
- mini toolsへの導線
- 必要に応じて解析・Balance Labへのリンク

---

## 13. 開発方針

初回公開を遅らせない。

新しい案は必ず以下に分類する。

- v0.1に必要
- 後日のアップデート候補
- 単なるアイデア

「面白いから」という理由だけでv0.1へ追加しない。

基本思想：

> **実装は小さく、演出は必要なところだけ無駄に大げさにする。**

特にGLOBAL RESETは作品の象徴なので多少過剰でもよい。

---

## 14. ChatGPT / Codexの分担

ChatGPT側：

- 仕様書
- イベントデータ
- テキスト
- UIプロトタイプ
- CSS演出
- RESET演出の独立デモ
- Pythonシミュレーター
- テストケース
- README
- バランス解析

Codex側：

- リポジトリ全体への統合
- 実ブラウザでの確認
- UIとゲームエンジンの接続
- レスポンシブ対応
- バグ修正
- GitHub Pages公開
- 最終実装検証

Codexに「設計しながら作り直す」仕事をできるだけさせず、事前に仕様や独立部品を準備してから渡す。

---

## 15. 将来の技術研究

ゲームバランスは将来的に大量の数値シミュレーションで評価する。

目的は必ずしもS/N最大化ではない。

測定候補：

- プレイヤー判断の影響
- ランダムイベントの影響
- 特定戦略の支配度
- ゲームオーバー率
- RESET利用回数
- スコア分布

「ゲームとして破綻しないパラメータ領域」を求め、その領域内で意図的にノイズを増やし、「管理された運ゲー」を作ることも許容する。

将来的な技術記事候補：

> **数値シミュレーションを正しく行ってクソゲーを設計する方法**
