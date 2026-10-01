# TheResetCompany — GLOBAL RESET Sequence Specification

## 1. 目的

GLOBAL RESETはTheResetCompanyの象徴的演出である。

ゲーム本体は数値とテキスト中心の軽量な経営シミュレーションだが、GLOBAL RESETだけは古典的SFの最終兵器発射シーケンスのように、無駄に大げさに演出する。

ただし特定作品の台詞・デザイン・演出を直接複製しない。

---

## 2. 基本シーケンス

### Phase 1 — Authorization

```text
GLOBAL RESET AUTHORIZATION ACCEPTED
```

通常画面からRESET専用状態へ移行。

- UIの色調を警告状態へ変更
- 警告音
- 通常操作を一時停止

---

### Phase 2 — Core Charging

```text
RESET CORE ............ CHARGING

████████████████░░░░    80%
████████████████████   100%
████████████████████   120%
```

120%まで充填する。

必要なら：

```text
WARNING:
RESET CORE OVERCHARGED
```

---

### Phase 3 — Target Acquisition

```text
TARGET SCOPE .......... PAID USERS

ACTIVE USERS .......... 2,841,291
LIMIT EXHAUSTED .......   428,193
X FRUSTRATION RATE ....        87%
KLAUDE ACTIVITY ....... SUSPICIOUS
```

地域別LOCK表示候補：

```text
US EAST ............... LOCKED
EUROPE ................ LOCKED
TOKYO ................. LOCKED
GLOBAL PAID USERS ..... LOCKED
```

---

### Phase 4 — Safety System

```text
SAFETY LOCK ........... RELEASED
ANTI-SHOCK ............ READY
ANTI-FLASH ............ READY
PROPAGATION NODES ..... READY
```

---

### Phase 5 — Console Deployment

通常の机／コンソール中央部が左右へ開く。

```text
CONSOLE LOCK .......... RELEASED
RESET UNIT ............ DEPLOYING
```

中央からRESET UNITがせり上がる。

RESET UNIT：

- 大きな赤い物理ボタン
- 透明安全カバー
- 警告ラベル
- 最終Safety Lock

CSSアニメーション主体を基本とする。

---

### Phase 6 — Final Safety

```text
FINAL SAFETY .......... LOCKED

[ RELEASE FINAL SAFETY ]
```

操作後：

```text
FINAL SAFETY .......... RELEASED
```

透明カバーのロックが外れる。

カバーは割らず、ヒンジでパカッと開く方式を基本とする。

理由：

- 繰り返し使える
- JUST RESETとの相性が良い
- 視覚的に操作が分かりやすい

---

### Phase 7 — HOLD TO RESET

ボタン表示：

```text
HOLD TO RESET
```

長押し中：

```text
23%
58%
91%
100%
```

100%で発動。

---

### Phase 8 — CODE-X RESET

発動時：

```text
CODE-X RESET!
```

演出：

- 一瞬無音
- 強い画面フラッシュ
- 衝撃表現
- RESET伝播開始

---

### Phase 9 — Propagation

地球CGは必須ではない。

ASCII / ドット風世界地図や地域名でも成立する。

例：

```text
SAN FRANCISCO  ██████████ RESET
NEW YORK       ██████████ RESET
LONDON         ██████████ RESET
TOKYO          ██████████ RESET
SINGAPORE      ██████████ RESET
SYDNEY         ██████████ RESET

GLOBAL PROPAGATION  100%
```

光の波、ライン、点滅などCSSで追加可能。

---

### Phase 10 — Complete

```text
GLOBAL RESET COMPLETE

2,841,291 developers refreshed.
428,193 exhausted developers saved.

GRATITUDE +428,193
```

最後に短い静寂を入れる。

全地域のRESET伝播が`100%`に達した後は、`GLOBAL RESET COMPLETE`の最終状態を1秒表示してから通常画面へ戻る。RESET画面が終了するまでは通常時音声へ戻さない。

必要に応じて：

```text
X FRUSTRATION RATE: 0.3%

...for now.
```

---

## 3. JUST RESETでの挙動

JUST RESETではコストなし。

何度でも実行可能。

連打対応候補。

押下回数に応じてメッセージを変える。

例：

```text
RESET ×50

PLEASE, TYBO.
THEY'RE ALREADY RESET.
```

```text
RESET ×100

THEY HAVE MORE CODE-X
THAN THEY CAN POSSIBLY USE.
```

---

## 4. 実装方針

GLOBAL RESET演出はゲームエンジンから独立したプロトタイプとして先に制作可能とする。

推奨：

```text
prototypes/
└─ reset-sequence/
   ├─ index.html
   ├─ reset-sequence.css
   └─ reset-sequence.js
```

本編への依存を避ける。

後で本編から以下のようなインターフェースで呼び出せる形を目指す。

```js
runGlobalResetSequence({
  activeUsers,
  exhaustedUsers,
  frustration,
  target: "PAID_USERS"
})
```

---

## 5. v0.1の完成基準

- 開始から完了まで通して再生できる
- カバー開放が視覚的に分かる
- 長押しで発動する
- フラッシュがある
- Propagationがある
- 完了表示がある
- スマホでも操作可能
- prefers-reduced-motionへの最低限の配慮
- 音がある場合はmute可能
