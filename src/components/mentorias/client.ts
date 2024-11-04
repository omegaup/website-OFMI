import { ScheduleMentoriaRequest } from "@/types/mentorias.schema";

export async function registerMentoria(
  payload: ScheduleMentoriaRequest,
): Promise<void> {
  await fetch("/api/mentoria/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
