import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const repo_root = process.cwd();
const temp_dir = mkdtempSync(path.join(tmpdir(), "httpmitm-package-smoke-"));
let tarball_path;

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: options.cwd || repo_root,
    stdio: "inherit",
    env: {
      ...process.env,
      npm_config_fund: "false",
      npm_config_audit: "false",
    },
  });
}

try {
  const pack_output = execFileSync("npm", ["pack", "--json"], {
    cwd: repo_root,
    encoding: "utf8",
  });
  const pack_json_match = pack_output.match(/(\[\s*\{[\s\S]*\}\s*\])\s*$/);
  if (!pack_json_match) {
    throw new Error("Unable to parse npm pack JSON output.");
  }
  const pack_result = JSON.parse(pack_json_match[1])[0];
  tarball_path = path.join(repo_root, pack_result.filename);

  writeFileSync(
    path.join(temp_dir, "package.json"),
    JSON.stringify(
      {
        name: "httpmitm-package-smoke",
        private: true,
        type: "module",
        dependencies: {
          "@opsimathically/httpmitm": tarball_path,
        },
      },
      null,
      2
    )
  );

  writeFileSync(
    path.join(temp_dir, "smoke-cjs.cjs"),
    [
      "const { HTTPMITM, Proxy } = require('@opsimathically/httpmitm');",
      "if (typeof HTTPMITM !== 'function') throw new Error('Missing HTTPMITM CJS export');",
      "if (typeof Proxy !== 'function') throw new Error('Missing Proxy CJS export');",
    ].join("\n")
  );

  writeFileSync(
    path.join(temp_dir, "smoke-esm.mjs"),
    [
      "import { HTTPMITM, Proxy } from '@opsimathically/httpmitm';",
      "if (typeof HTTPMITM !== 'function') throw new Error('Missing HTTPMITM ESM export');",
      "if (typeof Proxy !== 'function') throw new Error('Missing Proxy ESM export');",
    ].join("\n")
  );

  writeFileSync(
    path.join(temp_dir, "smoke-types.ts"),
    [
      "import { HTTPMITM, type httpmitm_start_params_t } from '@opsimathically/httpmitm';",
      "const params: httpmitm_start_params_t = {",
      "  host: '127.0.0.1',",
      "  listen_port: 0,",
      "  limits: { callback_timeout_ms: 1000 },",
      "  certificates: {",
      "    root_ca: {",
      "      material: {",
      "        cert_pem: '-----BEGIN CERTIFICATE-----\\\\nMIIB\\\\n-----END CERTIFICATE-----\\\\n',",
      "        private_key_pem: '-----BEGIN PRIVATE KEY-----\\\\nMIIB\\\\n-----END PRIVATE KEY-----\\\\n',",
      "        private_key_passphrase: 'optional-passphrase',",
      "      },",
      "    },",
      "    leaf_certificates: { storage: 'memory' },",
      "  },",
      "};",
      "const instance = new HTTPMITM();",
      "void instance;",
      "void params;",
    ].join("\n")
  );

  writeFileSync(
    path.join(temp_dir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          skipLibCheck: false,
          types: ["node"],
          typeRoots: [
            path.join(repo_root, "node_modules", "@types"),
            path.join(temp_dir, "node_modules", "@types"),
          ],
        },
        include: ["smoke-types.ts"],
      },
      null,
      2
    )
  );

  run("npm", ["install", "--ignore-scripts"], { cwd: temp_dir });
  run("node", ["smoke-cjs.cjs"], { cwd: temp_dir });
  run("node", ["smoke-esm.mjs"], { cwd: temp_dir });
  run(path.join(repo_root, "node_modules", ".bin", "tsc"), [
    "--noEmit",
    "--project",
    path.join(temp_dir, "tsconfig.json"),
  ]);

} finally {
  if (tarball_path) {
    rmSync(tarball_path, { force: true });
  }
  rmSync(temp_dir, { recursive: true, force: true });
}
