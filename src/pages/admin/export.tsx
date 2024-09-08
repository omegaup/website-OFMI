import type { GetServerSideProps } from "next/types";
import { getUser } from "@/lib/auth";
import { findMostRecentOfmi, friendlyOfmiName } from "@/lib/ofmi";
import { exportParticipants } from "@/lib/gcloud";
import { SuccessAlert } from "@/components/alert";
import { Link } from "@/components/link";
import path from "path";

export default function ExportPage({
  spreadsheetId,
}: {
  spreadsheetId: string;
}): JSX.Element {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <SuccessAlert>
        <p>
          Da click{" "}
          <Link
            className="underline"
            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
          >
            aquí
          </Link>{" "}
          para ver
        </p>
      </SuccessAlert>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  spreadsheetId: string;
}> = async ({ req }) => {
  const user = await getUser(req);
  if (!user) {
    throw Error("Bug: should have been gated");
  }

  const ofmi = await findMostRecentOfmi();
  const spreadsheetId = await exportParticipants({
    userAuthId: user.id,
    ofmi,
    spreadsheetName: path.join(
      friendlyOfmiName(ofmi.edition),
      `Registro ${friendlyOfmiName(ofmi.edition)} (Respuestas)`,
    ),
  });
  return {
    props: {
      spreadsheetId,
    },
  };
};
