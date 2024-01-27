import * as fs from 'node:fs';
import { Object } from '@/utils/initializeDefaults';

interface Entry {
    clave: string;
    nombre: string;
};

interface Municipality extends Entry {
    localidades: Entry[];
};

interface State extends Entry{
    municipios: Municipality[];
};

type Country = State[];

const file = fs.readFileSync('./Original.min.json', 'utf-8');

const Mexico = JSON.parse(file) as Country;

let states: Object<Object<string[]>> = {};
let state_names: string[] = [];

for (const { nombre, municipios } of Mexico) {
    let cities: Object<string[]> = {};
    state_names.push(nombre);
    for (const { nombre, localidades } of municipios) {
        const validas = localidades.filter(({ nombre }) => {
            return nombre !== 'Ninguno';
        });
        const final = validas.map(({ nombre }) => {
            return nombre;
        });
        cities[nombre] = Array.from(new Set(final));
    };
    states[nombre] = cities;
};

fs.writeFileSync('Estados.json', JSON.stringify(state_names));
fs.writeFileSync('Mexico.json', JSON.stringify(states));