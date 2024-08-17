import {
  UpsertParticipationRequest,
  UpsertParticipationResponse,
} from "@/types/participation.schema";
import { BadRequestError } from "@/types/errors";

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
