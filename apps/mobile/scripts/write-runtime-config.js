const fs = require("node:fs");
const path = require("node:path");

const distDir = path.resolve(__dirname, "../dist");
const indexPath = path.join(distDir, "index.html");
const configPath = path.join(distDir, "config.js");
const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3004/api/v1";

const configSource = `window.SCOUTGOL_CONFIG = {
  API_BASE_URL: ${JSON.stringify(apiBaseUrl)}
};
`;

fs.writeFileSync(configPath, configSource);

const indexHtml = fs.readFileSync(indexPath, "utf8");
const withoutOldConfig = indexHtml.replace(
  /\s*<script src="\/config\.js"><\/script>/g,
  ""
);
const withConfig = withoutOldConfig.replace(
  "</body>",
  '  <script src="/config.js"></script>\n</body>'
);

fs.writeFileSync(indexPath, withConfig);
