# ZVONA Launch Video

Вертикальный product launch video: 720 × 1280, 30 fps, 21 секунда. Весь визуал строится кодом и рендерится детерминированно через Remotion.

## Установка и запуск

```bash
npm --prefix video install
npm --prefix video run audio
npm run video:preview
npm run video:render
npm run video:render:silent
```

Результат: `video/out/zvona-launch-vertical.mp4`.

## Где менять

- Тексты и demo-данные: `src/fixtures.ts` и `src/scenes/`.
- Цвета, fps, размеры и длительность: `src/utils/timing.ts`.
- Звук: `props/audio.json` / `props/silent.json`; общий флаг — `audioEnabled`.
- Логотип: замените текст `ZVONA` в `BrandScene.tsx` и `FinaleScene.tsx` на локальный SVG-компонент.
- Общая длительность: измените `TOTAL_FRAMES` и границы `SCENES`, затем адаптируйте локальные тайминги reveal.

Для 1920 × 1080 измените `WIDTH` и `HEIGHT`, затем перестройте координаты сцен под горизонтальную safe area. Для версии 10 секунд оставьте brand, copilot, quality и finale, сократите их до 75/105/60/60 кадров и задайте `TOTAL_FRAMES = 300`.

Аудио — процедурные WAV без сторонней музыки. Пересоздание: `npm --prefix video run audio`.
