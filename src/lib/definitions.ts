import * as z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ error: "Informe um e-mail válido." }).trim(),
  password: z.string().min(1, { error: "Informe a senha." }),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const SignupFormSchema = z
  .object({
    name: z.string().min(2, { error: "Nome completo deve ter ao menos 2 caracteres." }).trim(),
    email: z.email({ error: "Informe um e-mail válido." }).trim(),
    password: z
      .string()
      .min(8, { error: "Senha deve ter ao menos 8 caracteres." })
      .regex(/[a-zA-Z]/, { error: "Senha deve conter ao menos uma letra." })
      .regex(/[0-9]/, { error: "Senha deve conter ao menos um número." }),
    birthDate: z.string().trim().min(1, { error: "Informe a data de nascimento." }),
    phone: z.string().trim().nullish(),
    address: z.string().trim().nullish(),
    role: z.enum(["LIDER", "MEMBRO", "PASTOR"], { error: "Escolha seu perfil." }),
    inviteCode: z.string().trim().nullish(),
    pastorCode: z.string().trim().nullish(),
  })
  .refine((data) => data.role !== "LIDER" || !!data.inviteCode, {
    error: "Informe o código de convite para se cadastrar como líder.",
    path: ["inviteCode"],
  })
  .refine((data) => data.role !== "PASTOR" || !!data.pastorCode, {
    error: "Informe o código de pastor.",
    path: ["pastorCode"],
  })
  .refine((data) => data.role === "PASTOR" || (!!data.phone && data.phone.length >= 8), {
    error: "Informe um telefone válido.",
    path: ["phone"],
  })
  .refine((data) => data.role === "PASTOR" || (!!data.address && data.address.length >= 3), {
    error: "Informe o endereço.",
    path: ["address"],
  });

export type SignupFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        birthDate?: string[];
        phone?: string[];
        address?: string[];
        role?: string[];
        inviteCode?: string[];
        pastorCode?: string[];
        avatar?: string[];
      };
      message?: string;
    }
  | undefined;

export const RedeFormSchema = z.object({
  nome: z.string().min(2, { error: "Nome deve ter ao menos 2 caracteres." }).trim(),
  liderNome: z.string().trim().optional(),
});

export type RedeFormState =
  | {
      errors?: {
        nome?: string[];
        liderNome?: string[];
      };
      message?: string;
    }
  | undefined;

export const IgrejaFormSchema = z.object({
  nome: z.string().min(2, { error: "Nome deve ter ao menos 2 caracteres." }).trim(),
  endereco: z.string().trim().optional(),
  liderId: z.string().min(1, { error: "Selecione o líder responsável." }),
  diaSemana: z.enum(["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"], {
    error: "Escolha o dia da semana.",
  }),
  horario: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Informe um horário válido." }),
  redeId: z.string().min(1, { error: "Rede inválida." }),
});

export type IgrejaFormState =
  | {
      errors?: {
        nome?: string[];
        endereco?: string[];
        liderId?: string[];
        diaSemana?: string[];
        horario?: string[];
        redeId?: string[];
      };
      message?: string;
    }
  | undefined;

export const EscalaFormSchema = z.object({
  tipo: z.enum(["INTERCESSAO", "INTEGRACAO", "MIDIA"], { error: "Escolha o tipo de escala." }),
  data: z.string().min(1, { error: "Informe a data e hora da escala." }),
  observacao: z.string().trim().optional(),
  participantes: z
    .array(z.string())
    .min(1, { error: "Selecione ao menos um participante." }),
});

export type EscalaFormState =
  | {
      errors?: {
        tipo?: string[];
        data?: string[];
        observacao?: string[];
        participantes?: string[];
      };
      message?: string;
    }
  | undefined;

export const AvisoFormSchema = z.object({
  titulo: z.string().min(2, { error: "Título deve ter ao menos 2 caracteres." }).trim(),
  conteudo: z.string().min(2, { error: "Escreva o conteúdo do aviso." }).trim(),
  dataEvento: z.string().trim().optional(),
  local: z.string().trim().optional(),
});

export type AvisoFormState =
  | {
      errors?: {
        titulo?: string[];
        conteudo?: string[];
        dataEvento?: string[];
        local?: string[];
      };
      message?: string;
    }
  | undefined;

export const OnboardingMembroFormSchema = z.object({
  redeId: z.string().min(1, { error: "Selecione a sua rede." }),
  igrejaId: z.string().min(1, { error: "Selecione a sua IC." }),
});

export type OnboardingMembroFormState =
  | {
      errors?: {
        redeId?: string[];
        igrejaId?: string[];
      };
      message?: string;
    }
  | undefined;

export const OnboardingLiderFormSchema = z
  .object({
    liderDeRede: z.enum(["sim", "nao"], { error: "Responda se você é líder de uma rede." }),
    redeId: z.string().trim().optional(),
  })
  .refine((data) => !!data.redeId, {
    error: "Selecione a rede.",
    path: ["redeId"],
  });

export type OnboardingLiderFormState =
  | {
      errors?: {
        liderDeRede?: string[];
        redeId?: string[];
      };
      message?: string;
    }
  | undefined;

export const EditPerfilFormSchema = z.object({
  name: z.string().min(2, { error: "Nome completo deve ter ao menos 2 caracteres." }).trim(),
});

export type EditPerfilFormState =
  | {
      errors?: {
        name?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export const EventoFormSchema = z.object({
  titulo: z.string().min(2, { error: "Dê um nome pro evento." }).trim(),
  data: z.string().min(1, { error: "Escolha a data." }),
});

export type EventoFormState =
  | {
      errors?: {
        titulo?: string[];
        data?: string[];
      };
      message?: string;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  role: "LIDER" | "MEMBRO" | "PASTOR";
  expiresAt: Date;
};
