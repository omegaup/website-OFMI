import { useState } from "react";
import { APIS } from "./client";

function APIForm({ endpoint }: { endpoint: string }): JSX.Element {
  const [requestSchema, responseSchema] = APIS[endpoint];

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    console.log(event);
  }

  console.log({ requestSchema, responseSchema });
  console.log(requestSchema.params);
  console.log(requestSchema.$schema);

  return (
    <form
      className="space-y-6"
      method="POST"
      onSubmit={(ev) => handleSubmit(ev)}
    ></form>
  );
}

export default function Admin(): JSX.Element {
  const [endpoint, setEndpoint] = useState<keyof typeof APIS>();

  return (
    <div className="mx-auto max-w-3xl px-2 pt-4">
      <div>
        <label
          htmlFor="endpoint"
          className="block font-medium leading-6 text-gray-900"
        >
          API endpoint
        </label>
        <select
          id="endpoint"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
          value={endpoint}
          onChange={(ev) => {
            ev.preventDefault();
            setEndpoint(
              ev.currentTarget.value in APIS
                ? (ev.currentTarget.value as Endpoint)
                : undefined,
            );
          }}
        >
          <option value={""}></option>
          {Object.keys(APIS).map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {endpoint && <APIForm endpoint={endpoint}></APIForm>}
    </div>
  );
}
