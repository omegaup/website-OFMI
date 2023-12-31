import Image from 'next/image';
import { type ReactElement, isValidElement, ComponentProps, useState } from 'react';

interface Option {
    value: string;
    label?: string;
    image?: ComponentProps<typeof Image>;
};

interface Props {
    name: string;
    options: Option[];
    label: string | ReactElement;
    type: 'radio' | 'checkbox';
};

export default function({ type, name, label, options }: Props) {
    const [ state, setState ] = useState({
        error: false,
        value: ''
    });
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
                                    const { value } = e.target;
                                    setState({
                                        value,
                                        error: !values.includes(value)
                                    });
                                }}
                            />
                            <label htmlFor={value}>{label ? label : value}</label>
                        </li>
                    );
                })}
                {state.error && <em>{`${state.value} no es una opcion valida`}</em>}
            </ul>
        </fieldset>
    );
};