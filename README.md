This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Mudderfuger 🛹🍻

**Mudderfuger** is a chaotic, cinematic satire project blending surreal skits, street culture, AI manipulation, and subversive humor into a gritty narrative universe. The site lives at [mudderfuger.ai](https://mudderfuger.ai), where episodes, brand collabs, and interactive experiences converge.

## 🎬 Episodes
All episodes are hosted on BunnyCDN and loaded in a responsive hover-to-preview video grid. Clicking opens a modal player, preserving playback time per video.

## 🛍️ Interactive Store
Powered by [Snipcart](https://snipcart.com), users can:
- Purchase product placements, song features, or even inject themselves into the skits.
- Use a lightweight e-commerce experience, seamlessly integrated into the frontend.

## ⚙️ Tech Stack
- [Next.js](https://nextjs.org/) (Pages Router)
- [Tailwind CSS](https://tailwindcss.com/) for layout + animation
- [Snipcart](https://snipcart.com) for headless checkout
- [BunnyCDN](https://bunny.net) for media delivery
- TypeScript + Heroicons

## 📁 Project Structure
```
.
├── public/              # Static assets (images, videos, favicon)
├── src/
│   ├── app/             # Root layout + metadata
│   ├── components/      # VideoGrid, ProductsSection, etc.
├── .env.local           # Env vars (not committed)
└── README.md
```

## 🧪 Development
```bash
pnpm install
pnpm dev
```

## 🚀 Build for Production
```bash
pnpm build
pnpm start
```

## 🔐 Environment Variables
Create a `.env.local` file with:

```env
NEXT_PUBLIC_SNIPCART_API_KEY=your-snipcart-public-key
```

> Never commit this file — it’s gitignored.

## 📦 Deployment
- Deployed via [Vercel](https://vercel.com) with GitHub CI
- Automatic builds from main + preview branches

---

© mudderfuger.ai — Reality is negotiable.