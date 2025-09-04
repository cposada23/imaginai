# ImaginAI Product Requirements Document

## 1. Introduction
This Product Requirements Document (PRD) outlines the functional and technical specifications for ImaginAI, a client-side image generation application powered by OpenAI's GPT-image-1 model. This document serves as the comprehensive guide for developers, designers, and stakeholders involved in the development process. ImaginAI aims to provide users with a Midjourney-style image generation experience through a unified chat-like interface and a scrollable timeline of results, all operating primarily within the user's browser.

## 2. Product overview
ImaginAI is a browser-based image generation tool that enables users to create AI-generated images using the OpenAI Images API. The application operates primarily client-side, with no server authentication required. Users provide their own OpenAI API key, enter text prompts along with optional parameters, and receive generated images that are displayed in a responsive grid timeline. The application stores all image data locally using IndexedDB and maintains user preferences in localStorage.

The core user experience revolves around a simple, intuitive flow:

*   Enter a text prompt and optional parameters
*   Submit to generate images
*   View generated images in a scrollable timeline
*   Access detailed views of specific image sets
*   Re-run previous prompts or download generated images

ImaginAI prioritizes user privacy by keeping all data local to the user's browser and only using the OpenAI API for image generation tasks.

## 3. Tech stack
The application will be built using the following technologies:

*   **Frontend Framework**: Next.js 15 with App Router, React 19
*   **UI Components**: TailwindCSS for styling, shadcn/ui component library, lucide-react for icons
*   **Form Management**: react-hook-form with zod for validation
*   **API Integration**: OpenAI Images API with model: "gpt-image-1"
*   **Storage**:
    *   IndexedDB for storing image binaries
    *   localStorage for configuration (API key, preferences)
*   **Styling**: Dark/light theme via Tailwind with CSS variables

## 4. Goals and objectives

### 4.1 Primary goals
*   Create a user-friendly, browser-based image generation tool similar to Midjourney
*   Provide a unified chat-like prompt input with a scrollable timeline of results
*   Ensure all user data remains local to the browser for privacy
*   Optimize for performance with client-side image processing and storage
*   Support responsive design across all device sizes

### 4.2 Success metrics
*   Smooth user experience with <2s response time for UI interactions
*   Efficient image processing and storage within browser limitations
*   Successful integration with OpenAI's image generation API
*   Intuitive navigation and image management for users

## 5. Target audience
ImaginAI targets individual users who:

*   Need to generate AI images for personal or professional use
*   Have an OpenAI API key
*   Value privacy and local data storage
*   Prefer browser-based tools that don't require account creation
*   Work across different devices (desktop, tablet, mobile)

## 6. Features and requirements

### 6.1 Core features

#### 6.1.1 Prompt input and options (FR-P1 to FR-P4)
*   **Unified input interface**
    *   Single input field (sticky positioned on desktop/mobile)
    *   Collapsible "Advanced" options panel
    *   Submit button to initiate image generation
*   **Advanced generation options**
    *   **Quality**: low | mid | high
    *   **Aspect ratio**: 1024x1024 | 1536x1024 | 1024x1536
    *   **Output compression**: 0-100% (default 50%)
    *   **Output format**: webp (fixed)
    *   **Moderation**: "low" (fixed)
    *   **Number of images (n)**: 1 or more, with reasonable maximum
    *   **Model**: "gpt-image-1" (default, editable for future compatibility)
    *   **Response format**: "b64_json" (preferred) or auto-detect
*   **Form validation**
    *   Required prompt field
    *   Bounded image count (n)
    *   Bounded compression value
    *   Validated enumerated options
*   **Job creation process**
    *   Submit adds job with "queued" status
    *   Renders placeholder cards in timeline
    *   Maintains consistent UI state during processing

#### 6.1.2 Timeline results feed (FR-T1 to FR-T5)
*   **Infinite scroll implementation**
    *   Cursor-based pagination over local dataset
    *   Load additional content as user scrolls
    *   Preserve scroll position between interactions
*   **Responsive grid layout**
    *   1 column on mobile (≤sm)
    *   2 columns on tablet (md)
    *   4 columns on desktop (lg+)
*   **Filtering capabilities**
    *   Date range selection
    *   Status filter (queued | running | completed | failed)
    *   Aspect ratio filter
    *   Sort order (newest | oldest)
*   **Result card design**
    *   Square container with letterboxed image (preserving aspect ratio)
    *   Status indicator
    *   Creation timestamp
    *   Image count indicator
    *   Click interaction to open details view
*   **Timeline management**
    *   Append new items without resetting scroll position
    *   Handle empty states and loading states
    *   Support for partial updates (some images complete, some pending)

#### 6.1.3 Details view (FR-D1 to FR-D3)
*   **Comprehensive display**
    *   All images for the specific prompt (carousel/grid)
    *   Complete metadata (jobId, created, status, imageCount, dimensions, model, quality)
*   **Available actions**
    *   Re-run button to reload form with same prompt/options
    *   Download button for each image (WEBP format)
*   **Deep linking**
    *   Accessible via route: `/prompt/[jobId]`
    *   Maintains state between direct access and navigation

#### 6.1.4 OpenAI integration (FR-A1 to FR-A4)
*   **API integration**
    *   Model: "gpt-image-1"
    *   Prompt: text string
    *   Image count (n): numeric value
    *   Size: mapped from aspect ratio selection
    *   Quality: mapped from quality selection
    *   Response format: attempt "b64_json" with fallback handling
*   **Image processing**
    *   Transcode returned base64 to WEBP
    *   Apply output compression setting
    *   Handle both explicit and implicit response formats
*   **Background job management**
    *   Client-side queue system (queued → running → completed/failed)
    *   Concurrency limiting to avoid rate limits
    *   Retry policy with exponential backoff
*   **Error handling**
    *   Rate-limit detection and user feedback
    *   Timeout handling
    *   Partial success support
    *   User-friendly error messages

#### 6.1.5 Storage and downloading (FR-S1 to FR-S4)
*   **Download functionality**
    *   Click to download WEBP image
    *   Standard filename format: `imaginai_{jobId}_{index}.webp`
*   **IndexedDB implementation**
    *   Store prompt records, options, job metadata
    *   Store image binaries as Blobs
    *   Support for pagination and filtering
    *   Indexed fields for efficient queries
*   **localStorage usage**
    *   Store API key securely
    *   Save UI preferences (theme, default options)
    *   Remember last used filters/sort
*   **Import/export capabilities**
    *   Export prompt group as ZIP (images + metadata.json)
    *   Optional full library export

#### 6.1.6 Moderation and safety (FR-M1 to FR-M2)
*   **Client-side filtering**
    *   Basic keyword checking when moderation is set to "low"
    *   Warning dialog with confirmation for potentially flagged content
*   **Legal and ethical compliance**
    *   Disclaimer in settings and first-run modal
    *   Clear information about data usage and limitations

#### 6.1.7 Navigation and layout (FR-N1 to FR-N3)
*   **Navigation components**
    *   Top navbar with brand, search, settings button
    *   Settings access via dialog/sheet
    *   Mobile-optimized interactions
*   **Settings interface**
    *   OpenAI API key management (masked for security)
    *   Default generation options configuration
    *   Data management tools (clear images/keys)
*   **Mobile adaptations**
    *   Sticky input positioning
    *   Collapsible filters
    *   Optional pull-to-refresh
    *   Touch-optimized interactions

#### 6.1.8 Accessibility and UX (FR-X1 to FR-X3)
*   **Keyboard navigation**
    *   Tab navigation for interactive elements
    *   Arrow key support for grid navigation
    *   Keyboard shortcuts for common actions
*   **Accessibility compliance**
    *   ARIA labels on all interactive elements
    *   Alt text generation from prompt text
    *   Screen-reader friendly notifications
*   **Progress indication**
    *   Visual indicators for running jobs
    *   Toast notifications for key events
    *   Accessible status updates

#### 6.1.9 Performance optimization (FR-PF1 to FR-PF3)
*   **Timeline virtualization**
    *   Render only visible elements
    *   Lazy decode images
    *   Intersection observer implementation
*   **Processing offloading**
    *   Web Worker support for image transcoding
    *   Background processing to maintain UI responsiveness
*   **Image optimization**
    *   Separate thumbnail cache for grid view
    *   Full resolution images only in details view
    *   Progressive loading where applicable

#### 6.1.10 Client observability (FR-O1 to FR-O2)
*   **Event logging**
    *   In-memory + IndexedDB event log
    *   Job lifecycle tracking
    *   Error capturing
*   **Debug capabilities**
    *   Optional console debugging
    *   Toggle in settings
    *   Performance monitoring

### 6.2 Data model

#### 6.2.1 PromptJob
```typescript
interface PromptJob {
  jobId: string;                // UUID
  prompt: string;               // Text prompt
  options: {
    quality: 'low' | 'mid' | 'high';
    aspect_ratio: '1024x1024' | '1536x1024' | '1024x1536';
    output_compression: number; // 0-100
    output_format: 'webp';      // Fixed
    moderation: 'low';          // Fixed
    n: number;                  // Image count
    model: string;              // Default "gpt-image-1"
    response_format: 'b64_json' | 'auto';
  };
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: number;            // Epoch ms
  updatedAt: number;            // Epoch ms
  imageCount: number;           // Total images
  dimensions: '1024x1024' | '1536x1024' | '1024x1536';
}
```

#### 6.2.2 GeneratedImage
```typescript
interface GeneratedImage {
  id: string;                   // UUID
  jobId: string;                // Reference to PromptJob
  index: number;                // Position in set
  blobKey: string;              // IndexedDB key
  width: number;                // Image width
  height: number;               // Image height
  status: 'ready' | 'failed';   // Image status
}
```

#### 6.2.3 Settings
```typescript
interface Settings {
  apiKey: string;               // OpenAI API key
  defaults: {
    quality: 'low' | 'mid' | 'high';
    aspect_ratio: '1024x1024' | '1536x1024' | '1024x1536';
    n: number;                  // Default image count
    output_compression: number; // 0-100
  };
  ui: {
    theme: 'system' | 'light' | 'dark';
  };
}
```

### 6.3 UI components
The application will utilize shadcn/ui components with Tailwind for styling:

*   **Navbar**
    *   Brand logo/text
    *   Search input with debounce
    *   Settings button
*   **PromptForm**
    *   Textarea for prompt input
    *   Collapsible advanced options panel
    *   Submit button
    *   Validation message display
*   **FiltersBar**
    *   DateRangePicker component
    *   StatusSelect dropdown
    *   AspectRatioSelect dropdown
    *   SortSelect dropdown
*   **TimelineGrid**
    *   Virtualized grid implementation
    *   Infinite loader integration
    *   Empty state display
    *   End of content indicator
*   **ResultCard**
    *   Square container with letterboxed image
    *   Status indicator chip
    *   Timestamp display
    *   Click handler for details view
*   **DetailsDrawer/Page**
    *   Metadata display section
    *   Image gallery (carousel/grid)
    *   Action buttons (re-run, download)
*   **SettingsDialog**
    *   API key input field (masked)
    *   Default options configuration
    *   Data management controls
    *   Theme selector
*   **Toaster**
    *   Success/error notification display
    *   Timed auto-dismissal
    *   Action buttons where applicable
*   **Loading/Spinner**
    *   Consistent loading indicators
    *   Progress visualization where applicable

## 7. User stories and acceptance criteria

### 7.1 Prompt submission and generation
**US-101: Submitting a text prompt**
As a user,
I want to enter a text prompt and submit it for image generation,
So that I can create AI-generated images based on my descriptions.
**Acceptance Criteria:**
*   The prompt input is prominently displayed and easy to access
*   The input accepts text of reasonable length (up to 1000 characters)
*   A submit button is clearly visible next to the input
*   After submission, the system provides visual feedback that the request is processing
*   The submitted prompt appears in the timeline with a "queued" or "running" status

**US-102: Configuring advanced generation options**
As a user,
I want to customize image generation parameters,
So that I can control the output quality, dimensions, and quantity.
**Acceptance Criteria:**
*   An "Advanced" or similar toggle expands additional options
*   Options include quality, aspect ratio, compression, and image count
*   Each option has a clear label and default value
*   Changes to options are preserved when the form is submitted
*   Invalid inputs show appropriate error messages

**US-103: Monitoring generation progress**
As a user,
I want to see the status of my generation requests,
So that I know when my images will be ready.
**Acceptance Criteria:**
*   The timeline shows placeholder cards for pending generations
*   Each card displays its current status (queued, running, completed, failed)
*   Status updates occur in real-time without page refresh
*   Failed generations show appropriate error messages
*   The UI remains responsive during generation processes

### 7.2 Timeline and results management
**US-201: Viewing the image timeline**
As a user,
I want to scroll through my previously generated images,
So that I can review my creation history.
**Acceptance Criteria:**
*   Timeline displays generated images in a responsive grid layout
*   Grid adapts to 1, 2, or 4 columns based on screen size
*   Images load progressively as the user scrolls
*   Timeline maintains position when new content is added
*   Empty states are handled appropriately (first use, cleared data, etc.)

**US-202: Filtering and sorting timeline results**
As a user,
I want to filter and sort my generated images,
So that I can find specific images or organize them by criteria.
**Acceptance Criteria:**
*   Filter controls are accessible and clearly labeled
*   Status filters (queued, running, completed, failed) work independently or in combination
*   Date range filtering functions correctly
*   Aspect ratio filtering shows only matching images
*   Sort order toggles between newest and oldest
*   Filters apply without full page refresh
*   Current filter state is visually indicated

**US-203: Viewing image details**
As a user,
I want to see detailed information about a specific image generation,
So that I can understand its parameters and see all related images.
**Acceptance Criteria:**
*   Clicking an image in the timeline opens a detailed view
*   Details view shows all images from the same prompt
*   Metadata (jobId, creation time, status, etc.) is clearly displayed
*   Navigation between timeline and details is intuitive
*   Details view is accessible via direct URL (`/prompt/[jobId]`)

### 7.3 Image management and actions
**US-301: Downloading generated images**
As a user,
I want to download my generated images,
So that I can use them outside the application.
**Acceptance Criteria:**
*   Download option is available for each image
*   Images download in WEBP format
*   Filename follows the pattern: `imaginai_{jobId}_{index}.webp`
*   Download works from both timeline and details view
*   Download action provides visual feedback

**US-302: Re-running previous prompts**
As a user,
I want to re-use a previous prompt configuration,
So that I can generate variations without retyping.
**Acceptance Criteria:**
*   "Re-run" option is available in the details view
*   Clicking re-run populates the input form with the exact prompt and options
*   The form is ready for immediate submission
*   New submissions are tracked separately from the original
*   UI clearly indicates this is a new generation based on previous settings

**US-303: Managing local image storage**
As a user,
I want to export or clear my stored images,
So that I can back up my work or free up local storage.
**Acceptance Criteria:**
*   Settings provides options to export data
*   Export creates a ZIP file with images and metadata
*   Clear data option shows a confirmation dialog
*   Clearing data properly removes items from IndexedDB
*   UI updates immediately to reflect changes

### 7.4 Settings and configuration
**US-401: Managing OpenAI API key**
As a user,
I want to securely store my OpenAI API key,
So that I don't need to enter it for each session.
**Acceptance Criteria:**
*   Settings dialog has a masked input field for the API key
*   Key is stored securely in localStorage
*   Clear option removes the saved key
*   Invalid key attempts show appropriate error messages
*   First use prompts for API key setup

**US-402: Configuring default generation options**
As a user,
I want to set default generation parameters,
So that I don't need to adjust them for each prompt.
**Acceptance Criteria:**
*   Settings includes controls for default quality, aspect ratio, and other parameters
*   Changes to defaults are immediately saved
*   New prompt forms use the configured defaults
*   Reset option restores original defaults
*   UI indicates when custom defaults are active

**US-403: Customizing application appearance**
As a user,
I want to toggle between light and dark themes,
So that I can optimize the UI for my viewing preferences.
**Acceptance Criteria:**
*   Theme toggle is available in settings
*   Options include light, dark, and system default
*   Theme changes apply immediately without refresh
*   Selected theme persists between sessions
*   All UI components properly support both themes

### 7.5 Error handling and edge cases
**US-501: Handling API errors**
As a user,
I want to receive clear error messages when API issues occur,
So that I understand why my generation failed and how to resolve it.
**Acceptance Criteria:**
*   Rate limit errors show specific messaging with retry guidance
*   Authentication errors prompt for API key verification
*   Network errors suggest connectivity troubleshooting
*   Timeout errors offer retry options
*   Partial successes (some images generated) are properly handled

**US-502: Managing data storage limitations**
As a user,
I want to be alerted when approaching storage limits,
So that I can manage my data before errors occur.
**Acceptance Criteria:**
*   Warning appears when storage usage exceeds 80% of typical browser limits
*   Clear guidance on managing storage is provided
*   Export options are emphasized when storage is limited
*   Errors during storage operations provide specific remediation steps
*   The application gracefully handles storage-full conditions

## 8. Technical requirements

### 8.1 API integration
*   Integration with OpenAI Images API using model "gpt-image-1"
*   Support for parameter mapping:
    *   Aspect ratio to API size parameter
    *   Quality levels to API quality settings and client compression
*   Response format handling for both explicit "b64_json" and default base64 payloads
*   Proper error handling for API rate limits, timeouts, and authentication issues
*   Background job system with concurrency control and retry logic

### 8.2 Client-side storage
*   IndexedDB implementation for storing:
    *   Prompt job metadata
    *   Image binary data (as Blobs)
*   LocalStorage implementation for:
    *   User API key
    *   Application preferences
    *   UI state persistence
*   Export functionality for data backup
*   Storage usage monitoring and cleanup tools

### 8.3 Image processing
*   Client-side transcoding from base64 to WEBP format
*   Compression control based on quality settings
*   Thumbnail generation for timeline view
*   Web Worker offloading for processing-intensive tasks
*   Canvas/OffscreenCanvas usage for image manipulation

### 8.4 Performance optimization
*   Virtualized rendering for timeline grid
*   Lazy image loading with intersection observer
*   Efficient pagination over local dataset
*   Thumbnail caching for improved scrolling performance
*   Optimized re-rendering patterns to minimize layout shifts

### 8.5 Security and privacy
*   Secure storage of API key in localStorage (no server transmission)
*   Clear data option for complete privacy control
*   No external analytics or tracking
*   Minimal logging, limited to local debugging
*   Client-side moderation for basic content filtering

## 9. Design and user interface

### 9.1 Core UI components
The application will use a cohesive set of UI components from shadcn/ui with Tailwind styling:

*   **Navbar**
    *   Fixed position at top of viewport
    *   Contains logo, search input, and settings button
    *   Consistent across all views
*   **Prompt Input**
    *   Positioned at bottom (desktop) or floating (mobile)
    *   Expandable advanced options panel
    *   Clear submit button with loading state
*   **Timeline Grid**
    *   Responsive layout (1/2/4 columns)
    *   Equal square containers with letterboxed images
    *   Status indicators and minimal metadata
    *   Infinite scroll implementation
*   **Details View**
    *   Full image carousel/grid
    *   Complete metadata display
    *   Action buttons prominently positioned
    *   Easy navigation back to timeline
*   **Settings Panel**
    *   Modal/sheet design
    *   Organized sections for different settings groups
    *   Clear save/cancel actions
    *   Secure input for API key

### 9.2 Responsive design
The UI will adapt across device sizes:

*   **Mobile (≤sm)**: Single column grid, compact controls, bottom navigation
*   **Tablet (md)**: Two column grid, expanded controls, side navigation
*   **Desktop (lg+)**: Four column grid, full controls, top navigation

Key responsive considerations:

*   Maintain tap/click targets at appropriate sizes
*   Adjust information density based on screen size
*   Ensure critical actions are always accessible
*   Optimize image viewing experience for each form factor

### 9.3 Theme support
The application will support light and dark themes:

*   Tailwind-based theming system
*   CSS variables for consistent color application
*   System preference detection with manual override
*   No flashing during theme transitions
*   Consistent contrast ratios for accessibility

### 9.4 Accessibility considerations
Design will prioritize accessibility:

*   Keyboard navigation support throughout
*   Screen reader compatibility
*   Sufficient color contrast
*   Focus indicators for interactive elements
*   Status announcements for dynamic content
*   Alternative text for images based on prompts
*   Scalable text and responsive layouts

## 10. Acceptance criteria
The following criteria will be used to validate the completed application:

*   **Prompt submission and image generation**
    *   Submitting a prompt with `n=4` creates 4 placeholders
    *   Images update in place as they complete
    *   Timeline scroll position remains intact during updates
    *   All form validation works as specified
    *   Error states are properly handled and displayed
*   **Responsive grid layout**
    *   Grid renders 1 column on mobile screens
    *   Grid renders 2 columns on tablet screens
    *   Grid renders 4 columns on desktop screens
    *   Images maintain aspect ratio without stretching
    *   Letterboxing is visible where needed for non-square images
*   **Filtering and sorting functionality**
    *   Filtering by `status=completed` shows only completed items
    *   Filtering by `aspect_ratio` shows only matching items
    *   Changing order flips sequence without reloading images
    *   Multiple filters can be applied simultaneously
    *   Clear filters restores full timeline view
*   **Details view functionality**
    *   Details view shows all images from the prompt
    *   All metadata is accurately displayed
    *   Re-run function correctly populates the form
    *   Navigation between timeline and details works bidirectionally
    *   Deep linking to specific prompts functions properly
*   **Download and storage functionality**
    *   Clicking an image downloads a `.webp` file
    *   Filename follows the specified pattern
    *   Downloaded files open correctly locally
    *   IndexedDB stores and retrieves images properly
    *   localStorage persists settings between sessions
*   **Settings and configuration**
    *   API key persists between reloads
    *   Clearing data removes keys and images from storage
    *   Default settings are applied to new prompts
    *   Theme toggling works correctly
    *   All settings persist as specified
*   **Performance and usability**
    *   Infinite scrolling appends additional pages seamlessly
    *   No duplicate items appear during pagination
    *   UI remains responsive during image generation
    *   Image processing doesn't block the main thread
    *   Storage usage remains efficient
*   **Error handling and recovery**
    *   API errors are clearly communicated
    *   Failed generations show appropriate messaging
    *   Retry mechanisms function as designed
    *   Storage limitations are properly detected and communicated
    *   The application recovers gracefully from error states

## 11. Security and privacy

### 11.1 Data storage and transmission
*   API key stored only in localStorage, never transmitted except to OpenAI
*   No server-side storage of user data or prompts
*   All image data remains in the user's browser via IndexedDB
*   Export functionality for user-controlled backups
*   Complete data clearing option in settings

### 11.2 Content moderation
*   Basic client-side keyword filtering when moderation setting is active
*   User confirmation for potentially sensitive prompts
*   Clear disclaimers about usage limitations and policies
*   No logging of user prompts beyond local debugging

### 11.3 Browser security
*   Modern security headers in Next.js configuration
*   No unnecessary third-party dependencies
*   Regular updates to dependencies for security patches
*   Proper Content Security Policy implementation
*   Secure local storage practices

## 12. Notes and constraints

### 12.1 API compatibility
*   OpenAI parameters may vary across versions:
    *   Client should attempt "b64_json" response format but handle default base64 gracefully
    *   Quality mapping should adapt to available API options
    *   Future model updates should be accommodated via the editable model field

### 12.2 Browser compatibility
*   Target modern evergreen browsers (Chrome, Firefox, Safari, Edge)
*   Progressive enhancement for advanced features
*   Graceful degradation for older browsers
*   IndexedDB and localStorage must be available and accessible

### 12.3 Performance considerations
*   Monitor IndexedDB usage to avoid storage limits
*   Implement efficient pagination to handle large image collections
*   Optimize image processing for client-side performance
*   Virtualize large collections to maintain smooth scrolling

### 12.4 Future expansion
*   The application is designed as client-only but could be extended with:
    *   Optional server-side processing for larger workloads
    *   User accounts for cross-device synchronization
    *   Additional AI model integrations
    *   Enhanced collaboration features