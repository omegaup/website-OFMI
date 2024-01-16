const fs = require('fs');
const Mexico = JSON.parse(fs.readFileSync('./Original.min.json'));

let states = {};
let state_names = [];

for (const { nombre, municipios } of Mexico) {
    let cities = {};
    state_names.push(nombre);
    for (const { nombre, localidades } of municipios) {
        cities[nombre] = localidades.map(({ nombre }) => {
            return nombre;
        });
    };
    states[nombre] = cities;
};

fs.writeFileSync('Estados.json', JSON.stringify(state_names));
fs.writeFileSync('Mexico.json', JSON.stringify(states));