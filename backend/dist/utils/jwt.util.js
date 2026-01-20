"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
function signJwt(jwtService, payload) {
    return jwtService.sign(payload);
}
//# sourceMappingURL=jwt.util.js.map