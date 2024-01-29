import { VerifyEmailRequest, VerifyEmailResponse } from "@/types/auth.schema";
import { BadRequestError } from "@/types/errors";

export async function resendEmailVerification({
  email,
}: {
  email: string;
}): Promise<
  | {
      success: false;
      error: Error;
    }
  | {
      success: true;
      data: VerifyEmailResponse;
    }
> {
  const payload: VerifyEmailRequest = {
    email,
  };

  const response = await fetch("/api/user/resendEmailVerification", {
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

  if (response.status !== 200) {
    const data: BadRequestError = await response.json();
    return {
      success: false,
      error: new Error(data.message),
    };
  }

  const data: VerifyEmailResponse = await response.json();
  return {
    success: true,
    data,
  };
}
