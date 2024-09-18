import { useState } from "react";
import { APIS } from "./client";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { RJSFSchema } from "@rjsf/utils";

function APIForm({ endpoint }: { endpoint: string }): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const requestSchema = APIS[endpoint];

  return (
    <div>
      <Form
        schema={requestSchema as RJSFSchema}
        validator={validator}
        disabled={loading}
        onSubmit={async (data, ev) => {
          ev.preventDefault();
          setLoading(true);
          setResponse(null);
          const formData = data.formData;
          if (!formData) {
            return;
          }
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          setLoading(false);
          const json = await res.json();
          setResponse(JSON.stringify(json, null, 2));
        }}
      />
      {response && (
        <div>
          <div className="mt-6 rounded-md border border-gray-300 bg-gray-100 p-4">
            <pre className="whitespace-pre-wrap break-words">{response}</pre>
          </div>
          <button
            onClick={(ev) => {
              ev.preventDefault();
              setResponse(null);
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}

export default function Admin(): JSX.Element {
  const [endpoint, setEndpoint] = useState<string>();

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
                ? ev.currentTarget.value
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
