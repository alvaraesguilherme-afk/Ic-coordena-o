export function roleLabel(user: { role: "LIDER" | "MEMBRO"; isAdmin?: boolean }) {
  if (user.isAdmin) return "Administrador";
  return user.role === "LIDER" ? "Líder" : "Membro";
}
