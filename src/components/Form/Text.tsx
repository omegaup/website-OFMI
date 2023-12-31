interface Props {
    type?: string;
    name: string;
    label: string;
    value: string;
    error: boolean;
    setError: Function;
    setValue: Function;
};

const isAlphabetic = /^[a-zA-Z ]+$/;

export default function({ type, name, label, value, error, setError, setValue }: Props) {
    return (
        <>
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                name={label}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                }}
                onBlur={(e) => {
                    setError(!isAlphabetic.test(e.target.value))
                }}
                type={type ? type : 'text'}
            />
            {error && <em>{`El campo ${name} solo admite letras y espacios`}</em>}
        </>
    );
};