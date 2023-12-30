import Options from "./Options";

interface Links {
    call: string;
    rules: string;
};

interface Props {
    name: string;
    links: Links;
};

export default function({ name, links }: Props) {
    const { call, rules } = links;
    return (
        <fieldset>
            <legend>
                Certifico que leí y entendi el
                <a href={rules}>reglamento</a> y la
                <a href={call}>convocatoria</a>, y que
                cumplo con los requisitos de elegibilidad,
                incluyendo mi identificación como
                mujer o persona no binaria.
            </legend>
            <Options 
                type='radio' 
                name={name} 
                values={[{
                    value: 'si',
                    label: 'Acepto'
                }, {
                    value: 'no',
                    label: 'No acepto'
                }]} 
            />
        </fieldset>
    );
};