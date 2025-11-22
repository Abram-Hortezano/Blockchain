# Dark Mode Note-Taking Dashboard - UI/UX Specification

## 1. Overview
This document outlines the visual design, component architecture, and interaction states for a responsive **Dark Mode Note-Taking Dashboard**. The design prioritizes a minimalist, high-contrast aesthetic with a focus on content hierarchy and visual quietness.

**Role**: UI/UX Implementation Specialist
**Objective**: Implement the UI structure focusing strictly on visuals, layout, and component styling using utility classes (e.g., Tailwind CSS).

---

## 2. Design Aesthetic & Tokens

### Core Philosophy
*   **Style**: Minimalist, Clean, Professional.
*   **Depth**: Visual separation via subtle background contrast. No strong shadows.
*   **Geometry**: Consistent medium rounded corners (e.g., `rounded-2xl`).

### Color Palette (Design Tokens)

| Token Name | Hex Value | Tailwind Utility (Approx) | Usage |
| :--- | :--- | :--- | :--- |
| **Background Primary** | `#0E121A` | `bg-[#0E121A]` | Main application canvas/body background. |
| **Background Secondary** | `#171C26` | `bg-[#171C26]` | Note cards and "Add New" card background. |
| **Accent / Action** | `#326AFD` | `text-[#326AFD]` | Primary interactive elements, active icons, "Add New" plus icon. |
| **Text High Contrast** | `#E0E0E0` | `text-[#E0E0E0]` | Titles, primary headings. |
| **Text Low Contrast** | `#899AC2` | `text-[#899AC2]` | Body text, dates, inactive icons, metadata. |

---

## 3. Layout & Responsiveness

The dashboard uses a fixed-height, fluid CSS Grid layout.

*   **Wrapper**: Generous, consistent padding around the grid container (e.g., `p-8`).
*   **Spacing**: Consistent gap (gutter) between all grid items (e.g., `gap-6`).

### Grid Breakpoints
| Device | Columns | Tailwind Class |
| :--- | :--- | :--- |
| **Mobile** | 1 Column | `grid-cols-1` |
| **Tablet** | 2 Columns | `md:grid-cols-2` |
| **Desktop** | 4 Columns | `lg:grid-cols-4` |

---

## 4. Component Specifications

### A. Note Card
*   **Container**:
    *   Background: `Background Secondary` (`#171C26`)
    *   Height: Full height of grid row (`h-full`)
    *   Border Radius: Medium (`rounded-2xl`)
    *   Padding: Consistent internal padding (e.g., `p-6`)
    *   Layout: Flex column (`flex flex-col justify-between`)

*   **Typography & Content**:
    *   **Title**:
        *   Font: Bold/Semibold (`font-semibold`)
        *   Size: Large (`text-xl`)
        *   Color: `Text High Contrast`
        *   *Goal*: Highest reading priority.
    *   **Body Snippet**:
        *   Font: Normal weight
        *   Size: Small (`text-sm`)
        *   Color: `Text Low Contrast`
        *   Margin: Top margin to separate from title (`mt-2`)
        *   *Goal*: Contextual preview.

*   **Footer (Metadata)**:
    *   Layout: Flex row, space between (`flex justify-between items-center mt-4`)
    *   **Timestamp**:
        *   Text: "1 day ago" (example)
        *   Size: Extra Small (`text-xs`)
        *   Color: `Text Low Contrast`
    *   **Favorite Icon**:
        *   Icon: Heart ($\heartsuit$)
        *   Style: Outlined (default)
        *   Color: `Text Low Contrast`
        *   Interaction: Clickable.

### B. "Add New" Call-to-Action Card
*   **Container**:
    *   Must match Note Card dimensions, background color (`#171C26`), and border radius exactly.
    *   Layout: Flexbox, centered content (`flex justify-center items-center`).
    *   Cursor: Pointer (`cursor-pointer`).
*   **Content**:
    *   **Icon**: Large Plus Sign ($\text{+}$).
    *   **Color**: `Accent / Action` (`#326AFD`).
    *   **Size**: Prominent (e.g., `w-12 h-12` or `text-4xl`).
    *   *Constraint*: No text labels; the icon stands alone.

---

## 5. Interactions & UX States

### Hover Effects
*   **Cards**: On hover, the card should exhibit a subtle "lift" or highlight.
    *   *Implementation*: Slight scale up (`hover:scale-[1.02]`) OR slight background lightening (`hover:bg-[#1f2633]`).
    *   *Transition*: Smooth ease-in-out (`transition-all duration-300`).

### Active States
*   **Favorite Toggle**:
    *   **Inactive**: Outlined Heart, Color `#899AC2`.
    *   **Active**: Filled Heart, Color `#326AFD` (Accent).
    *   *Animation*: Small pulse on click recommended.
