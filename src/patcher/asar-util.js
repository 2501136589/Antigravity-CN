/**
 * Antigravity-CN: 零依赖轻量级 ASAR 打包与解包工具 (完全支持 unpacked 属性与原生模块)
 * Zero-dependency ASAR Archive Reader and Writer for Node.js
 */

const fs = require('fs');
const path = require('path');

class AsarUtil {
  /**
   * 读取 ASAR 头信息
   */
  static readHeader(asarPath) {
    const fd = fs.openSync(asarPath, 'r');
    try {
      const headerBuf = Buffer.alloc(16);
      fs.readSync(fd, headerBuf, 0, 16, 0);

      const jsonSize = headerBuf.readUInt32LE(12);
      const jsonBuf = Buffer.alloc(jsonSize);
      fs.readSync(fd, jsonBuf, 0, jsonSize, 16);

      const header = JSON.parse(jsonBuf.toString('utf8'));
      const baseOffset = 16 + jsonSize;

      return { header, baseOffset, jsonSize };
    } finally {
      fs.closeSync(fd);
    }
  }

  /**
   * 解包 ASAR 文件到指定目录（保留 unpacked 信息）
   */
  static extractAll(asarPath, destDir) {
    if (!fs.existsSync(asarPath)) {
      throw new Error(`ASAR 文件不存在: ${asarPath}`);
    }

    const { header, baseOffset } = this.readHeader(asarPath);
    const fd = fs.openSync(asarPath, 'r');

    try {
      function extractNode(node, currentDest) {
        if (!fs.existsSync(currentDest)) {
          fs.mkdirSync(currentDest, { recursive: true });
        }

        for (const [name, entry] of Object.entries(node.files || {})) {
          const targetPath = path.join(currentDest, name);

          if (entry.files) {
            extractNode(entry, targetPath);
          } else if (entry.unpacked) {
            // unpacked 标记的文件在外部 app.asar.unpacked 中，解包时无需在内部生成实体文件
            // 记录占位符或忽略
          } else {
            const size = entry.size || 0;
            if (size === 0) {
              fs.writeFileSync(targetPath, Buffer.alloc(0));
            } else {
              const offset = baseOffset + parseInt(entry.offset, 10);
              const fileBuf = Buffer.alloc(size);
              fs.readSync(fd, fileBuf, 0, size, offset);
              fs.writeFileSync(targetPath, fileBuf);
            }
          }
        }
      }

      extractNode(header, destDir);
    } finally {
      fs.closeSync(fd);
    }
  }

  /**
   * 基于原始 ASAR Header 结构，将修改后的目录重新打包，严格保留 unpacked 标志
   */
  static createPackage(srcDir, destAsarPath, origHeader) {
    if (!fs.existsSync(srcDir)) {
      throw new Error(`源目录不存在: ${srcDir}`);
    }

    let currentOffset = 0;
    const fileEntries = [];

    function buildHeader(dirPath, origNode) {
      const filesObj = {};
      const origFiles = (origNode && origNode.files) ? origNode.files : {};

      // 遍历原始节点中所有 unpacked 文件，确保 100% 保留
      for (const [name, origEntry] of Object.entries(origFiles)) {
        if (origEntry.unpacked) {
          filesObj[name] = { unpacked: true };
        }
      }

      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const origEntry = origFiles[entry.name];

        if (entry.isDirectory()) {
          filesObj[entry.name] = buildHeader(fullPath, origEntry);
        } else if (entry.isFile()) {
          if (origEntry && origEntry.unpacked) {
            // 保持 unpacked 状态
            filesObj[entry.name] = { unpacked: true };
          } else {
            const stat = fs.statSync(fullPath);
            const size = stat.size;
            filesObj[entry.name] = {
              size: size,
              offset: String(currentOffset)
            };
            fileEntries.push({
              fullPath,
              size,
              offset: currentOffset
            });
            currentOffset += size;
          }
        }
      }
      return { files: filesObj };
    }

    const header = buildHeader(srcDir, origHeader);
    const jsonStr = JSON.stringify(header);
    const jsonBuf = Buffer.from(jsonStr, 'utf8');

    const jsonSize = jsonBuf.length;
    const headerSize = jsonSize + 8;

    const prefixBuf = Buffer.alloc(16);
    prefixBuf.writeUInt32LE(4, 0);
    prefixBuf.writeUInt32LE(headerSize, 4);
    prefixBuf.writeUInt32LE(jsonSize + 4, 8);
    prefixBuf.writeUInt32LE(jsonSize, 12);

    const tmpAsarPath = destAsarPath + '.tmp';
    const outFd = fs.openSync(tmpAsarPath, 'w');

    try {
      fs.writeSync(outFd, prefixBuf, 0, 16);
      fs.writeSync(outFd, jsonBuf, 0, jsonSize);

      for (const file of fileEntries) {
        if (file.size > 0) {
          const content = fs.readFileSync(file.fullPath);
          fs.writeSync(outFd, content, 0, file.size);
        }
      }
    } finally {
      fs.closeSync(outFd);
    }

    if (fs.existsSync(destAsarPath)) {
      try { fs.unlinkSync(destAsarPath); } catch (e) {}
    }
    fs.renameSync(tmpAsarPath, destAsarPath);
  }
}

module.exports = AsarUtil;
