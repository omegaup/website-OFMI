import { useState } from "react";
import { APIS } from "./client";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { RJSFSchema } from "@rjsf/utils";

function APIForm({ endpoint }: { endpoint: string }): JSX.Element {
  const [requestSchema, responseSchema] = APIS[endpoint];

  return (
    <Form
      schema={requestSchema as RJSFSchema}
      validator={validator}
      onSubmit={async (data, ev) => {
        ev.preventDefault();
        const formData = data.formData;
        if (!formData) {
          return;
        }
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        console.log(data);
      }}
    />
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
