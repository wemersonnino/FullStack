# Analise de materiais externos, planilha e oportunidades de produto

Data: 2026-06-26.

## Objetivo

Analisar a documentacao atual do projeto, os documentos de teste e os materiais locais em `C:\Users\wemersonpereira.bhs\Downloads` para identificar melhorias de produto, novas features e novas paginas para a aplicacao Escala.

Materiais solicitados:

- `Copy of Escala - Planilha de escala de trabalho.xlsx`
- `EscalasDeTrabalho_Escala_Convenia.pdf`
- `1759528667138Guia20escala20plantA3o%20hospitalar.pdf`
- `1759527672660DimensionamentoC3%A1tico.pdf`
- `1759527283207Guia20Banco20Horas.pdf`
- `Produtividade-na-saude-Ebook-Escala.pdf`
- `Escala-e-Einstein-cases.pdf`
- `Gestao-de-horas.pdf`
- `[Template] Por que otimizar a gestão de escalas.pptx`
- `Resultados-ROI-Escala-em-hospitais.pdf`
- `Como-transformamos-a-gestao-de-escalas-do-Einstein.pdf`

Materiais web adicionados em 2026-06-26:

- `https://pergamum.unoesc.edu.br/pergamumweb/download/4A03B45D2D765CD6E063021010AC485B.pdf`
- `https://unisenaiprperiodicos.com.br/index.php/inova/article/view/779/741`
- `https://www.tcconline.lapinf.ufn.edu.br/media/midias/Daniel_Cielo.pdf`
- `https://www.monografias.ufop.br/bitstream/35400000/6044/9/MONOGRAFIA_IntervaloIntrajornadaModalidade.pdf`

## Limites da extracao

A planilha `.xlsx` e a apresentacao `.pptx` foram extraidas com sucesso via leitura OOXML.

Os PDFs tiveram extracao parcial neste ambiente:

- Nao havia `pdftotext`, LibreOffice, `mutool`, `qpdf`, `PyPDF2`, `pypdf`, `fitz` ou `python-pptx/openpyxl` instalados.
- A tentativa por `strings` retornou essencialmente objetos internos do PDF, sem texto util.
- A tentativa via Microsoft Word/PowerShell ficou presa na conversao e foi interrompida para nao deixar processo invisivel ativo.
- O PDF `EscalasDeTrabalho_Escala_Convenia.pdf` teve texto parcialmente recuperado por conversao via Word antes da interrupcao. A formatacao ficou degradada, mas o conteudo central ficou legivel.

Assim, as conclusoes detalhadas abaixo usam como fonte confiavel a planilha, o PPTX, a documentacao do projeto e o conteudo parcialmente extraido de `EscalasDeTrabalho_Escala_Convenia.pdf`. Os demais PDFs entram como direcionadores tematicos pelos seus titulos: plantao hospitalar, dimensionamento, banco de horas, produtividade em saude, cases Einstein, gestao de horas e ROI hospitalar. Qualquer detalhe especifico desses PDFs deve ser reavaliado quando houver extrator/OCR disponivel.

Para os materiais web adicionais:

- O PDF da Unoesc foi baixado e convertido para texto via Microsoft Word, pois o site exigiu ignorar validacao TLS local.
- O artigo do periodico Inova abriu inicialmente como HTML com visualizador; o PDF real foi baixado pelo endpoint de download indicado no proprio HTML e convertido para texto.
- Os PDFs `Daniel_Cielo.pdf` e `MONOGRAFIA_IntervaloIntrajornadaModalidade.pdf` foram acessados pelo navegador com texto extraivel.
- As conclusoes abaixo sao analise de produto. Regras trabalhistas devem ser validadas juridicamente antes de virarem bloqueios automaticos.

## Documentacao interna analisada

Documentos principais considerados:

- `docs/observabilidade-testes-carga-jmeter.md`
- `docs/arquitetura-nuvem-aws-azure-producao.md`
- `docs/plano-implementacao-gestao-mensal-inteligente-escalas.md`
- `docs/okr.md`
- `docs/roadmap.md`
- `docs/Analise-Produto-Arquitetura-Concorrencia-Oceano-Azul.md`
- `docs/analise-seguranca-dados-produto-2026.md`
- `docs/Regras-de-Negocio.md`
- `docs/Requisitos.md`
- `docs/Arquitetura/*`
- `docs/frontend-backend-route-coverage.md`
- `docs/api/swagger-openapi.md`

Conclusao da documentacao atual:

- A direcao central esta correta: escala mensal correta para PMEs, com templates, feriados, contadores, alertas e publicacao auditavel.
- O roadmap ja cobre 5x2, 6x1, 12x36, feriados, legendas, banco de horas, ponto web, dimensionamento e IA.
- A oportunidade agora e transformar esses itens em experiencias de produto mais guiadas, importaveis, demonstraveis e vendaveis.
- Os testes de carga indicam que paginas/features novas devem nascer com paginacao, DTOs, cache e observabilidade, principalmente dashboards e relatorios.

## Aprendizados da planilha

### Estrutura das abas

A planilha possui:

| Aba | Papel |
| --- | --- |
| `Bem-vindo!` | Onboarding, instrucoes e pitch da solucao. |
| `Colaboradores` | Cadastro base de nome, cargo e carga horaria diaria decimal. |
| `Conversão` | Conversao de horas/minutos para decimal. |
| `Planilha` | Grade mensal principal com formulas, feriados e legendas. |
| `Template - 6x1` | Exemplo preenchido para 6x1. |
| `Template - 5x2` | Exemplo preenchido para 5x2. |
| `Template - 12x36` | Exemplo preenchido para 12x36. |
| `Escala Jornadas` | Pitch de funcionalidades que a planilha nao cobre. |
| `Conteúdos sobre escala` | Conteudos e calculadoras. |

### Campos importantes

`Colaboradores`:

- Nome completo.
- Cargo.
- Carga horaria diaria em decimal.

Isso confirma que o onboarding do produto deve aceitar uma entrada simples, parecida com planilha, antes de pedir estrutura organizacional mais sofisticada.

### Formula de conversao de jornada

A aba `Conversão` usa:

```text
horas_decimais = horas + (minutos * 0,0166666666666667)
```

Equivalente:

```text
horas_decimais = horas + minutos / 60
```

Exemplos extraidos:

| Horas | Minutos | Decimal |
| ---: | ---: | ---: |
| 8 | 48 | 8,8 |
| 7 | 20 | 7,333333333 |
| 8 | 30 | 8,5 |
| 8 | 12 | 8,2 |
| 5 | 30 | 5,5 |
| 6 | 15 | 6,25 |

Feature recomendada: criar um componente de conversao de jornada em cadastro de colaborador, templates e banco de horas. O usuario deve poder digitar `7h20`, `07:20`, `7,33` ou `7.33`, e o sistema normaliza.

### Formula de calendario mensal

A aba `Planilha` gera o primeiro dia do mes com:

```text
DATE(ano, MATCH(mes, lista_de_meses), 1)
```

Depois preenche os proximos dias ate o fim do mes com:

```text
IF(data_anterior + 1 <= EOMONTH(primeiro_dia, 0), data_anterior + 1, "")
```

E gera abreviatura do dia da semana:

```text
UPPER(LEFT(TEXT(data, "ddd"), 1))
```

Feature recomendada: manter calendario mensal gerado exclusivamente no backend, retornando `date`, `dayOfWeek`, `weekend`, `holiday`, `holidayDescription`, `shiftCode`, `legendImpact` e `warnings`.

### Busca de colaborador e carga

A planilha usa `VLOOKUP` para preencher cargo e carga horaria diaria:

```text
VLOOKUP(nome, Colaboradores!A:C, 2, FALSE)
VLOOKUP(nome, Colaboradores!A:C, 3, FALSE)
```

No produto isso deve virar selecao por colaborador/id, nao por nome. O importador pode aceitar nome, mas deve resolver duplicidades antes de salvar.

### Contadores mensais

A planilha calcula:

- Dias trabalhados: `COUNTIF` nas siglas trabalhadas.
- Dias ausentes: `COUNTIF` nas siglas ausentes.
- Horas de trabalho: `carga_horaria_diaria * dias_trabalhados`.

Formula central:

```text
dias_trabalhados = count(codigos_linha in legendas_trabalhadas)
dias_ausentes = count(codigos_linha in legendas_ausentes)
horas_previstas = carga_diaria_decimal * dias_trabalhados
```

No produto, esse calculo deve evoluir para:

- horas previstas por turno;
- horas realizadas via ponto;
- saldo previsto;
- banco de horas;
- horas extras;
- feriados trabalhados;
- domingos/fins de semana trabalhados;
- DSR;
- dias consecutivos.

### Legendas

Legendas extraidas:

Trabalhadas:

- `T`: Trabalho.
- `Cr`: Curso.
- `Ot`: Outros, contar como dia trabalhado.

Ausencias:

- `F`: Folga.
- `D`: Descanso, visto no template 12x36.
- `Fe`: Ferias.
- `Oa`: Outros, contar como dia ausente.

A documentacao interna ja amplia isso para:

- `At`: Atestado.
- `Fa`: Falta.
- `Tr`: Treinamento.

Feature recomendada: legenda configuravel por tenant com impacto em:

- dia trabalhado;
- dia ausente;
- horas previstas;
- banco de horas;
- folha;
- feriado;
- alerta;
- cor;
- permissao de uso por cargo/setor/template.

### Feriados

A planilha tem tabela de feriados por data e descricao, e destaca:

- Final de semana.
- Feriado.

Feature recomendada:

- CRUD de feriados por tenant/unidade.
- Importacao inicial por pais/UF/municipio.
- Feriado customizado.
- Impacto em remuneracao, alertas e relatorios.
- Indicador visual na grade mensal.

### Funcionalidades vendidas pela propria planilha

A aba principal cita como funcionalidades extras:

- Verificar infracoes.
- Sorteador de folgas.
- Envio de notificacoes.
- Check-in e check-out.
- Trocas automaticas.

A aba `Escala Jornadas` reforca:

- montar escalas com agilidade;
- notificar profissionais sobre publicacoes e alteracoes;
- relatorios com historico de horas trabalhadas e trocas;
- check-in/check-out;
- alertas de limites trabalhistas;
- trocas pelo sistema;
- escala sempre atualizada via web/app;
- apoio na distribuicao de folgas com sorteador e assistente automatico;
- reducao de tempo de montagem de escala de dias para menos de uma hora, como argumento comercial.

Isso confirma que a experiencia deve ir alem da grade: o valor percebido esta em automacao, comunicacao, conformidade e relatorios.

## Aprendizados do PDF de tipos de escala

O PDF `EscalasDeTrabalho_Escala_Convenia.pdf` reforca que a aplicacao precisa tratar escala como regra operacional e trabalhista, nao apenas como calendario.

Pontos relevantes recuperados:

- A carga horaria semanal maxima geral citada e de 44 horas.
- O descanso semanal remunerado deve ser observado, preferencialmente aos domingos.
- Trabalho em domingos e feriados exige atencao a revezamento, compensacao, remuneracao e regras coletivas.
- Acordos e convencoes coletivas podem alterar ou detalhar requisitos por categoria.
- A montagem correta deve considerar quantidade de pessoas, turnos, inicio/fim da jornada, intervalos, descanso e demanda operacional.

Tipos de escala citados:

- `4x2`: 4 dias de trabalho e 2 de descanso; comum com jornadas de 6 horas; pode demandar acordo coletivo ou individual conforme o caso.
- `5x2`: 5 dias de trabalho e 2 de descanso; aderente ao padrao comercial; pode usar jornada de 8h48 como compensacao semanal.
- `6x1`: 6 dias de trabalho e 1 de descanso; exige distribuir 44 horas semanais, com exemplo de 7h20 por dia ou 8h de segunda a sexta e 4h no sabado.
- `6x2`: 6 dias de trabalho e 2 de descanso; funciona por revezamento para intercalar domingos trabalhados.
- `12x36`: 12 horas de trabalho e 36 de descanso; usada em operacoes 24/7 e normalmente amparada por acordo coletivo ou contrato individual.
- `Escala espanhola`: 40 horas em uma semana e 48 horas na semana seguinte, normalmente dependente de acordo ou convencao coletiva.
- `24x48`: 24 horas de trabalho e 48 de descanso, tambem dependente de convencao coletiva ou acordo individual.

Implicacoes para o produto:

- O motor de templates nao deve ser apenas uma repeticao fixa de dias trabalhados e folgas. Cada template precisa carregar `requisitos`, `limites`, `alertas`, `necessidade_de_acordo`, `jornada_padrao` e `observacoes`.
- O verificador de infracoes deve ter regras parametrizaveis por tenant, sindicato/categoria, unidade e tipo de contrato.
- A publicacao da escala deve exigir ciencia dos alertas criticos quando houver trabalho em domingo, feriado, excesso de dias consecutivos, interjornada insuficiente ou template que demande acordo.
- A jornada 5x2 de 8h48 e 6x1 de 7h20 devem existir como presets para reduzir erro de cadastro.
- Templates como espanhola e 24x48 podem entrar depois dos templates prioritarios, mas a arquitetura ja deve permitir adiciona-los sem migracao pesada.

## Aprendizados do PPTX

O deck `[Template] Por que otimizar a gestão de escalas.pptx` e um material para convencer gestores.

Problemas destacados:

- Gestor precisa conhecer leis trabalhistas.
- Gestor precisa conhecer demanda e atendimento.
- Gestor precisa lidar com conflitos e mudancas.
- Gestor precisa comunicar alteracoes a tempo.
- Gestao manual consome tempo e aumenta falhas.
- Erros geram risco trabalhista, risco assistencial, sobrecarga, pior experiencia do cliente, turnover e retrabalho.

Beneficios destacados:

- Acesso instantaneo e simultaneo.
- Atualizacoes em tempo real.
- Escala-base replicavel.
- Check-in/check-out no mesmo sistema.
- Comunicacao padronizada para avisos, trocas, ausencias e recados.
- Relatorios financeiros, horas e produtividade.
- Decisao baseada em dados: quem tem mais/menos horas, quem chegou, areas super/subdimensionadas.
- Sistemas de escala como investimento, nao despesa, com argumento de ROI.
- Produto web/app, nuvem, relatórios e integrações.

Oportunidade forte: a aplicacao deve ter uma area comercial/inside-sales que ajude o comprador interno a defender a compra.

## Aprendizados dos novos documentos web

### Analise comparativa de custos na folha

Fonte: `https://pergamum.unoesc.edu.br/pergamumweb/download/4A03B45D2D765CD6E063021010AC485B.pdf`.

O estudo simula um mercado no regime de Lucro Real comparando escalas `6x1`, `5x2` e `4x3`, com impacto direto em folha de pagamento, encargos, provisoes e necessidade de contratacoes. A conclusao central e que:

- `6x1` tende a ter menor custo total, mas maior desgaste do colaborador.
- `5x2` aparece como equilibrio entre custo, produtividade e qualidade de vida.
- `4x3` melhora descanso, mas aumenta muito o custo por exigir mais funcionarios.
- No estudo, a troca de `6x1` para `5x2` elevou o custo anual medio da folha em cerca de `32,66%`; a troca para `4x3` elevou em cerca de `82,13%`.
- A simulacao usou cenarios com `12` funcionarios no `6x1`, `16` no `5x2` e `22` no `4x3`, mostrando que headcount e encargos crescem junto com a reducao de jornada.

O que faz sentido para a aplicacao:

- Criar simulador financeiro de escala por tenant, unidade e setor.
- Comparar `6x1`, `5x2`, `4x3`, `12x36` e personalizados antes da publicacao.
- Estimar necessidade de contratacao adicional para manter cobertura.
- Calcular impacto aproximado em folha, ferias, 13o, FGTS, INSS/RAT/terceiros, horas extras e adicionais.
- Permitir configurar regime tributario como metadado da empresa para relatorios gerenciais, sem substituir contabilidade oficial.
- Mostrar trade-off entre custo, cobertura, qualidade de vida, risco de absenteismo e robustez operacional.

### Reducao de horas extras em colaboradores terceirizados

Fonte: `https://unisenaiprperiodicos.com.br/index.php/inova/article/view/779/741`.

O artigo analisa uma industria automotiva que passou a operar recebimento de cargas aos sabados para evitar custo de pernoite/multa de caminhoes, mas criou custo de horas extras em equipe terceirizada. O trabalho usa pesquisa de campo, benchmarking, Brainstorming, Diagrama de Ishikawa, Matriz GUT e plano `5W2H` para propor novas escalas.

Pontos relevantes:

- A demanda operacional real, como chegada de caminhoes no sabado, pode tornar uma escala barata inadequada.
- O problema raiz nao e apenas "hora extra"; pode ser demanda, contrato, transporte, falta de mao de obra, falta de qualificacao ou processo pouco automatizado.
- O artigo prioriza problemas com Matriz GUT: gravidade, urgencia e tendencia.
- As propostas consideram alternancia de sabados, respeito a `11h` de interjornada, intervalo, banco de horas e necessidade de termo/aditivo.
- A alternativa escolhida reduz horas extras redistribuindo equipes e compensando saldo, mas depende de acordo entre empresa contratante, prestadora e regras coletivas.

O que faz sentido para a aplicacao:

- Criar diagnostico de horas extras por causa provavel, nao apenas por colaborador.
- Adicionar fluxo de planejamento por demanda: volume esperado por dia/turno, SLA operacional, carga de trabalho e capacidade necessaria.
- Tratar equipes terceirizadas/prestadoras como primeiro cidadao do dominio, com contrato, vigencia, regras e responsaveis.
- Gerar plano de acao `5W2H` para mudanca de escala, com responsaveis, prazo, custo estimado e dependencia juridica.
- Usar Matriz GUT para priorizar alertas de escala e gargalos.
- Alertar impactos colaterais, como transporte fretado, janela logistica, sindicato e termo de banco de horas.

### Algoritmo para criacao de escala de trabalho

Fonte: `https://www.tcconline.lapinf.ufn.edu.br/media/midias/Daniel_Cielo.pdf`.

O trabalho descreve um software para criacao de escalas com objetivo de reduzir trabalho manual. A abordagem usa disponibilidade dos funcionarios, carga de trabalho diaria, horas ja alocadas e restricoes legais. O algoritmo tenta:

- ordenar dias pela maior necessidade de mao de obra;
- selecionar funcionario disponivel com menor quantidade de horas acumuladas;
- respeitar intervalo minimo de `11h` entre jornadas;
- permitir ajuste manual quando necessario;
- equilibrar horas entre funcionarios;
- medir resultado por desvio padrao das horas trabalhadas.

O que faz sentido para a aplicacao:

- Implementar gerador inteligente explicavel: mostrar por que cada colaborador foi alocado.
- Priorizar dias/turnos com maior carga operacional antes de preencher dias simples.
- Usar criterio de justica: menor carga acumulada, menor quantidade de fins de semana, menor sequencia de dias e menor saldo negativo/positivo.
- Calcular indicadores de equidade: desvio padrao de horas, diferenca entre maior/menor carga, finais de semana por pessoa e feriados por pessoa.
- Permitir intervencao manual sem perder auditoria: toda mudanca deve registrar motivo e recalcular alertas.
- Quando nao houver solucao perfeita, gerar "melhor solucao possivel" com alertas e alternativas.

### Intervalo intrajornada e escala 12x36

Fonte: `https://www.monografias.ufop.br/bitstream/35400000/6044/9/MONOGRAFIA_IntervaloIntrajornadaModalidade.pdf`.

A monografia discute a supressao do intervalo intrajornada em regime `12x36`, com foco juridico e em saude do trabalhador. O ponto mais util para produto nao e transformar o texto em regra fechada, mas reforcar que intervalos e descanso sao riscos trabalhistas, operacionais e humanos.

Pontos relevantes:

- A escala `12x36` costuma aparecer em setores de funcionamento continuo, como saude, seguranca e vigilancia.
- O intervalo intrajornada tem funcao de recuperacao fisica e mental.
- Supressao ou indenizacao de intervalo pode ampliar fadiga, estresse, erros e risco de adoecimento.
- A reforma trabalhista e negociacoes coletivas tornam o tema sensivel e dependente de contexto juridico.
- O produto nao deve tratar `12x36` apenas como "12 horas trabalha, 36 descansa"; precisa modelar pausa, intervalo, risco, acordo e ciencia.

O que faz sentido para a aplicacao:

- Adicionar validacao especifica de intrajornada e interjornada por tipo de escala.
- Criar indicador de risco de fadiga para jornadas longas, noturnas, consecutivas ou com pausa insuficiente.
- Exigir configuracao de intervalo planejado por turno, nao apenas inicio/fim.
- Registrar ciencia e justificativa quando houver excecao em intervalo, descanso ou compensacao.
- Priorizar dashboards de saude operacional para segmentos como hospitais, clinicas, seguranca e facilities 24/7.
- Separar regra legal parametrizavel de recomendacao de bem-estar, para evitar transformar interpretacao juridica em bloqueio indevido.

## Features novas ou reforcadas

### 1. Importador de planilha de escala

Prioridade: alta.

Permitir que o usuario suba uma planilha parecida com a extraida e o sistema:

- detecte abas;
- leia colaboradores;
- leia carga horaria diaria;
- leia grade mensal;
- leia feriados;
- leia legendas;
- identifique templates 5x2, 6x1 e 12x36;
- aponte dados ambiguos;
- gere um rascunho importado;
- rode validacoes antes da publicacao.

Por que importa: reduz friccao de migracao de clientes que ja vivem em planilha.

### 2. Wizard “da planilha para a escala auditavel”

Prioridade: alta.

Fluxo:

1. Importar ou cadastrar colaboradores.
2. Converter jornadas.
3. Escolher template.
4. Definir feriados/unidade.
5. Gerar rascunho.
6. Validar infracoes.
7. Publicar e notificar.

Esse wizard traduz a experiencia da planilha para um produto SaaS sem assustar a PME.

### 3. Conversor de jornada

Prioridade: alta.

Componente reutilizavel:

- entrada `8h48`, `08:48`, `8,8`, `8.8`;
- saida decimal e HH:mm;
- explicacao simples do calculo;
- uso em colaborador, template, banco de horas e relatorios.

### 4. Motor de legendas com impacto operacional

Prioridade: alta.

Cada legenda deve ter:

- sigla;
- nome;
- categoria;
- cor;
- conta como trabalhado;
- conta como ausente;
- gera horas;
- afeta banco de horas;
- afeta folha;
- exige anexo/justificativa;
- permite colaborador solicitar;
- bloqueia escala.

### 5. Verificador de infracoes antes de publicar

Prioridade: alta.

Ja previsto no roadmap, mas deve virar uma tela forte:

- lista de alertas por severidade;
- filtro por colaborador, data, setor, regra;
- “entendi o risco” para alertas nao bloqueantes;
- bloqueio de publicacao para alertas criticos;
- explicacao da regra;
- trilha de auditoria da ciencia.

### 6. Sorteador/distribuidor justo de folgas

Prioridade: alta.

Baseado no “sorteador de folgas” da planilha:

- distribuir folgas sem repetir injustamente;
- evitar dias consecutivos quando houver alternativa;
- balancear finais de semana/feriados;
- mostrar criterio de justica;
- permitir travar folgas existentes;
- auditar alteracoes manuais.

### 7. Comunicacao e notificacao de escala publicada

Prioridade: alta.

Notificacoes:

- escala publicada;
- retificacao;
- troca solicitada;
- troca aprovada/rejeitada;
- ausencia registrada;
- alerta critico pendente;
- lembrete de check-in.

Canais:

- in-app primeiro;
- email no MVP;
- push/WhatsApp/Teams/Slack por plano.

### 8. Portal do colaborador / mural da escala

Prioridade: alta.

O colaborador deve ver:

- minha escala mensal;
- alteracoes recentes;
- feriados;
- folgas;
- saldo de banco de horas;
- solicitacao de troca;
- ciencia de publicacao;
- check-in/check-out.

### 9. Cockpit de cobertura e dimensionamento

Prioridade: media/alta.

Inspirado nos materiais de dimensionamento e no deck:

- necessario x escalado x disponivel;
- subdimensionado/superdimensionado;
- cobertura minima por setor/projeto/posto;
- demanda por turno;
- risco de sobrecarga;
- historico de horas extras;
- sugestoes explicaveis.

### 10. Banco de horas operacional

Prioridade: media/alta.

Com base nos materiais de banco/gestao de horas:

- saldo positivo/negativo;
- validade por politica;
- compensacao planejada;
- expiracao;
- diferenciar hora extra x banco;
- extrato do colaborador;
- relatorio para RH/gestor.

### 11. Check-in/check-out com trilha antifraude minima

Prioridade: media.

Nao vender como REP-P completo ainda, mas entregar:

- entrada;
- saida;
- inicio/fim de intervalo;
- origem;
- IP/device;
- geolocalizacao com consentimento;
- relatorio de presenca;
- divergencia entre escala prevista e presenca realizada.

### 12. Relatorios financeiros, horas e produtividade

Prioridade: media.

Relatorios:

- horas previstas x realizadas;
- horas extras previstas;
- banco de horas;
- produtividade/cobertura;
- folgas por colaborador;
- trocas realizadas;
- absenteismo;
- feriados trabalhados;
- CSV no curto prazo;
- PDF/XLSX assincrono no futuro.

### 13. Calculadora de ROI e economia de tempo

Prioridade: alta para marketing/conversao.

Entrada:

- numero de colaboradores;
- tempo gasto por escala;
- numero de gestores;
- custo/hora estimado;
- horas extras medias;
- retrabalho;
- turnover/ausencias se disponivel.

Saida:

- horas economizadas por mes;
- custo estimado evitado;
- payback;
- argumentos para apresentacao interna.

Observacao: o PPTX fala em ROI alto; qualquer numero como “500%” deve ser tratado como claim comercial que precisa de fonte/validacao antes de uso publico.

### 14. Gerador de business case interno

Prioridade: media.

Inspirado no PPTX:

- template de apresentacao para o gestor vender internamente;
- exportar PDF/PPTX com dados reais da empresa;
- incluir problemas medidos, tempo gasto, riscos, beneficios e plano de implantacao;
- bom para venda consultiva em saude, seguranca, facilities e logistica.

### 15. Templates verticais por segmento

Prioridade: alta.

Templates por nicho:

- Saude/hospitalar: plantao, 12x36, cobertura minima, habilidades/certificacoes.
- Seguranca patrimonial: posto, ronda, turno, substituicao.
- Restaurantes/varejo: pico de demanda, fim de semana, feriado.
- Igrejas/voluntarios: disponibilidade, escala de domingo, comunicacao.
- Logistica/CD: turnos e absenteismo.
- Tecnologia/suporte: plantao, sobreaviso, remoto/presencial.

### 16. Simulador de custo de escala e folha

Prioridade: alta.

Inspirado no estudo da Unoesc:

- comparar custo de `6x1`, `5x2`, `4x3`, `12x36` e escala personalizada;
- simular headcount necessario para manter cobertura;
- estimar folha, encargos, provisoes, adicionais e horas extras;
- indicar impacto financeiro por mes e ano;
- mostrar custo incremental e percentual de mudanca;
- gerar cenarios "menor custo", "melhor equilibrio" e "maior descanso";
- exportar simulacao para decisao gerencial.

Esse recurso enriquece a aplicacao porque transforma escala em decisao economica, nao apenas operacional.

### 17. Diagnostico de horas extras e plano 5W2H

Prioridade: media/alta.

Inspirado no artigo do Inova:

- detectar setores com maior hora extra;
- cruzar hora extra com demanda, cobertura, falta de mao de obra, ausencias, feriados e gargalos;
- aplicar Matriz GUT para priorizar causas;
- sugerir alternativas de escala e compensacao;
- gerar plano `5W2H` com responsavel, prazo, custo, dependencia e resultado esperado;
- registrar se a acao depende de acordo coletivo, aditivo contratual ou validacao juridica.

Esse recurso e especialmente forte para logistica, facilities, seguranca, industria, restaurantes e operacoes que precisam abrir aos sabados/domingo.

### 18. Motor inteligente de alocacao explicavel

Prioridade: alta, mas incremental.

Inspirado no trabalho de Daniel Cielo:

- ordenar dias/turnos por maior demanda;
- escolher colaboradores por disponibilidade, menor carga acumulada e menor penalidade de risco;
- respeitar restricoes como interjornada, limite semanal, folgas travadas, feriados e indisponibilidades;
- medir equidade com desvio padrao de horas, finais de semana e feriados;
- explicar cada alocacao e cada alerta;
- permitir ajuste manual auditado;
- recalcular alertas apos cada mudanca.

Esse motor deve ser implementado como servico de dominio no backend, nao como regra solta no frontend.

### 19. Monitor de intrajornada, interjornada e fadiga

Prioridade: media/alta para setores 24/7.

Inspirado na monografia sobre intervalo intrajornada no `12x36`:

- modelar pausa planejada dentro do turno;
- validar intrajornada e interjornada;
- apontar risco de fadiga por jornada longa, noturna ou sequencial;
- separar alerta legal, alerta operacional e alerta de bem-estar;
- exigir justificativa/ciencia para excecoes;
- gerar relatorio de risco por colaborador, setor e periodo.

Esse recurso diferencia o produto em saude, seguranca patrimonial, vigilancia, facilities e operacoes noturnas.

### 20. Gestao de equipes terceirizadas e contratos operacionais

Prioridade: media.

Inspirado no artigo sobre colaboradores terceirizados:

- cadastrar prestadora, contrato, vigencia e responsaveis;
- vincular colaboradores terceirizados a unidades/postos/setores;
- separar regras da contratante e da prestadora;
- controlar evidencia de jornada, pausas e escala publicada;
- registrar dependencias de aditivo, acordo ou validacao antes de mudar escala;
- gerar relatorio para reuniao entre contratante e prestadora.

Esse recurso amplia o produto para clientes consultivos com seguranca, limpeza, manutencao, recepcao, logistica e facilities.

## Novas paginas recomendadas

### Produto/app

- `/dashboard/cobertura`: cockpit de cobertura e dimensionamento.
- `/dashboard/custos`: simulacao de custo de escala, folha e headcount.
- `/escala/importar`: importador de planilha.
- `/escala/wizard`: wizard de criacao mensal.
- `/escala/templates`: biblioteca de templates.
- `/escala/validacao`: central de infracoes e alertas.
- `/escala/publicacoes`: versoes publicadas, retificacoes e ciencia.
- `/escala/otimizador`: gerador inteligente de escala e comparador de cenarios.
- `/escala/risco-fadiga`: intrajornada, interjornada, pausas e risco de fadiga.
- `/colaborador/minha-escala`: mural do colaborador.
- `/trocas`: timeline e gestao de trocas.
- `/banco-de-horas`: saldos, extratos e compensacoes.
- `/ponto`: check-in/check-out e presenca.
- `/terceirizados`: prestadoras, contratos e equipes terceirizadas.
- `/relatorios/produtividade`: cobertura, produtividade e horas.
- `/relatorios/roi`: economia de tempo e impacto financeiro.
- `/relatorios/horas-extras`: diagnostico, causas, Matriz GUT e plano 5W2H.

### Marketing/publico

- `/calculadora/roi-escala`: calculadora de ROI.
- `/calculadora/jornada-decimal`: conversor gratuito de jornada.
- `/calculadora/banco-de-horas`: simulador de banco de horas.
- `/calculadora/custo-escala`: comparador publico 6x1 x 5x2 x 4x3.
- `/materiais/reduzir-horas-extras`: guia/diagnostico para reduzir horas extras.
- `/templates/escala-6x1`
- `/templates/escala-5x2`
- `/templates/escala-4x3`
- `/templates/escala-12x36`
- `/templates/escala-terceirizados`
- `/lp/hospitais`
- `/lp/clinicas`
- `/lp/seguranca-patrimonial`
- `/lp/restaurantes`
- `/lp/igrejas`
- `/lp/supermercados`
- `/lp/logistica`
- `/lp/facilities-terceirizados`
- `/cases/einstein`
- `/materiais/business-case-gestao-escalas`
- `/materiais/guia-banco-de-horas`
- `/materiais/guia-plantao-hospitalar`
- `/materiais/dimensionamento-equipes`

Strapi deve gerenciar o conteudo editorial dessas paginas, enquanto calculadoras e captura de leads devem passar pelo BFF/backend.

## Ajustes no modelo de dominio

Entidades/objetos a considerar:

- `ScheduleTemplate`
- `ScheduleTemplatePattern`
- `LegendCode`
- `HolidayCalendar`
- `Holiday`
- `ScheduleDraft`
- `SchedulePublication`
- `ScheduleVersion`
- `ScheduleValidationAlert`
- `ScheduleImportJob`
- `ImportedScheduleRow`
- `CoverageDemand`
- `CoverageSnapshot`
- `TimeBalanceLedger`
- `TimeBalancePolicy`
- `NotificationPreference`
- `ScheduleAcknowledgement`
- `RoiSimulation`
- `ScheduleCostSimulation`
- `PayrollCostAssumption`
- `HeadcountScenario`
- `OvertimeDiagnosis`
- `GutPriorityScore`
- `ActionPlan5W2H`
- `ScheduleOptimizationRun`
- `AllocationExplanation`
- `FairnessMetric`
- `RestIntervalRule`
- `FatigueRiskAlert`
- `OutsourcingProvider`
- `OutsourcingContract`

Servicos de dominio:

- `JourneyConversionService`
- `ScheduleImportService`
- `LegendImpactCalculator`
- `MonthlyCounterCalculator`
- `FairRestDistributionService`
- `ScheduleComplianceValidator`
- `CoverageDimensioningService`
- `TimeBalanceCalculator`
- `RoiCalculator`
- `ScheduleCostSimulationService`
- `OvertimeDiagnosisService`
- `GutPrioritizationService`
- `ActionPlanGeneratorService`
- `ScheduleOptimizationService`
- `FairnessMetricCalculator`
- `RestAndFatigueRiskService`
- `OutsourcingContractPolicyService`

## Priorizacao sugerida

### Agora

1. Conversor de jornada.
2. Legendas com impacto.
3. Feriados por tenant/unidade.
4. Templates 5x2, 6x1 e 12x36.
5. Contadores mensais.
6. Verificador de infracoes.
7. Validador de intrajornada/interjornada basico.
8. Wizard de escala mensal.

### Proximo ciclo

1. Importador de planilha.
2. Sorteador/distribuidor justo de folgas.
3. Publicacao/versionamento/ciencia.
4. Portal do colaborador.
5. Notificacoes de publicacao/retificacao.
6. Trocas com aceite do colega e aprovacao do gestor.
7. Simulador de custo de escala e headcount.
8. Metricas de equidade da escala.

### Depois

1. Banco de horas completo.
2. Dimensionamento por demanda.
3. Check-in/check-out com trilha antifraude.
4. Relatorios financeiros/produtividade.
5. Calculadora de ROI e gerador de business case.
6. Templates verticais e paginas segmentadas.
7. Diagnostico de horas extras com Matriz GUT e 5W2H.
8. Motor inteligente de alocacao explicavel.
9. Gestao de terceirizados e contratos operacionais.
10. Monitor avancado de fadiga e bem-estar.

## Conclusao

Os materiais reforcam que a aplicacao deve se posicionar como a evolucao natural da planilha: mesma simplicidade de entrada, mas com validacao, automacao, notificacao, auditoria, relatorios e dados para decisao.

A maior oportunidade nao e apenas “montar escala”. E entregar um fluxo completo:

```text
importar/cadastrar equipe
-> converter jornadas
-> escolher template
-> considerar feriados e disponibilidade
-> gerar rascunho
-> validar infracoes
-> balancear folgas
-> publicar com ciencia
-> notificar colaboradores
-> acompanhar ponto, trocas, banco de horas e cobertura
-> medir ROI/produtividade
```

Isso conversa diretamente com os OKRs, o roadmap e a arquitetura ja definidos, e cria paginas publicas fortes para aquisicao PLG e venda consultiva.
