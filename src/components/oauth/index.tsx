import { OauthProvider } from "@prisma/client";
import { Button } from "@/components/button";
import { DisconnectOauthProviderRequest } from "@/types/oauth.schema";
import { useState } from "react";

function Provider({
  userAuthId,
  name,
  connected,
  redirect_to,
}: {
  userAuthId: string;
  name: OauthProvider;
  connected: boolean;
  redirect_to: string;
}): JSX.Element {
  const [isConnected, setConnected] = useState(connected);
  return (
    <div className="mb-4 grid md:grid-cols-2 md:gap-6">
      {name}
      {isConnected ? (
        <Button
          onClick={async (ev) => {
            ev.preventDefault();
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
          }}
        >
          Disconnect
        </Button>
      ) : (
        <Button>
          <a href={redirect_to}>Connect</a>
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
}: {
  userAuthId: string;
  connectedProviders: Array<OauthProvider>;
  calendlyRedirectTo: string;
  gCloudRedirectTo: string;
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
