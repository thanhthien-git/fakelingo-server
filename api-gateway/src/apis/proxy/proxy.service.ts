import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { CONFIG } from 'src/config/config';

@Injectable({ scope: Scope.REQUEST })
export class ProxyService {
  private readonly SERVICE = {
    AUTH: CONFIG.AUTH_SERVICE.url,
    USER: CONFIG.USER_SERVICE.url,
    CACHING: CONFIG.CACHING_SERVICE.url,
    MESSAGE: CONFIG.MESSAGE_SERVICE.url,
    NOTI: CONFIG.NOTIFICATION_SERVICE.url,
    FEED: CONFIG.FEED_SERVICE.url,
    MATCH: CONFIG.MATCH_SERVICE.url,
    SWIPE: CONFIG.SWIPE_SERVICE.url,
  };

  constructor(
    private readonly httpService: HttpService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async forwardRequest<T = any>(
    service: keyof typeof this.SERVICE,
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    data?: any,
    headers?: any,
    query?: any,
  ): Promise<T> {
    const baseUrl = this.SERVICE[service];
    const url = `${baseUrl}/${path}`;

    const reqHeader = this.request.headers;

    const requestHeader = {
      ...headers,
      ...reqHeader,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          data,
          headers: requestHeader,
          params: query,
        }),
      );
      return response.data;
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'Unknown error';
      throw new Error(`[${service}] ${message}`);
    }
  }
}
