# Persona Skill ClawHub 发布检查清单

## 发布结构

- 根目录包含 `SKILL.md`
- 运行时资源只依赖 `assets/mbti/mbti-index.json`、`references/`、`scripts/mbti-lookup.js`
- `.clawhubignore` 已排除 README、docs、skills 包装目录和其他维护态文件

## 发布前检查

- 先运行：`npm run test`（若 PowerShell 执行策略拦截 `npm.ps1`，可改用 `node --test tests`）
- 确认 `package.json` 中的 `version` 已更新为本次发布版本
- 确认 `SKILL.md` frontmatter 可被 OpenClaw 正常识别
- 确认 `metadata.openclaw.homepage` 指向可访问的项目主页
- 确认 `assets/mbti/mbti-index.json` 与 `references/mbti/*.md` 完整存在
- 确认 `references/*.md` 与 `scripts/mbti-lookup.js` 路径匹配 `SKILL.md`
- 确认 skill 仍只承担人格初始化，不含状态查询和跨 skill 联动
- 确认仓库级许可证与 ClawHub 的 `MIT-0` 发布规则不冲突

## 建议发布方式

在仓库根目录运行：

```bash
npm run publish:clawhub
```

该命令会先运行测试；只有测试通过后，才会自动读取 `package.json` 中的 `version` 并发布当前 skill 根目录。

## 发布后验证

- 安装验证：`clawhub install persona-skill`
- 在 OpenClaw 会话中明确输入：`调用 persona 进行初始化`
- 验证 skill 是否按一问一答方式进入初始化流程
- 验证其不会处理初始化以外的请求，也不会偏离五文件写入边界

## ClawHub 当前格式要点

- Skill 根目录必须包含 `SKILL.md`
- 只允许发布文本类文件；运行时 bundle 总大小上限为 50MB
- 版本号使用语义化版本；`latest` 只是指向版本的 tag
- 已发布 skill 统一按 `MIT-0` 许可分发，不支持冲突的单独 license 覆盖
