# Call Calendar

A simplified Cal.com: guests book fixed-length calls into free time slots on a single shared calendar.

## Language

**Slot**:
A fixed 30-minute interval on a specific day that can be booked. A slot is either free or taken.
_Avoid_: Time, appointment time, interval

**Booking**:
A taken slot together with the name and email of the guest who took it. A slot has at most one booking.
_Avoid_: Event, reservation, appointment, meeting

**Guest**:
A person who books a slot, identified only by the name and email they enter. Has no account.
_Avoid_: User, client, customer, invitee

**Calendar timezone**:
The time zone in which the calendar's days and working hours are defined. Every slot belongs to a day of this zone.
_Avoid_: Server timezone, owner timezone, local time

**Booking window**:
The range of days, from today onward, in which slots can be booked. Days outside it are unavailable.
_Avoid_: Horizon, availability range
