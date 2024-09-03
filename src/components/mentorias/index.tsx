import { UserAvailability } from "@/types/mentor.schema";
import Calendar from "react-calendar";
import { useState } from "react";
import { InlineWidget } from "react-calendly";
import { Link } from "../link";
import { getLocalDateTimeWithOffset } from "@/utils/time";

// Receives a list of connected providers
export default function Mentorias({
  startTime,
  endTime,
  availabilities,
}: {
  startTime: Date;
  endTime: Date;
  availabilities: Array<UserAvailability>;
}): JSX.Element {
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [selectedStartTime, setSelectedStartTime] = useState<Date>();
  const [schedulingUrlToShow, setSchedulingUrlToShow] = useState<string>();

  const showFilterCalendar = schedulingUrlToShow === undefined;
  const fullSchedulingUrlToShow = (schedulingUrlToShow: string): string => {
    return (
      schedulingUrlToShow &&
      (selectedStartTime
        ? `${schedulingUrlToShow}/${getLocalDateTimeWithOffset(selectedStartTime)}`
        : selectedDay
          ? `${schedulingUrlToShow}/?date=${selectedDay.toLocaleDateString()}?`
          : schedulingUrlToShow)
    );
  };
  const availableLocalDates = new Set(
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
    <div className="mx-auto max-w-4xl px-2 pt-4">
      {/* Filter calendar */}
      <div className="grid md:grid-cols-4 md:gap-6">
        <div
          className="group relative z-0 col-span-3 mb-5 w-full"
          hidden={!showFilterCalendar}
        >
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
              if (availableLocalDates.has(date.toLocaleDateString())) {
                res.push("react-calendar__tile--available");
              }
              return res;
            }}
          />
        </div>
        {availableLocalStartTimes && (
          <div
            className="group relative z-0 mb-5 w-full"
            hidden={!showFilterCalendar}
          >
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
          <table
            className="w-full table-auto"
            hidden={availabilities.length == 0}
          >
            <thead>
              <tr>
                <th>Mentor</th>
                <th>Disponibilidad</th>
              </tr>
            </thead>
            <tbody>
              {availabilities.map(
                ({
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
                  return (
                    <tr key={calendlySchedulingUrl} hidden={hidden}>
                      <td>{`${firstName} ${lastName}`}</td>
                      <td>
                        <div className="text-center">
                          <Link
                            className="font-light text-blue-600 hover:cursor-pointer hover:underline dark:text-blue-500"
                            onClick={(ev) => {
                              ev.preventDefault();
                              if (
                                calendlySchedulingUrl === schedulingUrlToShow
                              ) {
                                setSchedulingUrlToShow(undefined);
                              } else {
                                setSchedulingUrlToShow(calendlySchedulingUrl);
                              }
                            }}
                          >
                            {calendlySchedulingUrl === schedulingUrlToShow
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
        </div>
        {schedulingUrlToShow && (
          <div className="group relative z-0 mb-5 w-full">
            <InlineWidget
              url={fullSchedulingUrlToShow(schedulingUrlToShow)}
            ></InlineWidget>
          </div>
        )}
      </div>
    </div>
  );
}
