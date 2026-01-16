import fs from "node:fs";
import path from "node:path";
import Handlebars from "handlebars";

const EMAILS_ROOT = path.join(
  process.cwd(),
  "src/features/emails"
);

let partialsRegistered = false;

// -----------------------------------------------------------------------------
// Partials (footer, etc.)
// -----------------------------------------------------------------------------
function registerPartials() {
  if (partialsRegistered) return;

  const partialsDir = path.join(
    EMAILS_ROOT,
    "document/_partials"
  );

  if (!fs.existsSync(partialsDir)) {
    throw new Error(
      `Répertoire des fichiers partiels d'e-mail introuvable : ${partialsDir}`
    );
  }

  const files = fs.readdirSync(partialsDir);

  for (const file of files) {
    const ext = path.extname(file);
    const name = file.replace(ext, "");
    const content = fs.readFileSync(
      path.join(partialsDir, file),
      "utf8"
    );

    // Autorise {{> footer }} et {{> footer.html }}
    Handlebars.registerPartial(name, content);
    Handlebars.registerPartial(file, content);
  }

  partialsRegistered = true;
}

// -----------------------------------------------------------------------------
// Compilation
// -----------------------------------------------------------------------------
function compileTemplate(filePath: string) {
  const source = fs.readFileSync(filePath, "utf8");
  return Handlebars.compile(source);
}

// -----------------------------------------------------------------------------
// Renderer principal
// -----------------------------------------------------------------------------
export function renderEmailTemplate(params: {
  kind: string;
  variables: Record<string, unknown>;
}) {
  registerPartials();

  /**
   * Ex:
   * kind = "invoice"
   * → src/features/emails/document/invoice/invoice.html
   */
  const templateDir = path.join(
    EMAILS_ROOT,
    "document",
    params.kind
  );

  const htmlPath = path.join(
    templateDir,
    `${params.kind}.html`
  );
  const txtPath = path.join(
    templateDir,
    `${params.kind}.txt`
  );

  if (!fs.existsSync(htmlPath)) {
    throw new Error(
      `Email HTML template not found: ${htmlPath}`
    );
  }

  if (!fs.existsSync(txtPath)) {
    throw new Error(
      `Email TXT template not found: ${txtPath}`
    );
  }

  const html = compileTemplate(htmlPath)(
    params.variables
  );
  const text = compileTemplate(txtPath)(
    params.variables
  );

  return { html, text };
}
