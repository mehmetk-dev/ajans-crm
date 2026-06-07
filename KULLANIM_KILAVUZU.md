# FOG İstanbul CRM Teknik Kullanım ve Kod Kılavuzu

Bu doküman son kullanıcıya yönelik ekran anlatımı değil, projenin içeride nasıl çalıştığını anlatan teknik kılavuzdur. Amaç şudur: Bu CRM'de hangi panel hangi kod parçalarını kullanıyor, veri nereden geliyor, hangi API hangi service'e gidiyor, şirket hizmetleri panel görünürlüğünü nasıl etkiliyor, geliştirici yeni bir modül eklerken nerelere dokunmalı.

## 1. Proje Yapısı

Proje monorepo mantığında iki ana uygulamadan oluşur:

```text
ajans-crm/
├── backend/   Spring Boot uygulaması
├── frontend/  React + Vite uygulaması
└── docker-compose.yml
```

Backend:

```text
backend/src/main/java/com/fogistanbul/crm/
├── config/       Security, WebSocket, startup config
├── controller/   REST ve WebSocket endpointleri
├── dto/          Request/Response objeleri
├── entity/       JPA entity modelleri
├── enums/        Rol, durum, kategori enumları
├── repository/   Spring Data JPA repositoryleri
├── security/     JWT, auth filter, rate limit
└── service/      İş kuralları
```

Frontend:

```text
frontend/src/
├── api/          Axios API fonksiyonları
├── components/   Ortak componentler
├── features/     Merkezi feature/hizmet katalogları
├── hooks/        React Query ve yardımcı hooklar
├── layouts/      Admin, Staff, Client layoutları
├── pages/        Route sayfaları
├── store/        Auth ve tema contextleri
└── App.tsx       Ana route ağacı
```

## 2. Çalışma Ortamı

Docker Compose içinde üç servis vardır:

| Servis | Container | Port |
|---|---|---|
| PostgreSQL | `ajans-crm-db` | `5432` |
| Backend | `ajans-crm-backend` | `8080` |
| Frontend | `ajans-crm-frontend` | `5173` |

Frontend tarayıcıdan `http://localhost:5173` ile açılır. Frontend API isteklerini `/api` base path üzerinden backend'e proxy eder.

Backend API root:

```text
http://localhost:8080/api
```

## 3. Kimlik Doğrulama Akışı

Auth sistemi JWT + HttpOnly cookie üzerinden çalışır.

Frontend tarafı:

- Ana axios instance: `frontend/src/api/client.ts`
- Auth API: `frontend/src/api/auth.ts`
- Auth state: `frontend/src/store/AuthContext.tsx`

Backend tarafı:

- Controller: `AuthController`
- Service: `AuthService`
- JWT üretimi/doğrulama: `JwtTokenProvider`
- Request filtreleme: `JwtAuthFilter`
- Security kuralları: `SecurityConfig`

### 3.1 Login

Akış:

```text
LoginPage
  -> authApi.csrf()
  -> POST /api/auth/login
  -> AuthController.login()
  -> AuthService.login()
  -> UserProfileRepository.findByEmail()
  -> BCrypt password kontrolü
  -> access_token + refresh_token üretilir
  -> tokenlar HttpOnly cookie olarak yazılır
  -> frontend user bilgisini AuthContext'e alır
```

Login cevabında frontend'e token dönmez; token cookie'dedir. Frontend sadece `UserInfo` alır.

`UserInfo` içinde önemli alanlar:

```text
id
email
fullName
globalRole
membershipRole
avatarUrl
companyId
```

`companyId` sadece müşteri kullanıcısı için kritiktir. Client panelindeki raporlar bu `companyId` ile API çağrısı yapar.

### 3.2 Mevcut Kullanıcıyı Alma

Sayfa yenilendiğinde:

```text
AuthProvider useEffect
  -> GET /api/auth/csrf
  -> GET /api/auth/me
  -> AuthService.getCurrentUser(userId)
  -> user state set edilir
```

JWT `JwtAuthFilter` tarafından cookie'den okunur. Principal olarak `UUID userId` set edilir. Bu yüzden controllerlarda çoğunlukla şu yapı vardır:

```java
UUID userId = (UUID) auth.getPrincipal();
```

### 3.3 Token Refresh

Axios interceptor `401` yakalarsa:

```text
401 response
  -> POST /api/auth/refresh
  -> refresh cookie geçerliyse yeni access_token yazılır
  -> orijinal request tekrar denenir
```

Login ve refresh istekleri interceptor tarafından tekrar refresh döngüsüne sokulmaz.

## 4. Rol ve Yetki Sistemi

Sistemde iki farklı rol mantığı vardır:

### 4.1 Global Role

`user_profiles.global_role` alanında tutulur.

```text
ADMIN
AGENCY_STAFF
COMPANY_USER
```

Bu rol genel panel erişimini belirler.

SecurityConfig içinde temel routing:

```text
/api/admin/**  -> ADMIN
/api/staff/**  -> ADMIN veya AGENCY_STAFF
/api/client/** -> ADMIN veya COMPANY_USER
```

### 4.2 Membership Role

`company_memberships.membership_role` alanında tutulur.

```text
OWNER
EMPLOYEE
AGENCY_STAFF
```

Bu rol kullanıcının belirli bir şirket içindeki konumunu anlatır.

Örnek:

- `suleyman@aydinlife.com`: COMPANY_USER + OWNER
- `ebru@aydinlife.com`: COMPANY_USER + EMPLOYEE
- `burcu@fogistanbul.com`: AGENCY_STAFF + AGENCY_STAFF

### 4.3 Permission Sistemi

Şirket bazlı izinler `company_permissions` tablosundadır.

İzin seviyesi:

```text
NONE
RESTRICTED
FULL
```

Bu sistem şu anda izin kayıtlarını yönetmekte kullanılır. Admin panelinde kullanıcı-şirket bazlı izinler okunur ve güncellenir.

İlgili dosyalar:

- `PermissionService`
- `PermissionController`
- `CompanyPermissionRepository`
- `PermissionService.ALL_PERMISSION_KEYS`

Yeni şirket sahibi oluşturulurken `CompanyService.createCompanyWithOwner()` içinde OWNER için varsayılan izinler atanır.

## 5. Şirket ve Kullanıcı Veri Modeli

Ana tablolar:

```text
companies
persons
user_profiles
company_memberships
company_services
company_permissions
```

### 5.1 Company

`companies` tablosu müşteri veya ajans şirketini tutar.

Önemli alanlar:

```text
kind: AGENCY veya CLIENT
name
industry
email
phone
website
logoUrl
contractStatus
hostingProvider
domainExpiry
sslExpiry
cmsType
cmsVersion
themeName
```

Web Tasarım panelindeki site verileri `companies` üzerindeki web/infrastructure alanlarından beslenir.

### 5.2 Person

`persons` CRM kişi bilgisidir.

Kullanıcının ad soyad, telefon, pozisyon, avatar gibi kişisel bilgileri burada tutulur.

### 5.3 UserProfile

`user_profiles` sadece giriş ve rol bilgisidir.

Önemli alanlar:

```text
person_id
global_role
email
password_hash
```

### 5.4 CompanyMembership

Kullanıcıyı şirkete bağlar.

```text
user_id
company_id
membership_role
```

Client panelinin hangi şirkete ait olduğunu anlamak için buradan şirket bulunur.

## 6. Şirket Oluşturma Akışı

Frontend:

```text
CompaniesPage
  -> adminApi.createCompany(data)
  -> POST /api/admin/companies
```

Backend:

```text
CompanyController.create()
  -> CompanyService.createCompanyWithOwner()
```

Service içinde sırasıyla:

1. Owner email daha önce kayıtlı mı kontrol edilir.
2. `Company` oluşturulur.
3. Owner için `Person` oluşturulur.
4. Owner için `UserProfile` oluşturulur.
5. Owner `CompanyMembership` ile şirkete bağlanır.
6. OWNER varsayılan izinleri atanır.
7. Şirket grup mesaj kanalı oluşturulur.
8. Seçilen hizmetler `company_services` içine yazılır.

Bu işlem `@Transactional` içindedir. Bir adım patlarsa tüm işlem rollback olur.

## 7. Şirket Hizmetleri Sistemi

Bu CRM'in en kritik mimarilerinden biri şirket hizmetleri sistemidir.

Amaç:

```text
Her müşteriye ayrı panel yapmak yerine,
tek client panelini şirketin aldığı hizmetlere göre şekillendirmek.
```

### 7.1 Backend Modeli

Entity:

```text
CompanyService
```

Tablo:

```text
company_services
```

Alanlar:

```text
company_id
service_category
active
```

Enum:

```text
ServiceCategory
```

Kategoriler:

```text
DIGITAL_MARKETING
WEB_DESIGN
AD_MANAGEMENT
SOCIAL_MEDIA
PRODUCTION
CONTENT_MARKETING
```

### 7.2 Hizmetlerin Açtığı Modüller

| ServiceCategory | Açtığı Modüller |
|---|---|
| DIGITAL_MARKETING | Google Analytics, Search Console |
| WEB_DESIGN | PageSpeed, site sağlık verileri, bakım logları |
| AD_MANAGEMENT | Google Ads, Meta Ads |
| SOCIAL_MEDIA | Instagram analiz, Reels, gönderiler |
| PRODUCTION | Çekim takvimi |
| CONTENT_MARKETING | İçerik planları |

### 7.3 Admin Hizmet Toggle

Frontend:

```text
CompanyDetailPage
  -> adminApi.getCompanyServices(companyId)
  -> adminApi.toggleCompanyService(companyId, category, active)
```

Backend:

```text
AdminCompanyServiceController
  -> CompanyServicesManager.getAllServices()
  -> CompanyServicesManager.toggleService()
```

`CompanyServicesManager.getAllServices()` eski şirketlerde eksik hizmet satırı varsa otomatik oluşturur. Böylece sonradan eklenen hizmetler eski müşterilerde de pasif olarak görünür.

### 7.4 Client Aktif Hizmet Çekme

Frontend:

```text
useActiveServices()
  -> clientApi.getActiveServices()
  -> GET /api/client/active-services
```

Backend:

```text
ClientActiveServicesController
  -> CompanyServicesManager.getActiveServiceCategories(companyId)
```

`useActiveServices()` şu helperları döndürür:

```text
activeServices
hasService(category)
hasDigitalMarketing
hasWebDesign
hasAdManagement
hasSocialMedia
hasProduction
hasContentMarketing
```

### 7.5 Backend Hizmet Guard

Sadece frontend'de menü gizlemek yeterli değildir. Kullanıcı URL'yi elle yazıp API çağırabilir.

Bunu engelleyen servis:

```text
CompanyServiceAccessGuard
```

Örnek:

```java
serviceAccessGuard.requireService(userId, companyId, ServiceCategory.DIGITAL_MARKETING);
```

Bu kontrol:

1. Kullanıcıyı bulur.
2. ADMIN ve AGENCY_STAFF için geçişe izin verir.
3. COMPANY_USER için şirkete üyeliği kontrol eder.
4. `company_services` tablosunda ilgili hizmet aktif mi bakar.
5. Aktif değilse `AccessDeniedException` fırlatır.

`GlobalExceptionHandler` bu hatayı `403 Forbidden` olarak döndürür.

### 7.6 Hangi API Hangi Hizmetle Korunuyor?

| Controller | Endpoint | Hizmet |
|---|---|---|
| GoogleAnalyticsController | `/api/client/analytics/ga/**` | DIGITAL_MARKETING |
| SearchConsoleController | `/api/client/analytics/sc/**` | DIGITAL_MARKETING |
| PageSpeedController | `/api/client/pagespeed/**` | WEB_DESIGN |
| GoogleAdsController | `/api/client/analytics/google-ads/**` | AD_MANAGEMENT |
| MetaAdsController | `/api/client/analytics/meta-ads/**` | AD_MANAGEMENT |
| InstagramController | `/api/client/analytics/ig/**` | SOCIAL_MEDIA |
| ClientShootController | `/api/client/shoots/**` | PRODUCTION |
| ClientContentPlanController | `/api/client/content-plans/**` | CONTENT_MARKETING |

## 8. Frontend Hizmet Kataloğu

Hizmetlerin frontend tarafındaki merkezi tanımı:

```text
frontend/src/features/serviceCatalog.ts
```

Burada şu bilgiler tutulur:

```text
category
label
description
shortDescription
icon
color
glowColor
panels
```

Aynı dosyada client menüsünde hizmete bağlı açılan sayfalar da vardır:

```text
CLIENT_SERVICE_NAV_ITEMS
```

Bu katalog şu yerlerde kullanılır:

- `useActiveServices`
- `ServiceUpsellOverlay`
- `ServicePageGate`
- Client menü yapısı için referans olacak merkezi kaynak

Kilitli hizmet ekranı:

```text
ServiceBlurOverlay
```

Tam sayfa koruma:

```text
ServicePageGate
```

Route örneği:

```tsx
<Route
  path="google-analytics"
  element={
    <ServicePageGate service="DIGITAL_MARKETING">
      <GoogleAnalyticsDetailPage />
    </ServicePageGate>
  }
/>
```

Bu sayede hizmet aktif değilse gerçek sayfa yerine kilitli/upsell ekranı görünür.

## 9. Client Analytics Sayfasının Veri Akışı

Sayfa:

```text
frontend/src/pages/client/ClientAnalyticsPage.tsx
```

Bu sayfa müşteri raporlarını tek ekranda toplar.

Kullandığı ana kaynaklar:

```text
useAuth()
useActiveServices()
useRefreshAllClientData()
GoogleAnalyticsPanel
SearchConsolePanel
InstagramPanel
ContentPlanPanel
WebDesignPanel
GoogleAdsPanel
MetaAdsPanel
clientApi.getMyShoots()
```

### 9.1 companyId Önemi

Client analytics panelleri için `user.companyId` gerekir.

Eğer admin hesabıyla `/client/analytics` açılırsa `companyId` boş olabilir. Bu durumda sayfa API çağırmaz ve "Müşteri şirketi bulunamadı" uyarısı gösterir.

Müşteri hesabıyla login olunduğunda `AuthService.buildUserInfo()` şirket üyeliğinden `companyId` üretir.

### 9.2 Panel Görünürlüğü

Sayfa içinde her blok şöyle kontrol edilir:

```tsx
hasService('WEB_DESIGN')
hasService('SOCIAL_MEDIA')
hasService('CONTENT_MARKETING')
hasService('PRODUCTION')
hasService('DIGITAL_MARKETING')
hasService('AD_MANAGEMENT')
```

Hizmet aktifse gerçek panel render edilir. Aktif değilse `ServiceBlurOverlay` render edilir.

### 9.3 Prefetch Sistemi

Hook:

```text
useClientDataPrefetch()
```

Bu hook client panel açıldığında bazı verileri önden çeker. Ama hizmet kapalıysa ilgili API'yi çağırmaz.

Örnek:

```text
hasDigitalMarketing true ise GA ve SC prefetch edilir.
hasSocialMedia true ise Instagram verileri prefetch edilir.
hasProduction true ise çekimler prefetch edilir.
```

Bu önemlidir çünkü hizmet kapalıyken backend 403 döndürür. Gereksiz 403 ve kırmızı hata ekranlarını önlemek için prefetch hizmetlere göre şartlandırılmıştır.

## 10. Admin Panel Kod Akışları

### 10.1 Şirket Listesi

Frontend:

```text
CompaniesPage
  -> adminApi.getCompanies()
  -> GET /api/admin/companies
```

Backend:

```text
CompanyController.getAll()
  -> CompanyService.getAllClients()
  -> CompanyRepository.findByKind(CLIENT)
```

Response:

```text
CompanyResponse
```

Bu response içinde şirketin üye sayısı, çalışan sayısı, ajans çalışanı sayısı ve görev sayısı hesaplanır.

### 10.2 Şirket Detayı

Frontend:

```text
CompanyDetailPage
  -> adminApi.getCompany(id)
  -> adminApi.getCompanyServices(id)
  -> adminApi.getPermissions(userId, companyId)
```

Backend:

```text
CompanyController.getById()
CompanyServicesManager.getAllServices()
PermissionService.getPermissions()
```

Şirket detayında hem şirket bilgisi hem üyeler hem hizmet toggleları hem izinler yönetilir.

### 10.3 Şirket Altyapı Bilgileri

Frontend:

```text
adminApi.updateCompanyInfrastructure()
```

Backend:

```text
PUT /api/admin/companies/{id}/infrastructure
CompanyService.updateInfrastructure()
```

Bu alanlar Web Tasarımı paneline veri sağlar:

```text
hostingProvider
domainExpiry
sslExpiry
cmsType
cmsVersion
themeName
website
```

### 10.4 Ajans Çalışanı Atama

Frontend:

```text
adminApi.assignStaff(staffId, companyId)
```

Backend:

```text
StaffController.assign()
  -> StaffService.assignToCompany()
```

Atama sonucunda ajans çalışanı şirkete `AGENCY_STAFF` membership role ile bağlanır.

## 11. Staff Panel Kod Akışları

### 11.1 Görevler

Frontend:

```text
TasksPage
KanbanPage
FloatingTaskFab
staffApi / task API fonksiyonları
```

Backend:

```text
TaskController
  -> TaskService
  -> TaskRepository
```

Endpointler:

```text
GET    /api/staff/tasks
GET    /api/staff/tasks/my
GET    /api/staff/tasks/company/{companyId}
GET    /api/staff/tasks/{id}
POST   /api/staff/tasks
PUT    /api/staff/tasks/{id}
DELETE /api/staff/tasks/{id}
```

`TaskService` kullanıcının rolüne ve şirket üyeliklerine göre görev erişimini sınırlar.

### 11.2 Görev Notları

Endpointler:

```text
GET    /api/staff/tasks/{taskId}/notes
POST   /api/staff/tasks/{taskId}/notes
DELETE /api/staff/tasks/notes/{noteId}
```

Notlar görev detay panelinde kullanılır.

### 11.3 Şirketler

Staff şirket listesi kullanıcının atanmış olduğu şirketlere göre gelir.

Backend tarafında `CompanyService.getAllClientsForUser(userId, role)` admin ise tüm şirketleri, staff ise membership tablosundan erişebileceği şirketleri döndürür.

## 12. Client Panel Kod Akışları

### 12.1 Client Tasks

Frontend:

```text
ClientTasksPage
clientApi.getMyTasks()
clientApi.getTask()
clientApi.reviewTask()
```

Backend:

```text
ClientTaskController
  -> TaskService
```

Endpoint:

```text
GET /api/client/tasks/my
GET /api/client/tasks/{id}
```

Müşteri kullanıcısının şirketi membership tablosundan bulunur. Sonra sadece o şirketin görevleri döndürülür.

### 12.2 Client Content Plans

Frontend:

```text
ClientContentPlanPage
contentPlanApi
clientApi.getContentByShoot()
```

Backend:

```text
ClientContentPlanController
  -> CompanyServiceAccessGuard CONTENT_MARKETING
  -> ContentPlanService
```

Bu controller hem içerik listeleme hem onay akışlarını yönetir.

### 12.3 Client Shoots

Frontend:

```text
ClientShootsPage
clientApi.getMyShoots()
clientApi.getShootById()
```

Backend:

```text
ClientShootController
  -> CompanyServiceAccessGuard PRODUCTION
  -> ShootService
```

Prodüksiyon hizmeti aktif değilse bu API 403 döndürür.

## 13. Entegrasyon Panelleri

### 13.1 Google Analytics

Frontend:

```text
frontend/src/api/googleAnalytics.ts
GoogleAnalyticsPanel
GoogleAnalyticsDetailPage
```

Backend:

```text
GoogleAnalyticsController
  -> CompanyServiceAccessGuard DIGITAL_MARKETING
  -> GoogleAnalyticsService
  -> GoogleOAuthService
```

Endpointler:

```text
GET    /api/client/analytics/ga/status
GET    /api/client/analytics/ga/overview
POST   /api/client/analytics/ga/property
DELETE /api/client/analytics/ga/disconnect
```

`companyId` request param olarak gider.

### 13.2 Search Console

Frontend:

```text
frontend/src/api/searchConsole.ts
SearchConsolePanel
SearchConsoleDetailPage
```

Backend:

```text
SearchConsoleController
  -> CompanyServiceAccessGuard DIGITAL_MARKETING
  -> SearchConsoleService
  -> GoogleOAuthService
```

Endpointler:

```text
GET  /api/client/analytics/sc/status
GET  /api/client/analytics/sc/sites
GET  /api/client/analytics/sc/overview
POST /api/client/analytics/sc/site-url
```

### 13.3 PageSpeed / Web Design

Frontend:

```text
frontend/src/api/webDesign.ts
WebDesignPanel
PageSpeedDetailPage
```

Backend:

```text
PageSpeedController
  -> CompanyServiceAccessGuard WEB_DESIGN
  -> PageSpeedService
```

Client endpointleri:

```text
GET /api/client/pagespeed
PUT /api/client/pagespeed/website
```

Staff endpoint:

```text
GET /api/staff/companies/{companyId}/pagespeed
```

WebDesignPanel `companyId` verilmezse client endpointleri çağırır. Admin/staff ekranında companyId verilirse staff/company endpointleri kullanılır.

### 13.4 Google Ads

Backend:

```text
GoogleAdsController
  -> CompanyServiceAccessGuard AD_MANAGEMENT
  -> GoogleAdsService
  -> GoogleOAuthService
```

Endpointler:

```text
GET    /api/client/analytics/google-ads/status
GET    /api/client/analytics/google-ads/overview
POST   /api/client/analytics/google-ads/customer-id
DELETE /api/client/analytics/google-ads/disconnect
```

### 13.5 Meta Ads

Backend:

```text
MetaAdsController
  -> CompanyServiceAccessGuard AD_MANAGEMENT
  -> MetaAdsService
  -> InstagramOAuthService
```

Endpointler:

```text
GET    /api/client/analytics/meta-ads/status
GET    /api/client/analytics/meta-ads/overview
POST   /api/client/analytics/meta-ads/ad-account
DELETE /api/client/analytics/meta-ads/disconnect
```

### 13.6 Instagram

Backend:

```text
InstagramController
  -> CompanyServiceAccessGuard SOCIAL_MEDIA
  -> InstagramService
  -> InstagramOAuthService
```

Endpointler:

```text
GET    /api/client/analytics/ig/status
GET    /api/client/analytics/ig/overview
GET    /api/client/analytics/ig/reels
GET    /api/client/analytics/ig/posts
DELETE /api/client/analytics/ig/disconnect
```

## 14. Mesajlaşma Sistemi

Mesajlaşma iki parçalıdır:

1. Birebir mesajlaşma
2. Şirket grup mesajlaşması

### 14.1 Birebir Mesaj

Entityler:

```text
Conversation
Message
```

Backend:

```text
MessagingController        /api/staff/messaging/**
ClientMessagingController  /api/client/messaging/**
MessagingService
ConversationRepository
MessageRepository
```

Akış:

```text
startConversation(targetUserId)
  -> kullanıcılar ortak şirkette mi kontrol edilir
  -> varsa mevcut conversation döner
  -> yoksa yeni conversation oluşturulur
```

Mesaj gönderme:

```text
POST /conversations/{conversationId}/messages
  -> kullanıcı conversation katılımcısı mı?
  -> Message kaydedilir
  -> conversation.updatedAt güncellenir
  -> WebSocket topic'e broadcast edilir
```

Broadcast topic:

```text
/topic/thread/{conversationId}
/topic/user/{userId}
/topic/read/{conversationId}
```

### 14.2 Şirket Grup Mesajları

Entityler:

```text
GroupConversation
GroupMember
GroupMessage
GroupMessageRead
```

Backend:

```text
GroupMessagingController
ClientGroupMessagingController
GroupMessagingService
```

Şirket oluşturulurken:

```text
CompanyService.createCompanyWithOwner()
  -> groupMessagingService.createCompanyGroup(company, owner)
```

Çalışan eklenirken:

```text
CompanyService.addEmployeeToCompany()
  -> groupMessagingService.addMemberToCompanyGroup()
```

Grup mesaj gönderiminde:

```text
group üyesi mi kontrol edilir
message kaydedilir
/topic/group/{groupId} broadcast edilir
üyelere /topic/user/{userId} bildirimi gönderilir
```

## 15. WebSocket Mimarisi

Config:

```text
WebSocketConfig
```

Endpoint:

```text
/ws
```

STOMP prefixleri:

```text
Application prefix: /app
Broker prefix: /topic, /queue
User prefix: /user
```

Frontend hook:

```text
useWebSocket
```

Bağlantı SockJS ile kurulur:

```text
new SockJS('/ws')
```

Auth:

- Browser cookie içindeki `access_token` WebSocket handshake sırasında okunur.
- Alternatif olarak STOMP Authorization header desteklenir.
- Subscribe/send sırasında destination yetkisi kontrol edilir.

## 16. Bildirim Sistemi

Entity:

```text
Notification
NotificationPreference
```

Backend:

```text
NotificationController
NotificationPreferenceController
NotificationService
```

Frontend:

```text
NotificationBell
useNotifications
features.ts notificationApi
```

Endpointler:

```text
GET /api/notifications
GET /api/notifications/unread-count
PUT /api/notifications/{id}/read
PUT /api/notifications/read-all
```

Bildirimler okunma durumuna göre listelenir. Bell component unread count'u çeker.

## 17. Dosya ve Medya Sistemi

Backend:

```text
FileController
FileService
FileAttachment
FileAttachmentRepository
```

Frontend:

```text
FileUploader
features.ts fileApi
MediaLibraryPage
StaffMediaLibraryPage
```

Endpointler:

```text
POST   /api/files/upload
GET    /api/files/entity/{entityType}/{entityId}
GET    /api/files/download/{fileId}
DELETE /api/files/{fileId}
GET    /api/files/media/company/{companyId}
GET    /api/files/media/company-counts
```

Desteklenen entity type:

```text
MESSAGE
TASK
NOTE
COMPANY
```

Dosya yükleme akışı:

```text
Frontend FormData hazırlar
  -> POST /api/files/upload
  -> FileService.upload()
  -> boyut ve uzantı kontrolü
  -> entity erişim kontrolü
  -> dosya local uploads klasörüne yazılır
  -> FileAttachment kaydı oluşturulur
```

Not: Projede Cloudinary dependency/config var ama mevcut `FileService` dosyaları local `uploads` dizinine yazar.

## 18. Activity Log, Time Tracking ve Rutinler

### 18.1 Activity Log

Backend:

```text
ActivityLogController
ActivityLogService
ActivityLogRepository
```

Frontend:

```text
ActivityLogPage
activityLogApi
```

Sistemdeki bazı işlemler aktivite olarak kayıt altına alınır.

### 18.2 Time Tracking

Backend:

```text
TimeTrackingController
TimeTrackingService
TimeEntryRepository
```

Frontend:

```text
TimeTrackingPage
TimeTracker
timeTrackingApi
```

Çalışanlar görev bazlı zaman başlatıp durdurabilir.

### 18.3 Routine Tasks

Backend:

```text
AdminRoutineController
RoutineTaskService
RoutineTaskRepository
```

Frontend:

```text
RoutineManagementPage
adminApi.getRoutines/createRoutine/updateRoutine
```

Rutin görevler belirli periyotlarda operasyon işlerini takip etmek için kullanılır.

## 19. Veritabanı Migration Mantığı

Migration dosyaları:

```text
backend/src/main/resources/db/migration
```

Flyway aktif:

```yaml
spring.flyway.enabled: true
spring.jpa.hibernate.ddl-auto: validate
```

Bu şu anlama gelir:

- Şemayı Flyway kurar.
- Hibernate tabloyu otomatik yaratmaz.
- Entity ile DB uyumsuzsa uygulama açılışta hata verebilir.

Yeni tablo/kolon eklenecekse:

1. Entity güncellenir.
2. Yeni `Vxx__description.sql` migration yazılır.
3. Repository/service/controller güncellenir.
4. Frontend API tipi güncellenir.

## 20. Yeni Hizmet veya Modül Eklerken İzlenecek Yol

Yeni bir hizmet kategorisi eklemek için:

1. Backend enum'a ekle:

```text
ServiceCategory
```

2. Migration gerekiyorsa yaz.

3. `CompanyServicesManager` tüm enum değerlerini otomatik dolaştığı için yeni kategori admin ekranına düşebilir; frontend mapping eklenmelidir.

4. Frontend katalog güncelle:

```text
frontend/src/features/serviceCatalog.ts
```

5. Client route ekle:

```text
App.tsx
ServicePageGate service="YENI_SERVICE"
```

6. Menüye ekle:

```text
CLIENT_SERVICE_NAV_ITEMS
```

7. Backend API koruması ekle:

```java
serviceAccessGuard.requireService(userId, companyId, ServiceCategory.YENI_SERVICE);
```

8. Client prefetch varsa hizmete göre şartlandır.

9. Admin şirket detayında hizmet açıklamasını güncelle.

## 21. Yeni Panel Eklerken Veri Akışı Şablonu

Önerilen pattern:

```text
frontend page/component
  -> frontend api function
  -> backend controller
  -> access guard
  -> service
  -> repository
  -> DTO response
  -> React Query cache
  -> UI render
```

Örnek:

```text
GoogleAnalyticsPanel
  -> gaApi.getOverview(companyId)
  -> GET /api/client/analytics/ga/overview
  -> GoogleAnalyticsController.overview()
  -> CompanyServiceAccessGuard.requireService(DIGITAL_MARKETING)
  -> GoogleAnalyticsService.getOverview()
  -> GoogleOAuthTokenRepository / external Google API
  -> GaOverviewResponse
  -> panel render
```

## 22. Sık Debug Senaryoları

### 22.1 Client panelde veri gelmiyor

Kontrol sırası:

1. Sol altta doğru kullanıcı mı görünüyor?
2. `AuthResponse.UserInfo.companyId` dolu mu?
3. `/api/client/active-services` hangi hizmetleri dönüyor?
4. Şirketin `company_services` kayıtları aktif mi?
5. İlgili entegrasyon bağlı mı?
6. Backend loglarında 403 mü 500 mü var?

DB kontrol örneği:

```sql
select u.email, c.name, cm.membership_role, cs.service_category, cs.active
from user_profiles u
join company_memberships cm on cm.user_id = u.id
join companies c on c.id = cm.company_id
left join company_services cs on cs.company_id = c.id
where u.email = 'suleyman@aydinlife.com';
```

### 22.2 Menüde modül var ama API 403 dönüyor

Bu genellikle frontend aktif hizmet cache'i ile backend şirket hizmet kayıtlarının uyuşmadığını gösterir.

Çözüm:

```text
React Query cache invalidate
Hard refresh
Admin panelden hizmet toggle kontrolü
DB company_services kontrolü
```

### 22.3 API companyId null hatası veriyor

Sebep:

```text
Client panel admin/staff oturumuyla açılmış olabilir.
```

Client rapor panelleri müşteri kullanıcısının `companyId` alanına ihtiyaç duyar.

Çözüm:

```text
Logout -> müşteri hesabıyla login -> Ctrl+Shift+R
```

### 22.4 Frontend build TypeScript hataları

Projede bazı mevcut TypeScript strict hataları vardır:

- Kullanılmayan importlar
- PageResponse tip uyuşmazlıkları
- Bazı staff sayfası tip uyumsuzlukları

Bu hatalar hizmet-gate yapısından bağımsızdır ama genel `tsc -b` komutunu kırar.

## 23. Önemli Dosya Haritası

### Backend

| Amaç | Dosya |
|---|---|
| Security route kuralları | `SecurityConfig.java` |
| JWT filter | `JwtAuthFilter.java` |
| Auth iş kuralları | `AuthService.java` |
| Şirket oluşturma | `CompanyService.java` |
| Şirket hizmetleri | `CompanyServicesManager.java` |
| Hizmet erişim guard | `CompanyServiceAccessGuard.java` |
| Admin şirket API | `CompanyController.java` |
| Admin hizmet API | `AdminCompanyServiceController.java` |
| Client aktif hizmet API | `ClientActiveServicesController.java` |
| Görevler | `TaskController.java`, `TaskService.java` |
| Mesajlaşma | `MessagingService.java`, `GroupMessagingService.java` |
| Dosyalar | `FileController.java`, `FileService.java` |
| Bildirimler | `NotificationController.java`, `NotificationService.java` |
| GA | `GoogleAnalyticsController.java`, `GoogleAnalyticsService.java` |
| Search Console | `SearchConsoleController.java`, `SearchConsoleService.java` |
| PageSpeed | `PageSpeedController.java`, `PageSpeedService.java` |
| Instagram | `InstagramController.java`, `InstagramService.java` |
| Ads | `GoogleAdsController.java`, `MetaAdsController.java` |

### Frontend

| Amaç | Dosya |
|---|---|
| Ana route ağacı | `App.tsx` |
| Axios client | `api/client.ts` |
| Auth state | `store/AuthContext.tsx` |
| Admin API | `api/admin.ts` |
| Client API | `api/clientPanel.ts` |
| Hizmet katalogları | `features/serviceCatalog.ts` |
| Aktif hizmet hook'u | `hooks/useActiveServices.ts` |
| Client prefetch | `hooks/useClientDataPrefetch.ts` |
| Client layout | `layouts/ClientLayout.tsx` |
| Client analytics | `pages/client/ClientAnalyticsPage.tsx` |
| Hizmet kilit ekranı | `components/ServiceUpsellOverlay.tsx` |
| Bildirim UI | `components/NotificationBell.tsx` |
| Global arama | `components/GlobalSearch.tsx` |

## 24. Kısa Mimari Özeti

CRM'in temel çalışma mantığı:

```text
Kullanıcı login olur
  -> JWT cookie yazılır
  -> frontend user role ve companyId alır
  -> role'e göre panel açılır
  -> client panel aktif hizmetleri çeker
  -> menü ve route gate buna göre şekillenir
  -> API çağrısı yapılırken backend aynı hizmeti tekrar kontrol eder
  -> service/repository veriyi üretir
  -> DTO frontend'e döner
  -> React Query cache ve componentler ekranı render eder
```

Bu mimaride en önemli kural:

```text
Frontend görünürlük sağlar, backend güvenliği sağlar.
```

Yani bir modülü menüden gizlemek yeterli değildir. O modülün API'si de `CompanyServiceAccessGuard` ile korunmalıdır.

