import { useState, useEffect } from 'react';
import { Calendar, Plus, Pencil, Trash2, X, Clock, User } from 'lucide-react';
import { appointmentService, clientService, processService, userService } from '../../services';
import type { AppointmentDTO, ClientDTO, ProcessDTO, UserDTO } from '../../types';
import { format } from 'date-fns';

export function Appointments() {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [processes, setProcesses] = useState<ProcessDTO[]>([]);
  const [lawyers, setLawyers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentDTO | null>(null);
  const [error, setError] = useState('');

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
      setFormData({
        dateTime: appointment.dateTime,
        durationMinutes: appointment.durationMinutes,
        lawyerId: appointment.lawyerId,
        clientId: appointment.clientId,
        processId: appointment.processId,
        description: appointment.description || '',
      });
    } else {
      setEditingAppointment(null);
      const now = new Date();
      const dateTimeStr = format(now, "yyyy-MM-dd'T'HH:mm");
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
      // Converter para ISO 8601
      const isoDateTime = new Date(formData.dateTime).toISOString();
      const submitData = { ...formData, dateTime: isoDateTime };

      if (editingAppointment?.id) {
        await appointmentService.update(editingAppointment.id, submitData);
      } else {
        await appointmentService.create(submitData);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      setError('Erro ao salvar agendamento');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      await appointmentService.delete(id);
      loadData();
    } catch (err) {
      setError('Erro ao excluir agendamento');
      console.error(err);
    }
  };

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return format(date, "dd/MM/yyyy 'às' HH:mm");
    } catch {
      return dateTime;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-slate-900">Agendamentos</h1>
            </div>
            <p className="mt-2 text-slate-600">Gerencie agendamentos e consultas</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            Nenhum agendamento cadastrado ainda
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Advogado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {formatDateTime(appointment.dateTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        {getClientName(appointment.clientId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getLawyerName(appointment.lawyerId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {appointment.durationMinutes} min
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {appointment.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleOpenModal(appointment)}
                        className="inline-flex items-center gap-1 text-primary hover:text-primary/80 mr-3"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => appointment.id && handleDelete(appointment.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data e Hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Advogado <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.lawyerId}
                  onChange={(e) => setFormData({ ...formData, lawyerId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Processo</label>
                <select
                  value={formData.processId}
                  onChange={(e) => setFormData({ ...formData, processId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Detalhes do agendamento..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  {editingAppointment ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
