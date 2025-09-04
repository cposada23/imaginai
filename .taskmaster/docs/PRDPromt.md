I would like to create concise functional requirements for the following application:

The app is called ImaginAI and is a midjourney clone, but using OpenAI's image model.
Research midjourney to get a better understanding of the app.

My Requirements:
- We'll need a codebase using Next.js 15, TailwindCSS, Lucide Icons, React Hook Form with zod and Shadcn UI. See documentation on how to start it here: https://ui.shadcn.com/docs/installation/next
- It should integrate with the OpenAI APIs. The image model used is gpt-image-1. API Reference here: https://platform.openai.com/docs/api-reference/introduction
- The app should have a unified interface with a chat input and a timeline of results
- The timeline should be scrollable and have infinite loading with pagination
- The timeline should be responsive, a grid of 1 on mobile, 2 on tablet and 4 on desktop
- There should be minimal filters on the timeline, with the ability to filter by
  - date
  - status
  - aspect ratio
  - order by newest first or oldest first
- You should be able to download each image by clicking on it
- There should be a details view for the entire prompt which shows:
  - all images for the prompt
  - the jobId
  - created
  - status
  - image count
  - dimensions
  - model
  - quality
  - allow to easily re-run the prompt and download each of the images
- The images should be shown in their correct aspect ratio but within a square container
- You are able to submit the prompt multiple times; more items will be added to the timeline (as background jobs)
- Each prompt can have the following options:
  - quality: (low, mid, high)
  - aspect ratio: 1024x1024, 1536x1024, 1024x1536
  - output_compression ((0-100%)) - default is 50%
  - output_format should be webp
  - moderation should be "low"
  - n (number of images to generate)
  - response_format should be b64_json
  - model should be "gpt-image-1"
- You should be able to see a previous prompt and easily rerun it by clicking on it
- The response images should be stored locally in the browser storage
- You should have a simple navigation bar with a settings button
- In the settings menu you can set your OpenAI API key which is also stored locally in the browser storage


Output as markdown code.
