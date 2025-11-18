import { useState, useEffect } from 'react';
import { CalendarClock, Plus, Pencil, Trash2, X, Clock, UserCheck, Gavel } from 'lucide-react';
import { appointmentService, clientService, processService, userService } from '../../services';
import type { AppointmentDTO, ClientDTO, ProcessDTO, UserDTO } from '../../types';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';

export function Appointments() {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [processes, setProcesses] = useState<ProcessDTO[]>([]);
  const [lawyers, setLawyers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentDTO | null>(null);
  const [error, setError] = useState('');
  const { isOpen: isConfirmOpen, options: confirmOptions, confirm, handleConfirm, handleCancel } = useConfirm();

  const [formData, setFormData] = useState<Omit<AppointmentDTO, 'id'>>({
    dateTime: '',
    durationMinutes: 60,
    lawyerId: '',
    clientId: '',
    processId: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clientsRes, processesRes, lawyersRes] = await Promise.all([
        clientService.getAll(),
        processService.getAll(),
        userService.getAll(),
      ]);
      setClients(clientsRes.data || []);
      setProcesses(processesRes.data || []);
      setLawyers(lawyersRes.data || []);

      // Carregar agendamentos do primeiro advogado (ou implementar seleção)
      if (lawyersRes.data && lawyersRes.data.length > 0 && lawyersRes.data[0].id) {
        const appointmentsRes = await appointmentService.getByLawyer(lawyersRes.data[0].id);
        setAppointments(appointmentsRes.data || []);
      }
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientName = (id: string) => clients.find((c) => c.id === id)?.name || '-';
  const getLawyerName = (id: string) => lawyers.find((l) => l.id === id)?.fullName || '-';

  const handleOpenModal = (appointment?: AppointmentDTO) => {
    if (appointment) {
      setEditingAppointment(appointment);
      // Converter formato do backend (yyyy-MM-ddTHH:mm:ss) para datetime-local (yyyy-MM-ddTHH:mm)
      const dateTimeForInput = appointment.dateTime.slice(0, 16);
      setFormData({
        dateTime: dateTimeForInput,
        durationMinutes: appointment.durationMinutes,
        lawyerId: appointment.lawyerId,
        clientId: appointment.clientId,
        processId: appointment.processId,
        description: appointment.description || '',
      });
    } else {
      setEditingAppointment(null);
      const now = new Date();
      // Formato para datetime-local: yyyy-MM-ddTHH:mm
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const dateTimeStr = `${year}-${month}-${day}T${hours}:${minutes}`;
      setFormData({
        dateTime: dateTimeStr,
        durationMinutes: 60,
        lawyerId: lawyers[0]?.id || '',
        clientId: '',
        processId: '',
        description: '',
      });
    }
    setIsModalOpen(true);
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Enviar data no formato local (sem conversão para UTC)
      // O input datetime-local retorna "2025-11-18T11:10" que é o formato esperado pelo backend
      const submitData = { ...formData, dateTime: formData.dateTime + ':00' };

      if (editingAppointment?.id) {
        await appointmentService.update(editingAppointment.id, submitData);
      } else {
        await appointmentService.create(submitData);
      }
      handleCloseModal();
      loadData();
    } catch (err: unknown) {
      // Exibir mensagem de erro do backend (já em português)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string; data?: Record<string, string> } | string } };
        const responseData = axiosError.response?.data;

        if (typeof responseData === 'string') {
          setError(responseData);
        } else if (responseData && typeof responseData === 'object') {
          // Formato: { message: "Validation failed", data: { campo: "mensagem" } }
          if (responseData.data && typeof responseData.data === 'object') {
            const validationErrors = Object.values(responseData.data).join('. ');
            setError(validationErrors || responseData.message || 'Erro ao salvar agendamento');
          } else {
            setError(responseData.message || 'Erro ao salvar agendamento');
          }
        } else {
          setError('Erro ao salvar agendamento');
        }
      } else {
        setError('Erro ao salvar agendamento');
      }
      console.error(err);
    }
  };

  const handleDelete = async (id: string, clientName: string, dateTime: string) => {
    const formattedDate = formatDateTime(dateTime);
    const confirmed = await confirm({
      title: 'Excluir Agendamento',
      message: `Tem certeza que deseja excluir o agendamento com ${clientName} marcado para ${formattedDate}? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await appointmentService.delete(id);
      loadData();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 409) {
          setError(axiosError.response.data?.message || 'Não é possível excluir este agendamento');
        } else if (axiosError.response?.status === 404) {
          setError('Agendamento não encontrado');
        } else {
          setError('Erro ao excluir agendamento');
        }
      } else {
        setError('Erro ao excluir agendamento');
      }
      console.error(err);
    }
  };

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      const dateStr = date.toLocaleDateString('pt-BR');
      const timeStr = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return `${dateStr} às ${timeStr}`;
    } catch {
      return dateTime;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CalendarClock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Agendamentos</h1>
              <p className="text-sm text-slate-500">Gerencie agendamentos e consultas</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[hsl(213,56%,30%)] hover:shadow-lg hover:shadow-primary/25"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
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
        ) : appointments.length === 0 ? (
          <div className="text-center p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <CalendarClock className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Nenhum agendamento cadastrado</p>
            <p className="text-sm text-slate-400 mt-1">Adicione seu primeiro agendamento clicando no botão acima</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Advogado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="transition-colors duration-200 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {formatDateTime(appointment.dateTime)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                        {getClientName(appointment.clientId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Gavel className="h-3.5 w-3.5 text-slate-400" />
                        {getLawyerName(appointment.lawyerId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {appointment.durationMinutes} min
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {appointment.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(appointment)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-primary hover:bg-primary/10 transition-colors duration-200 mr-1"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          appointment.id &&
                          handleDelete(
                            appointment.id,
                            getClientName(appointment.clientId),
                            appointment.dateTime
                          )
                        }
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
                  <CalendarClock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
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
                  Data e Hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
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
                  Advogado <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.lawyerId}
                  onChange={(e) => setFormData({ ...formData, lawyerId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Selecione um advogado</option>
                  {lawyers.map((lawyer) => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Processo</label>
                <select
                  value={formData.processId}
                  onChange={(e) => setFormData({ ...formData, processId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Nenhum processo vinculado</option>
                  {processes.map((process) => (
                    <option key={process.id} value={process.id}>
                      {process.number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Duração (minutos) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="15"
                  step="15"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Detalhes do agendamento..."
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
                  {editingAppointment ? 'Salvar' : 'Criar'}
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
