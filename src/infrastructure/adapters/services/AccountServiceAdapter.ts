import { CircuitBreakerPolicy, RetryPolicy } from 'cockatiel';
import axios from 'axios';
import { IAccountService } from '@/core/ports/outbound/IAccountService';
import { AppConfig, RegisterData } from '@/core/types';
import { ExternalServiceError } from '@/core/errors/errors';
import { DI_TOKENS } from '@/config/di-tokens';
import { inject, injectable } from 'tsyringe';
import { createCircuitBreakerPolicy, createRetryPolicy } from '@/utils/resilience';

/**
 * Service class responsible for handling account-related actions such as
 * creating a new user or updating the password. It implements fault-tolerant
 * mechanisms like circuit breakers and retry strategies for resilience.
 */
@injectable()
export class AccountServiceAdapter implements IAccountService {
  private readonly baseUrl: string;
  private readonly endpoints: { createUser: string; updatePassword: string };
  private readonly retryPolicy: RetryPolicy;
  private readonly breakerPolicy: CircuitBreakerPolicy;

  constructor(
    @inject(DI_TOKENS.APP_CONFIG)
    private readonly config: AppConfig
  ) {
    this.baseUrl = this.config.services.accountService.baseUrl;
    this.endpoints = this.config.services.accountService.endpoints;
    this.retryPolicy = createRetryPolicy(3, 1000, 10000);
    this.breakerPolicy = createCircuitBreakerPolicy(4, 1000, 10000);
  }

  /**
   * Calls the account service to create a new user.
   * Utilizes a circuit breaker and retry mechanism to ensure resiliency.
   *
   * @param {CreateUserDto} user - Data transfer object containing user information.
   * @throws Will throw an error if the request fails after retries and circuit breaker timeouts.
   */
  public async createUser(user: RegisterData): Promise<any> {
    try {
      return await this.retryPolicy.execute(() =>
        this.breakerPolicy.execute(async () => {
          const url = `${this.baseUrl}${this.endpoints.createUser}`;
          console.log('Trying to create user with account service on URL:', url);
          const response = await axios.post(url, {
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            password_hash: user.password,
            role: user.role,
          });
          return response.data;
        })
      );
    } catch (error: any) {
      throw new ExternalServiceError(`Error in trying to create user: ${error.message}`);
    }
  }

  /**
   * Calls the account service to update a user's password.
   * Applies a circuit breaker and retry mechanism for robust handling of transient failures.
   *
   * @param {string} userId - The ID of the user whose password is to be updated.
   * @param {string} newPassword - The new password to set for the user.
   * @throws Will throw an error if the request fails after retries and circuit breaker timeouts.
   */
  public async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      return await this.retryPolicy.execute(() =>
        this.breakerPolicy.execute(async () => {
          const url = `${this.baseUrl}${this.endpoints.updatePassword.replace(':userId', userId)}`;
          console.log('Trying to update password with account service on URL:', url);
          const response = await axios.post(url, { newPassword });
          return response.data;
        })
      );
    } catch (error: any) {
      throw new ExternalServiceError(`Error in trying to update password: ${error}`);
    }
  }
}
