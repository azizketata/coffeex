# CoffeeX Icon Assets Guide

## Folder Structure

```
assets/
├── icons/
│   ├── coffee-cup.svg        # Main coffee cup icon
│   ├── coffee-bean.svg       # Coffee bean icon
│   ├── steam.svg            # Coffee steam animation
│   ├── wallet.svg           # Wallet/balance icon
│   ├── user-circle.svg      # User profile icon
│   ├── admin-badge.svg      # Admin badge icon
│   ├── machine.svg          # Coffee machine icon
│   ├── location-pin.svg     # Location marker icon
│   └── nfc-chip.svg         # NFC tag icon
├── images/
│   ├── logo.png             # CoffeeX logo (512x512)
│   ├── logo-dark.png        # Dark mode logo
│   ├── hero-coffee.jpg      # Hero banner image
│   └── patterns/
│       └── coffee-beans.png  # Background pattern
└── animations/
    ├── brewing.json         # Lottie animation for brewing
    └── steam.json          # Lottie animation for steam

```

## Icon Descriptions and Usage

### 1. **Coffee Cup Icon** (`coffee-cup.svg`)
- **Description**: A minimalist coffee cup with steam rising
- **Where to use**: 
  - Main logo area
  - Order button icon
  - Transaction history items
- **Color**: Primary brown (#6b3d00)

### 2. **Coffee Bean Icon** (`coffee-bean.svg`)
- **Description**: Single or paired coffee beans
- **Where to use**:
  - Bean level indicators
  - Refill notifications
  - Admin dashboard
- **Color**: Dark brown with gradient

### 3. **Wallet Icon** (`wallet.svg`)
- **Description**: Modern wallet with cards visible
- **Where to use**:
  - Balance display
  - Top-up button
  - Payment sections
- **Color**: Success green (#2e7d32) for positive balance

### 4. **User Circle Icon** (`user-circle.svg`)
- **Description**: Circular user avatar with coffee theme
- **Where to use**:
  - Profile page header
  - User menu
  - Navigation bar
- **Color**: Secondary beige (#d4a574)

### 5. **Machine Icon** (`machine.svg`)
- **Description**: Espresso machine silhouette
- **Where to use**:
  - Machine selection
  - Machine status display
  - Admin machine management
- **Color**: Match machine status (green/red)

### 6. **Location Pin Icon** (`location-pin.svg`)
- **Description**: Map pin with coffee cup inside
- **Where to use**:
  - Machine location display
  - Building selection
- **Color**: Primary brown

### 7. **NFC Chip Icon** (`nfc-chip.svg`)
- **Description**: NFC waves emanating from chip
- **Where to use**:
  - Machine selection button
  - NFC scan instructions
- **Color**: Tech blue (#0052cc)

### 8. **Admin Badge Icon** (`admin-badge.svg`)
- **Description**: Shield with coffee cup and star
- **Where to use**:
  - Admin portal header
  - Admin user indicators
- **Color**: Gold gradient

## Recommended Icon Sources

1. **Free Resources**:
   - [Feather Icons](https://feathericons.com/) - Simple, clean icons
   - [Heroicons](https://heroicons.com/) - Modern UI icons
   - [Tabler Icons](https://tabler-icons.io/) - 3000+ free SVG icons
   - [Phosphor Icons](https://phosphoricons.com/) - Flexible icon family

2. **Coffee-Specific Icons**:
   - [Flaticon Coffee Collection](https://www.flaticon.com/search?word=coffee)
   - [Icons8 Coffee Icons](https://icons8.com/icons/set/coffee)
   - [Noun Project Coffee](https://thenounproject.com/search/?q=coffee)

3. **Premium Options**:
   - [Streamline Icons](https://streamlinehq.com/)
   - [IconJar](https://geticonjar.com/)

## Implementation in Code

### Using Custom SVG Icons

```xml
<!-- In your view -->
<core:Icon src="./assets/icons/coffee-cup.svg" size="2rem" class="coffeeIcon"/>

<!-- Or as Image -->
<Image src="./assets/icons/coffee-cup.svg" width="32px" height="32px"/>
```

### Adding Background Patterns

```css
.homePageContainer {
  background-image: url('../assets/images/patterns/coffee-beans.png');
  background-repeat: repeat;
  background-size: 200px;
  background-position: center;
  opacity: 0.05;
}
```

## Icon Color Palette

- **Primary Brown**: #6b3d00
- **Dark Brown**: #4a2900
- **Light Brown**: #8b5a00
- **Beige**: #d4a574
- **Cream**: #f5e6d3
- **Success Green**: #2e7d32
- **Warning Orange**: #f57c00
- **Error Red**: #d32f2f

## Animation Suggestions

1. **Coffee Cup Steam**: Animated rising steam on hover
2. **Bean Rotation**: Rotating coffee beans on loading
3. **Pulse Effect**: For low balance warnings
4. **Slide In**: For transaction confirmations
5. **Brewing Animation**: While processing orders

## Where to Add Icons in Your Views

### User Home Page
- Balance card: Add wallet icon
- Today's count: Add coffee cup icon
- Machine status: Add machine icon with status indicator
- Order button: Add animated coffee cup

### Admin Dashboard
- Stats cards: Add relevant icons (users, machines, money)
- Charts: Add chart type icons
- Machine table: Add status icons

### Profile Page
- User avatar: Replace with custom coffee-themed avatar
- Menu items: Add icons for each action
- Balance display: Add animated coin/wallet icon