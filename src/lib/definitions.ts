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

export const MembroFormSchema = z.object({
  name: z.string().min(2, { error: "Nome completo deve ter ao menos 2 caracteres." }).trim(),
  email: z.email({ error: "Informe um e-mail válido." }).trim(),
  password: z
    .string()
    .min(8, { error: "Senha deve ter ao menos 8 caracteres." })
    .regex(/[a-zA-Z]/, { error: "Senha deve conter ao menos uma letra." })
    .regex(/[0-9]/, { error: "Senha deve conter ao menos um número." }),
  birthDate: z.string().min(1, { error: "Informe a data de nascimento." }),
  phone: z.string().min(8, { error: "Informe um telefone válido." }).trim(),
  address: z.string().min(3, { error: "Informe o endereço." }).trim(),
  role: z.enum(["LIDER", "MEMBRO"], { error: "Papel inválido." }),
});

export type MembroFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        birthDate?: string[];
        phone?: string[];
        address?: string[];
        role?: string[];
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
    birthDate: z.string().min(1, { error: "Informe a data de nascimento." }),
    phone: z.string().min(8, { error: "Informe um telefone válido." }).trim(),
    address: z.string().min(3, { error: "Informe o endereço." }).trim(),
    role: z.enum(["LIDER", "MEMBRO"], { error: "Escolha se você é líder ou membro." }),
    inviteCode: z.string().trim().optional(),
  })
  .refine((data) => data.role !== "LIDER" || !!data.inviteCode, {
    error: "Informe o código de convite para se cadastrar como líder.",
    path: ["inviteCode"],
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
        avatar?: string[];
      };
      message?: string;
    }
  | undefined;

export const ReuniaoFormSchema = z.object({
  titulo: z.string().min(2, { error: "Título deve ter ao menos 2 caracteres." }).trim(),
  data: z.string().min(1, { error: "Informe a data e hora da reunião." }),
  descricao: z.string().trim().optional(),
});

export type ReuniaoFormState =
  | {
      errors?: {
        titulo?: string[];
        data?: string[];
        descricao?: string[];
      };
      message?: string;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  role: "LIDER" | "MEMBRO";
  expiresAt: Date;
};
