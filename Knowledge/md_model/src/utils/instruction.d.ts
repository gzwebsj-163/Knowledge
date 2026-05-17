export interface Instruction {
  opcode: Opcode;
  data?: any;
  signature?: string;
}

export class Instruction implements Instruction {
  opcode: Opcode;
  data?: any;
  signature?: string;

  constructor(opcode: Opcode, data?: any, signature?: string) {
    this.opcode = opcode;
    this.data = data;
    this.signature = signature;
  }

  getOpcode(): Opcode {
    return this.opcode;
  }

  setOpcode(opcode: Opcode): void {
    this.opcode = opcode;
  }

  getData(): any | undefined {
    return this.data;
  }

  setData(data: any): void {
    this.data = data;
  }

  clearData(): void {
    this.data = undefined;
  }

  getSignature(): string | undefined {
    return this.signature;
  }

  setSignature(signature: string): void {
    this.signature = signature;
  }

  clearSignature(): void {
    this.signature = undefined;
  }

  hasSignature(): boolean {
    return !!this.signature;
  }

  isSigned(): boolean {
    return this.hasSignature();
  }

  hasData(): boolean {
    return this.data !== null && this.data !== undefined;
  }

  toJSON(): Instruction {
    return {
    opcode: this.opcode,
    data: this.data,
    signature: this.signature,
    getOpcode: function (): Opcode {
        throw new Error("Function not implemented.");
    },
    setOpcode: function (opcode: Opcode): void {
        throw new Error("Function not implemented.");
    },
    getData: function () {
        throw new Error("Function not implemented.");
    },
    setData: function (data: any): void {
        throw new Error("Function not implemented.");
    },
    clearData: function (): void {
        throw new Error("Function not implemented.");
    },
    getSignature: function (): string | undefined {
        throw new Error("Function not implemented.");
    },
    setSignature: function (signature: string): void {
        throw new Error("Function not implemented.");
    },
    clearSignature: function (): void {
        throw new Error("Function not implemented.");
    },
    hasSignature: function (): boolean {
        throw new Error("Function not implemented.");
    },
    isSigned: function (): boolean {
        throw new Error("Function not implemented.");
    },
    hasData: function (): boolean {
        throw new Error("Function not implemented.");
    },
    toJSON: function (): Instruction {
        throw new Error("Function not implemented.");
    },
    clone: function () {
        throw new Error("Function not implemented.");
    }
};
  }

  clone(): Instruction {
    return new Instruction(this.opcode, this.data, this.signature);
  }
}