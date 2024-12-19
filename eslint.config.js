import plugin from 'eslint-plugin-mist3rbru'

export default [
  plugin.configs.react,
  plugin.configs.jest,
  {
    rules: {
      '@typescript-eslint/no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 2, 100, 200, 300, 400, 500],
          ignoreNumericLiteralTypes: true,
          ignoreTypeIndexes: true,
        },
      ],
      '@typescript-eslint/no-magic-numbers': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
    },
  },
  {
    files: ['**/index.ts'],
    rules: {
      '@stylistic/padding-line-between-statements': 'off',
    },
  },
]
