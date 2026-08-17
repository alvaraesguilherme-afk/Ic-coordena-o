// "Líder de rede" (a única pessoa por rede em Rede.liderNome) aparece como
// "Supervisor" — quem lidera só uma IC continua "Líder". liderDeRede é calculado
// por quem chama (comparando o nome do usuário com Rede.liderNome), roleLabel só
// decide o texto.
export function roleLabel(user: {
  role: "LIDER" | "MEMBRO" | "PASTOR";
  isAdmin?: boolean;
  liderDeRede?: boolean;
}) {
  if (user.role === "PASTOR") return "Pastor";
  if (user.isAdmin) return "Administrador";
  if (user.role === "LIDER") return user.liderDeRede ? "Supervisor" : "Líder";
  return "Membro";
}

// Cores leves (fundo translúcido + texto na mesma cor) pro badge de papel —
// mesma entrada de roleLabel, só decide a cor em vez do texto. Membro fica
// neutro (cinza), Líder ganha um azul suave, Supervisor o amarelo já usado
// em destaques do app.
export function roleBadgeClass(user: {
  role: "LIDER" | "MEMBRO" | "PASTOR";
  isAdmin?: boolean;
  liderDeRede?: boolean;
}) {
  if (user.role === "LIDER") {
    return user.liderDeRede ? "bg-yellow-400/15 text-yellow-300" : "bg-blue-400/15 text-blue-300";
  }
  return "bg-white/10 text-white/70";
}

export function nomeReduzido(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return partes.slice(0, 2).join(" ");
}

// Rede.liderNome é texto livre (não uma referência de verdade a User.id), então
// comparar com User.name precisa ignorar maiúsculas/minúsculas e espaços nas
// pontas — já apareceu gente digitada como "fulana da silva" enquanto o cadastro
// tinha "Fulana da Silva", o que fazia a comparação exata falhar silenciosamente.
export function nomesIguais(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

const CONECTIVOS_NOME = new Set(["de", "da", "do", "das", "dos", "e"]);

// Normaliza a capitalização de um nome digitado de qualquer jeito ("paula DOS reis
// costa", "MARIA DA SILVA") pro padrão de nome próprio em português — primeira
// letra maiúscula em cada palavra, exceto conectivos comuns (de/da/do/das/dos/e).
// Usado no cadastro e na edição de perfil pra essa inconsistência não voltar a
// acontecer (ver nomesIguais acima, sobre o motivo).
export function capitalizarNome(nome: string) {
  return nome
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((palavra, i) => {
      const minuscula = palavra.toLocaleLowerCase("pt-BR");
      if (i > 0 && CONECTIVOS_NOME.has(minuscula)) return minuscula;
      return minuscula.charAt(0).toLocaleUpperCase("pt-BR") + minuscula.slice(1);
    })
    .join(" ");
}
