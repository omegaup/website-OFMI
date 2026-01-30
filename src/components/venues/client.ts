import { BadRequestError } from "@/types/errors";
import {
  CreateVenueQuotaInput,
  CreateVenueQuotaOutput,
} from "@/types/venue.schema";

export async function sendCreateUpdateVenueQuota(
  payload: CreateVenueQuotaInput,
): Promise<
  | {
      success: false;
      error: Error;
    }
  | {
      success: CreateVenueQuotaOutput;
    }
> {
  const response = await fetch("/api/venues/addVenueQuota", {
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

  const data: CreateVenueQuotaOutput = await response.json();

  return {
    success: data,
  };
}
