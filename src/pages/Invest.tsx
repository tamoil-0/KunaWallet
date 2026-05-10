import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, AlertTriangle, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { walletService } from "@/services/wallet.service";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { formatPEN, formatUSDC } from "@/utils/currency";
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { YieldPosition } from "@/types";

interface Pool {
  id: string;
  name: string;
  emoji: string;
  apy: number;
  risk: "low" | "medium" | "high";
  min: number;
  description: string;
}

const POOLS: Pool[] = [
  {
    id: "marinade",
    name: "Marinade Finance · mSOL",
    emoji: "🛡️",
    apy: 7.2,
    risk: "low",
    min: 1,
    description: "Staking de SOL líquido. Uno de los protocolos más seguros de Solana.",
  },
  {
    id: "orca",
    name: "Orca USDC/USDT",
    emoji: "🐬",
    apy: 5.8,
    risk: "low",
    min: 5,
    description: "Pool estable. Tus USDC siempre valen lo mismo. Solo ganas intereses.",
  },
  {
    id: "kamino",
    name: "Kamino Finance",
    emoji: "📈",
    apy: 9.1,
    risk: "medium",
    min: 10,
    description: "Estrategia automatizada de lending. Mayor rendimiento, algo más de riesgo.",
  },
];

export default function Invest() {
  const wallet = useAuthStore((s) => s.wallet);
  const [positions, setPositions] = useState<YieldPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [investAmount, setInvestAmount] = useState(50);
  const notify = useUIStore((s) => s.notify);

  useEffect(() => {
    walletService
      .getBalance()
      .then((res) => setPositions(res.positions))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper className="max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-display font-bold">📈 Invertir</h1>
        <p className="text-text-secondary mt-1">
          Pools de rendimiento auditados en la red Solana.
        </p>
      </div>

      <Card hover={false} className="mb-6 bg-[rgba(245,166,35,0.04)] border-[rgba(245,166,35,0.2)]">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <p className="font-display font-semibold mb-1">¿Cómo funciona?</p>
            <p className="text-sm text-text-secondary">
              Tu USDC entra a pools de liquidez en Solana. Protocolos auditados de
              bajo riesgo generan rendimientos reales. Sin intermediarios, sin
              comisiones bancarias.
            </p>
          </div>
        </div>
      </Card>

      {!loading && positions.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold mb-3">Tus posiciones activas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {positions.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display font-semibold">{p.pool_name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Activo desde{" "}
                      {new Date(p.started_at).toLocaleDateString("es-PE")}
                    </p>
                  </div>
                  <Badge color="green" icon={<ShieldCheck size={10} />}>
                    {p.risk_level === "low" ? "Bajo riesgo" : p.risk_level}
                  </Badge>
                </div>
                <p className="font-display font-bold text-2xl text-accent-gold mb-1">
                  {formatUSDC(Number(p.amount_usdc))}
                </p>
                <p className="text-state-success text-sm flex items-center gap-1">
                  <TrendingUp size={14} />
                  {Number(p.apy).toFixed(2)}% APY
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display font-semibold mb-3">Pools disponibles</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {POOLS.map((pool, i) => (
            <PoolCard key={pool.id} pool={pool} index={i} onSelect={() => setSelectedPool(pool)} />
          ))}
        </div>
      </div>

      <Modal
        open={!!selectedPool}
        onClose={() => setSelectedPool(null)}
        title={selectedPool?.name}
        size="md"
      >
        {selectedPool && (
          <div className="space-y-5">
            <div className="bg-bg-tertiary rounded-2xl p-4">
              <p className="text-sm text-text-secondary">{selectedPool.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-text-secondary uppercase">APY</p>
                <p className="font-display font-bold text-xl text-state-success">
                  {selectedPool.apy}%
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase">Riesgo</p>
                <p className="font-display font-bold text-base">
                  {selectedPool.risk === "low"
                    ? "🟢 Bajo"
                    : selectedPool.risk === "medium"
                    ? "🟡 Medio"
                    : "🔴 Alto"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase">Mínimo</p>
                <p className="font-display font-bold text-base">
                  {selectedPool.min} USDC
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-text-secondary block mb-2">
                ¿Cuánto USDC quieres invertir?
              </label>
              <div className="bg-bg-tertiary rounded-2xl p-4">
                <p className="font-display font-bold text-3xl mb-3">
                  {investAmount.toFixed(2)} USDC
                </p>
                <input
                  type="range"
                  min={selectedPool.min}
                  max={Math.max(selectedPool.min, Number(wallet?.balance_usdc || 100))}
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  className="w-full accent-accent-gold"
                />
                <p className="text-xs text-accent-cyan mt-2">
                  ≈ {formatPEN(investAmount * 3.7)}
                </p>
              </div>
            </div>

            <div className="bg-[rgba(0,229,160,0.05)] border border-[rgba(0,229,160,0.2)] rounded-xl p-3 text-sm">
              <p className="text-text-secondary">Rendimiento anual proyectado:</p>
              <p className="font-display font-bold text-state-success">
                +{(investAmount * (selectedPool.apy / 100)).toFixed(2)} USDC ≈{" "}
                {formatPEN(investAmount * (selectedPool.apy / 100) * 3.7)}
              </p>
            </div>

            {selectedPool.risk !== "low" && (
              <div className="flex items-start gap-2 text-sm text-state-warning">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p>
                  Este pool tiene riesgo medio. Las pérdidas son posibles si los
                  precios fluctúan mucho.
                </p>
              </div>
            )}

            <Button
              fullWidth
              size="lg"
              onClick={() => {
                notify(
                  `Demo: Invertirías ${investAmount} USDC en ${selectedPool.name}`,
                  "info",
                );
                setSelectedPool(null);
              }}
            >
              Invertir en este pool
            </Button>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}

function PoolCard({
  pool,
  index,
  onSelect,
}: {
  pool: Pool;
  index: number;
  onSelect: () => void;
}) {
  const yearOnPEN500 = (500 * (pool.apy / 100)).toFixed(2);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="bg-bg-secondary border border-[rgba(255,255,255,0.06)] rounded-3xl p-5 hover:border-[rgba(245,166,35,0.3)] transition flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-3xl">{pool.emoji}</div>
          <p className="font-display font-semibold">{pool.name}</p>
        </div>
      </div>
      <Badge
        color={pool.risk === "low" ? "green" : pool.risk === "medium" ? "gold" : "red"}
        className="self-start mb-3"
      >
        {pool.risk === "low" ? "🟢 Bajo riesgo" : pool.risk === "medium" ? "🟡 Riesgo medio" : "🔴 Alto"}
      </Badge>
      <p className="text-sm text-text-secondary mb-4 flex-1">{pool.description}</p>
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs text-text-secondary uppercase">APY</p>
          <p className="font-display font-bold text-3xl text-gradient-gold">
            {pool.apy}%
          </p>
        </div>
        <p className="text-xs text-text-secondary text-right">
          Mínimo: <span className="font-mono">{pool.min} USDC</span>
        </p>
      </div>
      <p className="text-xs text-text-secondary mb-3">
        Sobre S/ 500 al año: <span className="text-state-success">+S/ {yearOnPEN500}</span>
      </p>
      <Button onClick={onSelect} fullWidth iconRight={<ChevronRight size={14} />}>
        Invertir
      </Button>
    </motion.div>
  );
}
