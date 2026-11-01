import { Navigate, Route, Routes } from "react-router";
import Layout from "./layout/Layout.tsx";
import Book from "./pages/Book.tsx";
import Events from "./pages/Events.tsx";
import Landing from "./pages/Landing.tsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="book" element={<Book />} />
        <Route path="events" element={<Events />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
