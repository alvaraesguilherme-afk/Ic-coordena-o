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

export function nomeReduzido(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return partes.slice(0, 2).join(" ");
}
