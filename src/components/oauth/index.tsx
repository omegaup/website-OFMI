import { OauthProvider } from "@prisma/client";
import { Button } from "@/components/button";
import { DisconnectOauthProviderRequest } from "@/types/oauth.schema";
import { useState } from "react";

function Provider({
  userAuthId,
  name,
  connected,
  redirect,
}: {
  userAuthId: string;
  name: OauthProvider;
  connected: boolean;
  redirect: string;
}): JSX.Element {
  const [isConnected, setConnected] = useState(connected);
  return (
    <div className="grid md:grid-cols-2 md:gap-6">
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
          <a href={redirect}>Connect</a>
        </Button>
      )}
    </div>
  );
}

// Receives a list of connected providers
export default function Oauth({
  userAuthId,
  connectedProviders,
  calendlyRedirect,
}: {
  userAuthId: string;
  connectedProviders: Array<OauthProvider>;
  calendlyRedirect: string;
}): JSX.Element {
  const isProviderConnected = (provider: OauthProvider): boolean =>
    connectedProviders.find((v) => v === provider) !== undefined;
  return (
    <div className="mx-auto max-w-3xl px-2 pt-4">
      {/* Calendly */}
      <Provider
        userAuthId={userAuthId}
        name="CALENDLY"
        connected={isProviderConnected("CALENDLY")}
        redirect={calendlyRedirect}
      />
    </div>
  );
}
