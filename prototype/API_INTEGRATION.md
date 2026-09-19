# AINA API Integration Guide

## Overview

AINA (Your Cultural Discovery Companion) is a frontend-first cultural discovery application for Vadodara, Gujarat. This document describes the frontend architecture, API integration points, and how to transition from mock services to real backend APIs.

---

## Frontend Architecture

### Layer Structure

```
UI Components (Pages, Components)
↓
Custom Hooks (useChatbot, useAuth, etc.)
↓
Services (chatbotService, userService, mapService, etc.)
↓
API Client / Adapters
↓
Supabase / S3 Backend / S2 Chatbot
```

### Key Principles

1. **Separation of Concerns**: UI components must NOT directly contain large database/API operations
2. **Service Layer**: All data operations flow through service abstractions
3. **Mock-First**: Services currently use mock data that can be replaced with real API calls
4. **Type Safety**: Strong TypeScript typing throughout the application

---

## Supabase Integration

### Environment Variables

Required in `.env` file (local only, never committed):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

### Supabase Client

Location: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Supabase Features Used

- **Authentication**: User registration, login, password reset, session management
- **User Identity**: Storing user metadata (full_name, profile_photo)
- **Row Level Security (RLS)**: All backend operations must respect RLS policies

### Security Guidelines

- ✅ **DO**: Use `VITE_SUPABASE_PUBLISHABLE_KEY` (anon/public key)
- ❌ **DO NOT**: Use service-role key or secret key in frontend
- ❌ **DO NOT**: Hardcode credentials
- ❌ **DO NOT**: Bypass RLS
- ❌ **DO NOT**: Expose credentials in logs or UI

---

## Environment Configuration

### `.env` (Local Development)

This file is git-ignored and contains actual credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-actual-publishable-key
VITE_USE_MOCK=true
VITE_BACKEND_API_URL=
VITE_CHATBOT_API_URL=
```

### `.env.example` (Template)

This file is committed and contains placeholders only:

```bash
# AINA frontend env (Vite). Never put secret service-role keys here.

VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# true = use mock services (default if omitted)
VITE_USE_MOCK=true

# Leave empty until S2 / S3 publish their base URLs. Do not invent paths.
VITE_BACKEND_API_URL=
VITE_CHATBOT_API_URL=
```

---

## Mock Service Architecture

### Service Locations

All services are in `src/services/`:

- `auth.service.ts` - Authentication operations (via Supabase)
- `user.service.ts` - User profile, saved places, visited places, itineraries
- `map.service.ts` - Place data and map-related operations
- `food.service.ts` - Food discovery data
- `hiddenGems.service.ts` - Hidden gems discovery data
- `chatbot.service.ts` - Chatbot AI integration
- `admin.service.ts` - Admin operations

### Mock Data

Mock data is currently embedded within services for prototype purposes. Data includes:

- 8 Vadodara heritage places with comprehensive details
- 8 authentic Gujarati food items
- 6 hidden gems of Vadodara
- User profile and travel statistics
- Chatbot mock responses for common queries

### Replacing Mock Services

To replace a mock service with a real API:

1. Update the service to call the real API endpoint
2. Keep the same interface (method signatures, return types)
3. Handle API errors appropriately
4. Update environment variables if needed

Example transition:

```typescript
// Before (Mock)
class UserService {
  getSavedPlaces(): SavedPlace[] {
    return this.savedPlaces // Mock data
  }
}

// After (Real API)
class UserService {
  async getSavedPlaces(): Promise<SavedPlace[]> {
    const response = await fetch(`${API_URL}/saved-places`)
    return response.json()
  }
}
```

---

## S3 Backend Integration Point

### Expected S3 API

The S3 team should provide a REST API that handles:

- Place data (heritage, food, hidden gems)
- User operations (saved places, visited places, itineraries)
- Search and filtering
- Recommendations
- Admin operations

### Integration Location

Update services in `src/services/` to call S3 endpoints when `VITE_BACKEND_API_URL` is configured.

### Example Service Pattern

```typescript
class MapService {
  private apiUrl = import.meta.env.VITE_BACKEND_API_URL

  async getPlaces(): Promise<Place[]> {
    if (this.apiUrl) {
      const response = await fetch(`${this.apiUrl}/places`)
      return response.json()
    } else {
      return this.getMockPlaces() // Fallback to mock
    }
  }
}
```

### Data Models

Frontend data models are defined in `src/types/dashboard.types.ts`:

- `Place` - Heritage places
- `Food` - Food items
- `HiddenGem` - Hidden gems
- `SavedPlace` - User's saved places
- `VisitedPlace` - User's visited places
- `Itinerary` - User itineraries
- `UserProfile` - User profile
- `TravelStats` - Travel statistics
- `Recommendation` - Place recommendations

### Current Implementation

All data operations currently use mock state within services. The UI consumes data through:

- Custom hooks (e.g., `useChatbot`)
- Service method calls
- Type-safe interfaces

---

## S2 Chatbot Integration Point

### Expected S2 API

The S2 team should provide a chatbot API that handles:

- Natural language processing
- Context-aware responses
- Recommendation generation
- Itinerary planning assistance

### Integration Location

`src/services/chatbot.service.ts` and `src/hooks/useChatbot.ts`

### Current Implementation

The chatbot service currently:

- Uses mock responses based on keyword matching
- Supports voice input (browser Speech Recognition API)
- Maintains conversation state
- Provides context from user data (saved places, visited places)

### API Request Structure

```typescript
interface ChatbotRequest {
  message: string
  context?: ChatbotContext
  conversationHistory?: ChatMessage[]
}

interface ChatbotContext {
  currentLocation?: { latitude: number; longitude: number; address: string }
  selectedPlace?: { id: string; name: string; category: string }
  nearbyPlaces?: string[]
  currentItinerary?: { id: string; name: string; places: string[] }
  savedPlaces?: string[]
  visitedPlaces?: string[]
  userPreferences?: {
    interests: string[]
    language: string
    accessibility: string[]
  }
}
```

### Integration Pattern

```typescript
class ChatbotService {
  private apiUrl = import.meta.env.VITE_CHATBOT_API_URL

  async sendMessage(message: string, context?: ChatbotContext): Promise<ChatMessage> {
    if (this.apiUrl) {
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
      })
      const data = await response.json()
      return this.formatResponse(data)
    } else {
      return this.sendToMockApi(message, context)
    }
  }
}
```

---

## Frontend Data Models

### Type Definitions

All types are defined in `src/types/`:

- `auth.types.ts` - Authentication types
- `dashboard.types.ts` - Dashboard and chatbot types
- `admin.types.ts` - Admin panel types
- `api.types.ts` - API client types

### Key Models

```typescript
// Place
interface Place {
  id: string
  name: string
  category: PlaceCategory
  coordinates: [number, number]
  description: string
  rating: number
  image?: string
  history?: string
  historicalSignificance?: string
  architecture?: string
  culturalSignificance?: string
  interestingFacts?: string[]
  historicalImages?: string[]
  address?: string
  estimatedExplorationTime?: string
  bestTime?: string
  openingHours?: string
  thingsToSee?: string[]
  gallery?: string[]
}

// Chat Message
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
  error?: string
}

// User Profile
interface UserProfile {
  fullName: string
  email: string
  profilePhoto?: string
  joinDate: Date
  achievements: Achievement[]
}
```

---

## Team Responsibilities

### S1 (Frontend/UI Team)

- ✅ UI/UX implementation
- ✅ React components and pages
- ✅ Responsive design
- ✅ Authentication flow (Supabase)
- ✅ Mock service architecture
- ✅ Frontend state management
- ✅ TypeScript type definitions
- ✅ Integration layer preparation
- ❌ Backend API implementation
- ❌ Chatbot AI implementation
- ❌ Database schema

### S2 (AI Chatbot Team)

- ⏳ Chatbot AI model
- ⏳ Natural language processing
- ⏳ Context-aware response generation
- ⏳ Recommendation engine
- ⏳ API endpoint specification
- ⏳ API contract documentation

### S3 (Backend/API Team)

- ⏳ Backend API implementation
- ⏳ Database schema and migrations
- ⏳ REST/GraphQL API endpoints
- ⏳ Data models and validation
- ⏳ Authentication middleware
- ⏳ API contract documentation

---

## API Contract Status

### Pending Contracts

The following API contracts are **NOT YET DEFINED** and must be provided by respective teams:

#### S2 Chatbot API (Pending)

- Base URL: `VITE_CHATBOT_API_URL`
- Endpoint: `/chat` (or as specified by S2)
- Request format: To be defined by S2
- Response format: To be defined by S2
- Authentication: To be defined by S2

#### S3 Backend API (Pending)

- Base URL: `VITE_BACKEND_API_URL`
- Endpoints: To be defined by S3
- Request/Response formats: To be defined by S3
- Authentication: To be defined by S3
- Rate limiting: To be defined by S3

### Current Status

**Frontend is fully functional with mock services.** The UI will not require major rewrites when real APIs are provided, only service layer updates.

---

## Google Maps Integration

### Dynamic Destination URLs

All places use dynamically generated Google Maps destination URLs based on coordinates:

```typescript
const getGoogleMapsUrl = (place: Place): string => {
  const [lat, lng] = place.coordinates
  const query = encodeURIComponent(place.name || `${lat},${lng}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}
```

### Usage

- Place detail pages
- Navigation buttons
- Itinerary start navigation

❌ **DO NOT** use generic Google Maps homepage links.

---

## Performance Considerations

### Code Splitting

The build shows a warning about bundle size (>500KB). Future improvements:

- Use dynamic imports for route-based code splitting
- Lazy load admin components
- Optimize image loading

### Current Bundle

- CSS: ~78 KB (gzipped: ~16 KB)
- JS: ~735 KB (gzipped: ~205 KB)

---

## Security Checklist

- ✅ No Supabase secret/service-role key in frontend
- ✅ No API secrets hardcoded
- ✅ No credentials exposed in UI
- ✅ No credentials printed in logs
- ✅ `.env` is git-ignored
- ✅ `.env.example` contains placeholders only
- ✅ No backend logic accidentally implemented in frontend
- ✅ Environment variables read via `import.meta.env`

---

## Development Workflow

### Running the Project

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

---

## Future Integration Steps

When S2 and S3 provide their APIs:

1. **Update Environment Variables**: Add real API URLs to `.env`
2. **Update Services**: Replace mock implementations with API calls
3. **Test Integration**: Verify data flow and error handling
4. **Update Documentation**: Add API endpoint details to this file
5. **Remove Mock Data**: Clean up mock data when no longer needed

---

## Conclusion

The AINA frontend is production-ready as a prototype with a clean architecture that supports easy integration with future backend services. The service layer abstraction ensures minimal UI changes when real APIs become available.

For questions about API integration, contact the S1 (Frontend/UI Team).
