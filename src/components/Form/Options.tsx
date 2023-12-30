import { type FC, type ReactElement, type ReactNode, createElement, isValidElement } from 'react';
import { JsxElement } from 'typescript';

const isAlphabetic = /^[a-zA-Z]+$/;

interface Option {
    value: string;
    label?: string;
};

interface Props {
    name: string;
    options: Option[];
    label: string | ReactNode;
    type: 'radio' | 'checkbox';
};

export default function({ type, name, label, options }: Props) {
    return (
        <fieldset>
            {(typeof(label) === "string") ? <legend>{label}</legend> : (
                isValidElement(label) && label
            )}
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