import Image from 'next/image';
import { type ReactElement, isValidElement, ComponentProps } from 'react';

interface Option {
    value: string;
    label?: string;
    image?: ComponentProps<typeof Image>;
};

interface Props {
    name: string;
    options: Option[];
    type: 'radio' | 'checkbox';
    label: string | ReactElement;
    setValue: Function;
    setError: Function;
    error: boolean;
    value: string;
};

export default function({ type, name, label, options, error, value, setValue, setError }: Props) {
    const values = options.map(({ value }) => {
        return value;
    });
    return (
        <fieldset>
            {isValidElement(label) ? label : <legend>{label}</legend>}
            <ul>
                {options.map(({ value, label, image }) => {
                    return (
                        <li key={value}>
                            {image && <Image {...image} />}
                            <input 
                                type={type} 
                                name={name} 
                                id={value} 
                                value={value}
                                onChange={(e) => {
                                    const { 
                                        value 
                                    } = e.target;
                                    setValue(value);
                                    setError(!values.includes(value));
                                }}
                            />
                            <label htmlFor={value}>{label ? label : value}</label>
                        </li>
                    );
                })}
                {error && <em>{`La opcion ${value} no es valida`}</em>}
            </ul>
        </fieldset>
    );
};