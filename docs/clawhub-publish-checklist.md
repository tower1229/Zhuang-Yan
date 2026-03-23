# Persona Skill ClawHub 发布检查清单

## 发布结构

- 根目录包含 `SKILL.md`
- 运行时资源只依赖 `data/mbti/mbti-index.json`、`references/`、`scripts/mbti-lookup.js`
- `.clawhubignore` 已排除 README、docs、skills 包装目录和其他维护态文件

## 发布前检查

- 确认 `SKILL.md` frontmatter 可被 OpenClaw 正常识别
- 确认 `data/mbti/mbti-index.json` 与 `references/mbti/*.md` 完整存在
- 确认 `references/*.md` 与 `scripts/mbti-lookup.js` 路径匹配 `SKILL.md`
- 确认 skill 仍只承担人格初始化，不含状态查询和跨 skill 联动

## 建议发布方式

也可使用维护脚本：

```bash
node ./scripts/release-clawhub.mjs --version 0.1.0
```

或者直接在仓库根目录运行：

```bash
clawhub --workdir . publish . \
  --slug persona-skill \
  --name "Persona Skill" \
  --version 0.1.0 \
  --tags latest \
  --changelog "Initial public release"
```

## 发布后验证

- 安装验证：`clawhub install persona-skill`
- 在 OpenClaw 会话中明确输入：`调用 persona 进行初始化`
- 验证 skill 是否按一问一答方式进入初始化流程
- 验证其不会回答状态查询，也不会主动联动其他 skill


