#!/bin/bash
# AUTHOR: Đào Văn Phương - 198 - 2000
# SECURITY_LEVEL: HIGH (3-LAYER)
# INTEGRITY_CHECK: phuong_198_2000_ok

# PixelCompress - Automatic Setup (macOS/Linux)
echo "======================================================"
echo "  PIXELCOMPRESS - TỰ ĐỘNG CÀI ĐẶT VÀ CHẠY"
echo "  Tác giả: Đào Văn Phương - 198 - 2000"
echo "======================================================"
echo

# Kiem tra Node.js
if ! command -v node &> /dev/null
then
    echo "[CANH BAO] Khong tim thay Node.js."
    echo "[INFO] Dang thu tu dong cai dat..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install node
        else
            echo "[LOI] Vui long cai dat Node.js tai https://nodejs.org/"
            exit
        fi
    elif command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        sudo apt-get update && sudo apt-get install -y nodejs npm
    else
        echo "[LOI] Vui long cai dat Node.js cho he dieu hanh cua ban tai https://nodejs.org/"
        exit
    fi
fi

# Kiem tra thu muc node_modules
if [ ! -d "node_modules" ]; then
    echo "[INFO] Dang cai dat cac thu vien phu thuoc (can internet)..."
    npm install
else
    echo "[INFO] Cac thu vien da duoc cai dat."
fi

echo "[INFO] Dang khoi chay ung dung..."
echo "------------------------------------------------------"
echo "Ung dung se mo tai: http://localhost:3000"
echo "(Nhan Ctrl+C de dung ung dung)"
echo "------------------------------------------------------"
echo

npm run dev
