import { Navigate, Route, Routes } from "react-router";
import Layout from "./layout/Layout.tsx";
import AdminBookings from "./prototype/AdminBookings.tsx";
import AdminEventTypes from "./prototype/AdminEventTypes.tsx";
import AdminLayout from "./prototype/AdminLayout.tsx";
import BookStub from "./prototype/BookStub.tsx";
import BookTypes from "./prototype/BookTypes.tsx";
import Events from "./pages/Events.tsx";
import Landing from "./pages/Landing.tsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="book" element={<BookTypes />} />
        <Route path="book/:eventTypeId" element={<BookStub />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="bookings" replace />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="event-types" element={<AdminEventTypes />} />
        </Route>
        <Route path="events" element={<Events />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
