import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { apiUrl, eventType } from "../test/api.ts";
import { renderApp } from "../test/render.tsx";
import { server } from "../test/server.ts";

const DETAIL = apiUrl("/api/event-types/:id");
const notFound = () =>
  HttpResponse.json({ code: "event_type_not_found", message: "No event type" }, { status: 404 });

describe("a chosen event type", () => {
  it("opens the type named in the address", async () => {
    server.use(
      http.get(DETAIL, ({ params }) =>
        params.id === "code-review"
          ? HttpResponse.json(
              eventType({
                id: "code-review",
                name: "Разбор кода",
                description: "Смотрим ваш код вместе",
                durationMinutes: 60,
              }),
            )
          : notFound(),
      ),
    );

    renderApp("/book/code-review");

    expect(await screen.findByRole("heading", { level: 1, name: "Разбор кода" })).toBeVisible();
    const main = screen.getByRole("main");
    expect(within(main).getByText("Смотрим ваш код вместе")).toBeInTheDocument();
    expect(within(main).getByText("60 минут")).toBeInTheDocument();
    expect(within(main).getByRole("link", { name: /К выбору типа/ })).toHaveAttribute(
      "href",
      "/book",
    );
  });

  it("says the type is not found for an unknown address and links back to /book", async () => {
    server.use(http.get(DETAIL, notFound));
    renderApp("/book/nope");

    expect(await screen.findByText("Тип события не найден")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    const back = within(screen.getByRole("main")).getByRole("link", { name: /К выбору типа/ });
    expect(back).toHaveAttribute("href", "/book");
  });

  it("shows a skeleton while the type loads", async () => {
    server.use(http.get(DETAIL, () => HttpResponse.json(eventType())));
    renderApp("/book/intro-call");

    expect(screen.getByRole("status", { name: "Загрузка" })).toBeInTheDocument();
    await screen.findByRole("heading", { level: 1, name: "Знакомство" });
    expect(screen.queryByRole("status", { name: "Загрузка" })).not.toBeInTheDocument();
  });

  it.each([
    ["a server error", () => HttpResponse.json({ code: "boom" }, { status: 500 })],
    ["a network failure", () => HttpResponse.error()],
  ])("offers a retry after %s, not a not-found message", async (_name, failure) => {
    server.use(
      http.get(DETAIL, failure, { once: true }),
      http.get(DETAIL, () => HttpResponse.json(eventType())),
    );
    renderApp("/book/intro-call");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Не удалось загрузить данные. Попробуйте ещё раз");
    expect(screen.queryByText("Тип события не найден")).not.toBeInTheDocument();

    await userEvent.click(within(alert).getByRole("button", { name: "Повторить" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Знакомство" })).toBeVisible();
  });

  it("returns to the list of types with the back link", async () => {
    server.use(
      http.get(DETAIL, () => HttpResponse.json(eventType())),
      http.get(apiUrl("/api/event-types"), () => HttpResponse.json([eventType()])),
    );
    renderApp("/book/intro-call");

    await userEvent.click(await screen.findByRole("link", { name: /К выбору типа/ }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Запись на звонок" }),
    ).toBeVisible();
  });
});
