# Pharmacy Verification Logo

This directory contains the SVG implementation of the official pharmacy verification logo required for online pharmacies in Ukraine.

## Technical Specifications

The logo adheres to the official regulations and includes:

- An equilateral cross in two shades of green (Pantone 2270 C and Pantone 7731 C)
- A central part divided by a curved white line
- The Ukrainian flag at 2/3 the size of the cross
- The text "Перевір легальність роботи аптеки" in Bookman Old Style font
- Placed inside a white rectangle with rounded corners and green border
- Minimum width of 90 pixels
- Static implementation (no animations)

## Color Specifications

The logo uses these official colors:
- Pantone 2270 C (C60 M0 Y90 K0)
- Pantone 7731 C (C78 M3 Y84 K22)
- Pantone 2935 C (C100 M63 Y0 K2) - Flag blue
- Pantone 012 C (C0 M2 Y100 K0) - Flag yellow

## Usage

Import and use the logo with the provided utility functions:

```typescript
import { addPharmacyVerificationLogo } from './pharmacyVerificationLogo';

// Add to a container element with default size (200px)
addPharmacyVerificationLogo(containerElement);

// Or specify a custom width (minimum 90px will be enforced)
addPharmacyVerificationLogo(containerElement, 150);
```

The logo will automatically be displayed at the specified width (with a minimum of 90px as required by regulations). 