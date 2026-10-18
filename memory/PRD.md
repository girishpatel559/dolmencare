# Dolmen Care PRD

## Original problem statement
Build a Dolmen Care website for mobile repair pickup and delivery with repair services, brands, process, reviews, FAQ, contact details, an older phone selling option, and an Android app download option.

## Architecture decisions
- React single-page landing experience with responsive CSS and modal customer flows.
- FastAPI `/api/leads` endpoint stores quote and old-phone valuation submissions in MongoDB.
- WhatsApp booking uses a prefilled message to the supplied Dolmen Care number.
- Frontend uses the protected `REACT_APP_BACKEND_URL`; backend uses the existing MongoDB environment configuration.

## Implemented
- Clean light service-brand design with navy, blue, coral, and generous responsive layouts.
- Hero, trust strip, ten repair services with starting prices, four-step process, technician feature section, brands, reviews, FAQ, contact/footer.
- Book-a-pickup buttons open WhatsApp with a prefilled booking message.
- Instant quote modal captures brand, issue, and phone number with success/error handling.
- Sell-your-old-phone valuation modal captures model, condition, and phone number with success/error handling.
- Android app download CTA is wired to the in-page app-download target until the external APK URL is provided.
- Validation, lint, production build, API checks, and mobile interaction checks completed.

## Prioritized backlog
- P0: Connect the real Android APK URL when supplied.
- P1: Add authenticated repair-status lookup and live status updates.
- P1: Add service-area selection and pickup scheduling to the WhatsApp/lead flow.
- P2: Add a browsable used-phone inventory and individual product pages.