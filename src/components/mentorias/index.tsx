import useSWR from "swr";
import {
  type GetAvailabilitiesRequest,
  UserAvailability,
  GetAvailabilitiesResponseSchema,
} from "@/types/mentor.schema";
import Calendar from "react-calendar";
import { useState } from "react";
import { useCalendlyEventListener, InlineWidget } from "react-calendly";
import { Link } from "../link";
import { getLocalDateTimeWithOffset, nextHalfHour } from "@/utils/time";
import { Value } from "@sinclair/typebox/value";
import { registerMentoria } from "./client";

const fetcher = (args: RequestInfo): Promise<unknown> =>
  fetch(args).then((res) => res.json());

function useGetMentorAvailabilities({
  ofmiEdition,
  startTimeISOString,
  endTimeISOString,
}: {
  ofmiEdition: number;
  startTimeISOString: string;
  endTimeISOString: string;
}): Array<UserAvailability> | null {
  const request: GetAvailabilitiesRequest = {
    startTime: startTimeISOString,
    endTime: endTimeISOString,
    ofmiEdition,
  };
  const { data } = useSWR(
    `/api/volunteer/getMentorAvailabilities?${new URLSearchParams({
      ...request,
      ofmiEdition: request.ofmiEdition.toString(),
    }).toString()}`,
    fetcher,
  );
  if (Value.Check(GetAvailabilitiesResponseSchema, data)) {
    return data.availabilities;
  }
  return null;
}

function Loading(): JSX.Element {
  return (
    <div className="flex justify-center">
      <svg
        className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function CalendlyInlineWidget({
  url,
  contestantParticipantId,
  volunteerAuthId,
  volunteerParticipationId,
  meetingTimeOpt,
}: {
  volunteerAuthId: string;
  volunteerParticipationId: string;
  contestantParticipantId: string | null;
  meetingTimeOpt: Date | undefined;
  url: string;
}): JSX.Element {
  useCalendlyEventListener({
    onEventScheduled: async (e) => {
      if (contestantParticipantId) {
        await registerMentoria({
          volunteerAuthId,
          contestantParticipantId,
          volunteerParticipationId,
          meetingTimeOpt: meetingTimeOpt && meetingTimeOpt.toISOString(),
          calendlyPayload: e.data.payload,
        });
      }
    },
  });
  return (
    <div className="group relative z-0 mb-5 w-full">
      <InlineWidget url={url}></InlineWidget>
    </div>
  );
}

// Receives a list of connected providers
export default function Mentorias({
  ofmiEdition,
  contestantParticipantId,
}: {
  ofmiEdition: number;
  contestantParticipantId: string | null;
}): JSX.Element {
  const startTime = nextHalfHour(new Date(Date.now()));
  const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000);
  const availabilities = useGetMentorAvailabilities({
    ofmiEdition,
    startTimeISOString: startTime.toISOString(),
    endTimeISOString: endTime.toISOString(),
  });
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [selectedStartTime, setSelectedStartTime] = useState<Date>();
  const [schedulingUrlToShow, setSchedulingUrlToShow] = useState<{
    url: string;
    volunteerAuthId: string;
    volunteerParticipationId: string;
  }>();

  const showFilterCalendar = schedulingUrlToShow === undefined;
  const fullSchedulingUrlToShow = (schedulingUrlToShow: string): string => {
    return selectedStartTime
      ? `${schedulingUrlToShow}/${getLocalDateTimeWithOffset(selectedStartTime)}`
      : selectedDay
        ? `${schedulingUrlToShow}/?date=${selectedDay.toLocaleDateString()}?`
        : schedulingUrlToShow;
  };
  const availableLocalDates =
    availabilities &&
    new Set(
      availabilities
        .map((v) =>
          v.availableStartTimes.map((startTime) => {
            const time = new Date(startTime);
            return time.toLocaleDateString();
          }),
        )
        .flat(),
    );

  const availableLocalStartTimes =
    availabilities &&
    selectedDay &&
    Array.from(
      new Set(
        availabilities
          .map((v) =>
            v.availableStartTimes
              .map((startTime) => new Date(startTime))
              .filter((startTime) => {
                return (
                  startTime.toLocaleDateString() ===
                  selectedDay.toLocaleDateString()
                );
              })
              .map((startTime) => startTime.toISOString()),
          )
          .flat(),
      ),
    )
      .sort()
      .map((v) => new Date(v));

  return (
    <div className="mx-auto max-w-4xl px-2 py-8 md:mt-8 md:px-0">
      {/* Filter calendar */}
      <h1 className="text-4xl font-bold">Mentorías</h1>
      <div className="grid py-6 md:grid-cols-4 md:gap-6">
        {showFilterCalendar && (
          <div className="group relative z-0 col-span-3 mb-5 w-full">
            <Calendar
              defaultView="year" // TODO: Somehow the default view mess up the class name first rendering.
              minDate={startTime}
              maxDate={endTime}
              onClickDay={(value, event) => {
                event.preventDefault();
                if (selectedDay?.getTime() === value.getTime()) {
                  setSelectedDay(undefined);
                  setSelectedStartTime(undefined);
                } else {
                  setSelectedDay(value);
                  setSelectedStartTime(undefined);
                }
              }}
              tileClassName={({ date, view }) => {
                if (view !== "month") {
                  return null;
                }
                const res = [];
                if (date.getTime() === selectedDay?.getTime()) {
                  res.push("react-calendar__tile--activeV2");
                }
                if (
                  availableLocalDates &&
                  availableLocalDates.has(date.toLocaleDateString())
                ) {
                  res.push("react-calendar__tile--available");
                }
                return res;
              }}
            />
          </div>
        )}
        {availableLocalStartTimes && showFilterCalendar && (
          <div className="group relative z-0 mb-5 w-full">
            <div className="text-center">
              {selectedDay.toLocaleDateString()}
            </div>
            <div className="relative mx-auto flex max-w-64 flex-col divide-y overflow-auto bg-white shadow-lg ring-1 ring-black/5 md:max-h-96 ">
              {availableLocalStartTimes.map((v) => {
                const localeDate = v.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isSelected = selectedStartTime?.getTime() === v.getTime();
                return (
                  <div
                    className={`flex flex-col items-center p-2 ${isSelected ? "bg-blue-600" : ""}`}
                    key={localeDate}
                  >
                    <div>
                      <Link
                        className={`font-bold hover:cursor-pointer hover:underline ${isSelected ? "text-white" : "text-blue-600"}`}
                        onClick={(ev) => {
                          ev.preventDefault();
                          if (isSelected) {
                            setSelectedStartTime(undefined);
                          } else {
                            setSelectedStartTime(v);
                          }
                        }}
                      >
                        {localeDate}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* List of calendly */}
      <div className="grid md:grid-cols-2 md:gap-6">
        <div className="group relative z-0 mb-5 w-full">
          {availabilities !== null && availabilities.length > 0 && (
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Disponibilidad</th>
                </tr>
              </thead>
              <tbody>
                {availabilities &&
                  availabilities.map(
                    ({
                      volunteerAuthId,
                      volunteerParticipationId,
                      calendlySchedulingUrl,
                      firstName,
                      lastName,
                      availableStartTimes,
                    }) => {
                      const hidden =
                        availableStartTimes.find((v) => {
                          if (selectedDay === undefined) {
                            return true;
                          }
                          const time = new Date(v);
                          if (
                            time.toLocaleDateString() !==
                            selectedDay.toLocaleDateString()
                          ) {
                            return false;
                          }
                          if (
                            selectedStartTime &&
                            selectedStartTime.getTime() !== time.getTime()
                          ) {
                            return false;
                          }
                          return true;
                        }) === undefined;
                      if (hidden) {
                        return <></>;
                      }
                      return (
                        <tr key={calendlySchedulingUrl}>
                          <td>{`${firstName} ${lastName}`}</td>
                          <td>
                            <div className="text-center">
                              <Link
                                className="font-light text-blue-600 hover:cursor-pointer hover:underline dark:text-blue-500"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  if (
                                    calendlySchedulingUrl ===
                                    schedulingUrlToShow?.url
                                  ) {
                                    setSchedulingUrlToShow(undefined);
                                  } else {
                                    setSchedulingUrlToShow({
                                      url: calendlySchedulingUrl,
                                      volunteerParticipationId,
                                      volunteerAuthId,
                                    });
                                  }
                                }}
                              >
                                {calendlySchedulingUrl ===
                                schedulingUrlToShow?.url
                                  ? "Ocultar"
                                  : "Mostrar"}
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
              </tbody>
            </table>
          )}
          {availabilities === null && <Loading />}
        </div>
        {schedulingUrlToShow && (
          <CalendlyInlineWidget
            contestantParticipantId={contestantParticipantId}
            volunteerAuthId={schedulingUrlToShow.volunteerAuthId}
            volunteerParticipationId={
              schedulingUrlToShow.volunteerParticipationId
            }
            meetingTimeOpt={selectedStartTime}
            url={fullSchedulingUrlToShow(schedulingUrlToShow.url)}
          />
        )}
      </div>
    </div>
  );
}
