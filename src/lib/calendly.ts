import type { UserAvailability } from "@/types/mentor.schema";

const CALENDLY_API_BASE_URL = "https://api.calendly.com";

async function getUserUri(token: string): Promise<string> {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await fetch(`${CALENDLY_API_BASE_URL}/users/me`, options);
  if (response.status === 429) {
    throw Error("Calendly RareLimit");
  }
  const json = await response.json();
  if (response.status !== 200) {
    console.error("calendly.getUserUriError", json);
    throw Error("calendly.getUserUriError");
  }
  const uri = json.resource.uri;
  if (!uri || typeof uri !== "string") {
    throw Error("calendly.getUserUriError. Invalid uri");
  }
  return uri;
}

async function getEventUri(
  userUri: string,
  token: string,
): Promise<{ eventUri: string; eventSchedulingUrl: string }> {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const query = new URLSearchParams({
    user: userUri,
    active: "true",
  });

  const response = await fetch(
    `${CALENDLY_API_BASE_URL}/event_types?${query.toString()}`,
    options,
  );
  if (response.status === 429) {
    throw Error("Calendly RareLimit");
  }
  const json = await response.json();
  if (response.status !== 200) {
    console.error("calendly.getEventUri", json);
    throw Error("calendly.getEventUri");
  }
  const event =
    json.collection.length === 1
      ? json.collection[0]
      : json.collection.find(
          (event: { slug: string }) =>
            event.slug.toLowerCase().includes("ofmi") ||
            event.slug.toLowerCase().includes("mentoria"),
        );

  const eventUri = event.uri;
  const eventSchedulingUrl = event.scheduling_url;
  if (!eventUri || typeof eventUri !== "string") {
    throw Error("calendly.getEventUri. Invalid uri");
  }
  if (!eventSchedulingUrl || typeof eventSchedulingUrl !== "string") {
    throw Error("calendly.getEventUri. Invalid scheduling_url");
  }
  return {
    eventUri,
    eventSchedulingUrl,
  };
}

async function getAvailableStartTimes({
  eventUri,
  startTime,
  endTime,
  token,
}: {
  eventUri: string;
  token: string;
  startTime: Date;
  endTime: Date;
}): Promise<Array<string>> {
  if (endTime.getTime() - startTime.getTime() > 7 * 24 * 60 * 60 * 1000) {
    console.error(
      "calendly.getAvailableStartTimes. Calendly do not support range more than 7 days",
    );
    throw Error("calendly.getAvailableStartTimes");
  }
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const query = new URLSearchParams({
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    event_type: eventUri,
  });

  const response = await fetch(
    `${CALENDLY_API_BASE_URL}/event_type_available_times?${query.toString()}`,
    options,
  );
  if (response.status === 429) {
    throw Error("Calendly RareLimit");
  }
  const json = await response.json();
  if (response.status !== 200) {
    console.error("calendly.getAvailableStartTimes", json);
    throw Error("calendly.getAvailableStartTimes");
  }

  return json.collection.map(({ start_time }: { start_time: string }) => {
    if (!start_time || typeof start_time !== "string") {
      console.error("calendly.getAvailableStartTimes", json);
      throw Error("calendly.getAvailableStartTimes. Invalid start_time");
    }
    return new Date(start_time).toISOString();
  });
}

export async function getAvailabilities({
  token,
  startTime,
  endTime,
}: {
  token: string;
  startTime: Date;
  endTime: Date;
}): Promise<Omit<UserAvailability, "firstName" | "lastName"> | null> {
  try {
    // Get the user uri
    const userUri = await getUserUri(token);
    // Find the event url & uri
    const event = await getEventUri(userUri, token);
    // Get available start Times
    const availableStartTimes = await getAvailableStartTimes({
      eventUri: event.eventUri,
      startTime,
      endTime,
      token,
    });
    return {
      calendlySchedulingUrl: event.eventSchedulingUrl,
      availableStartTimes,
    };
  } catch (e) {
    console.error("Error getting availabilities...", e);
    return null;
  }
}
