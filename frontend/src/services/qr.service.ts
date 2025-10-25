import { api } from './api';
import { Sample, QREvent, CreateQREventDto, SampleTimeline } from '../types/qr';

export const qrService = {
  async getSampleByQR(codigoQR: string): Promise<Sample> {
    const response = await api.get<Sample>(`/samples/qr/${codigoQR}`);
    return response.data;
  },

  async createEvent(data: CreateQREventDto): Promise<QREvent> {
    const response = await api.post<QREvent>('/qr/events', data);
    return response.data;
  },

  async getSampleTimeline(sampleId: string): Promise<SampleTimeline> {
    const response = await api.get<SampleTimeline>(`/qr/samples/${sampleId}/timeline`);
    return response.data;
  },

  async getRecentEvents(): Promise<QREvent[]> {
    const response = await api.get<QREvent[]>('/qr/events/recent');
    return response.data;
  },
};
