# Cookie Consent Hub

A flexible and customizable cookie consent notification system that helps websites comply with GDPR and other privacy regulations.

## Features

- Multiple modal types (initial, settings, experience improve, simple notification)
- Customizable appearance and behavior
- Support for different cookie categories
- Automatic script loading based on consent
- Responsive design
- Dark theme support
- Accessibility features
- GTM integration

## Installation

```bash
npm install cookie-consent-hub
```

## Usage

1. Include the script and styles in your HTML:

```html
<link rel="stylesheet" href="dist/css/cookie-consent.min.css">
<script src="dist/js/cookie-consent.min.js"></script>
```

2. Initialize the consent notification:

```javascript
const cookieConsentConfig = {
  // Your configuration here
};

const consentNotification = new CookieConsent(cookieConsentConfig);
```

## Configuration

The configuration object supports the following options:

### Modal Types

- `initial`: Initial consent banner
- `firstVisitSettings`: Detailed settings modal
- `experienceImprove`: Experience improvement notification
- `manualSettings`: Manual settings trigger
- `simpleNotification`: Simple notification mode

### Visual Settings

```javascript
{
  visual: {
    zIndex: 9999,
    maxWidth: '600px',
    overlay: {
      show: true,
      color: 'rgba(0, 0, 0, 0.5)'
    },
    modals: {
      initial: {
        position: 'bottom',
        maxWidth: '600px',
        showOverlay: true,
        allowClose: true,
        closeOnOverlayClick: true,
        animation: 'slide',
        preventScroll: true,
        showExperienceImprove: true
      },
      // Other modal settings...
    }
  }
}
```

### Categories

```javascript
{
  categories: {
    necessary: {
      title: 'Necessary',
      description: 'Essential for the website to function properly',
      required: true,
      scripts: [
        {
          src: 'path/to/script.js',
          async: true
        }
      ]
    },
    // Other categories...
  }
}
```

### Texts

```javascript
{
  texts: {
    mainBanner: {
      title: 'Cookie Settings',
      description: 'We use cookies to improve your experience.\nBy continuing to use this site, you agree to our use of cookies.',
      acceptAll: 'Accept All',
      acceptNecessary: 'Accept Necessary',
      customize: 'Customize'
    },
    // Other text settings...
  }
}
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cookie-consent-hub.git
cd cookie-consent-hub
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run sass` - Compile SASS
- `npm run sass:watch` - Watch SASS files
- `npm run sass:min` - Compile minified SASS
- `npm run build:all` - Build all assets

### Testing

The project uses Jest for testing. Tests are located in the `__tests__` directory.

```bash
npm test
```

### Code Style

The project uses ESLint and Prettier for code formatting. Configuration files are included in the repository.

```bash
npm run lint
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [GDPR](https://gdpr.eu/) - General Data Protection Regulation
- [152-FZ](http://www.consultant.ru/document/cons_doc_LAW_61801/) - Russian Federal Law on Personal Data