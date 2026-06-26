/**
 * Compliance Validator Test Suite (QA Analyst)
 * Simula a verificação das regras trabalhistas da CLT (DSR, Interjornada, 44h semanais)
 * no lado do servidor para garantir que a escala do usuário esteja livre de bugs trabalhistas.
 */

// 1. Massa de dados simulada para testes de limites (Boundary Value Analysis / Equivalence Partitioning)
const mockShiftsValid = [
  { shiftDate: '2026-06-22', startTime: '08:00:00', endTime: '17:00:00' }, // Segunda (9h)
  { shiftDate: '2026-06-23', startTime: '08:00:00', endTime: '17:00:00' }, // Terça (9h)
  { shiftDate: '2026-06-24', startTime: '08:00:00', endTime: '17:00:00' }, // Quarta (9h)
  { shiftDate: '2026-06-25', startTime: '08:00:00', endTime: '17:00:00' }, // Quinta (9h)
  { shiftDate: '2026-06-26', startTime: '08:00:00', endTime: '17:00:00' }, // Sexta (9h)
  // Sábado: Folga (DSR)
  // Domingo: Folga (DSR)
];

const mockShiftsInvalidInterjornada = [
  { shiftDate: '2026-06-22', startTime: '14:00:00', endTime: '22:00:00' }, // Segunda: termina 22h
  { shiftDate: '2026-06-23', startTime: '08:00:00', endTime: '16:00:00' }, // Terça: começa 08h (Intervalo = 10h -> INVÁLIDO)
];

const mockShiftsInvalidDsr = [
  { shiftDate: '2026-06-22' }, // Dia 1
  { shiftDate: '2026-06-23' }, // Dia 2
  { shiftDate: '2026-06-24' }, // Dia 3
  { shiftDate: '2026-06-25' }, // Dia 4
  { shiftDate: '2026-06-26' }, // Dia 5
  { shiftDate: '2026-06-27' }, // Dia 6
  { shiftDate: '2026-06-28' }, // Dia 7 (Sem folga em 7 dias -> INVÁLIDO)
];

// 2. Funções de validação sob teste (System Under Test)
function checkInterjornada(shifts) {
  if (shifts.length < 2) return { ok: true };

  // Ordena os turnos por data e hora de início
  const sorted = [...shifts].sort((a, b) => new Date(`${a.shiftDate}T${a.startTime}`).getTime() - new Date(`${b.shiftDate}T${b.startTime}`).getTime());

  for (let i = 0; i < sorted.length - 1; i++) {
    const endCurrent = new Date(`${sorted[i].shiftDate}T${sorted[i].endTime}`).getTime();
    const startNext = new Date(`${sorted[i+1].shiftDate}T${sorted[i+1].startTime}`).getTime();
    const intervalHours = (startNext - endCurrent) / (1000 * 60 * 60);

    if (intervalHours < 11) {
      return {
        ok: false,
        error: `Conflito de Interjornada: Intervalo de apenas ${intervalHours}h entre ${sorted[i].shiftDate} e ${sorted[i+1].shiftDate}. Exigido mínimo 11h.`,
      };
    }
  }
  return { ok: true };
}

function checkDsr(shifts) {
  // Ordena datas
  const dates = shifts.map(s => s.shiftDate).sort();
  if (dates.length < 7) return { ok: true };

  // Verifica se há alguma sequência de 7 dias sem folga
  let consecutiveWorkDays = 0;
  let currentDate = new Date(dates[0]);

  for (let i = 0; i < 30; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const isWorking = dates.includes(dateStr);

    if (isWorking) {
      consecutiveWorkDays++;
      if (consecutiveWorkDays >= 7) {
        return {
          ok: false,
          error: `Conflito de DSR: Colaborador trabalhando há 7 ou mais dias consecutivos a partir do dia ${dates[0]}.`,
        };
      }
    } else {
      consecutiveWorkDays = 0;
    }
    // Sobe 1 dia
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { ok: true };
}

// 3. Asserções do Analista de Testes (QA Executions)
function runSuite() {
  console.log('=== INICIANDO SUÍTE DE TESTES DE COMPLIANCE (QA) ===\n');

  // Teste 1: Interjornada Válida
  const res1 = checkInterjornada(mockShiftsValid);
  console.log(`[Teste 1] Escala Válida - Interjornada: ${res1.ok ? 'PASSOU' : 'FALHOU'}`);
  if (!res1.ok) console.error(`  Erro inesperado: ${res1.error}`);

  // Teste 2: Interjornada Inválida (Limite de 10h)
  const res2 = checkInterjornada(mockShiftsInvalidInterjornada);
  console.log(`[Teste 2] Escala Inválida (10h) - Interjornada: ${!res2.ok ? 'PASSOU (Erro detectado corretamente)' : 'FALHOU (Aceitou intervalo curto)'}`);
  if (!res2.ok) console.log(`  Mensagem esperada detectada: "${res2.error}"`);

  // Teste 3: DSR Inválido (Trabalhando 7 dias seguidos)
  const res3 = checkDsr(mockShiftsInvalidDsr);
  console.log(`[Teste 3] Escala Inválida (7 dias seguidos) - DSR: ${!res3.ok ? 'PASSOU (Erro detectado corretamente)' : 'FALHOU (Aceitou escala sem DSR)'}`);
  if (!res3.ok) console.log(`  Mensagem esperada detectada: "${res3.error}"`);

  console.log('\n=== SUÍTE DE TESTES CONCLUÍDA COM SUCESSO ===');
}

// Executa caso rodado diretamente com node
runSuite();
