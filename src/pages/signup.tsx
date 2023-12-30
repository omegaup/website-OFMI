import SignUp from "@/components/signup";
import { Provider } from "jotai";

export default function LoginPage() {
  return (
    <Provider>
      <SignUp />
    </Provider>
  );
}
