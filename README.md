# Korean Photo Speaking — V2

This is the first structured version based on the supplied design:
Home → Beginner → Fruits → 10-card practice stack.

## Included
- Beginner / Intermediate / Advanced home screen
- Beginner > Fruits stack
- 10 fruit cards:
  1. Apple — 사과
  2. Banana — 바나나
  3. Watermelon — 수박
  4. Cherry — 체리
  5. Strawberry — 딸기
  6. Mango — 망고
  7. Grapes — 포도
  8. Orange — 오렌지
  9. Lemon — 레몬
  10. Peach — 복숭아
- Automatic Korean question playback when a card appears
- Speaker button for replay
- Type OR speak an answer
- Explicit correct answer after an incorrect response
- Incorrect cards are moved to the end of the queue
- Correct cards are removed from the queue
- Stack completes only when all 10 cards have been answered correctly
- No external image dependencies; fruit SVGs are included locally

## Hosting
Upload the complete folder to GitHub Pages. Keep the `images` folder and all files together.

## Speech
The app uses the browser's Web Speech API with `ko-KR`. If speech recognition is unavailable, typing remains available.
