import Text from "./Text";
import DataList from "./DataList";

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

interface State {
    value: string;
    error: boolean;
    setError: Function;
    setValue: React.ChangeEventHandler;
};

interface Props {
    country: State;
    state: State;
};

export default function({ country, state }: Props) {
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
                    value={country.value}
                    error={country.error}
                    setValue={country.setValue}
                    setError={country.setValue}
                />
            </p>
            <p>
                {country.value === 'Mexico' ? (
                    <DataList
                        name="state"
                        label="Estado"
                        values={states}
                        strictValidation={true}
                        value={state.value}
                        error={state.error}
                        setValue={state.setValue}
                        setError={state.setError}
                    />
                ) : (
                    <Text
                        name='estado'
                        label='Estado'
                        value={state.value}
                        error={state.error}
                        setValue={state.setValue}
                        setError={state.setError}
                    />
                )}
            </p>
        </>
    );
};