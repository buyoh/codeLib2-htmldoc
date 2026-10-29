import { createSelector } from '@reduxjs/toolkit';
import { selectLanguages } from '../../stores/selectors';

export type LanguageOption = {
  key: string;
  label: string;
  value: string;
};

const languageLabels: Readonly<Record<string, string>> = {
  cpp: 'C++',
  javascript: 'JS',
  ruby: 'Ruby',
  rust: 'Rust',
};

// 言語選択肢。先頭は全言語を表す 'all'
export const selectLanguageOptions = createSelector(
  [selectLanguages],
  (langs): Array<LanguageOption> => [
    { key: '', value: '', label: 'all' },
    ...langs.map((lang) => ({
      key: lang,
      value: lang,
      label: languageLabels[lang] ?? lang,
    })),
  ]
);
