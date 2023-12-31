import { useState } from 'react';
import Link from 'next/link';
import Name from '@/components/Form/Name';
import Text from '@/components/Form/Text';
import Number from '@/components/Form/Number';
import Country from '@/components/Form/Country';
import Options from "@/components/Form/Options";

export default function() {
    const [ personalData, setPersonalData ] = useState({
        TyC: '',
        nombres: '',
        apellidos: '',
        pronombres: '',
        pais: '',
        estado: '',
        ciudad: '',
        escolaridad: '',
        grado_escolaridad: '',

    });
    const [ deliveryAddress, setDeliveryAddress ] = useState({
        nombre_destinatario: '',
        direccion_completa: '',
        numero_telefono: ''
    });
    const [ dataErrors, setDataErrors ] = useState({
        TyC: false,
        nombres: false,
        apellidos: false,
        pronombres: false,
        pais: false,
        estado: false,
        ciudad: false,
        escolaridad: false,
        grado_escolaridad: false,

    });
    return (
        <form>
            <h1>Registro</h1>
            <Options
                name='TyC'
                type='radio'
                label={
                    <legend>
                        Certifico que lei y entendi el <Link href='/reglamento'>reglamento</Link> y la <Link href='/convocatoria'>convocatoria</Link>, y que cumplo con 
                        los requisitos de eligibilidad, incluyendo mi certificacion 
                        como mujer o persona no binaria.
                    </legend>
                }
                options={[{
                    value: '0',
                    label: 'Acepto'
                }, {
                    value: '1',
                    label: 'No acepto'
                }]}
                value={personalData.TyC}
                error={dataErrors.TyC}
                setValue={(value: string) => (
                    setPersonalData({ 
                        ...personalData,
                        TyC: value
                    })
                )}
                setError={(value: boolean) => (
                    setDataErrors({ 
                        ...dataErrors, 
                        TyC: value 
                    })
                )}
            />
            <Name 
                name='nombres'
                type='first'
                value={personalData.nombres}
                error={dataErrors.nombres}
                setValue={(name: string) => (
                    setPersonalData({ 
                        ...personalData, 
                        nombres: name 
                    })
                )}
                setError={(value: boolean) => (
                    setDataErrors({ 
                        ...dataErrors,
                        nombres: value
                    })
                )}
            />
            <Name 
                name='apellidos'
                type='last'
                value={personalData.apellidos}
                error={dataErrors.apellidos}
                setValue={(name: string) => (
                    setPersonalData({ 
                        ...personalData, 
                        apellidos: name 
                    })
                )}
                setError={(value: boolean) => (
                    setDataErrors({ 
                        ...dataErrors,
                        apellidos: value
                    })
                )}
            />
            <Options
                name='pronombres'
                type='checkbox'
                label='Pronombres'
                options={[{
                    value: 'el',
                }, {
                    value: 'ella',
                }, {
                    value: 'elle'
                }]}
                value={personalData.pronombres}
                error={dataErrors.pronombres}
                setValue={(value: string) => (
                    setPersonalData({ 
                        ...personalData,
                        pronombres: value
                    })
                )}
                setError={(value: boolean) => (
                    setDataErrors({ 
                        ...dataErrors, 
                        pronombres: value 
                    })
                )}
            />
        </form>
    );
};