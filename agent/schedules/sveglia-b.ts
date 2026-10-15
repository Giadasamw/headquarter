import { defineSchedule } from "eve/schedules";
import eve from "../channels/eve";
import { syncTogglForMorning } from "../lib/toggl";
import { cronForSlot, isSlotActiveToday, MORNING_MESSAGE } from "../lib/morning";

export default defineSchedule({
  cron: cronForSlot(1),
  async run({ to, waitUntil, appAuth }) {
    if (!isSlotActiveToday(1)) return;
    // Hours of the last 3 days from Toggl first, so the briefing sees them.
    await syncTogglForMorning();
    waitUntil(to(eve, {}).send(MORNING_MESSAGE, { auth: appAuth }));
  },
});
