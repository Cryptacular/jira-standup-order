import type Id from "./Id";

export default interface Attendee {
  id: Id;
  name: string;
  isSkipped: boolean;
}
