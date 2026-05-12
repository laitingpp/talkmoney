#!/bin/bash
export PATH="/Users/bytedance/.trae-cn/binaries/node/versions/24.15.0/bin:$PATH"
npm run build
echo "构建完成！静态文件在 dist 目录中"
echo "可以将 dist 目录部署到任何静态托管服务"
