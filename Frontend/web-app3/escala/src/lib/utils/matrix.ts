import { Escala, UsuarioEscala } from '@/core/domain/escala/escala.types';
import { format, eachDayOfInterval } from 'date-fns';

/**
 * Utilitário de Matriz para Grades de Escala
 * Transforma listas em uma matriz [Funcionário][Dia] para acesso O(1) na renderização.
 */
export function createEscalaMatrix(
  usuarios: UsuarioEscala[],
  escalas: Escala[],
  start: Date,
  end: Date
) {
  const days = eachDayOfInterval({ start, end });
  const dayKeys = days.map(day => format(day, 'yyyy-MM-dd'));
  
  // Mapear usuários para índices de linha
  const userMap = new Map<string | number, number>();
  usuarios.forEach((u, i) => userMap.set(u.id, i));

  // Inicializar Matriz (Filas x Colunas)
  const matrix: (Escala | null)[][] = Array.from(
    { length: usuarios.length }, 
    () => Array(days.length).fill(null)
  );

  // Popular Matriz
  escalas.forEach(escala => {
    const userIndex = userMap.get(escala.usuarioId);
    if (userIndex === undefined) return;

    const dateValue = escala.data ?? escala.dataInicio;
    const dateKey = dateValue.split('T')[0];
    const dayIndex = dayKeys.indexOf(dateKey);
    
    if (dayIndex !== -1) {
      matrix[userIndex][dayIndex] = escala;
    }
  });

  return { matrix, days, dayKeys };
}
