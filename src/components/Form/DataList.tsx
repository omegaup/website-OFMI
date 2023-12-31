const isAlphabetic = /^[A-Z0-9 ]+$/i;

interface DataList {
    name: string;
    error: boolean | undefined;
    value: string;
    label: string;
    values: string[];
    setValue: Function
    setError: Function;
    strictValidation?: boolean;
}

export default function({ name, label, value, values, error, setValue, setError, strictValidation }: DataList) {
    let validation = {
        function: (value: string) => (isAlphabetic.test(value)),
        message: 'solo puede contener letras, numeros y espacios'
    };
    if (strictValidation) {
        validation.function = (value: string) => (values.includes(value));
        validation.message = 'no es un valor valido';
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setError(!validation.function(value))
    };
    return (
        <>
            <label htmlFor={`${name}-op`}>{label}</label>
            <input 
                list={`${name}-opts`} 
                name={`${name}-op`} 
                id={`${name}-op`} 
                onBlur={handleBlur} 
                onChange={(e) => {
                    setValue(e.target.value);
                }}
                value={value} 
            />
            <datalist id={`${name}-opts`}>
                {values.map((value) => {
                    return <option key={value} value={value}>{value}</option>;
                })}
            </datalist>
            {error && <em>{`El valor de ${name} ${validation.message}`}</em>}
        </>
    );
};