import { OauthProvider } from "@prisma/client";
import { Button } from "@/components/button";
import { DisconnectOauthProviderRequest } from "@/types/oauth.schema";
import { useState } from "react";

function Provider({
  userAuthId,
  name,
  connected,
  redirect_to,
  disabled = false,
  disabledMessage,
}: {
  userAuthId: string;
  name: OauthProvider;
  connected: boolean;
  redirect_to: string;
  disabled?: boolean;
  disabledMessage?: string;
}): JSX.Element {
  const [isConnected, setConnected] = useState(connected);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="mb-4 grid md:grid-cols-2 md:gap-6 items-center">
      <div>
        <p className="font-bold">{name}</p>
        {disabled && disabledMessage && <p className="text-sm text-gray-500">{disabledMessage}</p>}
      </div>
      {isConnected ? (
        <Button
          isLoading={isLoading}
          disabled={isLoading || disabled}
          onClick={async (ev) => {
            ev.preventDefault();
            setIsLoading(true);
            const payload: DisconnectOauthProviderRequest = {
              userAuthId,
              provider: name,
            };
            const response = await fetch("/api/oauth/disconnect", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
            if (response.status === 200) {
              const res = await response.json();
              if (res.success) {
                setConnected(false);
              }
            }
            setIsLoading(false);
          }}
        >
          Disconnect
        </Button>
      ) : (
        <Button disabled={disabled}>
          <a href={disabled ? '#' : redirect_to}>Connect</a>
        </Button>
      )}
    </div>
  );
}

// Receives a list of connected providers
export default function Oauth({
  userAuthId,
  connectedProviders,
  calendlyRedirectTo,
  gCloudRedirectTo,
  mentorshipEnabled,
}: {
  userAuthId: string;
  connectedProviders: Array<OauthProvider>;
  calendlyRedirectTo: string;
  gCloudRedirectTo: string;
  mentorshipEnabled: boolean;
}): JSX.Element {
  const isProviderConnected = (provider: OauthProvider): boolean =>
    connectedProviders.find((v) => v === provider) !== undefined;
  return (
    <div className="mx-auto max-w-3xl px-2 pt-4">
      <Provider
        userAuthId={userAuthId}
        name="CALENDLY"
        connected={isProviderConnected("CALENDLY")}
        redirect_to={calendlyRedirectTo}
        disabled={!mentorshipEnabled}
        disabledMessage="Contacta a los organizadores para habilitar la opción de mentorías"
      />
      <Provider
        userAuthId={userAuthId}
        name="GCLOUD"
        connected={isProviderConnected("GCLOUD")}
        redirect_to={gCloudRedirectTo}
      />
    </div>
  );
}
