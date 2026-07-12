# Product

## Register

brand

## Users

Two distinct user groups, both dealership staff:

- **Operations & admins** — manage the vehicle inventory end-to-end. Adding, editing, deleting listings, tracking stock levels, processing restocks. Their context is a desk workstation during business hours, focused on data accuracy and throughput.
- **Sales staff** — browse inventory, search and filter vehicles by criteria, process purchases for walk-in customers. Their context is a showroom tablet or desk computer, working alongside customers, needing speed and clarity.

Both groups share the same tool throughout the day; the interface needs to serve the admin's depth and the salesperson's speed without compromising either.

## Product Purpose

A modern dealership inventory management system that replaces cluttered, dated dealership CRMs with a design that reflects the quality of the vehicles themselves. The tool should feel as premium and carefully crafted as the cars it manages — turning a routine inventory task into a delightful, confidence-inspiring experience.

Success looks like: staff who actually enjoy opening this app, customers who see a professional operation reflected in the tool, and inventory management that feels fast and effortless rather than like a chore.

## Brand Personality

Modern, energetic, delightful. Three words that translate to:

- **Bold** — confident use of color, space, and typography. Not afraid to make a statement.
- **Fast** — the interface feels snappy, responsive, alive. Micro-motions and transitions that feel instant.
- **Premium** — clean edges, thoughtful spacing, deliberate craft. Feels like a high-end car brand's digital touchpoint (Tesla, Rivian, Porsche).
- **Playful** — personality in the details. Micro-interactions, unexpected moments of delight, a voice that doesn't take itself too seriously.

## Anti-references

- **Traditional dealership CRMs** — cluttered tables, beige/gray palettes, dense data dumps, dated iconography, information overload with no hierarchy. The opposite of what we're building.
- **Generic SaaS admin panels** — soulless white-and-blue dashboards, identical card grids, hero-metric templates. No personality, no brand.
- **Beige or muted palettes** — the default "safe" route. A brand surface for cars should have energy, not blend into the background.

## Design Principles

1. **Energy first, information second.** A dashboard that's a joy to look at is more effective than one that crams every data point onto the screen. Lead with the visual; data follows.
2. **One job, done well.** Every screen has one primary action. Don't layer forms, tables, and controls on top of each other without clear visual hierarchy.
3. **The tool reflects the product.** A dealership selling premium vehicles should use a premium tool. Every pixel signals quality — or its absence.
4. **Delight in the details.** The loading state, the empty state, the purchase animation — these are moments to build brand, not gaps to fill.
5. **Speed is a feature.** The design should feel fast. Minimal re-renders, instant feedback, transitions that don't waste the user's time.

## Accessibility & Inclusion

- Target: WCAG 2.1 AAA
- Proper focus management, keyboard navigation, screen reader support across all workflows
- Reduced motion respected via `prefers-reduced-motion`
- Sufficient color contrast in all states, including semantic colors (success, danger, warning)
- Form validation and error states communicated visually and programmatically
