import { Button } from "@/components/button";
import { MailingAddress } from "./mailingAddress";
import { PersonalDetails } from "./personalDetails";
import { SchoolDetails } from "./schoolDetails";
import type { UpsertParticipationRequest } from "@/types/participation.schema";

export default function Registro({
  ofmiEdition,
}: {
  ofmiEdition: number;
}): JSX.Element {
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const request: UpsertParticipationRequest = {
      ofmiEdition,
      country: data.get("school_country")?.toString() ?? "",
      state: data.get("school_state")?.toString() ?? "",
    };

    console.log(request);
  }

  return (
    <form
      className="mx-auto max-w-3xl px-2 pt-4"
      action="#"
      method="POST"
      onSubmit={(ev) => handleSubmit(ev)}
    >
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
