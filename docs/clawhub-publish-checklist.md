# Persona Skill ClawHub 发布检查清单

## 发布结构

- 根目录包含 `SKILL.md`
- 运行时核心文档只依赖：
  - `references/protocols/initialization-flow.md`
  - `references/protocols/drafting-spec.md`
  - `references/runtime-context/template-pack.md`
  - `references/runtime-context/persona-profile-consumption-guide.md`
- 数据资产只依赖：
  - `assets/mbti/mbti-index.json`
  - `references/mbti/*.md`
- `.clawhubignore` 已排除 README、docs、tests 和其他维护态文件

## 发布前检查

- 先运行：`npm test`
- 确认 `package.json` 中的 `version` 已更新
- 确认 `SKILL.md` frontmatter 可被 OpenClaw 正常识别
- 确认 `metadata.openclaw.homepage` 指向可访问项目主页
- 确认新结构文件完整存在：
  - `references/protocols/initialization-flow.md`
  - `references/protocols/drafting-spec.md`
  - `references/runtime-context/template-pack.md`
  - `references/runtime-context/persona-profile-consumption-guide.md`
- 确认旧文件已移除：
  - `references/protocols/drafting-protocol.md`
  - `references/protocols/write-safety.md`
  - `references/strategy/persona-generation-strategy.md`
  - `references/runtime-context/persona-canon-template.md`
  - `references/runtime-context/execution-trigger-protocol-template.md`
  - `references/runtime-context/quality-calibration.md`
  - `references/runtime-context/canon-consumption-guide.md`
  - `docs/persona-generation-strategy.md`
- 确认 Skill 仍只承担人格初始化，不包含状态查询和跨 skill 联动
- 确认渐进式披露顺序没有被破坏：
  - `SKILL.md` 只负责是否启动
  - `initialization-flow.md` 只负责采访流程
  - `drafting-spec.md` 只负责起草、profile normalization 与写入
  - `template-pack.md` 只负责模板与校准
  - `persona-profile-consumption-guide.md` 只负责 `PERSONA_PROFILE` 的结构约定与消费方式

## 建议发布方式

在仓库根目录运行：

```bash
npm run publish:clawhub
```

该命令会先运行测试，通过后再读取 `package.json` 的版本号进行发布。

## 发布后验证

- 安装验证：`clawhub install persona-skill`
- 会话中输入：`调用 persona 进行初始化`
- 验证 Skill 是否按一问一答进入采访
- 验证采访语言是否全程锁定，不混用中英文
- 验证 Step 5 只补称呼/代词/长期备注
- 验证 Step 6 只问年龄
- 验证起草结果仍只写五个目标文件
- 验证 `persona/PERSONA_PROFILE.md` 包含 `Meta / Appearance Tendencies / Constraint Rules / Retrieval Units`
- 验证 `PERSONA_PROFILE` 不含当前时间判断、即时事件或季节结论
- 验证 `MEMORY.md` 不含旧人格残留
- 验证初始化不再询问额外分类标签

## ClawHub 当前格式要点

- Skill 根目录必须包含 `SKILL.md`
- 只允许发布文本类文件；运行时 bundle 总大小上限为 50MB
- 版本号使用语义化版本
- 已发布 skill 统一按 `MIT-0` 许可分发
