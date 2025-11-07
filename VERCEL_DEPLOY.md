# Vercel 部署指南

## 部署配置

项目已配置好 Vercel 部署，配置文件位于根目录的 `vercel.json`。

## 部署步骤

### 1. 通过 Vercel Dashboard 部署

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库：`wawsyy/pro28`
4. **重要配置**：
   - **Root Directory**: 在 UI 中设置为 `frontend`（点击 "Edit" 按钮）
   - **Framework Preset**: 选择 `Next.js`
   - **Build Command**: `npm run build`（会自动在 frontend 目录执行）
   - **Output Directory**: `.next`（会自动在 frontend/.next）
   
   **注意**：`rootDirectory` 必须在 Vercel Dashboard 的 UI 中设置，不能放在 `vercel.json` 中

### 2. 通过 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目根目录运行
vercel

# 生产环境部署
vercel --prod
```

## 重要说明

### ABI 文件

- ABI 文件已包含在 `frontend/abi/` 目录中
- 构建时不需要运行 `genabi` 脚本（因为 `deployments` 目录不在仓库中）
- 如果需要更新 ABI，请在本地运行 `npm run genabi` 后提交更新

### 环境变量（如需要）

如果项目需要环境变量，请在 Vercel Dashboard 中设置：

1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加所需的环境变量

### 网络配置

项目支持以下网络：
- **Sepolia Testnet** (Chain ID: 11155111)
- **Hardhat Local** (Chain ID: 31337) - 仅本地开发

合约地址配置在 `frontend/abi/DriverPerformanceAddresses.ts` 中。

## 构建流程

Vercel 构建流程：
1. 安装依赖：`cd frontend && npm install`
2. 构建项目：`npm run build`
3. 输出到：`frontend/.next`

## 故障排除

### 构建失败

如果构建失败，检查：
1. Node.js 版本（推荐 20+）
2. 依赖是否正确安装
3. TypeScript 编译错误

### ABI 文件缺失

如果遇到 ABI 相关错误：
1. 确保 `frontend/abi/` 目录中的文件已提交
2. 或在本地运行 `npm run genabi` 后提交

## 自定义域名

部署后可以在 Vercel Dashboard 中配置自定义域名。

