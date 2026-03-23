import { useEffect, useState } from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { RJSFSchema } from "@rjsf/utils";
import { APIS } from "./client";
import { Button } from "../button";

type Volunteer = {
  volunteerParticipationId: string;
  mentorshipEnabled: boolean;
  firstName: string;
  lastName: string;
  email: string;
};

function MentorshipsAdmin() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialStates, setInitialStates] = useState<Map<string, boolean>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/volunteers/mentorship")
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => Promise.reject(err));
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
            throw new Error("La respuesta de la API no tiene el formato esperado.");
        }
        setVolunteers(data);
        setInitialStates(new Map(data.map((v: Volunteer) => [v.volunteerParticipationId, v.mentorshipEnabled])));
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Ocurrió un error al cargar los datos de los voluntarios.");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setVolunteers((prev) =>
      prev.map((v) =>
        v.volunteerParticipationId === id ? { ...v, mentorshipEnabled: checked } : v
      )
    );
  };
  
  const getChangedVolunteers = () => {
    return volunteers.filter(v => v.mentorshipEnabled !== initialStates.get(v.volunteerParticipationId))
    .map(v => ({
      volunteerParticipationId: v.volunteerParticipationId,
      mentorshipEnabled: v.mentorshipEnabled
    }));
  }

  const handleSaveChanges = async () => {
    setSaving(true);
    const changedVolunteers = getChangedVolunteers();
    
    if (changedVolunteers.length > 0) {
      await fetch("/api/admin/volunteers/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedVolunteers),
      });
    }
    
    setSaving(false);
    const newInitialStates = new Map(volunteers.map(v => [v.volunteerParticipationId, v.mentorshipEnabled]));
    setInitialStates(newInitialStates);
  };

  if (loading) {
    return <p>Cargando voluntarios...</p>;
  }

  if (error) {
    return <p className="text-red-500 p-4 bg-red-100 border border-red-400 rounded">Error: {error}</p>;
  }

  const changedCount = getChangedVolunteers().length;

  return (
    <div className="pt-4">
      <h2 className="text-xl font-bold mb-4">Control de Mentorías</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Habilitado</th>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Email</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((v) => (
              <tr key={v.volunteerParticipationId}>
                <td className="py-2 px-4 border-b text-center">
                  <input
                    type="checkbox"
                    checked={v.mentorshipEnabled}
                    onChange={(e) => handleCheckboxChange(v.volunteerParticipationId, e.target.checked)}
                    className="h-5 w-5"
                  />
                </td>
                <td className="py-2 px-4 border-b">{`${v.firstName} ${v.lastName}`}</td>
                <td className="py-2 px-4 border-b">{v.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center">
         <Button
          onClick={handleSaveChanges}
          disabled={saving || changedCount === 0}
          isLoading={saving}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {saving ? 'Guardando...' : `Guardar Cambios (${changedCount})`}
        </Button>
      </div>
    </div>
  );
}


function APIForm({ endpoint }: { endpoint: string }): JSX.Element {
  // ... existing APIForm component code ...
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [method, requestSchema] = APIS[endpoint];

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

          let res: Response | null = null;
          if (method === "POST") {
            res = await fetch(endpoint, {
              method,
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            });
          } else {
            const query = new URLSearchParams(formData);
            res = await fetch(`${endpoint}?${query.toString()}`, {
              method,
            });
          }
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

enum Tab {
  Mentorships = "Mentorías",
  Generic = "API Genérica",
}

export default function Admin(): JSX.Element {
  const [endpoint, setEndpoint] = useState<string>();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Mentorships);

  return (
    <div className="mx-auto max-w-4xl px-2 pt-4">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab(Tab.Mentorships)}
            className={`${
              activeTab === Tab.Mentorships
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {Tab.Mentorships}
          </button>
          <button
            onClick={() => setActiveTab(Tab.Generic)}
            className={`${
              activeTab === Tab.Generic
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {Tab.Generic}
          </button>
        </nav>
      </div>

      {activeTab === Tab.Mentorships && <MentorshipsAdmin />}
      
      {activeTab === Tab.Generic && (
        <div className="pt-4">
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
          {endpoint && <APIForm endpoint={endpoint}></APIForm>}
        </div>
      )}
    </div>
  );
}