# Деплой Master Forge: Amvera + Supabase (вариант А)

Сайт — **Amvera**, вход и кампании — **Supabase** (бесплатный тариф).

---

## Шаг 1. Supabase (один раз, ~20 минут)

### 1.1. Проект

1. [supabase.com](https://supabase.com) → **New project**.
2. Регион, пароль БД — сохранить.
3. Дождаться **Active**.

### 1.2. Ключи API

**Project Settings → API**:

- **Project URL** → понадобится как `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.3. Таблица и RLS

**SQL Editor** → вставить содержимое файла `supabase/schema.sql` → **Run**.

Проверка: **Table Editor** → `campaigns`, RLS **enabled**, 4 policies.

### 1.4. Вход по почте

**Authentication → Providers → Email** — включить.

Для диплома (без подтверждения почты): выключить **Confirm email**.

### 1.5. URL (после деплоя — обновить!)

**Authentication → URL Configuration**:

- **Site URL**: `https://ВАШ-ДОМЕН.amvera.app`
- **Redirect URLs**:
  - `https://ВАШ-ДОМЕН.amvera.app/auth/callback`
  - `http://localhost:3050/auth/callback`

---

## Шаг 2. Подготовка проекта

### 2.1. Файл `.env.production`

```powershell
cd C:\Users\tkach\Projects\gm-forge
copy .env.production.example .env.production
```

Заполнить три строки реальными значениями из Supabase.  
`NEXT_PUBLIC_SITE_URL` — сначала можно заглушку, после деплоя — **точный** URL Amvera.

### 2.2. Локальная проверка (необязательно)

```powershell
docker compose build --no-cache
docker compose up
```

Открыть `http://localhost:3050` → регистрация → кампания → обновить страницу.

---

## Шаг 3. Amvera

### 3.1. Создать приложение

1. [amvera.ru](https://amvera.ru) → новый проект.
2. Деплой через **Git** (репозиторий Amvera или GitHub).

В репозитории уже есть `Dockerfile` и `amvera.yaml` (порт **3000**).

### 3.2. Залить код

На странице проекта → **Репозиторий** — URL вида  
`https://git.amvera.ru/ЛОГИН/master-forge`

```powershell
cd C:\Users\tkach\Projects\gm-forge
git init
git add .
git commit -m "Деплой Master Forge"
git remote add amvera https://git.amvera.ru/ЛОГИН/master-forge
git push -u amvera master
```

(или `main`, если ветка так называется)

Логин/пароль — от аккаунта Amvera. Смотреть лог **сборки** в панели.

### 3.3. Переменные в Amvera (runtime)

После первого деплоя узнать **публичный URL** сайта.

**Переменные** проекта (те же три имени):

| Переменная | Значение |
|------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `NEXT_PUBLIC_SITE_URL` | `https://реальный-домен.amvera.app` |

**Перезапустить** контейнер.

### 3.4. Финальный push

1. Обновить `NEXT_PUBLIC_SITE_URL` в `.env.production`.
2. Обновить URL в Supabase (шаг 1.5).
3. `git add . && git commit -m "Прод URL" && git push amvera master`

---

## Шаг 4. Проверка для диплома

1. С телефона открыть ссылку Amvera → войти.
2. Создать кампанию, персонажа.
3. Другой браузер / инкогнито → другой email → **чужих** кампаний нет.

---

## Частые ошибки

| Проблема | Решение |
|----------|---------|
| 502 на Amvera | `amvera.yaml`: `containerPort: 3000` |
| Сразу «Вход», сессия не держится | 3 переменные в Amvera + перезапуск; `NEXT_PUBLIC_SITE_URL` с `https://` |
| Кампании не сохраняются | Выполнить `supabase/schema.sql` |
| Сборка без Supabase URL | Заполнить `.env.production` перед push |
| `exit code 127`, `.env.production: not found` | Windows CRLF в `.env.production` — пересохрани файл в LF (VS Code: CRLF → LF) или пересобери после обновления Dockerfile |

---

## Что где хранится

| Данные | Где |
|--------|-----|
| Аккаунт (email, пароль) | Supabase Auth |
| Кампании, персонажи в кампании, монстры | Supabase, таблица `campaigns` |
| Черновик листа P1–P3 | localStorage браузера (не в облаке) |

Изоляция пользователей: **RLS** в PostgreSQL (`auth.uid() = user_id`).
