import { useState } from 'react';
import Link from 'next/link';
import Name from '@/components/Form/Name';
import Text from '@/components/Form/Text';
import Number from '@/components/Form/Number';
import Country from '@/components/Form/Country';
import Options from "@/components/Form/Options";
import DataList from '@/components/Form/DataList';

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
        escuela: '',
        grado_escolaridad: '',

    });
    const [ deliveryAddress, setDeliveryAddress ] = useState({
        nombre_destinatario: '',
        direccion_completa: '',
        numero_telefono: '',
        talla_playera: ''
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
        escuela: false,
        grado_escolaridad: false,

    });
    const [ deliveryErrors, setDeliveryErrors ] = useState({
        nombre_destinatario: false,
        direccion_completa: false,
        numero_telefono: false,
        talla_playera: false
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
            <Country
                country={{
                    value: personalData.pais,
                    error: dataErrors.pais,
                    setValue: (value: string) => (
                        setPersonalData({ 
                            ...personalData,
                            pais: value
                        })
                    ),
                    setError: (value: boolean) => (
                        setDataErrors({ 
                            ...dataErrors, 
                            pais: value 
                        })
                    )
                }}
                state={{
                    value: personalData.estado,
                    error: dataErrors.estado,
                    setValue: (value: string) => (
                        setPersonalData({ 
                            ...personalData,
                            estado: value
                        })
                    ),
                    setError: (value: boolean) => (
                        setDataErrors({ 
                            ...dataErrors, 
                            estado: value 
                        })
                    )
                }}
            />
            <Options
                name='escolaridad'
                type='radio'
                label='Escolaridad'
                options={[{
                    value: 'primaria',
                }, {
                    value: 'secundaria',
                }, {
                    value: 'prepa'
                }]}
                value={personalData.escolaridad}
                error={dataErrors.escolaridad}
                setValue={(value: string) => (
                    setPersonalData({ 
                        ...personalData,
                        escolaridad: value
                    })
                )}
                setError={(value: boolean) => (
                    setDataErrors({ 
                        ...dataErrors, 
                        escolaridad: value 
                    })
                )}
            />
            <DataList
                name='escuela'
                label='Escuela'
                values={['prepa 1', 'prepa 2']}
                value={personalData.escuela}
                error={dataErrors.escuela}
                setValue={(value: string) => (
                    setPersonalData({ 
                        ...personalData,
                        escuela: value
                    })
                )}
                setError={(value: boolean) => (
                    setDataErrors({ 
                        ...dataErrors, 
                        escuela: value 
                    })
                )}
            />
            <Number
                name='grado_escolaridad'
                label={personalData.escolaridad === 'prepa' ? 'Semestre' : 'Año'}
                range={personalData.escolaridad === 'secundaria' ? [1, 3] : [1, 6]}
                value={personalData.grado_escolaridad}
                error={dataErrors.grado_escolaridad}
                setValue={(value: string) => (
                    setPersonalData({ 
                        ...personalData,
                        grado_escolaridad: value
                    })
                )}
                setError={(value: boolean) => (
                    setDataErrors({ 
                        ...dataErrors, 
                        grado_escolaridad: value 
                    })
                )}
            />
            {/* CAMPOS SOLO PARA LAS DE MEXICO */}
            <Options
                name='talla_playera'
                type='radio'
                label='Talla de la Playera'
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
                value={deliveryAddress.talla_playera}
                error={deliveryErrors.talla_playera}
                setValue={(value: string) => (
                    setDeliveryAddress({ 
                        ...deliveryAddress,
                        talla_playera: value
                    })
                )}
                setError={(value: boolean) => (
                    setDeliveryErrors({ 
                        ...deliveryErrors, 
                        talla_playera: value 
                    })
                )}
            />
        </form>
    );
};