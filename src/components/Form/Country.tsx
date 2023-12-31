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

interface Errs {
    country: undefined | boolean;
    state: undefined | boolean;
};

export default function() {
    const [ location, setLocation ] = useState({
        country: '',
        state: '',
    });
    const [ errors, setErrors ] = useState<Errs>({
        country: undefined,
        state: undefined,
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
                    value={location.country}
                    error={errors.country}
                    setter={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setLocation({ ...location, country: e.target.value }) 
                    }}
                    magic={(value: boolean) => { 
                        setErrors({ ...errors, country: value })
                    }}
                />
            </p>
            <p>
                {location.country === 'Mexico' ? (
                    <DataList
                        name="state"
                        label="Estado"
                        values={states}
                        strictValidation={true}
                        value={location.state}
                        error={errors.state}
                        setter={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setLocation({ ...location, state: e.target.value });
                        }}
                        magic={(value: boolean) => { 
                            setErrors({ ...errors, country: value })
                        }}
                    />
                ) : (
                    <Text
                        name='estado'
                        label='Estado'
                    />
                )}
            </p>
        </>
    );
};