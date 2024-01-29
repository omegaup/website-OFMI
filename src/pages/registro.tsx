import { useState } from "react";
import ShippingDetails from "@/components/Forms/ShippingDetails";
import PersonalDetails from "@/components/Forms/PersonalDetails";
import { Response } from "@/components/Form/Form";
import { ObjVals } from "@/types/input.types";

export default function Registro(): JSX.Element {
  const [collectShippingDetails, setCollectShippingDetails] = useState(true);
  const submitPersonalDetails = (vals: ObjVals): Response => {
    if (vals.TyC === "No") {
      return {
        isError: true,
        message: "Debes aceptar los Términos y Condiciones",
      };
    }
    setCollectShippingDetails(vals.recibir_medalla === "Si");
    return {
      isError: false,
      message: "Tus datos han sido enviados exitosamente",
    };
  };
  return (
    <main>
      <PersonalDetails submitHandler={submitPersonalDetails} />
      {collectShippingDetails && <ShippingDetails />}
    </main>
  );
}
