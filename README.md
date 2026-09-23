# useful-copy · 临时寄存

通过六位访问码临时分享文本和文件。前端使用 React + Vite，API 运行在 Cloudflare Workers；D1 保存文本和元数据，R2 保存文件。

## 环境

- Bun 1.4.2 或更新版本；项目基准版本为 1.4.2。
- 本地工具通过 Bun 运行，Worker 通过 Cloudflare 的 workerd 运行。
- Vite 8 使用 Oxc 转译与 Rolldown 打包，TypeScript 负责类型检查，Oxlint 和 Oxfmt 分别负责代码检查与格式化。Vite、Drizzle、Oxlint 和 Oxfmt 使用 TypeScript 配置。

## 本地开发

```sh
bun install --frozen-lockfile
bun run cf:typegen
bun run db:migrate
bun run dev
```

首页为 `/`，取件页为 `/pickup/:id`。访问码由六位字母和数字组成，不区分大小写。

## 检查与构建

```sh
bun run typecheck
bun run lint
bun run format --check
bun run build
bun run preview
```

`preview` 预览已生成的构建结果，需先执行 `build`。

执行 `bun run format` 统一代码格式，格式约定集中在 `oxfmt.config.ts`；生成的类型、锁文件和数据库快照不参与格式化。执行 `bun run lint --fix` 自动修复可安全修复的代码问题。

## 数据库

在 `db/schema.ts` 修改数据结构，然后生成并应用迁移：

```sh
bun run db:generate --name describe_change
bun run db:migrate
```

迁移 SQL 和 Drizzle 元数据位于 `drizzle/`，应一起提交。`db:migrate` 只操作本地数据库；生产数据库使用 `db:migrate:remote`。

## 部署

创建 Cloudflare 资源：

```sh
bun --bun wrangler login
bun --bun wrangler d1 create useful-copy
bun --bun wrangler r2 bucket create useful-copy
```

将真实的 D1 `database_id` 填入 `wrangler.jsonc`，确认 `DB` 和 `BUCKET` 绑定对应目标资源，然后执行：

```sh
bun run cf:typegen
bun run db:migrate:remote
bun run deploy
```

部署命令先构建，再上传 Worker 和静态资源。

## 项目结构

```text
src/                 React 页面与样式
worker/              Worker API 与存储操作
components/ui/       页面使用的 UI 组件
lib/                 访问码与通用工具
db/                  数据模型
drizzle/             数据库迁移
cloudflare-env.d.ts   Wrangler 生成的绑定与运行时类型
wrangler.jsonc       Worker、D1、R2、静态资源配置
vite.config.ts       Vite、React、Cloudflare 配置
```

变更 Worker 配置后执行 `bun run cf:typegen`，提交更新后的类型文件。

## 数据生命周期

文本最多 100,000 字，单个文件最多 10 MB，可选择保存 1、3、6、12 或 24 小时。

过期内容在查询或下载时变为不可访问，并触发 D1 记录及 R2 对象删除。没有定时清理任务，未再次访问的过期内容不保证立即物理删除。

访问码用于便捷分享，不是强认证。请勿寄存密码、密钥或其他高度敏感信息。
