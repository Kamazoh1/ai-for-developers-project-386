# Календарь звонков


[![hexlet-check](https://github.com/Kamazoh1/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Kamazoh1/ai-for-developers-project-386/actions)

Разработайте совместно с ИИ сервис для бронирования календаря

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-for-developers
Как это должно работать: https://files.hexlet.app/a/2ipc5m

## Стек

- Бекенд: Python 3.13, FastAPI, uv, pytest, ruff, ty
- Фронтенд: TypeScript, Vite, React, Mantine, oxlint/oxfmt
- Контракт: TypeSpec → OpenAPI → TypeScript SDK (@hey-api/openapi-ts)
- Окружение и задачи: mise, hk (git-хуки), GitHub Actions

## Установка

```bash
git clone https://github.com/Kamazoh1/ai-for-developers-project-386.git
cd ai-for-developers-project-386
mise install        # инструменты нужных версий
mise run install    # зависимости
mise run hooks      # git-хуки
```

## Использование

```bash
mise daemons start   # бекенд :8000, фронтенд :5173
mise daemons stop
mise run check       # линтеры, типы, тесты, сборка
```

<!-- Добавьте запись asciinema — именно это смотрит работодатель -->

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
