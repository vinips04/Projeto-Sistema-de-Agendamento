import { useState, useEffect } from 'react';
import { UserCheck, Plus, Pencil, Trash2, X, Mail, Phone, FileText } from 'lucide-react';
import { clientService } from '../../services';
import type { ClientDTO } from '../../types';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { maskCPFCNPJ, formatCPFCNPJ } from '../../utils/masks';

export function Clients() {
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDTO | null>(null);
  const [error, setError] = useState('');
  const { isOpen: isConfirmOpen, options: confirmOptions, confirm, handleConfirm, handleCancel } = useConfirm();

  // Form state
  const [formData, setFormData] = useState<Omit<ClientDTO, 'id'>>({
    name: '',
    cpfCnpj: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await clientService.getAll();
      setClients(response.data || []);
    } catch (err) {
      setError('Erro ao carregar clientes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (client?: ClientDTO) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        cpfCnpj: client.cpfCnpj,
        email: client.email || '',
        phone: client.phone || '',
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', cpfCnpj: '', email: '', phone: '' });
    }
    setIsModalOpen(true);
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ name: '', cpfCnpj: '', email: '', phone: '' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingClient?.id) {
        await clientService.update(editingClient.id, formData);
      } else {
        await clientService.create(formData);
      }
      handleCloseModal();
      loadClients();
    } catch (err) {
      setError('Erro ao salvar cliente');
      console.error(err);
    }
  };

  const handleDelete = async (id: string, clientName: string) => {
    const confirmed = await confirm({
      title: 'Excluir Cliente',
      message: `Tem certeza que deseja excluir o cliente "${clientName}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await clientService.delete(id);
      loadClients();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 409) {
          setError(axiosError.response.data?.message || 'Não é possível excluir este cliente');
        } else if (axiosError.response?.status === 404) {
          setError('Cliente não encontrado');
        } else {
          setError('Erro ao excluir cliente');
        }
      } else {
        setError('Erro ao excluir cliente');
      }
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
              <p className="text-sm text-slate-500">Gerencie seus clientes</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[hsl(213,56%,30%)] hover:shadow-lg hover:shadow-primary/25"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
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
        ) : clients.length === 0 ? (
          <div className="text-center p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <UserCheck className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Nenhum cliente cadastrado</p>
            <p className="text-sm text-slate-400 mt-1">Adicione seu primeiro cliente clicando no botão acima</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    CPF/CNPJ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client.id} className="transition-colors duration-200 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <span className="text-sm font-semibold text-primary">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {formatCPFCNPJ(client.cpfCnpj)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.email ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {client.email}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.phone ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {client.phone}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(client)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-primary hover:bg-primary/10 transition-colors duration-200 mr-1"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => client.id && handleDelete(client.id, client.name)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
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
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
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
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Nome completo do cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  CPF/CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.cpfCnpj}
                  onChange={(e) => setFormData({ ...formData, cpfCnpj: maskCPFCNPJ(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  maxLength={18}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="(00) 00000-0000"
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
                  {editingClient ? 'Salvar' : 'Criar'}
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
