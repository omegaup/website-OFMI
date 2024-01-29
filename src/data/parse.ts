import * as fs from "node:fs";
import { Object as Obj } from "../utils/initializeDefaults";

interface Entry {
  clave: string;
  nombre: string;
}

interface Municipality extends Entry {
  localidades: Entry[];
}

interface State extends Entry {
  municipios: Municipality[];
}

type Country = State[];

const file = fs.readFileSync("./Original.min.json", "utf-8");

const Mexico = JSON.parse(file) as Country;

const states: Obj<Obj<string[]>> = {};
const state_names: string[] = [];

for (const { nombre, municipios } of Mexico) {
  const cities: Obj<string[]> = {};
  state_names.push(nombre);
  for (const { nombre, localidades } of municipios) {
    const validas = localidades.filter(({ nombre }) => {
      return nombre !== "Ninguno";
    });
    const names = validas.map(({ nombre }) => {
      return nombre;
    });
    cities[nombre] = Array.from(new Set(names));
  }
  states[nombre] = cities;
}

fs.writeFileSync("Estados.json", JSON.stringify(state_names));
fs.writeFileSync("Mexico.json", JSON.stringify(states));
