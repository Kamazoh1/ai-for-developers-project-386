import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import App from "../App.tsx";

/** Seam 2: the whole `<App />` in an in-memory router; the network is faked by msw. */
export function renderApp(path = "/") {
  return render(
    <MantineProvider env="test">
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </MantineProvider>,
  );
}
