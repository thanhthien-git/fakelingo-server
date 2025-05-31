"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TokenModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const token_service_1 = require("./token.service");
let TokenModule = TokenModule_1 = class TokenModule {
    static forRoot(secret) {
        if (!secret) {
            throw new Error('Secret Key must be provided');
        }
        const jwtModule = jwt_1.JwtModule.register({
            secret,
            signOptions: { expiresIn: '100h' },
        });
        return {
            module: TokenModule_1,
            imports: [jwtModule],
            providers: [token_service_1.TokenService],
            exports: [token_service_1.TokenService, jwtModule],
        };
    }
    static forRootAsync(options) {
        const jwtModule = jwt_1.JwtModule.registerAsync({
            imports: options.imports,
            useFactory: async (...args) => {
                const config = await options.useFactory(...args);
                return {
                    ...config,
                    signOptions: config.signOptions ?? { expiresIn: '100h' },
                };
            },
            inject: options.inject || [],
        });
        return {
            module: TokenModule_1,
            imports: [jwtModule],
            providers: [token_service_1.TokenService],
            exports: [token_service_1.TokenService, jwtModule],
        };
    }
};
exports.TokenModule = TokenModule;
exports.TokenModule = TokenModule = TokenModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], TokenModule);
//# sourceMappingURL=token.module.js.map