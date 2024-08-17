import { Button } from "@/components/button";
import { MailingAddress } from "./mailingAddress";
import { PersonalDetails } from "./personalDetails";
import { SchoolDetails } from "./schoolDetails";

export default function Registro(): JSX.Element {
  return (
    <form className="mx-auto max-w-3xl px-2 pt-4">
      {/* Personal information */}
      <PersonalDetails />
      {/* Mailing address */}
      <MailingAddress />
      {/* School */}
      <SchoolDetails />
      {/* Submit form */}
      <div className="flex justify-center">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
