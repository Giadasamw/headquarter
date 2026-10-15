import { defineSchedule } from "eve/schedules";
import eve from "../channels/eve";
import { cronForSlot, isSlotActiveToday, MORNING_MESSAGE } from "../lib/morning";

export default defineSchedule({
  cron: cronForSlot(1),
  async run({ to, waitUntil, appAuth }) {
    if (!isSlotActiveToday(1)) return;
    waitUntil(to(eve, {}).send(MORNING_MESSAGE, { auth: appAuth }));
  },
});
