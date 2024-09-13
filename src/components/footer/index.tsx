import Image from "next/image";
import JaneStreetImageData from "public/janestreet.svg";
import OmegaUpImageData from "public/omegaup.svg";

const email = "ofmi@omegaup.com";

const socialMediaLinks = {
  facebook: "https://www.facebook.com/ofmi.omegaup",
  instagram: "https://www.instagram.com/ofmi_omegaup",
  linkedin:
    "https://www.linkedin.com/company/olimpiada-femenil-mexicana-de-inform%C3%A1tica-ofmi/",
  twitter: "https://twitter.com/ofmi_omegaup",
};

type SocialMedia = keyof typeof socialMediaLinks;

interface SocialMediaIconProps extends React.SVGAttributes<HTMLOrSVGElement> {
  id: SocialMedia;
}

function SocialMediaIcon({ id, ...props }: SocialMediaIconProps): JSX.Element {
  return (
    <svg {...props}>
      <use href={`/minima-social-icons.svg#${id}`} />
    </svg>
  );
}

export const Footer = (): JSX.Element => {
  return (
    <footer className="mt-auto flex flex-col border-t-2 border-s-stone-300 pt-4">
      <div className="relative mx-auto max-w-3xl px-4 text-center md:px-8">
        <h2 className="mb-4">
          Página oficial de la Olimpiada Femenil Mexicana de Informática.
        </h2>
        <div className="grid items-center md:grid-cols-2 md:gap-6">
          {/* OmegaUp Section */}
          <div className="group relative z-0 mb-5 w-full">
            <a className="inline-block" href="https://omegaup.com">
              <Image
                height={32}
                width={135}
                src={OmegaUpImageData}
                alt="omegaUp"
              />
            </a>
            <p>
              <a
                className="font-medium text-blue-500 hover:text-blue-700 hover:underline"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            </p>
          </div>

          {/* Sponsors Section */}
          <div className="group relative z-0 mb-5 w-full">
            <a className="inline-block" href="https://janestreet.com/">
              <Image
                height={32}
                width={82}
                src={JaneStreetImageData}
                alt="janestreet"
              />
            </a>
            <p>Patrocinador</p>
          </div>
        </div>
        {/* Social Media Section */}
        <div className="group relative z-0 mb-4 w-full">
          <ul className="flex flex-wrap justify-center gap-8">
            {Object.entries(socialMediaLinks).map(([key, url]) => {
              const id = key as SocialMedia;
              return (
                <li key={id}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <SocialMediaIcon
                      className=" h-6 w-6 fill-stone-500"
                      id={id}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
};
