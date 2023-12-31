const isAlphabetic = /^[A-Z]+$/i;

interface DataList {
    name: string;
    error: boolean | undefined;
    value: string;
    label: string;
    values: string[];
    setter: React.ChangeEventHandler
    magic: Function;
    strictValidation?: boolean;
}

export default function({ name, label, value, values, error, setter, magic, strictValidation }: DataList) {
    let validation = {
        function: (value: string) => (isAlphabetic.test(value)),
        message: 'solo puede contener letras'
    };
    if (strictValidation) {
        validation.function = (value: string) => (values.includes(value));
        validation.message = 'no es un valor valido';
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { value } = e.target;
        magic(!validation.function(value))
    };
    return (
        <>
            <label htmlFor={`${name}-op`}>{label}</label>
            <input 
                list={`${name}-opts`} 
                name={`${name}-op`} 
                id={`${name}-op`} 
                onBlur={handleBlur} 
                onChange={setter}
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