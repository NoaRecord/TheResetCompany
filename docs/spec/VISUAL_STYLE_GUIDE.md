# TheResetCompany — Visual Style Guide

## 1. 基本コンセプト

TheResetCompanyの通常画面は、意図的に地味なレトロコンピュータ／古い管理端末風とする。

狙いは、通常時の地味さとGLOBAL RESET時の異常な大げささの落差を作ること。

キーワード：

- 1970年代に想像された2026年
- 巨大計算機
- 秘密司令室
- レトロSF
- CRT
- パンチカード
- 気送管
- 無意味に大量のランプ
- 物理スイッチ
- 事務処理なのに最終兵器級のRESET

---

## 2. 通常画面

基本：

- 黒背景
- 緑色の発光文字
- 警告は赤
- 注意・中間状態は琥珀色
- モノスペース
- 数値主体
- ゲージ主体
- テキストログ主体

CSSで表現する要素：

- scanline
- flicker
- text-shadow glow
- blinking warning
- slight screen noise
- panel border
- terminal cursor

派手な背景画像に依存しない。

---

## 3. CRT表示

画面内の主要領域候補：

- Main Operations
- User Metrics
- Reset Energy
- Krog X Monitor
- Chappy Message
- Incident Log
- System Status

例：

```text
╔════════ THE RESET COMPANY ════════╗

 ACTIVE USERS       2,481,903
 EXHAUSTED            381,204
 X FRUSTRATION          67.3%

 RESET ENERGY
 ███████████████░░░     84%

 > SYSTEM NOMINAL
 > BANKED RESET PROCESSING...
 > KLAUDE ACTIVITY DETECTED

             [ PREPARE RESET ]

╚════════════════════════════════════╝
```

---

## 4. 色

基本候補：

- Background: near black
- Normal text: phosphor green
- Warning: red
- Attention: amber
- Disabled: dim green/gray
- RESET button: strong red

RESET以外では色数を増やしすぎない。

---

## 5. GLOBAL RESET

通常UIと明確に差別化する。

演出候補：

- 赤い警告状態
- CORE CHARGING
- 120%
- パネル開閉
- RESET UNIT上昇
- 透明安全カバー
- 赤い巨大ボタン
- HOLD TO RESET
- 画面フラッシュ
- Propagation
- 一時的な無音
- 完了後の静寂

---

## 6. Banked Reset

GLOBAL RESETと対照的に、事務処理的・機械的にする。

将来演出：

- パンチカード
- 箱
- 大型カードリーダー
- バッチジョブ
- ラインプリンタ
- 処理枚数
- ジャム
- Propagation delay

---

## 7. Chappy

Chappyは社内オペレーション担当。

視覚的に追加する場合も、過度にヒーロー的にしない。

「真面目な助手」「古い未来企業の社員」の印象を優先する。

---

## 8. Krog

KrogはX Monitor Operator。

Krog端末は独立したCRTとして表現可能。

表示内容：

- 短い架空投稿
- RESET関連ワード出現率
- Frustration
- Klaude mention
- 👀 activity

---

## 9. 気送管

将来追加。

透明チューブをカプセルが圧搾空気で移動する。

用途：

- Incident Report
- Executive Approval
- R&D Report
- Confidential Memo

単なる飾りではなく、イベント通知UIとして機能させる。

---

## 10. 画像利用方針

初回版では画像枚数を増やしすぎない。

優先度：

1. CRT/CSSだけで成立するか
2. GLOBAL RESETのキー画像
3. 管制室背景
4. Banked Reset専用画像
5. キャラクター・社長室等

初回公開を妨げるほど画像制作へ時間を使わない。

---

## 11. 禁止・回避事項

- 特定SF作品の画面・台詞・構図の直接コピー
- 実在人物の写真的再現
- 実在企業ロゴの直接使用
- 実際のX投稿の転載
- 現代的なSaaSダッシュボード風へ寄せすぎること

---

## 12. デザイン原則

> 通常画面は地味に。  
> RESET時だけ制作費を間違える。
