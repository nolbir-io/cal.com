import * as Popover from "@radix-ui/react-popover";

import dayjs from "@calcom/dayjs";
import {
  formatTimeInTimezone,
  isNextDayInTimezone,
  isPreviousDayInTimezone,
  sortByTimezone,
} from "@calcom/lib/date-fns";
import { getTeamWithMembers } from "@calcom/lib/server/queries/teams";

import { Icon } from "../../Icon";
import { Attendee } from ".prisma/client";

interface MeetingTimeInTimezonesProps {
  attendees: Attendee[];
  userTimezone?: string;
  timeFormat?: number | null;
  startTime: string;
  endTime: string;
}

const MeetingTimeInTimezones = ({
  attendees,
  userTimezone,
  timeFormat,
  startTime,
  endTime,
}: MeetingTimeInTimezonesProps) => {
  if (!userTimezone || !attendees.length) return null;

  const attendeeTimezones = attendees.map((attendee) => attendee.timeZone);
  const uniqueTimezones = [userTimezone, ...attendeeTimezones].filter(
    (value, index, self) => self.indexOf(value) === index
  );

  // Convert times to time in timezone, and then sort from earliest to latest time in timezone.
  const times = uniqueTimezones
    .map((timezone) => {
      const isPreviousDay = isPreviousDayInTimezone(startTime, userTimezone, timezone);
      const isNextDay = isNextDayInTimezone(startTime, userTimezone, timezone);
      return {
        startTime: formatTimeInTimezone(startTime, timezone, timeFormat),
        endTime: formatTimeInTimezone(endTime, timezone, timeFormat),
        timezone,
        isPreviousDay,
        isNextDay,
      };
    })
    .sort((timeA, timeB) => sortByTimezone(timeA.timezone, timeB.timezone));

  // We don't show the popover if there's only one timezone.
  if (times.length === 1) return null;

  return (
    <Popover.Root>
      <Popover.Trigger className="popover-button ml-2 inline-flex h-5 w-5 items-center justify-center rounded-sm text-gray-900 transition-colors hover:bg-gray-200 focus:bg-gray-200">
        <Icon.FiGlobe />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          className="slideInBottom shadow-dropdown border-5 bg-brand-500 rounded-md border-gray-200 p-3 text-sm text-white shadow-sm">
          {times.map((time) => (
            <span className="mt-2 block first:mt-0" key={time.timezone}>
              <span className="inline-flex align-baseline">
                {time.startTime} - {time.endTime}
                {(time.isNextDay || time.isPreviousDay) && (
                  <span className="text-medium ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-[10px]">
                    {time.isNextDay ? "+1" : "-1"}
                  </span>
                )}
              </span>
              <br />
              <span className="text-gray-400">{time.timezone}</span>
            </span>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

MeetingTimeInTimezones.displayName = "MeetingTimeInTimezones";

export default MeetingTimeInTimezones;
