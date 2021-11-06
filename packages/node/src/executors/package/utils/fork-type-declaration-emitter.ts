import { fork } from 'child_process';
import { emitTypeDeclarations } from '../../../utils/typescript/emit-type-declarations';
import { printDiagnostics } from '../../../utils/typescript/print-diagnostics';

if (require.main === module) {
  main(JSON.parse(process.argv[2])).then((success) => {
    if (!success) {
      process.exitCode = 1;
    }
  });
}

async function main(opts: {
  workspaceRoot: string;
  projectRoot: string;
  configPath: string;
  outDir: string;
}): Promise<boolean> {
  const ts = await import('typescript');
  const result = await emitTypeDeclarations(
    ts,
    opts.workspaceRoot,
    opts.projectRoot,
    opts.configPath,
    opts.outDir
  );

  await printDiagnostics(result);
  return result.errors.length === 0;
}

export async function forkTypeDeclarationEmitter(opts: {
  workspaceRoot: string;
  projectRoot: string;
  configPath: string;
  outDir: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = fork(__filename, [JSON.stringify(opts)], {
      cwd: opts.projectRoot,
    });
    proc.on('close', (code) =>
      code === 0
        ? resolve()
        : reject(new Error('Found type errors. See above.'))
    );
  });
}