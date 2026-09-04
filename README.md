## Product: Momentum

## Team: Aarush, Sriram, Sathkrith, Yohaan

## Project background
Momentum was built as a team capstone project for an Advanced Projects course (Tesla STEM High School), Spring 2026. It ran as a six-sprint Scrum project:

| Sprint | Focus | Review date |
|---|---|---|
| Sprint 0 | Product framing, no feature work | Early March 2026 |
| Sprint 1 | Navigation bar, page scaffolding | Mid-March 2026 |
| Sprint 2 | Core page builds | March 26, 2026 |
| Sprint 3 | Login flow, trail browsing | April 10, 2026 |
| Sprint 4 | Gallery uploads, CO2 calculator, ride logging | April 30, 2026 |
| Sprint 5 | Trail filtering, activity log date validation | May 15, 2026 |
| Sprint 6 | End-to-end release candidate, demo hardening | May 29, 2026 |

Sprint planning docs, retrospectives, and demo checklists for all six sprints are in `/docs`.

This repo was migrated here from a school GitHub Classroom account in August 2026 ahead of losing access to that account. The code and history below reflect the finished state of the project as of the last sprint.

## Product Description: 
Most cycling apps are built for athletes, not for everyday commuters. They focus on performance, health and personal records, completely ignoring another focus point: biking as a solution to urban pollution. There are no platforms that combine environmental impact tracking, community building, local partnerships, and practical commuter tools into one place. That gap means that established apps miss people who might want to bike to work or school instead of driving, having no real support system that helps them make decisions. 
This matters because cities are running out of time to meet UN SDG goals around climate actions and sustainable transportation. When people lack personalized data showing them how much Co2 they're saving, how much money they're keeping in their pocket, or which trails and routes are available to them, the default choice stays the car. 
Momentum will be a working web application with four main features. The user must be able to use the mapping interface to plan a bike route and log the activity in their “calendar”, calculate the carbon cost of different modes of transportation for their routes and view an estimate of the positive impact they make when they choose to bike, browse trail suggestions (must specify mileage, difficulty, elevation, and ratings from other users), and pin bike rides to a pin board to share with other app users.

## Target User: 
Momentum's target user is the Gen-Z age group (14–30-year-olds) and users that care about the environment and/or biking. This allows us to personalize the website to match certain aesthetics, etc.

## Tech Stack: 
- Programming Language:
  - Typescript (via React): For frontend development, React is the industry standard and serves as a simple integration of HTML & CSS components. Yohaan and Sathkrith have done several React projects before, while Sriram & Aarush have worked on some JavaScript projects; however, the transition from JavaScript to TypeScript is not too difficult and will make development more effective and manageable. React handles dependencies simply and provides “components” that can be utilized several times to minimize structural redundancy throughout the site. Additionally, through the component structure, identification of vulnerabilities and errors will be much simpler and easily diagnosable. React does require Vite or a local development software to test, but that should be manageable on school laptops.
  - Tailwind CSS: As opposed to traditional CSS, Tailwind provides streamlined stylesheets that can be applied to modernize websites quickly and easily. All team members have familiarity with the language, and the utilization of the library should not be difficult. Since components are essentially just concise CSS components, they will increase readability significantly. Currently unsure about the limitations of Tailwind on school laptops, but it will serve as a dependency for our overall product.
  - Python: For backend features such as encryption and other API integrations, Python could be used to handle certain edge cases that React doesn’t have the bandwidth handle. All members have worked with Python during CSP and have done projects outside of school that require depth and familiarity with the language. As one of the most versatile and used languages in the world, we will likely run into no issues in terms of development as resources are nearly endless for issues we might run into. To run on school laptops, Python must be installed on the laptops, and since we are working on Windows, I would assume it is already installed.
- Framework/Engine:
  - React: Provides an industry standard for UI development with options for client-side features that are easy to develop. More details about React are in the previous question under the Typescript language. 
- Database:
  - Firebase or Supabase: For backend, we want something that integrates seamlessly, and both Firebase and Supabase provide that. Firebase has an extremely simple integration with React with minimal routing and excess code required. Supabase is a little more complicated but allows for tag-based querying and image capabilities. Both backend services are catered for React; however, we are unsure currently which one would be most applicable for us. This is something we will decide in one of our later Sprints after we finish the frontend and decide whether the tag-based image feature is worth the cost. Sathkrith has worked with Supabase before while the rest of the team has worked with Firebase. School laptops should have little to no obstacles to integrating with these backend services, so testing should not have any issues.
- Hosting/Deployment Plan:
  - Vercel: Vercel is the perfect tool for React developments as their hosting service is free to use, lightweight, and handles environmental variables on their end. That means dependencies that might have to traditionally be handled within our code and might serve as vulnerabilities will be on the deployment side, making testing and addressing issues simpler. All of us have worked with Vercel before, and it requires little to no prior technical experience to work with. As for school limitations, it is unfortunatly blocked by administration on the school provided laptops, but testing can still be done locally.
- Additional Libraries/APIs:
  - Mapping (Google Maps): Our app is heavily based on the use of mapping; hence, we will depend on an API for generating maps, collecting time & distance data, and other visual components. We have used Google Maps API with barebones integration, but none of us have familiarity with the use of specific features that will be needed for this API. However, it is highly publicized and there is very likely a plethora of documentation available that would make the learning curve a lot easier to overcome. Unsure about school laptop limitations, but Google Maps itself does not have any admin blocking, so I would hope the API can be used too.

## Running Momentum:

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Getting Started

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

Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## SPRINT GOAL (SPRINT 4): 
By the end of Sprint 4, a user will be able to upload both images AND documents to their personal galleries; calculate the CO2 savings of choosing to bike instead of driving,using public transit, or walking for a given distance; and log a bike ride to a personal activity log that persists.
