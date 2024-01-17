export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'json', 'node'],
  globals: {
    'babel-jest': {
      presets: ['@babel/preset-env'],
    },
  },
};
