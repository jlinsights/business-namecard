# Business Namecard - Digital Business Card Application

## Project Overview

This is a modern, interactive digital business card application built with React 19 and Vite. It allows users to create, customize, and share professional digital business cards with dynamic links, AI-generated bios, and analytics tracking.

**AI Studio URL**: https://ai.studio/apps/drive/1OvsehdF6EptvZ4YGDpSs4A1EflIlJsFR

## Tech Stack

### Core Technologies
- **React 19** (18.3.1) - UI framework with latest features
- **TypeScript** (5.8.2) - Type-safe development
- **Vite 6** - Build tool and dev server
- **Tailwind CSS v3** - Utility-first styling (local setup)

### Key Dependencies
- **@google/genai** (1.39.0) - Google Gemini AI integration for bio generation
- **lucide-react** (0.344.0) - Icon library
- **@hello-pangea/dnd** (16.6.0) - Drag-and-drop functionality for link reordering

## Architecture

### Project Structure
```
/business-namecard/
├── src/
│   ├── components/          # React components
│   │   ├── profile/        # Profile-related components
│   │   │   └── ProfileSection.tsx
│   │   ├── links/          # Link management components
│   │   │   ├── LinkList.tsx
│   │   │   └── LinkEditor.tsx
│   │   ├── Header.tsx
│   │   ├── Icons.tsx
│   │   ├── QRCodeModal.tsx
│   │   ├── AvatarSelectionModal.tsx
│   │   ├── AnalyticsModal.tsx
│   │   └── AndroidSaveGuideModal.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useProfile.ts   # Profile state management
│   │   ├── useLinks.ts     # Links state management
│   │   └── useAppUI.ts     # UI state management
│   ├── services/
│   │   └── geminiService.ts # AI service integration
│   └── App.tsx             # Main application component
├── types.ts                # TypeScript type definitions
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Component Architecture

The app follows a **hooks-based state management pattern** with clear separation of concerns:

1. **useAppUI** - Manages UI state (modals, edit mode, preview mode, copy state)
2. **useProfile** - Manages user profile data and AI bio generation
3. **useLinks** - Manages social/business links, click tracking, and reordering

Components are decomposed into logical sections:
- **Header**: Cover image, theme color, action buttons
- **ProfileSection**: Avatar, name, bio, profile editing
- **LinkList**: Display and manage links with drag-and-drop
- **LinkEditor**: Add new links with platform selection

## Key Features

### 1. Profile Management
- Customizable avatars
- Editable name, role, company, bio
- Custom theme colors
- Contact information (email, phone, location)
- Privacy settings for sensitive data masking

### 2. AI-Powered Bio Generation
- Integration with Google Gemini AI
- Tone selection (professional, casual, creative)
- Generates personalized bios based on user profile
- Safety settings configured to handle restricted content gracefully

### 3. Dynamic Link Management
- Add multiple link types: social, website, contact, video, commerce
- Drag-and-drop reordering with @hello-pangea/dnd
- Click tracking with timestamps
- Platform-specific icons and validation
- Link analytics dashboard

### 4. Sharing & Export
- QR code generation for easy sharing
- Save as contact (vCard format)
- Android-specific save guide modal
- Copy link functionality

### 5. Preview Mode
- Live preview of how the card appears to others
- Toggle between edit and preview modes
- Preview overlay with exit button

## Data Models

### UserProfile
```typescript
interface UserProfile {
  id: string;
  type: 'business' | 'personal' | 'business_card';
  organizationName?: string;
  isVerified?: boolean;
  name: string;
  role: string;
  company: string;
  bio: string;
  avatarUrl: string;
  email: string;
  phone: string;
  location: string;
  websiteUrl?: string;
  themeColor: string;
  links: LinkItem[];
  privacySettings: PrivacySettings;
}
```

### LinkItem
```typescript
interface LinkItem {
  id: string;
  title: string;
  url: string;
  type: 'social' | 'website' | 'contact' | 'video' | 'commerce' | 'locked';
  iconName: string;
  clicks?: number;
  clickTimestamps?: number[];
  price?: string;
  currency?: string;
  description?: string;
  isLocked?: boolean;
}
```

## Development

### Environment Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create `.env.local` with:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`

4. **Build for production**:
   ```bash
   npm run build
   ```

### Environment Variables

The Vite config exposes environment variables:
- `GEMINI_API_KEY` → `process.env.GEMINI_API_KEY` (for AI bio generation)

### Path Aliases

The project uses `@/` as an alias for the root directory:
```typescript
import { useProfile } from '@/src/hooks/useProfile';
```

## State Management Patterns

### Custom Hooks Architecture

The application uses a **hooks-based architecture** for state management, separating concerns into three main hooks:

#### useAppUI Hook
Manages all UI-related state:
- Modal visibility states (QR, avatar, analytics)
- Edit mode and preview mode toggles
- Copy link feedback state
- Share functionality

#### useProfile Hook
Manages profile data and operations:
- Profile data (name, bio, company, etc.)
- Edit profile state (temporary changes before save)
- AI bio generation with Gemini API
- Save contact functionality
- Android-specific UI handling

#### useLinks Hook
Manages links and their interactions:
- Links array state
- Add/delete/reorder operations
- Click tracking and analytics
- Platform selection and validation
- URL validation per platform type

### State Flow

```
App.tsx
├── useAppUI()          → UI state & handlers
├── useProfile()        → Profile data & AI operations
└── useLinks()          → Links data & operations
    ↓
Components receive props (no prop drilling via hooks)
```

## AI Integration (Gemini)

### Service Location
`src/services/geminiService.ts`

### Features
- Bio generation based on profile context
- Tone customization (professional, casual, creative)
- Safety settings configured to handle:
  - Harassment
  - Hate speech
  - Sexually explicit content
  - Dangerous content

### Error Handling
The service gracefully handles:
- API errors → Returns fallback message
- Safety blocks → Returns alternate bio suggestion
- Missing API key → Provides user guidance

### Usage Example
```typescript
const generatedBio = await generateBioWithAI(profile, tone);
```

## Styling Approach

### Tailwind CSS
- **Local Tailwind v3 setup** (not CDN)
- Utility-first styling approach
- Responsive design with mobile-first approach
- Custom theme colors support
- Safe area insets for mobile devices (`pb-safe`)

### Design Patterns
- **Thumb Zone UX**: Primary actions in bottom sticky bar
- **Backdrop blur effects**: Modern glassmorphism
- **Smooth transitions**: Scale animations on interactions
- **Responsive layout**: Max-width container with full mobile support

## Best Practices for Working with This Codebase

### Code Organization
1. **Components**: Keep components focused and single-responsibility
2. **Hooks**: Extract stateful logic into custom hooks
3. **Types**: Define all interfaces in `types.ts`
4. **Services**: External API calls go in `services/` directory

### Development Guidelines

1. **Type Safety**: Always use TypeScript types, avoid `any`
2. **Component Props**: Pass only necessary props, use hooks for state
3. **State Updates**: Use functional updates for setState when depending on previous state
4. **Event Handlers**: Define handlers close to where they're used or in custom hooks
5. **Validation**: Validate user input, especially URLs and form data

### Testing Considerations
- Links should have proper click tracking
- URL validation should be platform-specific
- AI bio generation should have fallbacks
- Save contact should work across platforms

### Common Tasks

#### Adding a New Link Type
1. Update `LinkItem` type in `types.ts`
2. Add platform definition in `useLinks.ts`
3. Add icon mapping in `Icons.tsx`
4. Add validation logic in `validateCurrentUrl()`

#### Modifying Profile Fields
1. Update `UserProfile` interface in `types.ts`
2. Update profile initialization in `useProfile.ts`
3. Add UI fields in `ProfileSection.tsx`
4. Update save logic if needed

#### Customizing Themes
1. Theme colors stored in `profile.themeColor`
2. Update Header component for theme rendering
3. Supports hex colors or predefined color names

## Recent Refactoring (Latest Commits)

### Commit: 6a36ca0
- Decomposed monolithic App.tsx into smaller components
- Fixed Gemini API safety settings
- Improved error handling for AI bio generation

### Commit: ba56c7b
- Added company field to profile editing
- Enhanced profile data model

### Architectural Changes
- Migrated from single-file component to hooks-based architecture
- Separated concerns: UI state, profile state, links state
- Improved maintainability and testability

## Git Workflow

- **Main branch**: Production-ready code
- **Feature branches**: Use `claude/` prefix for AI-assisted development
- Current branch: `claude/update-claude-md-swaOC`

## Deployment

The app is deployed via AI Studio and accessible at:
https://ai.studio/apps/drive/1OvsehdF6EptvZ4YGDpSs4A1EflIlJsFR

## Browser Compatibility

- Modern browsers with ES2022 support
- Mobile-optimized (iOS and Android)
- PWA-ready structure

## Future Considerations

- Consider adding more AI features (content suggestions)
- Add backend for persistent storage
- Implement user authentication
- Add more analytics features
- Social sharing metadata optimization

---

**Project Name**: TabNode - Digital Business Card
**Version**: 0.0.0
**License**: Private
**Node Version**: Requires Node.js for development
