import { Container, Group } from "@mantine/core";
import { IconCalendarClock } from "@tabler/icons-react";
import { Link, NavLink } from "react-router";
import classes from "./Header.module.css";

export default function Header() {
  return (
    <Container size="lg" h="100%">
      <Group h="100%" justify="space-between" wrap="nowrap">
        <Link to="/" className={classes.logo}>
          <IconCalendarClock className={classes.logoIcon} size={22} aria-hidden />
          Calendar
        </Link>
        <Group component="nav" gap="xs" wrap="nowrap">
          <NavLink to="/book" className={classes.link}>
            Записаться
          </NavLink>
          <NavLink to="/events" className={classes.link}>
            Предстоящие события
          </NavLink>
        </Group>
      </Group>
    </Container>
  );
}
