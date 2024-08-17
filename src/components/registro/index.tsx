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
        <Button type="submit" className="min-w-full md:w-64 md:min-w-0">
          Submit
        </Button>
      </div>
    </form>
  );
}
