import { useState, useEffect } from 'react';
import { Scale, Plus, Pencil, Trash2, X, UserCheck, FileText } from 'lucide-react';
import { processService, clientService } from '../../services';
import type { ProcessDTO, ClientDTO } from '../../types';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { maskProcessNumber, formatProcessNumber } from '../../utils/masks';

export function Processes() {
  const [processes, setProcesses] = useState<ProcessDTO[]>([]);
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ProcessDTO | null>(null);
  const [error, setError] = useState('');
  const { isOpen: isConfirmOpen, options: confirmOptions, confirm, handleConfirm, handleCancel } = useConfirm();

  const [formData, setFormData] = useState<Omit<ProcessDTO, 'id'>>({
    number: '',
    clientId: '',
    description: '',
    status: 'Em Andamento',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [processesRes, clientsRes] = await Promise.all([
        processService.getAll(),
        clientService.getAll(),
      ]);
      setProcesses(processesRes.data || []);
      setClients(clientsRes.data || []);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || 'Cliente não encontrado';
  };

  const handleOpenModal = (process?: ProcessDTO) => {
    if (process) {
      setEditingProcess(process);
      setFormData({
        number: process.number,
        clientId: process.clientId,
        description: process.description || '',
        status: process.status,
      });
    } else {
      setEditingProcess(null);
      setFormData({ number: '', clientId: '', description: '', status: 'Em Andamento' });
    }
    setIsModalOpen(true);
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProcess(null);
    setFormData({ number: '', clientId: '', description: '', status: 'Em Andamento' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProcess?.id) {
        await processService.update(editingProcess.id, formData);
      } else {
        await processService.create(formData);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      setError('Erro ao salvar processo');
      console.error(err);
    }
  };

  const handleDelete = async (id: string, processNumber: string) => {
    const confirmed = await confirm({
      title: 'Excluir Processo',
      message: `Tem certeza que deseja excluir o processo "${processNumber}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await processService.delete(id);
      loadData();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 409) {
          setError(axiosError.response.data?.message || 'Não é possível excluir este processo');
        } else if (axiosError.response?.status === 404) {
          setError('Processo não encontrado');
        } else {
          setError('Erro ao excluir processo');
        }
      } else {
        setError('Erro ao excluir processo');
      }
      console.error(err);
    }
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<string, { bg: string; text: string; dot: string }> = {
      'ATIVO': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
      'Em Andamento': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
      'Concluído': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      'Arquivado': { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
      'Suspenso': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    };
    return styles[status] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Processos</h1>
              <p className="text-sm text-slate-500">Gerencie processos jurídicos</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[hsl(213,56%,30%)] hover:shadow-lg hover:shadow-primary/25"
          >
            <Plus className="h-4 w-4" />
            Novo Processo
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : processes.length === 0 ? (
          <div className="text-center p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Scale className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Nenhum processo cadastrado</p>
            <p className="text-sm text-slate-400 mt-1">Adicione seu primeiro processo clicando no botão acima</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processes.map((process) => {
                  const statusStyle = getStatusStyles(process.status);
                  return (
                    <tr key={process.id} className="transition-colors duration-200 hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{formatProcessNumber(process.number)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                          {getClientName(process.clientId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                        {process.description || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}></span>
                          {process.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenModal(process)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-primary hover:bg-primary/10 transition-colors duration-200 mr-1"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => process.id && handleDelete(process.id, process.number)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingProcess ? 'Editar Processo' : 'Novo Processo'}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Número do Processo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: maskProcessNumber(e.target.value) })}
                  placeholder="0000000-00.0000.0.00.0000"
                  maxLength={25}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ATIVO">ATIVO</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Arquivado">Arquivado</option>
                  <option value="Suspenso">Suspenso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Descrição do processo..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 hover:border-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[hsl(213,56%,30%)] hover:shadow-lg hover:shadow-primary/25"
                >
                  {editingProcess ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmOptions.title}
        message={confirmOptions.message}
        confirmText={confirmOptions.confirmText}
        cancelText={confirmOptions.cancelText}
        variant={confirmOptions.variant}
      />
    </div>
  );
}
