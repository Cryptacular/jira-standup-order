import type Attendee from "./Attendee";
import type Id from "./Id";

export default interface StateV2 {
  version: 2;
  attendees: Attendee[];
  shuffled: Id[];
  currentAttendee: number | null;
  lastShuffled: string | null;
}
