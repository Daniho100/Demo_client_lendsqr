export interface IUser {
  id: number;
  email: string;
  name: string;
  password: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface IWallet {
  id: number;
  user_id: number;
  balance: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ITransaction {
  id: number;
  wallet_id: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_SENT' | 'TRANSFER_RECEIVED';
  amount: number;
  recipient_wallet_id?: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: Date;
  updated_at: Date;
}

export interface ICreateUserRequest {
  email: string;
  name: string;
  password: string,
}

export interface IDepositRequest {
  amount: number;
}

export interface ITransferRequest {
  toEmail: string;
  amount: number;
}

export interface IWithdrawRequest {
  amount: number;
}

export interface IJWTPayload {
  userId: number;
  email: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
    }
  }
}