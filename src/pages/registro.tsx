import Link from 'next/link';
import Country from '@/components/Form/Country';
import Options from "@/components/Form/Options";

export default function() {
    return (
        <form>
            <h1>Registro</h1>
            <Options
                name='xd'
                type='radio'
                label={
                    <legend>
                        Certifico que lei y entendi el <Link href='/reglamento'>reglamento</Link> y la <Link href='/convocatoria'>convocatoria</Link>, y que cumplo con 
                        los requisitos de eligibilidad, incluyendo mi certificacion 
                        como mujer o persona no binaria.
                    </legend>
                }
                options={[{
                    value: 'si'
                }, {
                    value: 'no'
                }]}
            />
            <Options
                name='shirt-size'
                type='radio'
                label='Tamaño de playera'
                options={[{
                    value: 'small',
                    label: 'S'
                }, {
                    value: 'medium',
                    label: 'M'
                }, {
                    value: 'large',
                    label: 'L'
                }, {
                    value: 'extra-large',
                    label: 'XL'
                }]}
            />
            <Country />
        </form>
    );
};