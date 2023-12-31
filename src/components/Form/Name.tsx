import Text from "./Text";

interface Input {
    name: string;
    value: string;
    error: boolean;
    setValue: Function;
    setError: Function;
    type: 'first' | 'last' | 'full';
};

export default function({ type, name, value, error, setValue, setError }: Input) {
    let label = 'Nombre Completo';
    if (type === 'first') {
        label = 'Nombre(s)';
    } else if (type === 'last') {
        label = 'Apellido(s)'
    };
    return (
        <Text 
            name={name}
            label={label}
            value={value}
            error={error}
            setValue={setValue}
            setError={setError}
        />
    );
};