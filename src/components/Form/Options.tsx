interface Value {
    value: string;
    label?: string;
};

interface Props {
    name: string;
    values: Value[];
    type: 'radio' | 'checkbox';
};

export default function({ type, name, values }: Props) {
    return (
        <ul>
            {values.map(({ value, label }) => {
                return (
                    <li>
                        <input type={type} name={name} id={value} value={value} />
                        <label htmlFor={value}>{label ? label : value}</label>
                    </li>
                );
            })}
        </ul>
    );
};