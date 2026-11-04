// PROTOTYPE (throwaway): admin area with two tab links (ticket "Маршруты UI").
import { Group, Stack, Text } from "@mantine/core";
import { NavLink, Outlet } from "react-router";
import classes from "../layout/Header.module.css";

export default function AdminLayout() {
  return (
    <Stack gap="lg">
      <Group gap="xs" component="nav" aria-label="Админка">
        <Text fw={700} mr="sm">
          Админка
        </Text>
        <NavLink to="/admin/bookings" className={classes.link}>
          Предстоящие встречи
        </NavLink>
        <NavLink to="/admin/event-types" className={classes.link}>
          Типы событий
        </NavLink>
      </Group>
      <Outlet />
    </Stack>
  );
}
