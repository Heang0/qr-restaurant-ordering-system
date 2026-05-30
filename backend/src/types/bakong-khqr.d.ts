declare module 'bakong-khqr' {
  export class BakongKHQR {
    generateIndividual(individualInfo: IndividualInfo): any;
  }

  export const khqrData: {
    currency: {
      usd: string;
      khr: string;
    };
  };

  export class IndividualInfo {
    constructor(
      accountId: string,
      merchantName: string,
      merchantCity: string,
      optionalData: any
    );
  }
}
