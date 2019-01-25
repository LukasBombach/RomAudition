/* static async getAll(file, startPos) {
    await file.expectByte(startPos, kHeader, "kHeader");
    let position = this.startPos + 1;
    const headers = [];
    while ((await file.byte(position)) !== kEnd) {
      headers.push(await Header.fromPosition(file, position));
      position += headers[headers.length - 1].length;
    }
    return headers;
  }

  static async fromPosition(file, position) {
    const header = new Header(file, position);
    await header.read();
    return header;
  }

  constructor(file, startPos) {
    this.file = file;
    this.startPos = startPos;
  }

  async read() {
    const type = await this.getType();
  }

  async getType() {
    const id = await this.file.byte(position);
    const type = types[id.toString("hex")];
    if (!type) throw new Error(`No implementation for 0x${id.toString("hex")}`);
    return type;
  } */
