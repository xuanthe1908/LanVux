import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';
import config from '../config';
import logger from '../utils/logger';

export interface VNPayPaymentData {
  orderId: string;
  amount: number;
  orderDescription: string;
  orderType: string;
  ipAddress: string;
  bankCode?: string;
  locale?: string;
}

export interface VNPayReturnData {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHashType: string;
  vnp_SecureHash: string;
}

export interface VNPayQueryData {
  orderId: string;
  transDate: string;
  ipAddress: string;
}

class VNPayService {
  private tmnCode: string;
  private hashSecret: string;
  private url: string;
  private returnUrl: string;
  private apiUrl: string;

  constructor() {
    this.tmnCode = config.vnpay.tmnCode;
    this.hashSecret = config.vnpay.hashSecret;
    this.url = config.vnpay.url;
    this.returnUrl = config.vnpay.returnUrl;
    this.apiUrl = config.vnpay.apiUrl;
  }

  /**
   * Create VNPay payment URL
   */
  createPaymentUrl(paymentData: VNPayPaymentData): string {
    try {
      const createDate = moment().format('YYYYMMDDHHmmss');
      const expireDate = moment().add(15, 'minutes').format('YYYYMMDDHHmmss');

      const vnpParams: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.tmnCode,
        vnp_Locale: paymentData.locale || config.payment.locale,
        vnp_CurrCode: config.payment.currency,
        vnp_TxnRef: paymentData.orderId,
        vnp_OrderInfo: paymentData.orderDescription,
        vnp_OrderType: paymentData.orderType,
        vnp_Amount: paymentData.amount * 100, // VNPay requires amount in VND cents
        vnp_ReturnUrl: this.returnUrl,
        vnp_IpAddr: paymentData.ipAddress,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate
      };

      // Add bank code if provided
      if (paymentData.bankCode) {
        vnpParams.vnp_BankCode = paymentData.bankCode;
      }

      // Sort parameters
      const sortedParams = this.sortObject(vnpParams);
      
      // Create query string
      const queryString = qs.stringify(sortedParams, { encode: false });
      
      // Create secure hash
      const secureHash = crypto
        .createHmac('sha512', this.hashSecret)
        .update(queryString)
        .digest('hex');
      
      // Final URL with secure hash
      const paymentUrl = `${this.url}?${queryString}&vnp_SecureHash=${secureHash}`;
      
      logger.info('VNPay payment URL created', {
        orderId: paymentData.orderId,
        amount: paymentData.amount
      });

      return paymentUrl;
    } catch (error) {
      logger.error('Error creating VNPay payment URL:', error);
      throw new Error('Failed to create payment URL');
    }
  }

  /**
   * Verify VNPay return data
   */
  verifyReturnUrl(returnData: VNPayReturnData): boolean {
    try {
      const secureHash = returnData.vnp_SecureHash;
      delete (returnData as any).vnp_SecureHash;
      delete (returnData as any).vnp_SecureHashType;

      const sortedParams = this.sortObject(returnData);
      const queryString = qs.stringify(sortedParams, { encode: false });
      
      const expectedHash = crypto
        .createHmac('sha512', this.hashSecret)
        .update(queryString)
        .digest('hex');

      const isValid = secureHash === expectedHash;
      
      logger.info('VNPay return verification', {
        orderId: returnData.vnp_TxnRef,
        isValid,
        responseCode: returnData.vnp_ResponseCode
      });

      return isValid;
    } catch (error) {
      logger.error('Error verifying VNPay return:', error);
      return false;
    }
  }

  /**
   * Query payment status from VNPay
   */
  async queryPayment(queryData: VNPayQueryData): Promise<any> {
    try {
      const requestId = moment().format('YYYYMMDDHHmmss');
      
      const vnpParams: any = {
        vnp_RequestId: requestId,
        vnp_Version: '2.1.0',
        vnp_Command: 'querydr',
        vnp_TmnCode: this.tmnCode,
        vnp_TxnRef: queryData.orderId,
        vnp_OrderInfo: `Query transaction ${queryData.orderId}`,
        vnp_TransactionDate: queryData.transDate,
        vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
        vnp_IpAddr: queryData.ipAddress
      };

      const sortedParams = this.sortObject(vnpParams);
      const queryString = qs.stringify(sortedParams, { encode: false });
      
      const secureHash = crypto
        .createHmac('sha512', this.hashSecret)
        .update(queryString)
        .digest('hex');
      
      vnpParams.vnp_SecureHash = secureHash;

      // Make API request to VNPay
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vnpParams)
      });

      const result = await response.json() as Record<string, any>;
      
      logger.info('VNPay query result', {
        orderId: queryData.orderId,
        responseCode: result.vnp_ResponseCode
      });

      return result;
    } catch (error) {
      logger.error('Error querying VNPay payment:', error);
      throw new Error('Failed to query payment status');
    }
  }

  /**
   * Process refund request
   */
  async processRefund(refundData: {
    orderId: string;
    amount: number;
    transactionNo: string;
    transDate: string;
    createBy: string;
    ipAddress: string;
  }): Promise<any> {
    try {
      const requestId = moment().format('YYYYMMDDHHmmss');
      
      const vnpParams: any = {
        vnp_RequestId: requestId,
        vnp_Version: '2.1.0',
        vnp_Command: 'refund',
        vnp_TmnCode: this.tmnCode,
        vnp_TransactionType: '02', // Partial refund
        vnp_TxnRef: refundData.orderId,
        vnp_Amount: refundData.amount * 100,
        vnp_OrderInfo: `Refund for order ${refundData.orderId}`,
        vnp_TransactionNo: refundData.transactionNo,
        vnp_TransactionDate: refundData.transDate,
        vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
        vnp_CreateBy: refundData.createBy,
        vnp_IpAddr: refundData.ipAddress
      };

      const sortedParams = this.sortObject(vnpParams);
      const queryString = qs.stringify(sortedParams, { encode: false });
      
      const secureHash = crypto
        .createHmac('sha512', this.hashSecret)
        .update(queryString)
        .digest('hex');
      
      vnpParams.vnp_SecureHash = secureHash;

      // Make API request to VNPay
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vnpParams)
      });

      const result = await response.json() as Record<string, any>;
      
      logger.info('VNPay refund result', {
        orderId: refundData.orderId,
        responseCode: result.vnp_ResponseCode
      });

      return result;
    } catch (error) {
      logger.error('Error processing VNPay refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Get payment method list
   */
  getPaymentMethods(): Array<{code: string, name: string}> {
    return [
      { code: 'VNPAYQR', name: 'VNPay QR Code' },
      { code: 'VNBANK', name: 'Domestic ATM/Internet Banking' },
      { code: 'INTCARD', name: 'International Card' },
      { code: 'VISA', name: 'Visa' },
      { code: 'MASTERCARD', name: 'MasterCard' },
      { code: 'JCB', name: 'JCB' },
      { code: 'BIDV', name: 'BIDV' },
      { code: 'VCB', name: 'Vietcombank' },
      { code: 'VIETINBANK', name: 'VietinBank' },
      { code: 'TCB', name: 'Techcombank' },
      { code: 'MB', name: 'MBBank' },
      { code: 'VPB', name: 'VPBank' },
      { code: 'ACB', name: 'ACB' },
      { code: 'VIB', name: 'VIB' },
      { code: 'SACOMBANK', name: 'Sacombank' },
      { code: 'EXIMBANK', name: 'Eximbank' },
      { code: 'MSBANK', name: 'MSBank' },
      { code: 'NAMABANK', name: 'NamABank' },
      { code: 'OCB', name: 'OCB' },
      { code: 'SHB', name: 'SHB' },
      { code: 'TPBANK', name: 'TPBank' }
    ];
  }

  /**
   * Sort object keys alphabetically
   */
  private sortObject(obj: any): any {
    const sorted: any = {};
    const str = [];
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    
    str.sort();
    
    for (let key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    
    return sorted;
  }

  /**
   * Get VNPay response codes
   */
  getResponseCodeMessage(code: string): string {
    const codes: { [key: string]: string } = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    };

    return codes[code] || 'Mã lỗi không xác định';
  }
}

export default new VNPayService();