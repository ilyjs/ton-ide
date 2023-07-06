import { Registry } from 'monaco-textmate';
import { wireTmGrammars } from 'monaco-editor-textmate';
import { loadWASM } from 'onigasm';
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";


import { loader } from '@monaco-editor/react';
import ftmLanguage from './ftmLanguage.json';

let loaded = false;

export async function rewireEditor(): Promise<any> {
  if (!loaded) {
    await loadWASM(onigasmWasm);
    loaded = true;
  }

  await loader.init().then((monaco) => {
    const registry = new Registry({
      getGrammarDefinition: async () => {
        return {
          format: 'json',
          content: ftmLanguage,
        };
      },
    });
    const grammars = new Map();
    grammars.set('func', 'source.func');
    monaco.languages.register({ id: 'func' });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    wireTmGrammars(monaco, registry, grammars);
  });
}
