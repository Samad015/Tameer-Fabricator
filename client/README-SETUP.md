# Tameer Fabricators — Home Page Setup

## 1. Install the one extra dependency this uses
```bash
npm install react-router-dom
```
Everything else (React, Vite) you already have.

## 2. Copy files into your project
Copy the `src/` and `public/` contents from this folder into your existing
`vite-project/`, matching the same paths (they mirror your original structure
exactly — `src/components/layout/Navbar.jsx` goes to the same path, etc.)

## 3. Things marked TODO that you need to fill in
Search your codebase for `TODO` — here's what's still placeholder:

| File | What to replace |
|---|---|
| `src/components/layout/Navbar.jsx` | `PHONE_NUMBER` constant |
| `src/components/layout/Footer.jsx` | `PHONE_NUMBER`, `EMAIL`, `ADDRESS` |
| `src/components/home/Hero.jsx` | `PHONE_NUMBER` constant |
| `src/assets/logo/logo.png` | drop your real logo file here (Navbar will pick it up automatically — falls back to text logo if missing) |
| `public/images/factory/workshop-01.jpg` | a real workshop/factory photo |
| `public/images/products/*.jpg` | real product photos (see `src/data/products.js` for expected filenames) |
| `src/data/products.js` | real product names + descriptions |
| `src/components/home/WhyChooseUs.jsx` | `REASONS` array — adjust to your real differentiators |
| `src/components/home/Testimonials.jsx` | `TESTIMONIALS` array — real client quotes |

## 4. Pages not built yet
`About`, `Products`, `ProductDetails`, `Projects`, `Factory`, `Gallery`, and
`Contact` are currently placeholder stubs so routing works and nothing
breaks. We'll build these one at a time next — just tell me which one to do
next and give me the content/photos for it.

## 5. Run it
```bash
npm run dev
```
