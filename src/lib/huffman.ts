/**
 * Huffman Coding Implementation for Image Compression
 */

export interface HuffmanNode {
  value?: number; // Pixel value (0-255)
  freq: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
}

export interface CodeMap {
  [key: number]: string;
}

export class HuffmanEngine {
  /**
   * Build a Huffman tree from byte frequencies
   */
  static buildTree(frequencies: Map<number, number>): HuffmanNode | null {
    const nodes: HuffmanNode[] = Array.from(frequencies.entries()).map(([value, freq]) => ({
      value,
      freq,
    }));

    if (nodes.length === 0) return null;

    while (nodes.length > 1) {
      nodes.sort((a, b) => a.freq - b.freq);
      const left = nodes.shift()!;
      const right = nodes.shift()!;
      nodes.push({
        freq: left.freq + right.freq,
        left,
        right,
      });
    }

    return nodes[0];
  }

  /**
   * Generate a mapping of values to their bitstring representations
   */
  static generateCodeMap(node: HuffmanNode | null, prefix = "", map: CodeMap = {}): CodeMap {
    if (!node) return map;

    if (node.value !== undefined) {
      map[node.value] = prefix || "0"; // Handle single-node case
    } else {
      this.generateCodeMap(node.left || null, prefix + "0", map);
      this.generateCodeMap(node.right || null, prefix + "1", map);
    }

    return map;
  }

  /**
   * Encodes an array of pixel values into a packed Uint8Array
   */
  static encodeToBytes(data: Uint8ClampedArray, codeMap: CodeMap): { buffer: Uint8Array, totalBits: number } {
    let totalBits = 0;
    for (let i = 0; i < data.length; i++) {
        totalBits += codeMap[data[i]].length;
    }

    const buffer = new Uint8Array(Math.ceil(totalBits / 8));
    let bitPos = 0;

    for (let i = 0; i < data.length; i++) {
      const code = codeMap[data[i]];
      for (let j = 0; j < code.length; j++) {
        if (code[j] === "1") {
          buffer[bitPos >> 3] |= 1 << (7 - (bitPos % 8));
        }
        bitPos++;
      }
    }

    return { buffer, totalBits };
  }

  /**
   * Decodes a packed Uint8Array back into pixel values
   */
  static decodeFromBytes(buffer: Uint8Array, totalBits: number, reverseMap: Record<string, number>, count: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(count);
    let pixelIdx = 0;
    let currentBits = "";

    for (let i = 0; i < totalBits && pixelIdx < count; i++) {
      const bit = (buffer[i >> 3] & (1 << (7 - (i % 8)))) ? "1" : "0";
      currentBits += bit;
      
      if (reverseMap[currentBits] !== undefined) {
        result[pixelIdx++] = reverseMap[currentBits];
        currentBits = "";
      }
    }

    return result;
  }
}
