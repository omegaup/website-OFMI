import ChangePassword from "@/components/changePassword";
import { GetServerSideProps } from "next";

export interface IChangePasswordProps {
  token: string;
}

export default function ChangePasswordPage({
  token,
}: IChangePasswordProps): JSX.Element {
  return <ChangePassword token={token} />;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const token = query?.token;
  if (typeof token !== "string") {
    return {
      redirect: {
        destination: "/forgotPassword",
        permanent: false,
      },
    };
  }
  return {
    props: {
      token: token,
    },
  };
};
