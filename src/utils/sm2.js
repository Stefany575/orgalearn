/**
 * Lògica Repetição Espaçada (SM-2)
 * Implementação da regra matemática do Algoritmo SuperMemo-2 (SM-2)
 * @param {number} quality Nota de autoavaliação (0 a 5)
 * @param {number} repetitions Quantidade de repetições bem-sucedidas anteriores
 * @param {number} previousInterval Intervalo anterior em dias
 * @param {number} previousEF Fator de facilidade (Easiness Factor) anterior
 */
export function calculateSM2(quality, repetitions = 0, previousInterval = 0, previousEF = 2.5) {
  // Calculo do Fator de Facilidade
  let nextEF = previousEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEF < 1.3) {
    nextEF = 1.3; // Limite mínimo estabelecido pelo algoritmo SM-2
  }

  let nextRepetitions = repetitions;
  let nextInterval = 0;

  //Definição do Próximo Intervalo
  if (quality < 3) {
    nextRepetitions = 0;
    nextInterval = 1;
  } else {
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(previousInterval * nextEF);
    }
    nextRepetitions += 1;
  }

  //Retorno dos dados obtidos
  return {
    interval: nextInterval,
    repetitions: nextRepetitions,
    easinessFactor: parseFloat(nextEF.toFixed(2))
  };
}