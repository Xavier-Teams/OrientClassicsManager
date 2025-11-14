# Design Guidelines: Eastern Classics Translation Project Management System

## Design Approach

**Selected Approach:** Design System-Based (Material Design 3 + Custom Productivity Patterns)

Drawing inspiration from Monday.com's workflow visualization and ClickUp's feature density, combined with Material Design 3's productivity-focused components for a professional, data-dense enterprise application.

**Core Principles:**
- Information clarity over visual flair
- Efficient workflows with minimal clicks
- Scalable component architecture
- Consistent, predictable interactions

---

## Typography System

**Font Family:** Inter (primary), Noto Sans (Vietnamese support)

**Hierarchy:**
- H1: 32px/Bold - Page titles, main headers
- H2: 24px/Semibold - Section headers, card titles
- H3: 20px/Semibold - Subsection headers
- H4: 16px/Medium - Card headers, list titles
- Body Large: 16px/Regular - Primary content, form inputs
- Body Medium: 14px/Regular - Secondary content, descriptions
- Body Small: 12px/Regular - Metadata, timestamps, helper text
- Caption: 11px/Medium - Labels, tags, status indicators

---

## Layout System

**Spacing Scale:** Use Tailwind units of 1, 2, 4, 6, 8, 12, 16, 20, 24

**Common Patterns:**
- Card padding: p-6
- Section spacing: py-12 or py-16
- Component gaps: gap-4 or gap-6
- Icon margins: mr-2 or ml-2
- Button padding: px-6 py-3

**Grid System:**
- Dashboard: 12-column grid with gap-6
- Cards: Flexible grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Forms: 2-column layout for efficiency (md:grid-cols-2)
- Sidebar: Fixed 280px width, collapsible to 64px (icon-only)

---

## Component Library

### Navigation & Layout

**Top Navigation Bar**
- Height: h-16
- Contains: Logo, global search, notifications, user menu
- Sticky positioning
- Shadow: subtle elevation

**Sidebar Navigation**
- Collapsible structure
- Icons: 24px with mr-3 spacing
- Active state: subtle background treatment
- Nested items: pl-12 indent

**Breadcrumbs**
- Size: text-sm
- Separator: Chevron icon
- Max depth: 4 levels

### Data Display

**Board View (Kanban)**
- Columns: min-w-80, max-w-96
- Card dimensions: Full width, min-h-32
- Column headers: h-12 with task count badge
- Card spacing: gap-3 within columns
- Drag indicators: visible on hover

**Cards (Universal)**
- Border radius: rounded-lg
- Padding: p-4 or p-6 (depending on content density)
- Shadow: subtle on default, elevated on hover
- Header section: flex justify-between items-start
- Content area: space-y-3
- Footer/metadata: mt-4, text-sm, flex items-center gap-4

**Timeline/Gantt View**
- Row height: h-12
- Bar height: h-8
- Grid lines: subtle guides
- Time scale: sticky header
- Milestone markers: diamond shape

**Tables**
- Header: h-12, medium font weight
- Row height: h-14 (comfortable), h-10 (compact)
- Sticky header on scroll
- Row hover: subtle background shift
- Cell padding: px-4 py-3

**Status Badges**
- Height: h-6
- Padding: px-3
- Border radius: rounded-full
- Text: text-xs, font-medium
- Icon: 14px with mr-1.5

### Forms & Inputs

**Text Inputs**
- Height: h-12
- Padding: px-4
- Border radius: rounded-md
- Label: mb-2, text-sm, font-medium
- Helper text: mt-1, text-xs
- Error state: red treatment with icon

**Dropdowns/Selects**
- Height: h-12
- Chevron icon: right-aligned
- Menu: max-h-64, overflow-y-auto
- Option padding: px-4 py-2

**Buttons**
- Primary: h-11, px-6, rounded-md, font-medium
- Secondary: h-11, px-6, rounded-md, outlined variant
- Small: h-9, px-4, text-sm
- Icon button: w-10 h-10, rounded-md
- Icon spacing: mr-2 (when paired with text)

**Search Bar**
- Height: h-11
- Icon: left-aligned, 20px
- Clear button: right-aligned on input
- Dropdown suggestions: mt-2, rounded-lg

### Overlays

**Modals**
- Max width: max-w-2xl (forms), max-w-4xl (detail views)
- Padding: p-6
- Header: h-16 with close button
- Footer: h-16 with action buttons (right-aligned)
- Content: max-h-96, overflow-y-auto

**Side Panels**
- Width: w-96 or w-1/3
- Slide-in animation from right
- Sticky header/footer

**Tooltips**
- Max width: max-w-xs
- Padding: px-3 py-2
- Text: text-xs
- Arrow indicator included

**Dropdowns/Popovers**
- Padding: p-2
- Item padding: px-3 py-2
- Dividers: my-1
- Max height with scroll: max-h-72

### Specialized Components

**Progress Indicators**
- Linear: h-2, rounded-full
- Circular: 48px diameter (small), 64px (medium)
- Percentage label: text-sm, font-medium

**File Upload**
- Drop zone: min-h-48, dashed border
- File list: space-y-2
- File item: h-12, flex items-center, px-4

**Calendar/Date Picker**
- Cell size: w-10 h-10
- Header navigation: h-12
- Today indicator: subtle treatment

**Avatar/Profile Images**
- Sizes: w-8 h-8 (small), w-10 h-10 (medium), w-12 h-12 (large)
- Rounded: rounded-full
- Fallback: initials with contrasting background

---

## View-Specific Layouts

### Dashboard
- Hero stats: grid-cols-4, h-32 cards
- Chart section: grid-cols-2, min-h-96
- Recent activity: max-h-96, overflow-y-auto

### Work Management (Board/List)
- Filter bar: h-14, sticky below navigation
- View switcher: tabs with icons
- Bulk actions: toolbar appears on selection

### Detail Views
- Two-column layout: 2/3 main content, 1/3 sidebar
- Main content: max-w-4xl
- Sidebar: metadata, timeline, comments

### Forms
- Section dividers: my-8
- Field groups: space-y-6
- Form actions: sticky bottom bar or right-aligned

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px (single column, stacked navigation)
- Tablet: 768px - 1024px (2 columns, collapsible sidebar)
- Desktop: > 1024px (full layout)

**Mobile Adaptations:**
- Sidebar: overlay drawer
- Tables: horizontal scroll or card transformation
- Multi-column grids: collapse to single column
- Reduced padding: p-4 instead of p-6

---

## Accessibility

- Focus indicators: 2px offset ring
- ARIA labels on all interactive elements
- Keyboard navigation: consistent tab order
- Minimum contrast ratios: WCAG AA
- Screen reader announcements for status changes

---

## Performance Patterns

- Virtual scrolling for long lists (>100 items)
- Lazy loading for heavy components
- Skeleton screens during data fetch
- Debounced search inputs (300ms)
- Optimistic UI updates for actions