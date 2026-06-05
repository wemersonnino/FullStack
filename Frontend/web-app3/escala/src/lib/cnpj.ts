/**
 * Valida um CNPJ (numérico ou alfanumérico).
 * O novo formato de CNPJ alfanumérico (2026) mantém a estrutura XX.XXX.XXX/XXXX-XX
 * mas permite letras nas primeiras 8 posições.
 */
export function isValidCnpj(cnpj: string): boolean {
  if (!cnpj) return false;

  // Remove pontuação mas preserva letras e números
  const cleanCnpj = cnpj.replace(/[^\w]/g, '').toUpperCase();
  
  if (cleanCnpj.length !== 14) return false;

  // Se for puramente numérico, valida se não é uma sequência repetida
  if (/^\d{14}$/.test(cleanCnpj)) {
    if (/^(\d)\1+$/.test(cleanCnpj)) return false;
  }

  // Validação Alfanumérica (Estrutura: 8 alfanum + 4 num + 2 num)
  if (!/^[A-Z0-9]{8}[0-9]{4}[0-9]{2}$/.test(cleanCnpj)) return false;

  // Algoritmo de validação (DV)
  // Caracteres alfanuméricos têm valor decimal = ASCII - 48
  const charToValue = (char: string) => char.charCodeAt(0) - 48;

  const calculateDv = (base: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += charToValue(base[i]) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const dv1 = calculateDv(cleanCnpj.slice(0, 12), weights1);
  const dv2 = calculateDv(cleanCnpj.slice(0, 13), weights2);

  return dv1 === charToValue(cleanCnpj[12]) && dv2 === charToValue(cleanCnpj[13]);
}

/**
 * Máscara para CNPJ (numérico ou alfanumérico)
 * XX.XXX.XXX/XXXX-XX
 */
export function formatCnpj(cnpj: string): string {
  const clean = cnpj.replace(/[^\w]/g, '').toUpperCase().slice(0, 14);
  
  let formatted = clean;
  if (clean.length > 2) formatted = clean.slice(0, 2) + '.' + clean.slice(2);
  if (clean.length > 5) formatted = formatted.slice(0, 6) + '.' + formatted.slice(6);
  if (clean.length > 8) formatted = formatted.slice(0, 10) + '/' + formatted.slice(10);
  if (clean.length > 12) formatted = formatted.slice(0, 15) + '-' + formatted.slice(15);
  
  return formatted;
}
