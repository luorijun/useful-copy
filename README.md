# useful-copy · 临时寄存

通过 6 位访问码临时分享文本和文件。前端是 React + Vite 单页应用，API 直接运行在 Cloudflare Worker；D1 保存文本和元数据，R2 保存文件。

## 技术栈

- React 19 + Vite
- Cloudflare Workers + `@cloudflare/vite-plugin`
- Cloudflare D1 + R2
- TypeScript + Tailwind CSS
- Drizzle schema / migrations

项目不再依赖 Next.js、Vinext、React Server Components 或 OpenAI Sites 运行时。

## 本地开发

需要 Node.js >= 22.13.0 和 npm。

```sh
npm ci
npm run cf:typegen
```

首次创建本地 D1 后，按顺序应用迁移：

```sh
npx wrangler d1 execute DB --local --file drizzle/0000_vengeful_hellion.sql
npx wrangler d1 execute DB --local --file drizzle/0001_smart_rhodey.sql
```

启动开发服务器：

```sh
npm run dev
```

质量检查：

```sh
npm run typecheck
npm run lint
npm run build
```

## Cloudflare 资源

`wrangler.jsonc` 声明两个 Worker bindings：

- `DB`: D1 database
- `BUCKET`: R2 bucket

仓库中的 D1 `database_id` 是占位值。首次部署前创建生产资源并把真实 ID 写入 `wrangler.jsonc`：

```sh
npx wrangler d1 create useful-copy
npx wrangler r2 bucket create useful-copy
```

然后对生产 D1 应用 `drizzle/` 中的迁移并部署：

```sh
npm run deploy
```

## 结构

```text
src/                 React 客户端
worker/              Cloudflare Worker API
components/          UI 组件
lib/                 跨运行时业务工具
db/ + drizzle/       数据模型与迁移
wrangler.jsonc       Worker、D1、R2、静态资源配置
vite.config.ts       Vite + React + Cloudflare
```

前端路由目前只有首页和取件页，因此直接按 pathname 分发，没有引入额外 Router 依赖。Cloudflare 静态资源配置使用 SPA fallback，`/pickup/:id` 和 `/取件/:id` 均可直接访问。

## 数据生命周期

过期记录在查询或下载时变为不可访问，并尝试删除 D1 记录及对应 R2 对象。当前没有定时清理任务；从未再次访问的过期数据不会保证在到期瞬间物理删除。生产环境如需要严格清理，可增加 Cron Trigger 和 R2 lifecycle policy。

访问码用于便捷分享，不是强认证。不要寄存密码、密钥或其他高度敏感信息。
