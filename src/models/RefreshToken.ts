import mongoose from 'mongoose';

interface IRefreshToken {
  userId: mongoose.Schema.Types.ObjectId;
  token: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  isRevoked: { 
    type: Boolean, 
    default: false 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index cho việc tìm kiếm và cleanup
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

export default mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);