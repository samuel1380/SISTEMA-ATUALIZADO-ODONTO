-- =========================================================================
-- Script de Limpeza e Saneamento de Faturas Fantasmas e Duplicadas
-- Sistema Odontoprint - Banco de Dados de Produção odontoprint_db
-- Data: 22/11/2026
-- =========================================================================

-- 1. Diagnóstico Inicial: Total de faturas abertas sem nenhuma OS e com valor fantasma
SELECT 
    'Faturas abertas fantasmas (0 OSs)' AS diagnostico,
    COUNT(*) AS total_faturas_fantasmas,
    COALESCE(SUM(f.valorTotal), 0) AS valor_fantasma_total
FROM TbFinanceiroFatura f
WHERE f.status = 'ABERTA'
  AND (f.valorPago IS NULL OR f.valorPago = 0)
  AND NOT EXISTS (SELECT 1 FROM TbOrdemServico os WHERE os.idFatura = f.idFatura);

-- 2. Remove parcelas vinculadas aos lançamentos das faturas abertas fantasmas
DELETE p FROM TbFinanceiroParcela p
INNER JOIN TbFinanceiroLancamento l ON l.idLancamento = p.idLancamento
INNER JOIN TbFinanceiroFatura f ON f.idFatura = l.idFatura
WHERE f.status = 'ABERTA'
  AND (f.valorPago IS NULL OR f.valorPago = 0)
  AND NOT EXISTS (SELECT 1 FROM TbOrdemServico os WHERE os.idFatura = f.idFatura);

-- 3. Remove os lançamentos financeiros vinculados às faturas abertas fantasmas
DELETE l FROM TbFinanceiroLancamento l
INNER JOIN TbFinanceiroFatura f ON f.idFatura = l.idFatura
WHERE f.status = 'ABERTA'
  AND (f.valorPago IS NULL OR f.valorPago = 0)
  AND NOT EXISTS (SELECT 1 FROM TbOrdemServico os WHERE os.idFatura = f.idFatura);

-- 4. Exclui as faturas abertas que não têm nenhuma OS vinculada e nenhum pagamento
DELETE FROM TbFinanceiroFatura
WHERE status = 'ABERTA'
  AND (valorPago IS NULL OR valorPago = 0)
  AND NOT EXISTS (SELECT 1 FROM TbOrdemServico os WHERE os.idFatura = TbFinanceiroFatura.idFatura);

-- 5. Caso alguma fatura não possa ser deletada por integridade referencial, cancela e zera
UPDATE TbFinanceiroFatura
SET status = 'CANCELADA', valorTotal = 0, valorTotalBruto = 0, desconto = 0
WHERE status = 'ABERTA'
  AND (valorPago IS NULL OR valorPago = 0)
  AND NOT EXISTS (SELECT 1 FROM TbOrdemServico os WHERE os.idFatura = TbFinanceiroFatura.idFatura);

-- 6. Recalcula o valor total de todas as faturas abertas restantes para baterem exatamente com suas OSs
UPDATE TbFinanceiroFatura f
INNER JOIN (
    SELECT idFatura, COALESCE(SUM(valorTotal), 0) AS total_os
    FROM TbOrdemServico
    WHERE idFatura IS NOT NULL
    GROUP BY idFatura
) os_soma ON os_soma.idFatura = f.idFatura
SET f.valorTotalBruto = os_soma.total_os,
    f.valorTotal = GREATEST(0, os_soma.total_os - COALESCE(f.desconto, 0))
WHERE f.status = 'ABERTA';

-- 7. Sincroniza lançamentos financeiros e parcelas das faturas ativas
UPDATE TbFinanceiroLancamento l
INNER JOIN TbFinanceiroFatura f ON f.idFatura = l.idFatura
SET l.valorTotal = f.valorTotal,
    l.dataCompetencia = f.dataInicio
WHERE f.status != 'CANCELADA';

UPDATE TbFinanceiroParcela p
INNER JOIN TbFinanceiroLancamento l ON l.idLancamento = p.idLancamento
INNER JOIN TbFinanceiroFatura f ON f.idFatura = l.idFatura
SET p.valor = f.valorTotal
WHERE f.status != 'CANCELADA' AND p.status != 'PAGO';

-- 8. Diagnóstico Final: Verifica os valores recalculados das faturas de 06/2026
SELECT 
    f.idFatura, 
    f.idEmpresa, 
    f.dataInicio, 
    f.dataVencimento, 
    f.valorTotal, 
    f.status, 
    (SELECT COUNT(*) FROM TbOrdemServico os WHERE os.idFatura = f.idFatura) AS qtd_os,
    (SELECT COALESCE(SUM(os.valorTotal), 0) FROM TbOrdemServico os WHERE os.idFatura = f.idFatura) AS soma_os
FROM TbFinanceiroFatura f
WHERE f.dataInicio >= '2026-06-01' AND f.dataInicio <= '2026-06-30'
ORDER BY f.idEmpresa, f.idFatura;

-- 9. Receita total do DRE para 06/2026 após saneamento
SELECT 
    '06/2026' AS competencia,
    COALESCE(SUM(valorTotal), 0) AS receita_total_faturas_dre
FROM TbFinanceiroFatura
WHERE status != 'CANCELADA'
  AND EXTRACT(YEAR FROM dataInicio) = 2026
  AND EXTRACT(MONTH FROM dataInicio) = 6;
