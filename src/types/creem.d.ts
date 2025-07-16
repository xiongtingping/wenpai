/**
 * Creem SDK 类型定义
 */

declare module 'creem' {
  export interface CreemConfig {
    apiKey?: string;
    xApiKey?: string;
    baseURL?: string;
    timeout?: number;
  }

  export interface CreateCheckoutRequest {
    productId?: string;
    apiKey?: string;
    xApiKey?: string;
    headers?: Record<string, string>;
    createCheckoutRequest?: {
      productId: string;
      xApiKey?: string;
    };
  }

  export interface CreateCheckoutResponse {
    id: string;
    productId: string;
    amount: number | string;
    currency: string;
    status: string;
    alipayQrCodeUrl?: string;
    alipay_qr_code_url?: string;
    qrCodeUrl?: string;
    qrCodes?: {
      alipay?: string;
      wechat?: string;
    };
    createdAt: string;
    updatedAt: string;
  }

  export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
  }

  export interface Transaction {
    id: string;
    checkoutId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }

  export interface RetrieveProductRequest {
    productId: string;
    xApiKey?: string;
  }

  export interface RetrieveCheckoutRequest {
    checkoutId: string;
    xApiKey?: string;
  }

  export interface SearchProductsRequest {
    xApiKey?: string;
    limit?: number;
    offset?: number;
  }

  export interface SearchTransactionsRequest {
    xApiKey?: string;
    limit?: number;
    offset?: number;
  }

  export class Creem {
    constructor(config?: CreemConfig);
    
    /**
     * 创建支付订单
     */
    createCheckout(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse>;
    
    /**
     * 获取订单状态
     */
    getCheckout(checkoutId: string): Promise<CreateCheckoutResponse>;
    retrieveCheckout(request: RetrieveCheckoutRequest): Promise<CreateCheckoutResponse>;
    
    /**
     * 获取产品信息
     */
    getProduct(productId: string): Promise<Product>;
    retrieveProduct(request: RetrieveProductRequest): Promise<Product>;
    
    /**
     * 获取产品列表
     */
    getProducts(): Promise<Product[]>;
    searchProducts(request?: SearchProductsRequest): Promise<Product[]>;
    
    /**
     * 搜索交易记录
     */
    searchTransactions(request?: SearchTransactionsRequest): Promise<Transaction[]>;
  }

  export default Creem;
} 