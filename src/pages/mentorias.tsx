import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { findMostRecentOfmi } from "@/lib/ofmi";
import { Alert } from "@/components/alert";
import { getAllAvailabilities } from "@/lib/volunteer/mentor";
import { nextHalfHour } from "@/utils/time";
import { UserAvailability } from "@/types/mentor.schema";
import Mentorias from "@/components/mentorias";

export default function MentoriasPage({
  startTime,
  endTime,
  availabilities,
  errorMsg,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  if (errorMsg != null) {
    return (
      <div className="flex w-full items-center justify-center">
        <Alert
          className="block w-1/2 items-center justify-center"
          errorMsg={errorMsg}
        />
      </div>
    );
  }

  return (
    <Mentorias
      startTime={new Date(startTime)}
      endTime={new Date(endTime)}
      availabilities={availabilities}
    />
  );
}

export const getServerSideProps: GetServerSideProps<{
  startTime: string;
  endTime: string;
  availabilities: Array<UserAvailability>;
  errorMsg: string | null;
}> = async () => {
  const ofmi = await findMostRecentOfmi();

  const startTime = nextHalfHour(new Date(Date.now()));
  const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000);

  const availabilities =
    ofmi &&
    (await getAllAvailabilities({
      ofmiEdition: ofmi.edition,
      startTime,
      endTime,
    }));

  let errorMsg: string | null = null;
  if (!ofmi) {
    errorMsg = "No hay ninguna ofmi en curso.";
  }

  return {
    props: {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      availabilities: availabilities || [],
      errorMsg,
    },
  };
};
