import { Button } from "@/components/button";
import { AddVenuesRequest } from "@/types/venue.schema";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { SectionTitle } from "../contactData/sectionTitle";

export function AddVenues(): JSX.Element {
  const [tsvFile, setTSVFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleAddVenuesSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setLoading(true);
    setResponse(null);
    if (!tsvFile) {
      setResponse("No seleccionaste ningún archivo.");
      return;
    }

    if (!tsvFile.name.endsWith(".tsv")) {
      setResponse("Sube un archivo tsv");
      return;
    }

    // Tenemos tsv
    const reader = new FileReader();
    reader.onload = async (f): Promise<void> => {
      console.log("on load");
      const text = f.target?.result;
      if (!text) {
        setResponse("tsv sin contenido");
        return;
      }

      if (typeof text === "string") {
        const venues: AddVenuesRequest = [];
        text.split("\n").forEach((row) => {
          if (!row.toLowerCase().includes("name")) {
            const values = row.split("\t");
            console.log("values", values);
            if (values.length >= 3) {
              venues.push({
                name: values[0],
                state: values[1],
                address: values[2],
                googleMapsUrl: values[3],
              });
            }
          }
        });

        if (venues.length > 0) {
          let res: Response | null = null;

          res = await fetch("/api/venues/addVenues", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(venues),
          });
          const json = await res.json();
          setLoading(false);
          setResponse(JSON.stringify(json, null, 2));
        } else {
          setLoading(false);
          setResponse("El archivo no contenia ninguna venue");
        }
      }
    };
    reader.readAsText(tsvFile);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      console.log("got file");
      setTSVFile(e.target.files[0]);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-2 pt-4">
      <div>
        <SectionTitle title="Agregar sedes" />
        <form
          className="space-y-6"
          method="POST"
          onSubmit={handleAddVenuesSubmit}
        >
          <div>
            <div className="flex items-center justify-between">
              Subir tsv con datos de sedes headers: [name, state, address, url]
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="tsv-upload">Seleccionar tsv:</label>
              <input
                id="tsv"
                name="tsv"
                type="file"
                accept=".tsv" // Restrict file picker to tsv files
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div>
            <Button
              type="submit"
              buttonType="primary"
              className="w-full"
              disabled={!tsvFile && loading}
            >
              Registrar sedes
            </Button>
          </div>
        </form>
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
    </div>
  );
}
