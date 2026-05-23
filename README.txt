Master Forge — GM-инструмент для кампаний
=========================================

Проект вынесен из папки с Kanban-дипломом; в браузере отдельный ключ localStorage: master-forge:v1
(старое сохранение gm-forge:v1 в том же браузере не подхватится).

Запуск в Docker (из этого каталога):
  copy .env.production.example .env.production   # заполнить ключи Supabase
  docker compose up --build
  http://localhost:3050

Деплой в интернет (Amvera + Supabase):
  см. DEPLOY.md

Локально без Docker:
  npm install
  npm run dev

Git (после установки Git на машине):
  git init
  git add .
  git commit -m "init"
