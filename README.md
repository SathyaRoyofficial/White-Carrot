#The project is been named as career craft initially however returned in the name of white carrot for training purpose only

⚪ How to Run

• Clone and Install the Repo
-- git clone https://github.com/SathyaRoyofficial/White-Carrot.git
-- cd careercraft
-- npm install

• env variables
-- create a .env.local at root folder
    Copy and paste your Supabase Keys as follows 

--  NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
--  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

• Start the Development Server
-- npm run dev
-- yarn dev
# or
-- pnpm dev
# or
-- bun dev

Go to localhost:3000 to view the live server or 

Deploy Virtually on Vercel by connecting the github connect or directly deploy on vercel to view it live

**Check the Application Live Here** : https://white-carrot-seven.vercel.app/


⚪ What I Built?

- **Visual Page Builder** : Built a Career Page interface featuring live-updating Zustand state stores and `@dnd-kit` sortable columns.
- **Applicant Tracking System (ATS)**: Integrated a job creation engine supporting Rich Text WYSIWYG editing, bulk CSV imports, and automated pagination tracking.
- **Dynamic Routing**: Leveraged Next.js dynamic slugs (`/[companySlug]/careers`) to auto-hydrate customized themes and SEO properties on the fly. 


⚪ Improvement Plan

• Custom Domain : For now we are based on vercel and slug based on vercel , in future we can let users map to there own custom domain
• Team Collaboration : Now, the application is limited to one user which is equal to one company , in future there might be a collaborate option so teams from the same company can access the application easily


⚪ Step by Step Guide

- **Onboarding**: Create an account, provide your company name, and the system automatically generates a unique URL slug for you.
- **Build the Portal**: Navigate to "Career Pages". Jump into the visual editor. Drag and drop "Hero", "Culture", and "Benefits" blocks. Customize your primary brand colors in the Theme tab. Click "Save Draft", then set to Published.
- **Open Jobs**: Go to the Jobs tab. Individually format job descriptions using the built-in Text Editor, or upload a CSV to bulk-import 50 roles at once.
- **Share**: Copy your distinct `whitecarrot.io/your-slug/careers` link and post it on LinkedIn. Candidates will see a heavily customized timeline tailored perfectly to your brand and open roles.
