# Synamyk Admin Panel

Веб-админка образовательной платформы Synamyk (подготовка к ОРТ, Кыргызстан).
Фронтенд к готовому Spring Boot REST API.

## Стек

- **React 19 + TypeScript + Vite**
- **React Router v7**
- **Redux Toolkit + RTK Query** — весь серверный стейт, кэш, инвалидация
  (в ТЗ предлагался TanStack Query; по решению владельца оставлен RTK Query,
  интерсепторы 401/refresh реализованы в `src/services/baseQuery.ts`)
- **React Hook Form + Zod** — формы и валидация
- **Tailwind CSS v4** — вёрстка, токены в `src/index.css` (`@theme`)
- **MathLive** — WYSIWYG-ввод формул · **KaTeX** — рендер формул
- **sonner** — тосты · **date-fns** — даты · **recharts** — графики
- **@dnd-kit** — drag-sort списков

## Запуск

```bash
npm install
cp .env.example .env      # при необходимости поменять VITE_API_URL
npm run dev
```

- `VITE_API_URL` — базовый URL бэкенда. По умолчанию
  `https://synamyk-production.up.railway.app`.
- Вход: телефон в формате `+996 (XXX) XX-XX-XX`, на бэк уходит `996XXXXXXXXX`.
  После логина проверяется `role === "ADMIN"` — иначе доступ закрыт и сессия чистится.

```bash
npm run build      # tsc + vite build
npm run lint
```

## Структура

```
src/
  api/ → services/     axios-подобный слой на RTK Query (baseApi + injectEndpoints по доменам)
  types/api.ts         TS-типы, зеркалящие DTO бэкенда
  lib/                 datetime, errors, format, latex, auth, config, download, youtube
  hooks/               useAuth, useDebounce, useUrlState, useDocumentTitle, redux
  components/
    ui/                Button, Input, Select, Badge, Card, Dialog, Switch, Tabs, Skeleton
    common/            DataTable, PageHeader, ConfirmDialog, EmptyState, ImageUploader,
                       Bilingual (BilingualField/Provider), PeriodPicker, SortableList, ...
    math/              MathField, MathText, MathToolbar, MathLiveInput  ← ключевой модуль
  pages/
    tests/  users/  access/  payments/  reports/  notifications/  news/  videos/  games/  rating/
```

## Формулы (LaTeX внутри текстовых полей)

Соглашение (соблюдать строго):

- Формулы пишутся в **LaTeX** внутри обычных текстовых полей (`text`, `explanation`,
  варианты ответа и т.д.), обрамлённые `$...$` (инлайн) или `$$...$$` (блок).
- Одиночный `$` как знак валюты — экранируется `\$`.
- Строка отправляется на сервер **ровно так, как её собрал редактор** — без нормализации.
- Компонент `<MathField>` (режимы «текст+формулы» / «чистая формула»), панель кнопок,
  шаблоны, недавние формулы, живой предпросмотр, валидация каждого `$...$`-фрагмента
  через `katex.renderToString(..., { throwOnError: true })` — сохранение блокируется
  при ошибке компиляции.
- Компонент `<MathText>` рендерит контент из БД везде, где он показывается.

### ⚠️ Мобильный клиент пока НЕ рендерит LaTeX

Flutter-приложение сейчас показывает текст вопроса как обычный текст. Если админ
введёт формулу, ученик в приложении увидит сырой `$\frac{3}{4}$`.

**Что нужно на стороне мобильного клиента:** пакет `flutter_math_fork` (виджет
`Math.tex`), парсинг текста на сегменты по `$...$` / `$$...$$`. До этого момента
формулы корректно отображаются только в этой админке и в веб-клиенте.

## Известные ограничения бэкенда (не баги)

1. **Нельзя вернуть скрытый тест / подтест / вопрос / новость / видео.**
   В `Create*Request` нет поля `active`, а `DELETE` только выключает (`active=false`).
   Кнопок «Восстановить» намеренно нет — API их не поддерживает.
2. **Мобильный клиент не рендерит LaTeX** — см. выше.
3. **Нет редактирования запланированной рассылки** — только «Отменить» + создать заново.
4. **Нет журнала действий администратора.**
5. **Только две роли** (`USER`, `ADMIN`), гранулярных прав нет. Смена роли на `ADMIN`
   даёт полный доступ — в форме требуется ввод слова `ADMIN` для подтверждения.
6. **Удаление платежа** необратимо и **не отзывает доступ** к тесту; смена статуса
   платежа **не выдаёт доступ**. Управление доступом — только через «Доступы к тестам».
7. **Нет массового импорта вопросов.** Поэтому в редакторе вопроса есть
   «Сохранить и создать следующий», автосохранение черновика в `localStorage`
   (`draft:question:{subTestId}:{questionId|new}`) и «Дублировать вопрос».
8. **Нет reorder-эндпоинта.** Порядок подтестов/вопросов меняется полным `PUT`
   на каждый затронутый элемент (⚠️ `PUT` вопроса — полная замена вместе с вариантами,
   у новых вариантов будут новые `id`).
9. **`PUT /tests/{id}/pricing`** — полная перезапись: подтесты вне `paidSubTestIds`
   становятся бесплатными.
10. **Создание подтеста** автоматически шлёт push всем, у кого есть активный доступ
    к тесту (об этом предупреждает диалог создания).
11. **Лента `/api/feed/**` публичная** — новости видны всем без авторизации.
12. **`AdminTestResponse` не содержит `subject`** — при редактировании тянется из
    строки списка / `/tests/subjects`; если пусто — поле не затирается.
13. **Даты** приходят как `LocalDateTime` без зоны и означают **Asia/Bishkek (UTC+6)**.
    Парсинг/формат — через `src/lib/datetime.ts` (`parseServerDate`, `formatDT`).
14. **Presigned-ссылки на изображения живут 1 час.** В поля сущностей сохраняется
    `objectKey` (не `url`); `staleTime` списков с картинками ≤ 30 мин.
15. **Дашборд** построен на `/api/admin/reports/overview` (legacy `/api/admin/dashboard`
    не используется).
