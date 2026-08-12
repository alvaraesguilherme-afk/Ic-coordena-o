export function roleLabel(user: { role: "LIDER" | "MEMBRO" | "PASTOR"; isAdmin?: boolean }) {
  if (user.role === "PASTOR") return "Pastor";
  if (user.isAdmin) return "Administrador";
  return user.role === "LIDER" ? "Líder" : "Membro";
}

export function nomeReduzido(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return partes.slice(0, 2).join(" ");
}
