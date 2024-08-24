import { OauthProvider } from "@prisma/client";
import { Button } from "@/components/button";

function Provider({
  name,
  connected,
  redirect,
}: {
  name: OauthProvider;
  connected: boolean;
  redirect: string;
}): JSX.Element {
  return (
    <div className="grid md:grid-cols-2 md:gap-6">
      {name}
      {connected ? (
        <Button>Disconnect</Button>
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
  connectedProviders,
  calendlyRedirect,
}: {
  connectedProviders: Array<OauthProvider>;
  calendlyRedirect: string;
}): JSX.Element {
  const isProviderConnected = (provider: OauthProvider): boolean =>
    connectedProviders.find((v) => v === provider) !== undefined;
  return (
    <div className="mx-auto max-w-3xl px-2 pt-4">
      {/* Calendly */}
      <Provider
        name="CALENDLY"
        connected={isProviderConnected("CALENDLY")}
        redirect={calendlyRedirect}
      />
    </div>
  );
}
