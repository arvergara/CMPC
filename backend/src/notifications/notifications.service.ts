import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Notifica cuando un análisis ha sido completado
   */
  async notifyAnalysisCompleted(data: {
    to: string;
    investigadorNombre: string;
    codigoQR: string;
    tipoAnalisis: string;
    fechaFin: Date;
  }) {
    await this.mailerService.sendMail({
      to: data.to,
      subject: `CMPC LIMS - Análisis Completado: ${data.codigoQR}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2980b9;">Análisis Completado</h2>
          <p>Estimado/a <strong>${data.investigadorNombre}</strong>,</p>
          <p>Le informamos que el análisis de su muestra ha sido completado.</p>

          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Código QR:</strong> ${data.codigoQR}</p>
            <p><strong>Tipo de Análisis:</strong> ${data.tipoAnalisis}</p>
            <p><strong>Fecha de Finalización:</strong> ${format(data.fechaFin, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</p>
          </div>

          <p>Puede ver los resultados accediendo al sistema CMPC LIMS.</p>

          <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
            Este es un correo automático del sistema CMPC LIMS. Por favor no responda a este mensaje.
          </p>
        </div>
      `,
    });
  }

  /**
   * Notifica alertas de vencimiento de muestras en bodega
   */
  async notifyStorageExpiration(data: {
    to: string;
    responsableNombre: string;
    muestrasProximasVencer: Array<{
      codigoQR: string;
      ubicacion: string;
      fechaVencimiento: Date;
    }>;
  }) {
    const muestrasHtml = data.muestrasProximasVencer
      .map(
        (muestra) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${muestra.codigoQR}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${muestra.ubicacion}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${format(muestra.fechaVencimiento, 'dd/MM/yyyy')}</td>
        </tr>
      `,
      )
      .join('');

    await this.mailerService.sendMail({
      to: data.to,
      subject: `CMPC LIMS - Alerta: Muestras Próximas a Vencer`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">⚠️ Alerta de Vencimiento de Muestras</h2>
          <p>Estimado/a <strong>${data.responsableNombre}</strong>,</p>
          <p>Le informamos que las siguientes muestras están próximas a vencer:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #2980b9; color: white;">
                <th style="padding: 10px; border: 1px solid #ddd;">Código QR</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Ubicación</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              ${muestrasHtml}
            </tbody>
          </table>

          <p>Por favor, tome las acciones necesarias.</p>

          <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
            Este es un correo automático del sistema CMPC LIMS. Por favor no responda a este mensaje.
          </p>
        </div>
      `,
    });
  }

  /**
   * Notifica cuando un requerimiento ha sido creado
   */
  async notifyRequirementCreated(data: {
    to: string;
    investigadorNombre: string;
    codigo: string;
    numeroMuestras: number;
  }) {
    await this.mailerService.sendMail({
      to: data.to,
      subject: `CMPC LIMS - Nuevo Requerimiento Creado: ${data.codigo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">✓ Requerimiento Creado</h2>
          <p>Estimado/a <strong>${data.investigadorNombre}</strong>,</p>
          <p>Su requerimiento ha sido creado exitosamente.</p>

          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Código de Requerimiento:</strong> ${data.codigo}</p>
            <p><strong>Número de Muestras:</strong> ${data.numeroMuestras}</p>
          </div>

          <p>Puede hacer seguimiento de su requerimiento en el sistema CMPC LIMS.</p>

          <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
            Este es un correo automático del sistema CMPC LIMS. Por favor no responda a este mensaje.
          </p>
        </div>
      `,
    });
  }

  /**
   * Notifica cuando una muestra ha sido recibida en el laboratorio
   */
  async notifySampleReceived(data: {
    to: string;
    investigadorNombre: string;
    codigoQR: string;
    codigoRequerimiento: string;
    fechaRecepcion: Date;
  }) {
    await this.mailerService.sendMail({
      to: data.to,
      subject: `CMPC LIMS - Muestra Recibida: ${data.codigoQR}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2980b9;">Muestra Recibida</h2>
          <p>Estimado/a <strong>${data.investigadorNombre}</strong>,</p>
          <p>Le informamos que su muestra ha sido recibida en el laboratorio.</p>

          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Código QR:</strong> ${data.codigoQR}</p>
            <p><strong>Requerimiento:</strong> ${data.codigoRequerimiento}</p>
            <p><strong>Fecha de Recepción:</strong> ${format(data.fechaRecepcion, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</p>
          </div>

          <p>Puede hacer seguimiento del estado de su muestra en el sistema CMPC LIMS.</p>

          <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
            Este es un correo automático del sistema CMPC LIMS. Por favor no responda a este mensaje.
          </p>
        </div>
      `,
    });
  }

  /**
   * Método genérico para enviar correos personalizados
   */
  async sendCustomEmail(data: {
    to: string | string[];
    subject: string;
    html: string;
    attachments?: Array<{
      filename: string;
      content: Buffer;
    }>;
  }) {
    await this.mailerService.sendMail({
      to: data.to,
      subject: data.subject,
      html: data.html,
      attachments: data.attachments,
    });
  }
}
