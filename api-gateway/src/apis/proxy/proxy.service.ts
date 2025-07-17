import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { CONFIG } from 'src/config/config';
import * as http from 'http';

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

    const forwardableHeaders = ['authorization', 'content-type', 'accept'];

    const filteredHeaders: Record<string, string> = Object.fromEntries(
      Object.entries({
        ...this.request.headers,
        ...headers,
      })
        .filter(([key]) => forwardableHeaders.includes(key.toLowerCase()))
        .map(([key, value]) => [key.toLowerCase(), String(value)]),
    );

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          data,
          headers: filteredHeaders,
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

  async forwardStreamRequest(
    service: keyof typeof this.SERVICE,
    path: string,
    req: Request,
    res: Response,
  ) {
    const target = this.SERVICE[service];
    const targetUrl = `${target}/${path}`;

    const options: http.RequestOptions = {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(target).host,
      },
    };

    const proxyReq = http.request(targetUrl, options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    });

    req.pipe(proxyReq);

    proxyReq.on('error', (err) => {
      console.error(`[${service}] Proxy error:`, err);
      res.status(502).json({ message: 'Bad Gateway' });
    });
  }
}
