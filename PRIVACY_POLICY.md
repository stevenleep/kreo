# Kreo Canvas Privacy Policy / 隐私政策

Last Updated / 最近更新: 2025-08-25

---
## English Version

### 1. Summary
Kreo Canvas is a local, on‑page drawing & annotation Chrome extension. It does **not** collect, transmit, sell, or share personal information. All drawing data stays in your browser unless you explicitly export it.

### 2. Data We Do NOT Collect
We do not collect or send to any server:
- Personal identity information (name, email, account IDs)
- Page contents or URLs you visit
- Keystrokes, form inputs, passwords
- Usage analytics, tracking identifiers, advertising data
- Your drawings, screenshots, exported images, or imported JSON

### 3. Data Stored Locally (On Your Device Only)
The extension may store minimal preferences using Chrome local storage (e.g., toolbar position, internal UI state). These values:
- Never leave your device
- Can be cleared by removing the extension or clearing site/extension data

### 4. Permissions Explanation
The manifest requests the following Chrome extension permissions:
- `storage`: Save small UI preferences (e.g., toolbar position). No personal data.
- `activeTab` / `tabs`: Allow activating the drawing overlay on the current tab after you click the extension. No background scraping.
- `scripting`: Inject required content scripts (canvas overlay) into the current page when activated.
- `notifications`: (If used) Show optional local completion or success notifications. No remote messaging.

No continuous background data harvesting is performed.

### 5. Drawings & Exports
- Your drawings live only in memory (the active tab) and optionally in JSON/Png files you export manually.
- Exported PNG/JSON files are created locally in the browser and immediately downloaded—no upload.
- Imported JSON files are parsed only in memory to restore a previous drawing state.

### 6. Network Requests
The extension does not initiate outbound network requests for analytics, telemetry, or data sync.

### 7. Third‑Party Services
None. No embedded analytics SDK, ad network, or remote storage.

### 8. Children’s Privacy
Because we collect no personal data, the extension is suitable for general audiences. Do not use it to annotate or expose sensitive personal information on shared screens without consent.

### 9. Security
All processing occurs locally. Still, avoid importing untrusted JSON files unless you trust their source. (They are parsed as drawing state; no code execution is intended.)

### 10. Your Control
You can at any time:
- Remove the extension (Chrome > Manage Extensions)
- Clear extension storage (Chrome > Settings > Privacy and security > Clear browsing data > Hosted app data)
- Delete any exported files manually from your filesystem

### 11. Changes to This Policy
Material changes will update the "Last Updated" date. Significant changes may be announced in the project README or release notes.

### 12. Contact
For questions or requests, please add or replace this placeholder with your contact email: `REPLACE_WITH_CONTACT_EMAIL`.
If you fork this project, customize this section for your distribution.

---
## 中文版本

### 1. 概述
Kreo Canvas 是一个在网页上本地绘制与标注的 Chrome 扩展。**不会** 收集、传输、出售或共享您的任何个人信息。所有绘制数据均保留在您的浏览器内，除非您主动导出。

### 2. 我们不收集的数据
我们不会收集或发送至任何服务器：
- 个人身份信息（姓名、邮箱、账号等）
- 您访问的网页内容或 URL
- 键盘输入、表单内容、密码
- 使用行为分析、追踪标识、广告数据
- 您的绘图、截图、导出的图片或导入的 JSON

### 3. 本地存储（仅在您的设备）
扩展可能通过 Chrome 存储保存极少量偏好（例如：工具栏位置、界面状态）。这些数据：
- 不会离开您的设备
- 可通过卸载扩展或清除浏览数据删除

### 4. 权限说明
- `storage`: 保存界面偏好（如工具栏位置），不含个人信息。
- `activeTab` / `tabs`: 在您点击扩展后于当前标签页启用绘图层，不进行后台抓取。
- `scripting`: 注入绘图覆盖层所需的脚本。
- `notifications`: （若启用）显示本地操作成功提示，不进行外部通信。

扩展不会持续后台收集数据。

### 5. 绘图与导出
- 绘图数据仅存在于当前标签页内存中，除非您手动导出。
- 导出的 PNG / JSON 文件在本地生成并立即下载，不会上传。
- 导入的 JSON 文件只在内存中解析，用于恢复绘图状态。

### 6. 网络请求
扩展不发起任何用于统计、遥测或同步的数据请求。

### 7. 第三方服务
无。未集成分析 SDK、广告网络或远程存储。

### 8. 未成年人隐私
由于不收集个人数据，本扩展适用于通用用户。请勿在未经允许的情况下标注或展示含个人敏感信息的内容。

### 9. 安全
所有处理均在本地完成。请避免导入来源不明的 JSON 文件（其仅作为绘图状态数据解析，不执行代码）。

### 10. 用户控制
您可以随时：
- 卸载扩展（Chrome > 管理扩展）
- 清除扩展存储（Chrome > 设置 > 隐私与安全 > 清除浏览数据 > 托管应用数据）
- 手动删除已导出的文件

### 11. 政策变更
若有重大变更，将更新“最近更新”日期，并可能在 README 或版本说明中提示。

### 12. 联系方式
如需咨询或提出需求，请在此替换占位符邮箱：`REPLACE_WITH_CONTACT_EMAIL`。
如你 Fork 本项目，请根据你的发布版本自行修改本隐私声明。

---
## Open Source Notice / 开源提示
This is an open-source project. If you redistribute or modify it, ensure your privacy policy reflects your actual data practices.

这是一个开源项目，如你二次分发或修改，请确保你的隐私政策与实际行为一致。

---
## License Relationship / 许可关系
This privacy policy governs data handling only and does not alter the MIT License terms found in `LICENSE` (if present).

本隐私政策仅约束数据处理，不改变 MIT 开源许可证（若仓库包含）。

