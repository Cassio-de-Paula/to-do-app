export function validateFutureDate(dateString: string): string | null {
    if (!dateString || dateString.length === 0) return null;

    const inputDate = new Date(dateString);
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate <= today) {
        return "A data precisa ser maior que hoje";
    }

    return null;
}

export function validateUUID(uuid: string): string | null {
    if (!uuid) return "UUID não pode ser vazio";

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(uuid)) {
        return "O valor precisa ser um UUID válido";
    }

    return null;
}

export const validateColor = (input: string) => {
  // Regex: # seguido de exatamente 6 dígitos hexadecimais
  const hexColorRegex = /^#([0-9A-Fa-f]{6})$/;
  
  if (!hexColorRegex.test(input)) return "Campo inválido"

  return null
}