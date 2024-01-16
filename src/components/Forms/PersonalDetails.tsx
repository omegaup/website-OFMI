import Link from "next/link";
import Form from "../Form/Form";
import { useState } from "react";
import Options from "../Form/Options";
import AlphaText from "../Form/AlphaText";
import AlphaNumText from "../Form/AlphaNumText";
import DataList from "../Form/DataList";
import Birthday from "../Form/Birthday";
import Number from "../Form/Number";
import CURP from "../Form/CURP";
import initializeDefaults from "@/utils/initializeDefaults";
import { ObjVals, ObjErrs, Handler } from "@/types/input.types";
import Estados from "@/data/Estados.json";

interface Props {
    submitHandler: Handler;
};

export default function({ submitHandler }: Props) {
    const fields = [
        'TyC',
        'nombres',
        'apellidos',
        'pronombres',
        'pais',
        'estado',
        'cumpleanos',
        'escolaridad',
        'periodo',
        'escuela',
        'curp',
        'recibir_medalla'
    ];
    const [ data, setData ] = useState<ObjVals>({
        ...initializeDefaults(fields, ''),
        recibir_medalla: 'No',
        TyC: '0'
    });
    const [ errors, setErrors ] = useState<ObjErrs>({
        ...initializeDefaults(fields, null),
        count: fields.length - 2,
    });
    return (
        <Form
            name='Registro'
            values={{ state: data, updater: setData }}
            errors={{ state: errors, updater: setErrors }}
            submit={{ label: 'Enviar', handler: submitHandler }}
            >
                <Options
                    name='TyC'
                    type='radio'
                    label={
                        <legend>
                            Certifico que lei y entendi 
                            el <Link href='/reglamento'>reglamento</Link> y 
                            la <Link href='/convocatoria'>convocatoria</Link>, 
                            y que cumplo con los requisitos de eligibilidad, 
                            incluyendo mi certificacion como 
                            mujer o persona no binaria.
                        </legend>
                    }
                    options={[
                        { val: 'Si', label: 'Acepto' }, 
                        { val: 'No', label: 'No acepto' }]
                    }
                />
                <AlphaText
                    name='nombres'
                    label='Nombre(s)'
                />
                <AlphaText
                    name='apellidos'
                    label='Apellido(s)'
                />
                <Options
                    type='checkbox'
                    name='pronombres'
                    label='Pronombre'
                    options={[
                        'ella',
                        'elle',
                        'el'
                    ]}
                />
                <DataList
                    name='pais'
                    label='Pais'
                    validation={/^[a-zA-ZÁÉÍÓÚáéíóú ]+$/g}
                    options={[ 'México' ]}
                />
                <DataList
                    name='estado'
                    label='Estado'
                    validation={data.pais === 'México' ? 'strict' : /^[a-zA-ZÁÉÍÓÚáéíóú ]+$/g}
                    options={data.pais === 'México' && Estados}
                />
                <Birthday
                    name='cumpleanos'
                    label='Cumpleaños'
                    ageRange={[18, 20]}
                />
                <Options
                    type='radio'
                    name='escolaridad'
                    label='Escolaridad'
                    options={[ 
                        'Primaria',
                        'Secundaria',
                        'Preparatoria'
                    ]}
                />
                <Number
                    name='periodo'
                    range={data.escolaridad === 'Secundaria' ? [1, 3] : [1, 6]}
                    label={data.escolaridad === 'Preparatoria' ? 'Semestre' : 'Año'}
                />
                <AlphaNumText
                    name='escuela'
                    label='Escuela'
                />
                {data.pais === 'México' 
                && errors.estado === 0
                && errors.cumpleanos === 0
                && (
                    <CURP
                        name='curp'
                        label='CURP'
                        fullFirst={data.nombres}
                        fullLast={data.apellidos}
                        birthday={data.cumpleanos}
                        state={data.estado}
                    />
                )}
                {data.pais === 'México' && (
                    <Options
                        type='radio'
                        name='recibir_medalla'
                        label='Si eres seleccionade, ¿te gustaría recibir medalla y playera?'
                        options={[ 'Si', 'No' ]}
                    />
                )}
            </Form>
    );
};