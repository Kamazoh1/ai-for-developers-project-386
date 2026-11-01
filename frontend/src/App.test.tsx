import { MantineProvider } from "@mantine/core";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import App from "./App.tsx";

function renderAt(path: string) {
  return render(
    <MantineProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </MantineProvider>,
  );
}

describe("landing page", () => {
  it("presents the product and what is available right now", () => {
    renderAt("/");

    const main = screen.getByRole("main");
    expect(within(main).getByText("Быстрая запись на звонок")).toBeInTheDocument();
    expect(within(main).getByRole("heading", { level: 1, name: "Calendar" })).toBeInTheDocument();
    expect(
      within(main).getByText(
        "Один экран, понятные слоты, быстрая бронь. Выберите время и запишитесь на звонок без лишних шагов.",
      ),
    ).toBeInTheDocument();

    expect(
      within(main).getByRole("heading", { name: "Что доступно прямо сейчас" }),
    ).toBeInTheDocument();
    const features = within(main).getAllByRole("listitem");
    expect(features.map((item) => item.textContent)).toEqual([
      "Фиксированные 30-минутные слоты с 09:00 до 18:00.",
      "Проверка конфликта при бронировании.",
      "Просмотр предстоящих событий в отдельном разделе.",
    ]);
  });

  it("invites the guest to book a call", () => {
    renderAt("/");

    const cta = within(screen.getByRole("main")).getByRole("link", { name: /Записаться/ });
    expect(cta).toHaveAttribute("href", "/book");
  });
});

describe("header", () => {
  it("links to the home page and to both sections without highlighting any on the landing", () => {
    renderAt("/");

    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: "Calendar" })).toHaveAttribute("href", "/");

    const book = within(header).getByRole("link", { name: "Записаться" });
    const events = within(header).getByRole("link", { name: "Предстоящие события" });
    expect(book).toHaveAttribute("href", "/book");
    expect(events).toHaveAttribute("href", "/events");
    expect(book).not.toHaveAttribute("aria-current");
    expect(events).not.toHaveAttribute("aria-current");
  });

  it.each([
    ["/book", "Записаться", "Предстоящие события"],
    ["/events", "Предстоящие события", "Записаться"],
  ])("highlights only the current section on %s", (path, current, other) => {
    renderAt(path);

    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: current })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(header).getByRole("link", { name: other })).not.toHaveAttribute("aria-current");
  });
});

describe("routing", () => {
  it("opens the booking page from the landing call to action", async () => {
    renderAt("/");

    await userEvent.click(
      within(screen.getByRole("main")).getByRole("link", { name: /Записаться/ }),
    );

    expect(screen.getByRole("heading", { level: 1, name: "Запись на звонок" })).toBeInTheDocument();
  });

  it("opens the upcoming events page", () => {
    renderAt("/events");

    expect(
      screen.getByRole("heading", { level: 1, name: "Предстоящие события" }),
    ).toBeInTheDocument();
  });

  it("sends an unknown address back to the landing page", () => {
    renderAt("/no-such-page");

    expect(screen.getByRole("heading", { level: 1, name: "Calendar" })).toBeInTheDocument();
  });
});
