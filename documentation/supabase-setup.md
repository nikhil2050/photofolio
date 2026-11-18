
1. Go to supabase.com, create a project, and wait for it to finish provisioning.
2. In Supabase, open Project Settings → API and copy:
   - Project URL
   - Publishable key (sb_publishable_...)
3. In the Photofolio project, create .env.local:
```.env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

4. Apply the database migration:
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF

npx supabase db push --remote
#npx supabase db push

```

5. In Supabase Dashboard, Authentication → URL Configuration, add:
```
http://localhost:3000/auth/confirm
```

6. Install dependencies and start the app:
```
npm install
npm run dev
```

7. Stop Supabase Anonymous usage data:
```
supabase telemetry disable
``` 