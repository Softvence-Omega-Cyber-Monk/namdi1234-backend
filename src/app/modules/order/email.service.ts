import nodemailer from 'nodemailer';
import { IOrder, OrderStatus } from '../order/order.interface';

interface IEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface IVendorOrderEmailData {
  vendorEmail: string;
  vendorName: string;
  order: any;
  products: Array<{
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

export class EmailService {
  sendAdminOrderNotification(adminEmail: string, arg1: IOrder & Required<{ _id: unknown; }> & { __v: number; }) {
    throw new Error('Method not implemented.');
  }
  sendOrderCancellationEmail(email: any, arg1: any, arg2: IOrder & Required<{ _id: unknown; }> & { __v: number; }, reason: string | undefined) {
    throw new Error('Method not implemented.');
  }
  sendOrderStatusUpdateEmail(email: any, arg1: any, arg2: IOrder & Required<{ _id: unknown; }> & { __v: number; }, PENDING: OrderStatus, CONFIRMED: OrderStatus) {
    throw new Error('Method not implemented.');
  }
  private transporter: nodemailer.Transporter;

  constructor() {
    const port = parseInt(process.env.SMTP_PORT || '587');
    const config: IEmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    // Add additional options for Gmail
    const transportConfig: any = {
      ...config,
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000
    };

    this.transporter = nodemailer.createTransport(transportConfig);

    // Test connection on initialization
    this.testConnection().then(success => {
      if (success) {
        console.log('✅ Email service initialized successfully');
      } else {
        console.error('❌ Email service initialization failed');
      }
    });
  }

  /**
   * Send order notification email to vendor
   */
  async sendVendorOrderNotification(data: IVendorOrderEmailData): Promise<void> {
    try {
      console.log(`📧 Attempting to send email to vendor: ${data.vendorEmail}`);

      const { vendorEmail, vendorName, order, products } = data;

      // Validate email address
      if (!vendorEmail || !this.isValidEmail(vendorEmail)) {
        console.error(`❌ Invalid vendor email address: ${vendorEmail}`);
        throw new Error(`Invalid vendor email address: ${vendorEmail}`);
      }

      const productRows = products
        .map(
          (product) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.productName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${product.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">BHD ${product.price.toFixed(3)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">BHD ${product.total.toFixed(3)}</td>
        </tr>
      `
        )
        .join('');

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #4CAF50; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">New Order Received!</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hello <strong>${vendorName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                You have received a new order. Please review the details below and prepare for shipment.
              </p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; border-left: 4px solid #4CAF50;">
                <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #333;">Order Information</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #666; font-size: 14px;">Order Number:</td>
                    <td style="color: #333; font-weight: bold; font-size: 14px; text-align: right;">${order.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px;">Order Date:</td>
                    <td style="color: #333; font-size: 14px; text-align: right;">${new Date(order.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px;">Order Status:</td>
                    <td style="color: #333; font-size: 14px; text-align: right;">
                      <span style="background-color: #2196F3; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
                        ${order.status}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #333;">Shipping Address</h2>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;"><strong>${order.shippingAddress.fullName}</strong></p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${order.shippingAddress.addressSpecific}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${order.shippingAddress.country}</p>
                <p style="margin: 0; font-size: 14px; color: #666;">Phone: ${order.shippingAddress.mobileNumber}</p>
              </div>
            </td>
          </tr>

          <!-- Products Table -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #333;">Order Items</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 6px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    <th style="padding: 12px 10px; text-align: left; font-size: 14px; color: #666; font-weight: 600;">Product</th>
                    <th style="padding: 12px 10px; text-align: center; font-size: 14px; color: #666; font-weight: 600;">Qty</th>
                    <th style="padding: 12px 10px; text-align: right; font-size: 14px; color: #666; font-weight: 600;">Price</th>
                    <th style="padding: 12px 10px; text-align: right; font-size: 14px; color: #666; font-weight: 600;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${productRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px;">
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #666; font-size: 14px;">Subtotal:</td>
                    <td style="color: #333; font-size: 14px; text-align: right;">BHD ${order.totalPrice.toFixed(3)}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px;">Shipping Fee:</td>
                    <td style="color: #333; font-size: 14px; text-align: right;">BHD ${order.shippingFee.toFixed(3)}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px;">Tax:</td>
                    <td style="color: #333; font-size: 14px; text-align: right;">BHD ${order.tax.toFixed(3)}</td>
                  </tr>
                  ${order.discount > 0 ? `
                  <tr>
                    <td style="color: #666; font-size: 14px;">Discount:</td>
                    <td style="color: #4CAF50; font-size: 14px; text-align: right;">- BHD ${order.discount.toFixed(3)}</td>
                  </tr>
                  ` : ''}
                  <tr style="border-top: 2px solid #ddd;">
                    <td style="color: #333; font-size: 18px; font-weight: bold; padding-top: 10px;">Grand Total:</td>
                    <td style="color: #4CAF50; font-size: 18px; font-weight: bold; text-align: right; padding-top: 10px;">BHD ${order.grandTotal.toFixed(3)}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          ${order.orderNotes ? `
          <!-- Order Notes -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #333;">Customer Notes</h2>
              <div style="background-color: #fff9e6; padding: 15px; border-radius: 6px; border-left: 4px solid #FFC107;">
                <p style="margin: 0; font-size: 14px; color: #666; font-style: italic;">"${order.orderNotes}"</p>
              </div>
            </td>
          </tr>
          ` : ''}
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9f9f9; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #999; text-align: center;">
                This is an automated notification. Please do not reply to this email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
                &copy; ${new Date().getFullYear()} ${process.env.COMPANY_NAME || process.env.MERCHANT_NAME || 'MDItems'}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || process.env.MERCHANT_NAME || 'MDItems'}" <${process.env.SMTP_USER}>`,
        to: vendorEmail,
        subject: `New Order Received - ${order.orderNumber}`,
        html: emailHtml
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Order notification email sent successfully to vendor: ${vendorEmail}`);
      console.log(`📧 Message ID: ${info.messageId}`);
    } catch (error) {
      console.error('❌ Error sending vendor order notification email:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      throw new Error(`Failed to send vendor notification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send order confirmation email to customer
   */
  async sendCustomerOrderConfirmation(customerEmail: string, customerName: string, order: IOrder): Promise<void> {
    try {
      console.log(`📧 Attempting to send confirmation email to customer: ${customerEmail}`);

      // Validate email address
      if (!customerEmail || !this.isValidEmail(customerEmail)) {
        console.error(`❌ Invalid customer email address: ${customerEmail}`);
        throw new Error(`Invalid customer email address: ${customerEmail}`);
      }

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #4CAF50; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Order Confirmed!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px;">Dear ${customerName},</p>
              <p style="margin: 0 0 20px 0; font-size: 16px;">Thank you for your order! Your order <strong>${order.orderNumber}</strong> has been confirmed and is being processed.</p>
              <p style="margin: 0; font-size: 16px;">Order Total: <strong>BHD ${order.grandTotal.toFixed(3)}</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #f9f9f9; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
                &copy; ${new Date().getFullYear()} ${process.env.COMPANY_NAME || process.env.MERCHANT_NAME || 'MDItems'}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || process.env.MERCHANT_NAME || 'MDItems'}" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: emailHtml
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Order confirmation email sent successfully to customer: ${customerEmail}`);
      console.log(`📧 Message ID: ${info.messageId}`);
    } catch (error) {
      console.error('❌ Error sending customer order confirmation email:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      // Don't throw error to prevent order creation failure
    }
  }

  /**
   * Validate email address format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready and verified');
      return true;
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name
        });
      }
      return false;
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(to: string): Promise<boolean> {
    try {
      console.log(`📧 Sending test email to: ${to}`);

      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Test'}" <${process.env.SMTP_USER}>`,
        to: to,
        subject: 'Test Email - Email Service Working',
        html: '<h1>Test Email</h1><p>If you receive this email, your email service is working correctly!</p>'
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Test email sent successfully! Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return false;
    }
  }

}

export const emailService = new EmailService();