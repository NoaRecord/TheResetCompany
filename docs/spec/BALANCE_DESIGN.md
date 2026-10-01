# TheResetCompany — Balance Design

## 1. 基本思想

Employee側ゲームの基本目的：

> できるだけ少ないRESETコストで、ユーザー数と満足度を維持・増加させる。

RESETはコストを持つ経営資源。

RESETを使えば短期的な満足度は上がるが、Expectationも上昇し、将来のRESET要求が強くなる。

「RESET乱発」と「RESET完全温存」のどちらも常に最適にならないことを目指す。

---

## 2. 主要状態値候補

- Active Users
- Paid Users
- Satisfaction
- Frustration
- Expectation
- Reset Energy
- Users Lost to Klaude
- Community Attention
- Day / Time

---

## 3. 基本フィードバック

### RESETを使う

```text
RESET
→ Satisfaction ↑
→ Frustration ↓
→ Gratitude ↑
→ Expectation ↑
```

### Expectationが上がる

```text
Expectation ↑
→ 次回の枠切れ時のFrustration増加
→ RESET要求増加
→ RESETを頻繁に使うほど将来が難しくなる
```

### 満足度が上がる

```text
Satisfaction ↑
→ 新規加入 ↑
→ 利用者数 ↑
→ 枠切れユーザー数 ↑
→ 将来の運営負荷 ↑
```

### 満足度が下がる

```text
Satisfaction ↓
→ Klaude等への流出 ↑
→ Paid Users ↓
```

---

## 4. RESET種別

### Banked Reset

- コスト：低～中
- 効果：限定的
- Expectation上昇：小～中
- 日常的な補償向け

### Global Reset

- コスト：高
- 効果：大
- Expectation上昇：大
- 危機対応／大規模イベント向け

---

## 5. ゲーム期間

初期案：

- 30日
- 実時間5～8分程度

Day 30で通常終了。

ユーザー数が極端に減少した場合は早期終了候補。

---

## 6. スコア思想

スコアは単純なユーザー数最大化ではなく、以下を反映する。

- 最終ユーザー数
- ユーザー純増
- 満足度
- RESETコスト
- RESET回数
- 他社流出
- 運営効率

「多くのユーザーを満足させつつ、RESETを無駄遣いしない」ことを評価する。

---

## 7. 仮想プレイヤー戦略

将来の自動シミュレーションで使用。

候補：

### Reset Maniac
Energyが貯まったら即RESET。

### Miser
極力RESETしない。

### Satisfaction Keeper
Satisfactionが閾値を下回ったらRESET。

### Panic Manager
Frustrationが閾値を超えたらRESET。

### Growth Manager
ユーザー流出が始まったらRESET。

### Banked Lover
原則Banked Resetのみ。

### Global Lover
Global ResetまでEnergyを貯める。

### Balanced
複数指標を組み合わせて判断。

### Random
ランダム選択。

---

## 8. Balance Lab

Pythonで実装する方向。

目的：

- 人間の実時間プレイだけでは足りない試行回数を補う
- 数千～数百万ゲームを高速実行
- seedで再現
- 戦略別統計
- パラメータ探索

ゲームUIとは分離する。

---

## 9. 解析指標候補

- 平均スコア
- スコア分布
- 標準偏差
- ゲームオーバー率
- 最終ユーザー数
- 最終満足度
- RESET平均回数
- Banked / Global内訳
- Users Lost to Klaude
- Strategy Dominance
- Player Decision Sensitivity
- Random Noise Sensitivity

---

## 10. 一因子サーベイ

非線形性があるため、最初から直交表だけに依存しない。

まず基準条件を固定し、一因子ずつ広く振る。

例：

- Global Reset Cost
- Banked Reset Cost
- Expectation Increase
- Frustration Growth
- Churn Sensitivity
- Reset Energy Gain

各値について多数seedを与え、応答曲線を見る。

目的：

- 非線形領域発見
- 飽和領域発見
- 危険領域発見
- 安全域候補の把握

---

## 11. DOE / Taguchi-style分析

必要な場合のみ重要因子へ適用する。

候補：

- 直交表
- DOE
- 交互作用確認
- S/N
- 感度

ただし目的は「S/N最大化」ではない。

ゲームでは、ランダム性そのものが価値を持つ。

品質工学の考え方を利用して、

> どの程度までノイズを増やしてもゲームが破綻しないか

を評価する。

---

## 12. Controlled Instability

最終的に「良い一点」を決めるのではなく、「ゲームが成立する安全領域」を求める。

その安全領域内から毎回異なるbalance profileを選択する。

例：

- User Patience
- Churn Sensitivity
- Reset Expectation
- Incident Frequency
- Klaude Pressure
- Market Volatility
- Noise Level

プレイヤーには開始時に内部値を直接見せず、ゲーム内の反応から推定させる。

終了後に内部条件を公開してもよい。

---

## 13. 目標とする状態

理想：

- RESET乱発が常に最強ではない
- RESET温存が常に最強ではない
- Banked中心でも成立する場合がある
- Global中心でも成立する場合がある
- 状況判断するプレイヤーが平均的には強い
- ランダムイベントだけで勝敗が決まりすぎない
- ただし一部の回は意図的に運ゲー寄りでもよい
- どの回でもプレイヤーの意思決定が完全に無意味にはならない

---

## 14. 技術記事候補

> **数値シミュレーションを正しく行ってクソゲーを設計する方法**

想定構成：

1. Game Stateのモデル化
2. 仮想プレイヤー
3. Monte Carlo
4. 一因子サーベイ
5. 感度解析
6. DOE
7. S/N
8. 安全領域
9. Controlled Instability
10. 管理された運ゲー

解析そのものは再現可能で技術的に正しい方法を使用する。
