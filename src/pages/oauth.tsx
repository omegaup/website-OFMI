import {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { Calendly, GCloud, findConnectedProviders } from "@/lib/oauth";
import Oauth from "@/components/oauth";
import { OauthProvider } from "@prisma/client";
import { X_USER_AUTH_ID_HEADER } from "@/lib/auth";
import { findMostRecentOfmi } from "@/lib/ofmi";
import { prisma } from "@/lib/prisma";

export default function OauthPage({
  userAuthId,
  connectedProviders,
  calendlyRedirectTo,
  gCloudRedirectTo,
  mentorshipEnabled,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <Oauth
      userAuthId={userAuthId}
      connectedProviders={connectedProviders}
      calendlyRedirectTo={calendlyRedirectTo}
      gCloudRedirectTo={gCloudRedirectTo}
      mentorshipEnabled={mentorshipEnabled}
    />
  );
}

export const getServerSideProps: GetServerSideProps<{
  userAuthId: string;
  connectedProviders: Array<OauthProvider>;
  calendlyRedirectTo: string;
  gCloudRedirectTo: string;
  mentorshipEnabled: boolean;
}> = async ({ req }) => {
  const userAuthId = req.headers[X_USER_AUTH_ID_HEADER];
  if (!userAuthId || typeof userAuthId !== "string") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const ofmi = await findMostRecentOfmi();
  const participation = await prisma.participation.findFirst({
    where: {
      ofmiId: ofmi.id,
      user: { userAuthId },
      role: 'VOLUNTEER'
    },
    include: {
      VolunteerParticipation: true
    }
  });

  const mentorshipEnabled = participation?.VolunteerParticipation?.mentorshipEnabled ?? false;

  const connectedProviders = await findConnectedProviders(userAuthId);

  return {
    props: {
      userAuthId,
      connectedProviders,
      calendlyRedirectTo: Calendly.REDIRECT_TO,
      gCloudRedirectTo: GCloud.REDIRECT_TO,
      mentorshipEnabled,
    },
  };
};
