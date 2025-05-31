import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/jwt-payload.interface';
import { ITokenPayload } from './dto/generate-token.dto';
export declare class TokenService {
    private jwtService;
    constructor(jwtService: JwtService);
    verifyToken(token: string): Promise<TokenPayload | null>;
    generateToken(dto: ITokenPayload): Promise<string>;
}
//# sourceMappingURL=token.service.d.ts.map