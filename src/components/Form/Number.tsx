interface Props {
    name: string;
    label: string;
    value: string;
    error: boolean;
    range: [number, number];
    setValue: React.ChangeEventHandler;
    setError: Function;
};

export default function({ name, label, value, error, range, setValue, setError }: Props) {
    const [ start, end ] = range;
    return (
        <>
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                name={label}
                value={value}
                onChange={setValue}
                onBlur={(e) => {
                    let isInRange = true;
                    const value = parseInt(e.target.value);
                    if (value < start || value > end) {
                        isInRange = false;
                    };
                    setError(!isInRange);
                }}
                type='number'
            />
            {error && <em>{`El valor de ${name} debe estar entre ${start} y ${end}`}</em>}
        </>
    );
};