import Text from "./Text";
import DataList from "./DataList";
import { useState } from "react";

const states = [
    'Ciudad de Mexico',
    'Aguascalientes',
    'Baja California',
    'Campeche',
    'Chiapas',
    'Chihuaua',
    'Coahuila',
    'Colima',
    'Durango',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'Mexico',
    'Michoacan',
    'Morelos',
    'Nayarit',
    'Nuevo Leon',
    'Oaxaca',
    'Puebla',
    'Queretaro',
    'Quintana Roo',
    'San Luis Potosi',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatan',
    'Zacatecas'
]

export default function() {
    const [ location, setLocation ] = useState({
        country: '',
        state: '',
    });
    return (
        <>
            <p>
                <DataList
                    name='country' 
                    label='Pais'
                    values={[
                        'Mexico',
                        'Otro'
                    ]}
                />
            </p>
            <p>
                {location.country === 'mexico' ? (
                    <DataList
                        name="state"
                        label="Estado"
                        values={states}
                        strictValidation={true}
                    />
                ) : (
                    <Text
                        name='state'
                        label='Estado'
                    />
                )}
            </p>
        </>
    );
};