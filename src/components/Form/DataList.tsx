import { useState  } from "react";

const isAlphabetic = /^[A-Z]+$/i;

interface DataList {
    name: string;
    label: string;
    values: string[];
    strictValidation?: boolean;
}

export default function({ name, label, values, strictValidation }: DataList) {
    const [ value, setValue ] = useState<string | undefined>(undefined);
    const [ error, setError ] = useState<string | undefined>(undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (strictValidation && !values.includes(value)) {
            setError(`${value} no es una opción válida`);
            return;
        } else if (!strictValidation && !isAlphabetic.test(value)) {
            setError(`El ${name} debe ser alfabetico`);
        } else {
            setError(undefined);
        };
    };
    return (
        <>
            <label htmlFor={`${name}-op`}>{label}</label>
            <input 
                list={`${name}-opts`} 
                name={`${name}-op`} 
                id={`${name}-op`} 
                onBlur={handleBlur} 
                onChange={handleChange}
                value={value} 
            />
            <datalist id={`${name}-opts`}>
                {values.map((value) => {
                    return <option key={value} value={value}>{value}</option>;
                })}
            </datalist>
            {error && <em>{error}</em>}
        </>
    );
};