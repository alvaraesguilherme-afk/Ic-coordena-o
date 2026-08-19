export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Números são salvos sem código de país (formatPhone só formata DDD + número
// nacional) — wa.me exige o código do Brasil na frente.
export function whatsappLink(phone: string) {
  return `https://wa.me/55${phone.replace(/\D/g, "")}`;
}
