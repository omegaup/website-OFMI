import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import Oauth from "@/components/oauth";
import { findMostRecentOfmi } from "@/lib/ofmi";
import { Alert } from "@/components/alert";
import { getAllAvailabilities } from "@/lib/mentor";
import { nextHalfHour } from "@/utils/time";
import { UserAvailability } from "@/types/mentor.schema";

export default function MentoriasPage({
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

  console.log(availabilities);

  return <div>Coming soon.</div>;
}

export const getServerSideProps: GetServerSideProps<{
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
      availabilities: availabilities || [],
      errorMsg,
    },
  };
};
