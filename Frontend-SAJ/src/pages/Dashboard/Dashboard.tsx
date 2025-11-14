import { LayoutDashboard } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        </div>
        <p className="mt-2 text-slate-600">Visão geral do sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards - serão implementados depois */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-600">Total de Clientes</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">0</div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-600">Processos Ativos</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">0</div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-600">Agendamentos Hoje</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">0</div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-600">Próximos 7 Dias</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">0</div>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Próximos Agendamentos</h2>
        <p className="mt-4 text-center text-slate-500">Nenhum agendamento encontrado</p>
      </div>
    </div>
  );
}
