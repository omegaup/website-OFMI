import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next/types";
import { findMostRecentOfmi } from "@/lib/ofmi";
import Mentorias from "@/components/mentorias";

export default function MentoriasPage({
  ofmiEdition,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return <Mentorias ofmiEdition={ofmiEdition} />;
}

export const getServerSideProps: GetServerSideProps<{
  ofmiEdition: number;
}> = async () => {
  const ofmi = await findMostRecentOfmi();
  return {
    props: {
      ofmiEdition: ofmi.edition,
    },
  };
};
