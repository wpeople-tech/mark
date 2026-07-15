import { withUI } from '@extension/ui';

export default withUI({
  content: ['index.html', 'src/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        ink: '#0F0F0E',
        paper: '#F7F6F3',
        surface: '#EFEFEB',
        border: '#E5E3DC',
        muted: '#888785',
        accent: '#1A47A8',
        'accent-bg': '#EBF2FF',
        'accent-border': '#C3D7F7',
        green: '#1B6B28',
        'green-bg': '#E9F5E9',
        'green-border': '#B6DEB9',
        'term-bg': '#0B0B0A',
        'term-text': '#E8E6E0',
        'term-green': '#6DBE8A',
        'term-blue': '#7DAEEA',
        'term-yellow': '#E8C56A',
        'term-dim': '#444442',
      },
      borderRadius: {
        sm: '4px',
        md: '10px',
        card: '14px',
        lg: '16px',
        pill: '99px',
      },
    },
  },
});
