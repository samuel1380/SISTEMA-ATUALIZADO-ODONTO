export const defineMock = (classMock: any, funcao: string, returnValue: any) => {
  const mockJest = jest.fn();

  if (typeof returnValue !== 'function') {
    jest.spyOn(classMock, funcao).mockImplementation(async (...args: [any]) => {
      mockJest.apply(this, args);
      return await new Promise((resolve) => {
        resolve(returnValue);
      });
    });
  } else {

    jest.spyOn(classMock, funcao).mockImplementation((...args: [any]) => {
      mockJest.apply(this, args);

      return returnValue.apply(args);
    });
  }

  return mockJest;
};
