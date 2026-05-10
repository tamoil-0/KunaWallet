import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { TransactionItem } from "@/components/dashboard/TransactionItem";
import { walletService } from "@/services/wallet.service";
import { useUIStore } from "@/store/uiStore";
import { getErrorMessage } from "@/services/api";
import { formatPEN } from "@/utils/currency";
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { Transaction } from "@/types";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "deposit", label: "Depósitos" },
  { value: "withdraw", label: "Retiros" },
  { value: "yield", label: "Rendimientos" },
  { value: "goal_contribution", label: "Metas" },
];

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const notify = useUIStore((s) => s.notify);

  useEffect(() => {
    load(filter);
  }, [filter]);

  async function load(type: string) {
    setLoading(true);
    try {
      const res = await walletService.getTransactions({
        type: type === "all" ? undefined : type,
        limit: 100,
      });
      setTransactions(res.transactions);
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  const filtered = transactions.filter(
    (t) =>
      !search ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase()),
  );

  // Aggregates
  const totalDeposits = transactions
    .filter((t) => t.type === "deposit")
    .reduce((s, t) => s + Number(t.amount_pen), 0);
  const totalYield = transactions
    .filter((t) => t.type === "yield")
    .reduce((s, t) => s + Number(t.amount_pen), 0);
  const totalWithdraws = transactions
    .filter((t) => t.type === "withdraw")
    .reduce((s, t) => s + Number(t.amount_pen), 0);

  return (
    <PageWrapper className="max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Transacciones</h1>
        <p className="text-text-secondary mt-1">
          Historial completo de tu actividad financiera.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        <Card hover={false}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === f.value
                    ? "bg-gradient-gold text-bg-primary"
                    : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="flex-1 min-w-[200px]">
              <Input
                icon={<Search size={16} />}
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="-mx-2">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="px-2 py-2">
                  <Skeleton height={56} />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <p className="text-center py-12 text-text-secondary">
                Sin transacciones que mostrar
              </p>
            ) : (
              <div className="px-2">
                {filtered.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-3">
          <Card>
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              Depositado
            </p>
            <p className="font-display font-bold text-xl text-state-success">
              {formatPEN(totalDeposits)}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              Rendimientos
            </p>
            <p className="font-display font-bold text-xl text-accent-gold">
              {formatPEN(totalYield)}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              Retirado
            </p>
            <p className="font-display font-bold text-xl text-state-error">
              {formatPEN(totalWithdraws)}
            </p>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
