package com.escala.authservice.core.ai.port;

import java.util.Map;

public interface AiProviderPort {
    /**
     * Envia um prompt para o motor de IA e retorna a sugestão/análise.
     * 
     * @param context Contexto dos dados (ex: lista de funcionários disponíveis, turnos vagos)
     * @param instruction O que a IA deve fazer (ex: "Sugira um substituto para o turno X")
     * @return Resposta textual da IA
     */
    String generateResponse(Map<String, Object> context, String instruction);
}
