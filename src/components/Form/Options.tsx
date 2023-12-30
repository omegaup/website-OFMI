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
    label: string | ReactElement;
    type: 'radio' | 'checkbox';
};

export default function({ type, name, label, options }: Props) {
    return (
        <fieldset>
            {isValidElement(label) ? label : <legend>{label}</legend>}
            <ul>
                {options.map(({ value, label, image }) => {
                    return (
                        <li key={value}>
                            {image && <Image src={image.src} alt={image.alt} />}
                            <input type={type} name={name} id={value} value={value} />
                            <label htmlFor={value}>{label ? label : value}</label>
                        </li>
                    );
                })}
            </ul>
        </fieldset>
    );
};