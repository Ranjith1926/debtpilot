import bcrypt from 'bcryptjs';
import { userRepository } from '@/repositories/user.repository';
import { generateTokenPair, verifyRefreshToken } from '@/lib/jwt';
import { verifyFirebaseToken, getFirebaseUser } from '@/firebase/admin';
import { cacheSet, cacheDel } from '@/lib/redis';
import { CACHE_KEYS, CACHE_TTL } from '@/config/constants';
import { generateSecureToken } from '@/utils/encryption';
import prisma from '@/lib/prisma';
import type { RegisterInput, LoginInput, FirebaseAuthInput, TokenPair } from '@/types';

const SALT_ROUNDS = 12;

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: object; tokens: TokenPair }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new Error('Email already registered');

    if (input.phone) {
      const existingPhone = await userRepository.findByPhone(input.phone);
      if (existingPhone) throw new Error('Phone number already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      firebaseUid: input.firebaseToken ?? null,
    });

    const tokens = generateTokenPair({ sub: user.id, email: user.email, role: user.role });
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const safeUser = this.sanitizeUser(user);
    await cacheSet(CACHE_KEYS.USER(user.id), safeUser, CACHE_TTL.MEDIUM);

    return { user: safeUser, tokens };
  }

  async login(input: LoginInput): Promise<{ user: object; tokens: TokenPair }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.passwordHash) throw new Error('Invalid credentials');
    if (!user.isActive) throw new Error('Account is deactivated');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const tokens = generateTokenPair({ sub: user.id, email: user.email, role: user.role });
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const safeUser = this.sanitizeUser(user);
    await cacheSet(CACHE_KEYS.USER(user.id), safeUser, CACHE_TTL.MEDIUM);

    return { user: safeUser, tokens };
  }

  async loginWithFirebase(input: FirebaseAuthInput): Promise<{ user: object; tokens: TokenPair }> {
    const decoded = await verifyFirebaseToken(input.idToken);
    const firebaseUser = await getFirebaseUser(decoded.uid);

    let user = await userRepository.findByFirebaseUid(decoded.uid);

    if (!user) {
      user = await userRepository.upsertByFirebaseUid(decoded.uid, {
        firebaseUid: decoded.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || `${decoded.uid}@firebase.local`,
        phone: firebaseUser.phoneNumber,
        isEmailVerified: firebaseUser.emailVerified,
        isPhoneVerified: !!firebaseUser.phoneNumber,
      });
    }

    if (input.deviceToken) {
      const notifRepo = await import('@/repositories/notification.repository');
      await notifRepo.notificationRepository.upsertDeviceToken(
        user.id,
        input.deviceToken,
        input.platform || 'unknown',
      );
    }

    const tokens = generateTokenPair({ sub: user.id, email: user.email, role: user.role });
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = verifyRefreshToken(refreshToken);

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive) throw new Error('User not found or deactivated');

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } });

    const tokens = generateTokenPair({ sub: user.id, email: user.email, role: user.role });
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, token: refreshToken },
      data: { isRevoked: true },
    });
    await cacheDel(CACHE_KEYS.USER(userId));
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  }

  private sanitizeUser(user: { id: string; name: string; email: string; phone: string | null; role: string; profileImage: string | null; language: string; theme: string; monthlyIncome: unknown }) {
    const { id, name, email, phone, role, profileImage, language, theme, monthlyIncome } = user;
    return { id, name, email, phone, role, profileImage, language, theme, monthlyIncome };
  }
}

export const authService = new AuthService();
