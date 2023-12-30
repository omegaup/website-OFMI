import { type FC, type ReactElement, isValidElement } from 'react';

interface Option {
    value: string;
    label?: string;
};

interface Props {
    name: string;
    options: Option[];
    label: string | ReactElement;
    type: 'radio' | 'checkbox';
};

export default function({ type, name, label, options }: Props) {
    return (
        <fieldset>
            {isValidElement(label) ? label : <legend>{label}</legend>}
            <ul>
                {options.map(({ value, label }) => {
                    return (
                        <li key={value}>
                            <input type={type} name={name} id={value} value={value} />
                            <label htmlFor={value}>{label ? label : value}</label>
                        </li>
                    );
                })}
            </ul>
        </fieldset>
    );
};