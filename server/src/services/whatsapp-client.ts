import axios from 'axios';

export class WhatsAppClient {
  private apiUrl = 'https://graph.facebook.com/v18.0';
  private phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  private isDev = process.env.NODE_ENV === 'development';

  async sendText(to: string, text: string) {
    if (this.isDev) {
      console.log('[WhatsApp MOCK] sendText to', to, ':', text.slice(0, 50) + '...');
      return { success: true };
    }
    try {
      await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: this.formatPhone(to),
          type: 'text',
          text: { body: text }
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('WhatsApp sendText error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendInteractive(to: string, options: {
    type: 'button' | 'list';
    body: string;
    buttons?: Array<{ id: string; title: string }>;
    list?: { title: string; sections: any[] };
  }) {
    if (this.isDev) {
      console.log('[WhatsApp MOCK] sendInteractive to', to, options.type);
      return { success: true };
    }
    try {
      let interactive: any = {
        type: options.type,
        body: { text: options.body }
      };

      if (options.type === 'button' && options.buttons) {
        interactive.action = {
          buttons: options.buttons.map(btn => ({
            type: 'reply',
            reply: { id: btn.id, title: btn.title }
          }))
        };
      }

      if (options.type === 'list' && options.list) {
        interactive.action = options.list;
      }

      await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: this.formatPhone(to),
          type: 'interactive',
          interactive
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('WhatsApp sendInteractive error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendDocument(to: string, document: { url: string; caption?: string; filename: string }) {
    if (this.isDev) {
      console.log('[WhatsApp MOCK] sendDocument to', to);
      return { success: true };
    }
    try {
      await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: this.formatPhone(to),
          type: 'document',
          document: {
            link: document.url,
            caption: document.caption,
            filename: document.filename
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('WhatsApp sendDocument error:', error.response?.data || error.message);
      throw error;
    }
  }

  async downloadMedia(mediaId: string): Promise<Buffer> {
    if (this.isDev) {
      console.log('[WhatsApp MOCK] downloadMedia', mediaId);
      return Buffer.from('mock receipt image data');
    }
    try {
      const mediaUrlResponse = await axios.get(
        `${this.apiUrl}/${mediaId}`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        }
      );

      const mediaUrl = mediaUrlResponse.data.url;

      const mediaResponse = await axios.get(mediaUrl, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
        responseType: 'arraybuffer'
      });

      return Buffer.from(mediaResponse.data);
    } catch (error) {
      console.error('WhatsApp downloadMedia error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getMediaUrl(mediaId: string): Promise<string> {
    if (this.isDev) {
      console.log('[WhatsApp MOCK] getMediaUrl', mediaId);
      return 'https://mock-media-url.com/image.jpg';
    }
    try {
      const response = await axios.get(
        `${this.apiUrl}/${mediaId}`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        }
      );
      return response.data.url;
    } catch (error) {
      console.error('WhatsApp getMediaUrl error:', error.response?.data || error.message);
      throw error;
    }
  }

  private formatPhone(phone: string): string {
    // Remove any non-digit characters and ensure it starts with country code
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned;
    }
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    return cleaned;
  }
}
