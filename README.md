# useful-copy · 临时寄存

一个通过访问码分享临时文本和文件的小工具。输入内容或上传文件，获取 6 位访问码；接收者在首页输入访问码即可取出内容。

## 功能

- 文本寄存：最多 100,000 个字符。
- 文件寄存：单个文件最大 10 MB。
- 有效期：1、3、6、12 或 24 小时。
- 6 位小写字母／数字访问码，查询不区分大小写。
- 兼容旧版带独立访问码保护的寄存记录。

## 技术栈

React 19、TypeScript、Vinext / Vite、Tailwind CSS、Cloudflare Workers、D1 和 R2。D1 存储文本及元数据，R2 存储文件。

## 本地运行

需要 Node.js >= 22.13.0 和 npm。干净克隆默认使用 portable 执行模式。

```sh
npm ci
npm run build
```

首次运行，在构建生成本地 Worker 配置后，按顺序初始化本地 D1 数据库：

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_vengeful_hellion.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_smart_rhodey.sql
npm run dev
```

打开终端输出的地址。迁移只对新建本地数据库执行一次，不要重复执行。`npm start` 可运行已构建的 Worker；开发与构建预览共用 `.wrangler/state`。

```sh
npm run lint
npx tsc --noEmit
npm run build
```

## 项目结构

| 路径                       | 用途                                     |
| -------------------------- | ---------------------------------------- |
| `app/page.tsx`             | 寄存和访问码输入页面                     |
| `app/取件/[id]/page.tsx`   | 取件界面                                 |
| `app/pickup/[id]/page.tsx` | 英文路径兼容入口                         |
| `app/api/drops/`           | 创建、查询和下载接口                     |
| `lib/drops.ts`             | 共用查询、过期数据删除和记录类型         |
| `lib/drop-security.ts`     | 访问码生成、旧版密码校验和下载文件名处理 |
| `db/`、`drizzle/`          | 数据模型及 SQL 迁移                      |
| `components/ui/`           | 已有基础界面组件                         |
| `build/`、`scripts/`       | 构建与运行支持                           |
| `docs/sites-runtime.md`    | Sites 运行环境和部署细节                 |

## 数据生命周期与访问方式

过期记录在查询或下载时返回不可访问状态，并尝试删除对应数据库记录和文件。目前源码没有定时清理任务：从未被再次访问的过期数据不保证在到期时立即物理删除。若自行部署且需要定时物理清理，应另行配置清理任务及 R2 生命周期策略。

访问码使用序列映射生成，用于便捷分享，不是加密密钥，也不能视为强认证。知道或猜到访问码的人可以读取有效期内的内容。不要存放密码、密钥或其他高度敏感信息。

## 部署与公开源码

站点依赖名为 `DB` 的 D1 绑定和名为 `BUCKET` 的 R2 绑定。克隆源码不会复制线上数据、资源或账号授权。构建生成的本地配置包含占位资源信息，不能直接作为生产资源配置使用。

Sites 部署沿用 `.openai/hosting.json` 中的项目绑定。为新站点复用源码时，应由 Sites 注册新的项目，不能复用原项目 ID。公开导出的源码只保留逻辑绑定名称。

`.env*`、`.dev.vars*`、本地数据库、依赖、构建产物和运行缓存均不应提交。第三方组件和构建支持代码的许可文件保留在对应目录；本仓库沿用仓库所有者选择的 GPL-3.0 许可，详见 [LICENSE](LICENSE)。
