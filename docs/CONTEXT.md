# CONTEXT.md

## 1. Mục tiêu tệp
Tệp `CONTEXT.md` này cung cấp hướng dẫn triển khai chi tiết cho **AI Agent lập kế hoạch du lịch cá nhân hóa** (sau đây gọi tắt: _Travel Planner Agent_). Nội dung bao gồm: mô tả chức năng, techstack đề xuất, kiến trúc hệ thống, cây thư mục chuẩn, lộ trình triển khai theo giai đoạn, các mẫu API/DB, chiến lược tích hợp LLM/Agent, vận hành & bảo mật. Tài liệu được viết để dễ gửi cho AI (prompt-engineering), đội dev và đội triển khai vận hành.

---

# 2. Tổng quan hệ thống (System Overview)
Hệ thống là một nền tảng web + mobile cho khách hàng tạo, tối ưu và đặt chuyến du lịch cá nhân hóa, tích hợp nhiều nguồn dữ liệu (vé máy bay, khách sạn, địa điểm, ăn uống). Core: **Frontend (FE)**, **Backend (BE)**, **Database (DB)**, **AI Agent / LLM layer**, **Integrations (third-party APIs)**.

Nguyên tắc thiết kế: modular, API-first, event-driven cho booking orchestration, an toàn (OAuth2/JWT), mở rộng (microservices nếu cần), dễ quan sát (observability).

---

# 3. Tech stack đề xuất
- **Frontend (web + mobile)**
  - Web: React (TypeScript) + Ant Design / MUI
  - Mobile (tùy chọn): React Native (Expo) hoặc Flutter
  - State management: Redux Toolkit (RTK Query) hoặc React Query
  - Map/Geolocation: Mapbox hoặc Google Maps SDK
  - I18n: i18next

- **Backend**
  - Node.js (TypeScript) — Fastify / NestJS (khuyến nghị NestJS nếu system lớn) hoặc Python (FastAPI) nếu team Python
  - Authentication: OAuth2 (Auth0/Okta/Cognito) + JWT
  - API style: REST + GraphQL (tùy use-case; GraphQL cho client-flex)
  - Worker queue: Redis + BullMQ / RabbitMQ
  - Orchestration: Temporal hoặc custom saga pattern

- **Database**
  - Primary: PostgreSQL (relational for bookings, transactions)
  - Secondary / search: Elasticsearch (search & ranking)
  - Caching: Redis
  - Object storage: S3-compatible (AWS S3, DigitalOcean Spaces) for PDFs, images

- **AI & LLM**
  - Hosted LLMs: OpenAI / Anthropic / Azure OpenAI (tuỳ chính sách)
  - Local models: Llama 2 / Mistral cho tính riêng tư (tùy hạ tầng)
  - Embeddings: OpenAI embeddings or open-source (sentence-transformers)
  - Vector DB: Pinecone / Milvus / Weaviate
  - Prompt orchestration: LangChain / LlamaIndex (chỉ làm orchestration, không gắn chặt vendor)

- **Integrations**
  - Flight APIs: Amadeus, Skyscanner (APIs/partners)
  - Hotels: Booking.com, Expedia, Agoda (APIs/affiliate)
  - Places/Maps: Google Places/Maps, Here Maps
  - Reviews: TripAdvisor
  - Payments: Stripe (global), VNPay/Bank integration (VN)

- **Infra & DevOps**
  - Container: Docker
  - Orchestration: Kubernetes (EKS/GKE/AKS) hoặc ECS
  - CI/CD: GitHub Actions / GitLab CI
  - Monitoring: Prometheus + Grafana
  - Logging: ELK stack (Elasticsearch, Logstash, Kibana) hoặc Datadog

- **Security & Compliance**
  - Secrets: HashiCorp Vault / AWS Secrets Manager
  - WAF: Cloudflare / AWS WAF
  - Data protection: encryption-at-rest & in-transit, GDPR/VN data rules

---

# 4. Chức năng chi tiết (Feature catalogue)
Phần này chia theo vai trò: Client (khách), Admin, Core AI Agent, Service Connectors.

## 4.1 Client (User-facing)
- Authentication: register / login / logout, social login (Google, Facebook), OAuth2 flows, password reset.
- User Profile: preferences (budget range, travel style, alergies, transport preferences), payment methods, travel history.
- Create Trip: form / chat / voice -> collect: destination, dates, #people, budget, preferences.
- Itinerary Editor: drag & drop points trên bản đồ, ngày/giờ, thời gian dự kiến tại điểm.
- Search & Recommendations: flights, hotels, activities.
- Booking Flow: multi-step booking (select -> hold -> confirm -> payment -> issue tickets/booking ref).
- Notifications: email + push + in-app regarding price changes, confirmations, cancellations.
- History & Documents: show past trips, invoices, download PDF itinerary.
- Chatbot Interface: natural conversation to create/adjust trip.

## 4.2 Admin
- User management: CRUD user, impersonation, support tools.
- Provider management: onboard travel suppliers, manage API keys, rate limits.
- Dashboard: bookings, revenue, KPIs, logs.
- Audit & logs: action logs, booking transactions.

## 4.3 Core AI Agent (Capabilities)
- NLU: intent classification & entity extraction (destination, dates, pax, budget, activities)
- Dialogue management: slot-filling, clarification prompts, multi-turn.
- Planner: generate itinerary templates (rule-based + ML ranking), produce day-by-day schedules.
- Route optimizer: solve TSP-like ordering with travel-time heuristics, integrate map travel-time estimates.
- Cost estimator: aggregate prices from providers + buffer + taxes.
- Booking orchestrator: execute bookings across providers with compensation logic (saga), webhooks and retries.
- Monitor: watch for price changes, cancellations; alert users.
- Personalization: ranking content by user profile using embeddings & user signals.

## 4.4 Service connectors
- Wrappers for third-party APIs with unified interface: searchFlights(), getFlightDetails(), searchHotels(), createBooking(), cancelBooking(), getPlaceDetails().
- Normalization layer: map provider-specific fields -> internal DTOs.
- Rate-limiting & caching layer per provider.

---

# 5. Lộ trình triển khai (Roadmap) — giai đoạn & milestones
Lộ trình chia nhỏ thành giai đoạn (MVP -> Production -> Agent Full)

## Phase 0 — Planning & Infra (1-2 tuần)
- Thiết lập repo, CI pipeline, infra cơ bản (dev DB, staging), tạo project skeleton
- Quy trình coding & code review, style guide, access control
- Thiết kế ERD & API contract (OpenAPI)

**Deliverables**: repo template, infra dev/staging, API spec

## Phase 1 — Core BE + DB + Basic FE (3-6 tuần)
- BE: user auth (OAuth2 + JWT), user profile, trip model, basic endpoints CRUD
- DB schemas, migrations
- FE minimal: trang đăng nhập, form tạo trip, list trips, view itinerary
- Integrations: mock connectors cho flight/hotel (mock data)
- Worker queue + background jobs skeleton

**Deliverables**: working CRUD, basic UI, mock integrations

## Phase 2 — Booking Flow & Provider Integrations (4-8 tuần)
- Implement connectors cho 1 flight provider + 1 hotel provider (real APIs)
- Booking orchestration: hold -> confirm -> payment stub
- Payment integration (Stripe test)
- Itinerary editor + map view
- Unit & integration tests cho flow chính

**Deliverables**: end-to-end booking (test mode), map-based UI

## Phase 3 — AI Agent (NLU + Planner) (4-8 tuần)
- Embed LLM: NLU pipeline (intent/entity) + slot-filling flow
- Planner: rule-based templates + ML ranking model (initial heuristics)
- Dialogue UI: chat interface integrated with backend
- Vector DB & embeddings for personalization

**Deliverables**: conversational trip creation, auto-generated itinerary, personalization

## Phase 4 — Resilience, Ops & Production (2-4 tuần)
- Monitoring, alerting, logging, security review
- Performance tuning, scaling, DB backups
- Legal & privacy checklist
- Final acceptance tests

**Deliverables**: production-ready deployment, runbooks

## Phase 5 — Advanced Features & Optimization (ongoing)
- Price-watch agents, dynamic rebooking, multi-language support, advanced ranking ML
- Mobile apps, loyalty integration, partner dashboards

---

# 6. Cấu trúc source & cây thư mục chuẩn (Monorepo sample)
Dưới đây là cấu trúc monorepo gợi ý — có thể tách services khi cần.

```
travel-agent/                     # root monorepo
├── README.md
├── apps/
│   ├── web/                      # Frontend React
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/          # API clients
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   └── i18n/
│   │   └── package.json
│   └── mobile/                    # optional React Native
├── services/
│   ├── api-gateway/               # routing, auth, rate-limiting
│   ├── auth-service/              # OAuth2, JWT
│   ├── user-service/              # profile, preferences
│   ├── trip-service/              # trip creation, itinerary, bookings (core)
│   ├── booking-orchestrator/      # worker, saga
│   ├── connector-service/         # third-party API adapters
│   ├── ai-service/                # NLU, planner, embeddings
│   └── admin-service/             # admin dashboard APIs
├── infra/
│   ├── k8s/                       # k8s manifests
│   ├── terraform/                 # infra as code
│   └── scripts/
├── libs/                          # shared types, utils
│   ├── common-types/
│   └── sdk/                       # internal SDK for connectors
├── docs/
│   └── CONTEXT.md
├── tests/
└── .github/workflows/
```

---

# 7. Mô tả database model (tóm tắt)
> Lưu ý: đây là sơ đồ high-level; chi tiết chuẩn hoá khi design ERD.

- **users**: id, email, password_hash, social_ids, prefs(json), budget_range, created_at
- **trips**: id, user_id, name, status(draft/confirmed/cancelled), start_date, end_date, created_at
- **itineraries**: id, trip_id, day_index, sequence(int), place_id, start_time, end_time, notes
- **bookings**: id, trip_id, booking_type(flight/hotel/activity), provider, provider_ref, status, price, created_at
- **providers**: id, name, type, config(json)
- **prices_cache**: provider, query_hash, payload(json), ttl
- **embeddings_index**: doc_id, vector, metadata

---

# 8. API Contracts (một số endpoint mẫu)
- `POST /api/v1/auth/register` {email, password}
- `POST /api/v1/auth/login` {email, password} -> {access_token, refresh_token}
- `GET /api/v1/trips` -> list trips
- `POST /api/v1/trips` {name, start_date, end_date, preferences} -> trip
- `POST /api/v1/trips/:id/generate` {via: "chat"|"template"} -> start agent generation job
- `POST /api/v1/bookings` {trip_id, bookings: []} -> starts booking orchestrator
- Webhook: `POST /api/v1/webhooks/provider` -> provider events

(OpenAPI spec cần tạo sớm để FE dev song hành)

---

# 9. Ai Agent — thiết kế chi tiết
## 9.1 NLU pipeline
- Tokenization & language detection (VN/EN)
- Intent classification model (fine-tune hoặc hosted LLM prompt)
- Entity extraction (dates, location, budget, pax) -> normalized slots
- Slot filling + confirmation dialog

## 9.2 Planner & Ranking
- Rule-based templates (short trip, family, honeymoon, business)
- Feature signals: user prefs, review scores, distance, cost
- Ranking model: train/heuristic, sử dụng embeddings cho personalization

## 9.3 Booking Orchestrator
- Pattern: Saga/Compensating transactions
- Steps: reserve/hold -> charge payment -> confirm booking -> send confirmation
- Failure handling: retries, rollback (cancel holds), alert support

## 9.4 Prompt engineering & chains
- Use short structured prompts for intent/entity extraction
- Maintain a context window: user profile + trip draft + last N messages
- Store conversation memory embeddings for personalization

---

# 10. Tích hợp provider & connector patterns
- Thiết kế adapter interface:
  - `searchFlights(query)`, `getFlightQuote(id)`, `createFlightBooking(payload)`
- Thực hiện normalizing layer để mappings: price_currency, taxes, refundable, vendor_code
- Caching: cache search results TTL 5-15 phút (provider dependent)
- Rate limiting: token-bucket per provider; circuit-breaker khi provider fail

---

# 11. Testing & QA
- Unit tests cho business logic
- Contract tests cho connectors
- Integration tests (mock providers)
- End-to-end tests cho booking flow (sandbox providers)
- Load tests: simulate search traffic peak

---

# 12. Observability & SLOs
- Metrics: request latency, bookings/sec, success rate, error rate
- Dashboards: Grafana boards cho tiap service
- Alerts: pagerduty/email for critical failures (booking failures)
- SLO examples: booking success rate >= 99% (non-network windows), response p95 < 500ms for search cache hits

---

# 13. Bảo mật & Quyền riêng tư
- Authentication: OAuth2, rotating refresh tokens
- RBAC cho admin
- Encrypt sensitive data in DB (payment details), do not store card numbers (use PCI-compliant tokenization)
- Data retention policy & user data export/delete

---

# 14. CI/CD & Release
- Pipeline: build/tests -> staging deploy -> smoke tests -> production deploy
- Feature flags để rollout gradual
- DB migrations versioned (Flyway / Liquibase)

---

# 15. Deployment checklist (production-ready)
- HTTPS everywhere (TLS)
- WAF and rate limiting
- Backups & automated restore tests
- DB read replicas & migrations plan
- Secret rotation

---

# 16. Operational Runbooks (tóm tắt)
- Booking failure: steps để xác định provider, perform rollback, notify customer, open support ticket
- Price-watch alert triggered: how to throttle notifications to users

---

# 17. Kịch bản UX / Flows quan trọng (tóm tắt)
1. Chat -> Agent hỏi: "Bạn đi đâu, khi nào, mấy người, ngân sách?" -> tạo trip draft -> agent gợi ý 3 option -> user chọn 1 -> agent build itinerary -> user confirm -> booking orchestrator chạy.
2. Map edit -> user kéo điểm -> system re-calc time, update ETA và giá.
3. Price-watch -> giá giảm 10% so với giá ban đầu -> gửi notification -> offer rebook.

---

# 18. Cấu trúc để gửi cho AI / Prompt template
- Luôn gửi: user profile (anon ID, prefs), trip draft (slots), recent messages (last 6), available provider results snapshot (top N)
- Tránh gửi PII (số thẻ) vào prompt. Thông tin nhạy cảm qua tokenized references only.

---

# 19. Appendix: mẫu metadata & enums
- TripStatus = {draft, pending_booking, confirmed, cancelled}
- BookingStatus = {held, confirmed, failed, cancelled}
- PreferenceKeys = {travel_style, budget_range, preferred_airlines, hotel_class}

---

# 20. Next steps đề xuất (immediate)
1. Tạo repo skeleton theo cây thư mục trên.
2. Viết OpenAPI spec cho core endpoints (auth, trips, bookings).
3. Implement auth-service + user-service minimal.
4. Build FE minimal pages (login, create trip form, trip list).
5. Tích hợp mock provider và viết contract tests.


---

*File generated để phục vụ phát triển và deploy. Nếu bạn cần, em có thể:*
- Xuất thành `README.md` ngắn gọn hơn;
- Sinh OpenAPI skeleton tự động từ models;
- Tạo script Terraform & k8s manifest cơ bản.

