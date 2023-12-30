import { useState } from "react";

interface Text {
    type?: string;
    name: string;
    label: string;
};

const isAlphabetic = /^[a-zA-Z]+$/;

export default function({ type, name, label }: Text) {
    const [ error, setError ] = useState<boolean>(false);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setError(!isAlphabetic.test(e.target.value));
    };
    return (
        <>
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                name={label}
                onBlur={handleBlur}
                type={type ? type : 'text'}
            />
            {error && <em>{`El campo ${name} debe ser alfabetico`}</em>}
        </>
    );
};