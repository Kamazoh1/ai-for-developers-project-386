import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { apiUrl, calendar } from "../test/api.ts";
import { renderApp } from "../test/render.tsx";
import { server } from "../test/server.ts";

describe("booking page", () => {
  it("shows whom the guest is booking a call with", async () => {
    server.use(
      http.get(apiUrl("/api/calendar"), () =>
        HttpResponse.json(calendar({ owner: { name: "Мария Петрова" } })),
      ),
    );

    renderApp("/book");

    expect(await screen.findByText("Запись к: Мария Петрова")).toBeInTheDocument();
  });

  it("shows a skeleton while the owner is loading", async () => {
    renderApp("/book");

    expect(screen.getByRole("status", { name: "Загрузка" })).toBeInTheDocument();
    await screen.findByText(/Запись к:/);
    expect(screen.queryByRole("status", { name: "Загрузка" })).not.toBeInTheDocument();
  });

  it.each([
    ["a server error", () => HttpResponse.json({ code: "boom" }, { status: 500 })],
    ["a network failure", () => HttpResponse.error()],
  ])("offers a retry after %s", async (_name, failure) => {
    server.use(http.get(apiUrl("/api/calendar"), failure, { once: true }));

    renderApp("/book");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Не удалось загрузить данные. Попробуйте ещё раз");
    expect(screen.queryByText(/Запись к:/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));

    expect(await screen.findByText("Запись к: Алексей Иванов")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
