import { Type, Static } from "@sinclair/typebox";
import {
  Participation,
  ParticipationRole,
  Prisma,
  SchoolStage,
} from "@prisma/client";
import { countryReg } from "@/lib/validators/address";
import { toISOStringReg } from "@/lib/validators/date";
import { exhaustiveMatchingGuard } from "@/utils";
import { UserInputSchema } from "./user.schema";

export const ParticipationRoleOfString = (
  role: string,
): ParticipationRole | undefined => {
  return role in ParticipationRole
    ? ParticipationRole[role as keyof typeof ParticipationRole]
    : undefined;
};

export const ParticipationRoleName = (role: ParticipationRole): string => {
  switch (role) {
    case "CONTESTANT":
      return "Participante";
    case "VOLUNTEER":
      return "Voluntario";
    default: {
      return exhaustiveMatchingGuard(role);
    }
  }
};

const SchoolStageSchema = Type.Enum(SchoolStage);

export type ContestantParticipationInput = Static<
  typeof ContestantParticipationInputSchema
>;

export const ContestantParticipationInputSchema = Type.Object({
  role: Type.Literal(ParticipationRole.CONTESTANT),
  schoolName: Type.String({ minLength: 1 }),
  schoolStage: SchoolStageSchema,
  schoolGrade: Type.Integer({ minimum: 1 }),
  schoolCountry: Type.String({ pattern: countryReg.toString() }),
  schoolState: Type.String({ minLength: 1 }),
  disqualificationReason: Type.Optional(Type.String({ default: "N/A" })),
});

const VolunteerParticipationInputSchema = Type.Object({
  role: Type.Literal(ParticipationRole.VOLUNTEER),
  educationalLinkageOptIn: Type.Boolean(),
  fundraisingOptIn: Type.Boolean(),
  communityOptIn: Type.Boolean(),
  trainerOptIn: Type.Boolean(),
  problemSetterOptIn: Type.Boolean(),
  mentorOptIn: Type.Boolean(),
});

export type UserParticipation = Static<typeof UserParticipationSchema>;
export const UserParticipationSchema = Type.Union([
  ContestantParticipationInputSchema,
  VolunteerParticipationInputSchema,
]);

export type ParticipationRequestInput = Static<
  typeof ParticipationRequestInputSchema
>;
export const ParticipationRequestInputSchema = Type.Object({
  ofmiEdition: Type.Integer({ minimum: 1 }),
  user: UserInputSchema,
  registeredAt: Type.String({ pattern: toISOStringReg }),
  userParticipation: UserParticipationSchema,
});

export type ParticipationOutput = Static<typeof ParticipationOutputSchema>;
export const ParticipationOutputSchema = Type.Object({
  // input schema of request
  input: ParticipationRequestInputSchema,
  contestantParticipantId: Type.Union([Type.Null(), Type.String()]),
});

export type UpsertParticipationRequest = Static<
  typeof UpsertParticipationRequestSchema
>;
export const UpsertParticipationRequestSchema = Type.Omit(
  ParticipationRequestInputSchema,
  ["registeredAt"],
);

export type ParticipationWithUserOauth = Prisma.ParticipationGetPayload<{
  include: {
    user: {
      include: {
        UserAuth: {
          include: {
            UserOauth: true;
          };
        };
      };
    };
  };
}>;

export interface UpsertParticipationResponse {
  participation: Participation;
}

export const disqualificationReasons: {
  [key: string]: string;
} = {
  NO_ELEGIBLE:
    "No cumples con todos los criterios de eligibilidad señalados en la convocatoria",
  IA: "Durante la competencia, usaste herramientas de Inteligencia Artificial para autocompletar/generar código u obtener la solución a un problema",
  SUMINISTROS_PROHIBIDOS:
    "Durante la competencia, usaste uno o varios suministros que no están explícitamente mencionados en la sección de Suministros de la convocatoria",
  MATERIAL_PROHIBIDO:
    "Durante la competencia, usaste uno o varios materiales que no están explícitamente mencionados en la sección de Material Permitido de la convocatoria",
  IDENTIDAD_NO_VERIFICADA:
    "No se pudo verificar tu identidad con las grabaciones que enviaste",
  MALAS_GRABACIONES:
    "No se pudo verificar que no hayas hecho trampa con las grabaciones que enviaste",
  MULTICUENTAS:
    "Durante la competencia, iniciaste sesión en una cuenta de OmegaUp distinta a la que se te asignó para la competencia",
  COMUNICACION_PROHIBIDA:
    "Durante la competencia, te comunicaste con personas que no son parte del Comité Organizador",
  FALTA_GRABACION: "No subiste tu grabación del día 1 o del día 2",
  MALA_CONDUCTA: "No cumpliste con el Código de Conducta",
} as const;
