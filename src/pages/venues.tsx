import Venues from "@/components/venues";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { findAllVenues } from "@/lib/venue";
import { AvailableVenues } from "@/types/venue.schema";
import { findMostRecentOfmi } from "@/lib/ofmi";

export default function AddVenuesPage({
  availableVenues,
  ofmiId,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const allVenues: AvailableVenues = availableVenues
    ? JSON.parse(availableVenues)
    : null;
  return <Venues allVenues={allVenues} ofmiId={ofmiId} />;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const [venues, ofmi] = await Promise.all([
    findAllVenues(),
    findMostRecentOfmi(),
  ]);

  return {
    props: {
      availableVenues: venues && JSON.stringify(venues),
      ofmiId: ofmi && JSON.stringify(ofmi.id),
    },
  };
};
