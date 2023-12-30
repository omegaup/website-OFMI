import Link from 'next/link';
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
        </form>
    );
};