import Form from "../Form/Form";
import { useState } from "react";
import Number from "../Form/Num";
import Options from "../Form/Options";
import DataList from "../Form/DataList";
import AlphaText from "../Form/AlphaText";
import PhoneNumber from "../Form/PhoneNumber";
import PostalCode from "../Form/PostalCode";
import { ObjVals, ObjErrs } from "@/types/input.types";
import initializeDefaults from "@/utils/initializeDefaults";
import Estados from "@/data/Estados.json";
import MexicoJSON from "@/data/Mexico.json";

const Mexico = Object.create(MexicoJSON);

export default function () {
  const fields = [
    "receptor_nombre",
    "receptor_telefono",
    "calle",
    "numero_exterior",
    "numero_interior",
    "colonia",
    "codigo_postal",
    "estado",
    "municipio",
    "talla_playera",
    "corte_playera",
  ];
  const [data, setData] = useState<ObjVals>({
    ...initializeDefaults(fields, ""),
  });
  const [errors, setErrors] = useState<ObjErrs>({
    ...initializeDefaults(fields, null),
    count: fields.length,
  });
  const submitHandler = (vals: ObjVals) => {
    return {
      isError: false,
      message: "Tu registro ha sido completado",
    };
  };
  return (
    <Form
      name="Información de Envío"
      values={{ state: data, updater: setData }}
      errors={{ state: errors, updater: setErrors }}
      submit={{ label: "Finalizar", handler: submitHandler }}
    >
      <AlphaText
        name="receptor_nombre"
        label="Nombre de la persona que puede recibir el paquete en el domicilio"
      />
      <PhoneNumber
        name="receptor_telefono"
        label="Teléfono de la persona que puede recibir el paquete en el domicilio"
      />
      <Number name="calle" label="Calle" />
      <Number name="numero_exterior" label="Numero Exterior" />
      <Number
        isRequired={false}
        name="numero_interior"
        label="Numero Interior"
      />
      <DataList
        name="estado"
        label="Estado"
        options={Estados}
        validation="strict"
      />
      {errors.estado === 0 && (
        <DataList
          name="municipio"
          label="Municipio"
          options={Object.keys(Mexico[data.estado])}
          validation="strict"
        />
      )}
      {errors.municipio === 0 && (
        <DataList
          name="colonia"
          label="Colonia"
          options={Mexico[data.estado][data.municipio]}
          validation="strict"
        />
      )}
      <PostalCode name="codigo_postal" label="Codigo Postal" />
      <Options
        type="radio"
        name="talla_playera"
        label="Talla de Playera"
        options={[
          { val: "S", label: "Chica" },
          { val: "M", label: "Mediana" },
          { val: "L", label: "Grande" },
          { val: "XL", label: "Extra Grande" },
        ]}
      />
      <Options
        type="radio"
        name="corte_playera"
        label="Tipo de Corte de Playera"
        options={[
          {
            val: "A",
            label: "Tipo A (recta)",
            image: {
              src: "/corte-a.png",
              width: 257,
              height: 256,
              alt: "",
            },
          },
          {
            val: "B",
            label: "Tipo B (acinturada)",
            image: {
              src: "/corte-b.png",
              width: 209,
              height: 283,
              alt: "",
            },
          },
        ]}
      />
    </Form>
  );
}
