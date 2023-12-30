import { useState } from "react";

interface Text {
    type?: string;
    name: string;
    label: string;
    errMsg: string;
};

export default function({ type, name, label, errMsg }: Text) {
    const [ error, setError ] = useState<boolean>(false);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setError(!/^[a-zA-Z]+$/.test(value));
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
            {error && <em>{errMsg}</em>}
        </>
    );
};