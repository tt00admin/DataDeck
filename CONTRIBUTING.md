# Contributing to DataDeck

Thank you for your interest in contributing to DataDeck!

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/datadeck/datadeck.git
   cd datadeck
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd webview && npm install && cd ..
   ```

3. **Build the extension**
   ```bash
   npm run compile
   npm run webview:build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Run in debug mode**
   - Press `F5` in VS Code to open a new window with the extension loaded

## Project Structure

```
datadeck/
├── src/                    # Main extension code (TypeScript)
│   ├── extension.ts        # Extension entry point
│   ├── sidebar/            # Sidebar provider and webview communication
│   ├── clipboard/          # Clipboard service and HTML processing
│   ├── storage/            # Storage service for clips
│   ├── search/             # Search and filter service
│   ├── export/             # Markdown export
│   ├── notebook/           # Notebook adapters (Native)
│   └── types/              # TypeScript type definitions
├── webview/               # React webview UI
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx        # Main app component
│   │   └── styles.css     # Styles
│   └── public/            # Static assets
├── resources/             # Icons and images
└── out/                  # Compiled output
```

## Coding Conventions

- Use TypeScript with strict mode
- Follow existing code style
- Add JSDoc comments for public APIs
- Write unit tests for new features

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Commit Message Format

```
<type>: <subject>

<body>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

## Testing

Run tests with:
```bash
npm test
```

## Building for Distribution

```bash
# Build the extension
npm run compile
npm run webview:build

# Package as .vsix
npx vsce package

# Publish to Marketplace
npx vsce publish
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.