import {
  UpsertParticipationRequest,
  UpsertParticipationResponse,
} from "@/types/participation.schema";
import { BadRequestError } from "@/types/errors";

const friendlyErrorMap = {
  "/phone":
    "Asegúrate que el Número de télefono sea un teléfono válido de 10 dígitos.",
  "/zipcode": "El código postal es debe contener 5 dígitos",
};

export async function sendUpsertParticipation(
  payload: UpsertParticipationRequest,
): Promise<
  | {
      success: false;
      error: Error;
    }
  | {
      success: true;
      data: UpsertParticipationResponse;
    }
> {
  const response = await fetch("/api/ofmi/upsertParticipation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 500) {
    return {
      success: false,
      error: new Error("Internal server error"),
    };
  }

  if (response.status !== 201) {
    const data: BadRequestError = await response.json();
    // Try to parse error.
    const errorField = Object.keys(friendlyErrorMap).find((v) =>
      data.message.match(`El campo.*${v} `),
    );
    if (errorField !== undefined) {
      return {
        success: false,
        error: new Error(
          friendlyErrorMap[errorField as keyof typeof friendlyErrorMap],
        ),
      };
    }

    return {
      success: false,
      error: new Error(data.message),
    };
  }

  const data: UpsertParticipationResponse = await response.json();
  return {
    success: true,
    data,
  };
}
