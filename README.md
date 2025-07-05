# CoinStack - Crypto Trading Analysis Dashboard

A modern, responsive crypto trading analysis dashboard with advanced features for tracking trades, analyzing patterns, and managing trading schedules.

## 🚀 Features

- **Trading History Management**: Track and analyze your crypto trades with detailed P&L calculations
- **Technical Analysis**: Comprehensive knowledge base of trading patterns and indicators
- **Trading Schedule**: Plan and manage your trading sessions with time-based recommendations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, minimalist interface with glassmorphism effects and smooth animations
- **Data Export/Import**: CSV export and import functionality for data portability
- **Real-time Search**: Fast search through technical analysis content
- **Interactive Charts**: Visual candlestick pattern demonstrations

## 📁 Project Structure

```
CoinStack/
├── index.html              # Main application file
├── css/                    # Stylesheets directory
│   ├── index.css          # Main CSS entry point (imports all other files)
│   ├── main.css           # Core styles, typography, layout
│   ├── components.css     # UI components (tables, modals, forms)
│   ├── candlestick.css    # Candlestick pattern visualizations
│   ├── trading.css        # Trading-specific styles
│   └── responsive.css     # Mobile and tablet adaptations
├── js/                    # JavaScript files (to be implemented)
├── components/            # Reusable components (to be implemented)
└── assets/               # Images, icons, and other assets (to be implemented)
```

## 🎨 CSS Architecture

The CSS is organized into modular files for better maintainability and performance:

### `css/index.css`
- Main entry point that imports all other CSS files
- Contains CSS custom properties (variables) for consistent theming
- Includes utility classes for common styling needs
- Defines print styles for better printing experience

### `css/main.css`
- Base styles and typography
- Header and navigation styles
- Layout and grid systems
- Global animations and transitions

### `css/components.css`
- Reusable UI components
- Tables, forms, buttons, and modals
- Search functionality styles
- Counter components with animations

### `css/candlestick.css`
- Candlestick pattern visualizations
- Interactive chart components
- Pattern recognition styles

### `css/trading.css`
- Trading history table styles
- Schedule management components
- Trading session guides
- Action buttons and forms

### `css/responsive.css`
- Mobile-first responsive design
- Breakpoint-specific adjustments
- Touch-friendly interactions
- Print media queries

## 🎯 Key Features

### Trading History
- Add, edit, and delete trades
- Automatic P&L calculations
- Risk amount tracking
- Trade type categorization (Open/Close)
- Visual connection highlighting between related trades

### Technical Analysis
- Comprehensive pattern library
- Interactive candlestick demonstrations
- Searchable knowledge base
- Collapsible content sections

### Trading Schedule
- Session planning and management
- Time-based trading recommendations
- Progress tracking
- Export/import functionality

### Modern UI Elements
- Glassmorphism effects
- Smooth animations and transitions
- Hover effects and micro-interactions
- Responsive design across all devices

## 🛠️ Usage

1. **Open the application**: Simply open `index.html` in a modern web browser
2. **Add trades**: Use the "Add New Trade" button to input trade data
3. **Analyze patterns**: Browse the Knowledge Base tab for technical analysis
4. **Plan sessions**: Use the Trading Schedule tab to plan your trading sessions
5. **Export data**: Use the export buttons to save your data as CSV files

## 🎨 Customization

### Colors
The application uses CSS custom properties for easy theming. Main color variables:

```css
--primary-color: #8b5cf6;    /* Purple */
--success-color: #10b981;    /* Green */
--warning-color: #f59e0b;    /* Orange */
--danger-color: #ef4444;     /* Red */
```

### Typography
The application uses Inter font family for a modern, clean look:

```css
--font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
```

### Spacing
Consistent spacing system using CSS variables:

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- **Desktop**: 1200px and up
- **Tablet**: 768px to 1199px
- **Mobile Large**: 600px to 767px
- **Mobile Small**: 480px and below

## 🔧 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or support, please open an issue on the GitHub repository.

---

**CoinStack** - Making crypto trading analysis simple and beautiful. 