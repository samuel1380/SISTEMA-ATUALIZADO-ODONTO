"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineMock = void 0;
const defineMock = (classMock, funcao, returnValue) => {
    const mockJest = jest.fn();
    if (typeof returnValue !== 'function') {
        jest.spyOn(classMock, funcao).mockImplementation(async (...args) => {
            mockJest.apply(this, args);
            return await new Promise((resolve) => {
                resolve(returnValue);
            });
        });
    }
    else {
        jest.spyOn(classMock, funcao).mockImplementation((...args) => {
            mockJest.apply(this, args);
            return returnValue.apply(args);
        });
    }
    return mockJest;
};
exports.defineMock = defineMock;
//# sourceMappingURL=mockBase.model.mock.js.map