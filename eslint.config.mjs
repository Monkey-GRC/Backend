// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

// Configuración mínima y sin reglas con tipos (rápida y de poco ruido): atrapa errores reales, no estilo.
// El formato lo decide prettier (`npm run format`), no es parte de lint.
export default tseslint.config(
  { ignores: ['dist/**', 'generated/**', 'node_modules/**', 'coverage/**', 'prisma/migrations/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: { globals: { ...globals.node, ...globals.jest }, sourceType: 'commonjs' },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
