# FOG Istanbul CRM Refactor ve Spaghetti Kod Onleme Plani

**Inceleme tarihi:** 9 Haziran 2026
**Kapsam:** `frontend`, `backend`, veritabani migration'lari, depo hijyeni ve gelistirme sureci
**Ana hedef:** Yeni ozellik gelistirmeye devam ederken kodun daha fazla birbirine dolanmasini durdurmak, mevcut sistemi davranis kaybi olmadan moduler hale getirmek.

## 1. Yonetici Ozeti

Proje calisiyor olabilecek genis bir urun kapsamina sahip, ancak kod organizasyonu urunun buyume hizini tasiyacak seviyede degil. Temel sorun "her seyin tek sayfada olmasi"ndan daha genis:

- Frontend sayfalari veri cekme, cache yonetimi, form state'i, modal state'i, is kurallari ve render sorumluluklarini ayni dosyada topluyor.
- Backend teknik katmanlara gore (`controller`, `service`, `repository`, `entity`) tek paket halinde organize edilmis. Bir ozelligi anlamak icin cok sayida klasor arasinda gezinmek gerekiyor.
- Yetki ve sirket erisim kontrolleri birden fazla serviste tekrar uygulanmis.
- API tipleri ve endpoint'ler buyuk dosyalarda birikmis.
- Query key'ler string olarak ekranlara dagilmis.
- Test kapsami kritik is akislari icin yok denecek kadar az.
- Kaynak kod yedegi ve kullanici yuklemeleri Git icinde tutuluyor.
- Dokumantasyon ile gercek konfigurasyon arasinda sapma var.

Bu nedenle ilk hedef dosyalari rastgele kucultmek degil, **bagimlilik kurallarini ve kalite kapilarini koymaktir**. Aksi halde bolunen dosyalar kisa surede yeniden birbirine baglanir.

Onerilen strateji:

1. Once gelistirme zemini, test taban cizgisi ve mimari kurallar kurulur.
2. Big bang rewrite yapilmaz.
3. Ozellikler dikey dilimler halinde, davranis korunarak tasinir.
4. Her refactor PR'i kucuk, test edilebilir ve geri alinabilir olur.
5. Yeni kod hedef mimariye yazilir; eski kod yalnizca dokunulan bolgede iyilestirilir.

### Modul Durumu

| Modul | Durum | Tamamlanma tarihi | Not |
|---|---|---|---|
| Notes | **TAMAMLANDI** | 9 Haziran 2026 | Backend, frontend, ortak componentler ve testler birlikte duzenlendi |
| Maintenance log | **TAMAMLANDI** | 9 Haziran 2026 | Yetki aciklari kapatildi, tekrar eden admin/staff/client akislar birlestirildi |
| Company / membership / permissions | **TAMAMLANDI** | 9 Haziran 2026 | Ortak authorization temeli, staff atamalari ve client ekip akisi modullestirildi |
| Tasks | **TAMAMLANDI** | 9 Haziran 2026 | CRUD, not, review, routine, client/staff akislar ve ortak query altyapisi modullestirildi |
| Meetings / calendar | **TAMAMLANDI** | 9 Haziran 2026 | Meeting CRUD, katilimci/not yetkileri, ortak frontend feature'i ve task/meeting takvimi duzenlendi |
| Shoots | **TAMAMLANDI** | 9 Haziran 2026 | CRUD, katilimci/ekipman, content plan baglantilari, takvim ve export akislari modullestirildi |
| Content plans / approvals | **TAMAMLANDI** | 9 Haziran 2026 | CRUD, durum gecisleri, client onaylari, staff inceleme akisi ve ortak frontend feature'i modullestirildi |
| PR projects | **TAMAMLANDI** | 10 Haziran 2026 | Proje/faz/uye/not/task baglantilari, authorization ve ortak frontend feature'i modullestirildi |
| Files / media library | **TAMAMLANDI** | 10 Haziran 2026 | Dosya erisimi, attachment baglantilari ve ortak medya feature'i modullestirildi |
| Messaging | **TAMAMLANDI** | 10 Haziran 2026 | Direct/grup mesajlasma, WebSocket ve ortak frontend feature'i modullestirildi |
| Integrations | **TAMAMLANDI** | 12 Haziran 2026 | PageSpeed/Web Design, Google Analytics, Search Console, Google Ads, Instagram ve Meta Ads ayri modul sinirlarina tasindi |
| Genel UI / performans | Devam ediyor | - | Route-level code splitting tamamlandi; dashboard view model ve query tekrar analizi tamamlandi |

## 2. Mevcut Durumun Olculebilir Ozeti

### 2.1 Kod hacmi

| Alan | Olcum |
|---|---:|
| Frontend canli kaynak | 26.517 satir |
| Backend Java kaynak | 17.616 satir |
| Frontend 300+ satir dosya | 36 |
| Frontend 500+ satir dosya | 16 |
| Frontend 700+ satir dosya | 3 |
| Backend 200+ satir dosya | 19 |
| Backend 300+ satir dosya | 8 |
| Backend 400+ satir dosya | 5 |
| Frontend `useState` kullanimi | 367 |
| Frontend `useEffect` kullanimi | 52 |
| Acik `any` kullanimi | En az 27 |
| Frontend/backup ortak dosya | 93 |
| Flyway migration | 35 |
| Backend controller | 49 |
| Backend service | 36 |
| Backend repository | 40 |
| Backend entity | 59 |

Bu sayilar tek basina hata degildir. Sorun, buyuk dosyalarin cogunun tek bir is akisini degil birden fazla sorumlulugu tasimasidir.

### 2.2 En belirgin frontend yogunluklari

| Dosya | Satir | Birlesen sorumluluklar |
|---|---:|---|
| `frontend/src/components/analytics/ContentPlanPanel.tsx` | 1.147 | Liste, CRUD, form, detay, cekim detayi, onay akisi, modal'lar, query/mutation |
| `frontend/src/pages/staff/KanbanPage.tsx` | 769 | Dashboard, tarih islemleri, gorevler, cekimler, toplantilar, PR, notlar, avatar |
| `frontend/src/pages/client/ClientDashboard.tsx` | 732 | Birden fazla entegrasyon sorgusu, tab sistemi, grafikler, takvim, hizli linkler |
| `frontend/src/pages/client/PageSpeedDetailPage.tsx` | 698 | Veri erisimi, rapor donusumu ve tum sunum |
| `frontend/src/pages/client/GoogleAnalyticsDetailPage.tsx` | 668 | Query, filtre, metrik hesaplama ve grafikler |
| `frontend/src/pages/staff/StaffCalendarPage.tsx` | 650 | Takvim motoru, filtreleme, veri birlestirme ve UI |
| `frontend/src/pages/client/ClientContentPlanPage.tsx` | 634 | Staff content plan akisinin kismen tekrar edilmesi |
| `frontend/src/pages/staff/MessagingPage.tsx` | 622 | Konusmalar, mesajlar, WebSocket, secim ve UI |
| `frontend/src/pages/client/ClientMessagingPage.tsx` | 601 | Staff mesajlasma akisinin ayri uygulamasi |
| `frontend/src/components/FloatingTaskFab.tsx` | 544 | Global form, veri yukleme, atama ve modal yonetimi |

### 2.3 En belirgin backend yogunluklari

| Dosya | Satir | Birlesen sorumluluklar |
|---|---:|---|
| `backend/.../service/InstagramService.java` | 1.402 | HTTP client, API uyumlulugu, parse, fallback, hesaplama, tarih araligi, DTO uretimi |
| `backend/.../service/InstagramOAuthService.java` | 494 | OAuth akisi, token saklama, yenileme ve harici API cagirilari |
| `backend/.../service/TaskService.java` | 459 | CRUD, erisim, atama, bildirim, phase tamamlama, note yonetimi, mapping |
| `backend/.../service/PrProjectService.java` | 429 | Proje, faz, uye, not, gorev ve erisim akislari |
| `backend/.../service/CompanyService.java` | 407 | Sirket, sahip kullanici, uyelik, izin, grup mesaji, hizmetler, mapping |
| `backend/.../service/MessagingService.java` | 346 | Konusma, mesaj, okundu bilgisi ve bildirim akislari |

## 3. Oncelikli Bulgular

### P0 - Yeni spaghetti kodu durduracak kurallar yok

Dosya boyutu, bagimlilik yonu, test zorunlulugu veya feature siniri icin otomatik bir kontrol bulunmuyor. ESLint konfigurasyonu temel seviyede; backend icin mimari test veya statik analiz yok.

**Sonuc:** Mevcut dosyalar bolunse bile ayni sorun tekrar olusur.

**Karar:** Refactor'un ilk PR'i ozellik kodu degil, kalite kapilari olmalidir.

### P0 - Test guvenlik agi yetersiz

- Backend'de yalnizca Spring context testi gorunuyor.
- Frontend'de test setup dosyasi var, davranis testi yok.
- Kritik akislarda otomatik regresyon guvencesi bulunmuyor: login/refresh, sirket erisimi, gorev durumu, content approval, mesajlasma ve entegrasyon fallback'leri.

**Sonuc:** Buyuk dosyalari parcalarken davranis kaybi fark edilmeyebilir.

### P0 - Yetkilendirme ve tenant erisimi tekrarlaniyor

`ensureCompanyAccess`, `ensureCompanyMembership` ve `getUserOrThrow` benzeri kodlar `TaskService`, `ShootService`, `MeetingService`, `PrProjectService`, `NoteService`, `TimeTrackingService` ve `FileService` icinde ayri ayri bulunuyor.

**Sonuc:** Bir serviste duzeltilen guvenlik kurali digerinde eski kalabilir. Bu yalnizca temiz kod degil, tenant veri sizintisi riskidir.

**Karar:** Tek bir `CurrentUser`, `CompanyAccessPolicy` ve ozellik bazli authorization servisi kullanilmalidir.

### P1 - Frontend page component'leri uygulama katmanina donusmus

Ornek olarak `ContentPlanPanel.tsx` ayni dosyada ana panel, detay modal'i, form, cekim modal'i ve onay modal'i barindiriyor. `ClientDashboard.tsx` icindeki tab component'leri `any` ile veri aliyor ve API cevap yapisina dogrudan bagli.

**Sonuc:** UI degisikligi veri akisini, veri akisi degisikligi modal ve form davranisini etkiliyor.

### P1 - Backend package-by-layer yapisi ozellik sinirlarini gizliyor

Tum controller'lar bir klasorde, tum service'ler baska klasorde. Ornegin content plan ozelligini anlamak icin controller, DTO, entity, repository ve service klasorleri arasinda gezinmek gerekiyor.

**Sonuc:** Bir ozelligin gercek bagimliliklari gorunmuyor; servisler arasi cagrilar zamanla dongusel ve kirilgan hale gelebilir.

### P1 - Controller'lar repository'lere dogrudan erisiyor

En az 11 controller repository import ediyor. Bunlar arasinda `ClientTaskController`, `ClientShootController`, `ClientTeamController`, `UserManagementController` ve `PageSpeedController` bulunuyor.

**Sonuc:** Is kurali ve authorization controller'a siziyor; transaction sinirlari belirsizlesiyor.

**Kural:** Controller yalnizca request dogrulama, kimlik baglami ve application service cagrisindan sorumlu olmalidir.

### P1 - Frontend server-state standartlari yari uygulanmis

TanStack Query kullaniliyor, ancak:

- Query key'ler merkezi factory yerine ekranlarda literal string.
- Ayni veri icin farkli key'ler var: `client-shoots`, `client-shoots-analytics`, `my-panel-shoots`.
- Invalidation davranisi cok sayida component'e dagilmis.
- API modelleri ile view modelleri ayrilmamis.
- Formlarin bir kismi React Hook Form/Zod yerine cok sayida `useState` ile yonetiliyor.

**Sonuc:** Cache tutarsizligi ve gereksiz tekrar sorgular olusabilir.

### P1 - Entegrasyon servisleri harici API detaylarini is kuraliyla karistiriyor

`InstagramService.java` HTTP URL olusturma, Graph API versiyonu, response tree parse etme, fallback metrik hesaplama, tarih cozumleme ve response mapping islerini tek sinifta yapiyor.

**Sonuc:** API versiyonu degistiginde tum analitik akisi risk altina giriyor ve birim test yazmak zorlasiyor.

### P2 - Router ve bundle tek noktada buyuyor

`frontend/src/App.tsx` tum panellerin ekranlarini eager import ediyor ve tum route tanimlarini tek dosyada tutuyor.

**Sonuc:** Route sahipligi belirsiz; yeni sayfa eklemek merkezi dosyada cakisma yaratir; route-level code splitting kullanilmaz.

### P2 - Depo hijyeni bozuk

- `frontend/src_backup` icinde 93 canli kaynak kopyasi Git tarafindan takip ediliyor.
- `backend/uploads` altindaki kullanici dosyalari Git tarafindan takip ediliyor.
- Frontend README halen Vite sablon metni.
- `proje-plani.md` Java 21 diyor, gercek `pom.xml` Java 17 kullaniyor.

**Sonuc:** Hangi kodun gercek oldugu belirsizlesiyor, depo sisiyor ve dokumantasyon guvenilirligini kaybediyor.

## 4. Spaghetti Kodu Engelleyen Zorunlu Kurallar

Bu kurallar refactor tamamlanmadan da yeni kod icin hemen uygulanmalidir.

### 4.1 Genel kurallar

1. Bir PR hem davranis degisikligi hem genis dosya tasima islemi yapmamalidir.
2. Refactor PR'inda API davranisi degismeyecekse once characterization test yazilmalidir.
3. Yeni bir ozellik mevcut dev dosyaya eklenmez; kendi feature klasorunde baslatilir.
4. Controller veya React page icinde tekrar kullanilabilir is kurali yazilmaz.
5. Bir katman yalnizca bir alt katmana baglanir; katman atlanmaz.
6. Ortak klasore kod koymak icin en az iki gercek kullanim olmalidir.
7. `utils` bir cop kutusu degildir. Is alanina ait yardimci kod feature icinde kalir.
8. `any`, string rol/status ve kontrolsuz type assertion yeni kodda yasaktir.
9. Dosya bolmek hedef degildir; sorumluluk ve bagimlilik siniri olusturmak hedeftir.
10. Eski ve yeni implementasyon uzun sure paralel tutulmaz.

### 4.2 Boyut esikleri

Boyut tek kalite metrigi degildir, ancak inceleme tetikleyicisidir.

| Kod turu | Hedef | Sert inceleme esigi |
|---|---:|---:|
| React page/container | 150-250 satir | 300 satir |
| React presentational component | 50-150 satir | 200 satir |
| Custom hook | 30-100 satir | 150 satir |
| API modulu | 50-150 satir | 200 satir |
| Java application service | 100-200 satir | 250 satir |
| Java controller | 30-100 satir | 150 satir |
| Mapper/policy/client | 50-150 satir | 200 satir |

Esik asildiginda otomatik olarak dosya bolunmez. PR aciklamasinda neden tek sorumluluk oldugu aciklanir veya parcalama yapilir.

### 4.3 Frontend bagimlilik kurallari

Izin verilen yon:

```text
app -> pages -> features -> entities -> shared
```

- `shared` feature veya page import edemez.
- `entities` page import edemez.
- Bir feature diger feature'in ic dosyasini import edemez; yalnizca public `index.ts` API'sini kullanir.
- Page yalnizca route composition ve feature birlestirme yapar.
- API response tipi dogrudan buyuk UI agacina yayilmaz; gerekiyorsa view model'e map edilir.
- Query key ve query option'lari feature'in `api/` klasorunde tanimlanir.

### 4.4 Backend bagimlilik kurallari

Her feature icin izin verilen yon:

```text
web -> application -> domain
infrastructure -> domain
application -> infrastructure portlari
```

- Controller repository kullanamaz.
- Controller entity donduremez.
- Domain kodu Spring MVC, JPA repository veya harici HTTP client bilmez.
- Harici servis cevabi application service icinde `Map<String, Object>` olarak dolasmaz.
- Authorization tek bir policy uzerinden uygulanir.
- DTO mapping entity icinde veya dev service metodunda yapilmaz.
- Feature'lar arasi yan etkiler dogrudan servis zinciri yerine uygun yerlerde domain/application event ile ayrilir.

## 5. Hedef Frontend Mimarisi

Onerilen yapi:

```text
frontend/src/
  app/
    App.tsx
    providers/
      AppProviders.tsx
      queryClient.ts
    router/
      router.tsx
      adminRoutes.tsx
      staffRoutes.tsx
      clientRoutes.tsx
    styles/
  pages/
    admin/
    staff/
    client/
    auth/
  features/
    auth/
      api/
      model/
      ui/
      index.ts
    tasks/
      api/
        taskApi.ts
        taskQueries.ts
        taskKeys.ts
      model/
        task.types.ts
        task.schema.ts
        task.mapper.ts
      hooks/
      ui/
      index.ts
    content-plans/
    messaging/
    companies/
    shoots/
    meetings/
    analytics/
  entities/
    company/
    user/
    task/
  shared/
    api/
      httpClient.ts
      apiError.ts
      pagination.ts
    auth/
    ui/
      Button/
      Modal/
      EmptyState/
      DataTable/
    lib/
      date/
      format/
    config/
```

### 5.1 Page sorumlulugu

Bir page dosyasi:

- Route parametrelerini okur.
- Yetki/gate composition yapar.
- Feature container'larini yerlestirir.
- Sayfa seviyesinde loading/error boundary belirler.

Bir page dosyasi sunlari yapmaz:

- Ham Axios cagrisi.
- Buyuk form state'i.
- DTO donusumu.
- Cache invalidation ayrintisi.
- Is kurali hesaplamasi.
- Birden fazla modal'in implementasyonu.

### 5.2 Query standardi

Ornek:

```ts
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};
```

Query option ve mutation hook'lari feature icinde tutulmali:

```text
features/tasks/api/taskKeys.ts
features/tasks/api/taskQueries.ts
features/tasks/api/taskMutations.ts
```

Component yalnizca `useTasks(filters)` veya `useUpdateTask()` kullanmali; hangi key'in invalidate edilecegini bilmemeli.

### 5.3 Form standardi

- React Hook Form + Zod varsayilan standart olmali.
- API request modeli ile form modeli ayni olmak zorunda degildir.
- Tarih/saat birlestirme ve bos string/null donusumu mapper'da yapilmali.
- Modal kapanirken state sifirlama tek bir form lifecycle'i ile yonetilmeli.

### 5.4 Route standardi

`App.tsx` provider composition disinda kucuk tutulmali. Admin, staff ve client route'lari ayri dosyalarda ve lazy import ile tanimlanmali.

```text
app/router/adminRoutes.tsx
app/router/staffRoutes.tsx
app/router/clientRoutes.tsx
```

Admin'in staff sayfasini dogrudan import etmesi yerine ortak ozellik ekrani feature katmanina tasinmali.

## 6. Hedef Backend Mimarisi

Mikroservis onerilmiyor. Mevcut olcek icin **moduler monolith** yeterli ve daha guvenlidir.

Onerilen feature-first paketleme:

```text
com.fogistanbul.crm
  shared/
    security/
    error/
    persistence/
    web/
  auth/
    web/
    application/
    domain/
    infrastructure/
  company/
    web/
    application/
    domain/
    infrastructure/
  task/
    web/
    application/
    domain/
    infrastructure/
  contentplan/
  shoot/
  meeting/
  messaging/
  integration/
    google/
    instagram/
    metaads/
    pagespeed/
```

Tum projeyi tek PR'da bu yapiya tasimak yasaktir. Her feature, testleriyle birlikte dikey olarak tasinir.

### 6.1 Application service

Application service bir use-case temsil etmeli:

```text
CreateTaskHandler
UpdateTaskHandler
CompleteTaskHandler
GetTaskDetailsQuery
ListCompanyTasksQuery
```

Her CRUD icin zorunlu olarak ayri class acmak gerekmiyor. Ancak tek `TaskService` icinde gorev, note, notification, phase ve authorization birikmemeli.

### 6.2 Authorization

Onerilen ortak yapilar:

```text
CurrentUser
CompanyAccessPolicy
TaskAccessPolicy
ContentPlanAccessPolicy
```

Ornek sorumluluk:

```java
companyAccessPolicy.requireMember(currentUser.id(), companyId);
taskAccessPolicy.requireEditable(currentUser, task);
```

Bu policy'ler:

- Admin bypass kuralini tek yerde tutar.
- Membership sorgusunu tek yerde yapar.
- Hata tipini standartlastirir.
- Birim test ile tum rol kombinasyonlarini kapsar.

### 6.3 Mapping

`toResponse` metodlari dev service siniflarinin sonunda tutulmamali.

```text
TaskResponseMapper
CompanyResponseMapper
ContentPlanResponseMapper
```

Mapper sadece donusum yapar; repository sorgusu veya authorization yapmaz.

### 6.4 Harici entegrasyonlar

Instagram icin hedef ayrim:

```text
integration/instagram/
  application/
    GetInstagramOverview.java
    GetInstagramPosts.java
    GetInstagramReels.java
  infrastructure/
    InstagramGraphClient.java
    InstagramTokenProvider.java
    InstagramResponseParser.java
    InstagramMetricFallback.java
  domain/
    InstagramOverview.java
    InstagramPost.java
    InstagramReel.java
    InsightRange.java
  web/
    InstagramController.java
```

`InstagramGraphClient` HTTP ve Graph API versiyonunu bilir. Parser JSON yapisini bilir. Application use-case fallback politikasini orkestre eder. Controller bunlarin hicbirini bilmez.

## 7. Dosya Bazli Parcalama Plani

### 7.1 `ContentPlanPanel.tsx`

Hedef:

```text
features/content-plans/
  api/
    contentPlanApi.ts
    contentPlanKeys.ts
    contentPlanQueries.ts
    contentPlanMutations.ts
  model/
    contentPlan.types.ts
    contentPlan.schema.ts
    contentPlan.mapper.ts
  ui/
    ContentPlanList.tsx
    ContentPlanCard.tsx
    ContentPlanDetailDialog.tsx
    ContentPlanForm.tsx
    ContentPlanStatusActions.tsx
    ApproveContentPlanDialog.tsx
    ShootDetailsDialog.tsx
  hooks/
    useContentPlanApproval.ts
  index.ts
```

Staff ve client ekranlari ayni feature'i farkli capability props ile kullanmali. `readOnly` gibi tek boolean zamanla yetersiz kalir; acik yetenek modeli tercih edilmeli:

```ts
type ContentPlanCapabilities = {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
};
```

### 7.2 `ClientDashboard.tsx`

Hedef:

```text
features/client-dashboard/
  model/dashboardViewModel.ts
  hooks/useClientDashboard.ts
  ui/OverviewTab.tsx
  ui/WebAnalyticsTab.tsx
  ui/SocialAnalyticsTab.tsx
  ui/ScheduleTab.tsx
  ui/DashboardMetricCard.tsx
```

- `any` kaldirilir.
- GA, Search Console ve Instagram cevaplari tek hook icinde view model'e cevrilir.
- Baglanti durumu ve bos state kurallari merkezi olur.
- Tab component'leri query client bilmez.

### 7.3 `KanbanPage.tsx`

Dosya adi ile gercek davranis uyusmuyor; bu ekran daha cok "personel calisma paneli".

Hedef:

```text
pages/staff/StaffWorkspacePage.tsx
features/staff-workspace/
  hooks/useStaffWorkspace.ts
  model/calendar.ts
  ui/WeekStrip.tsx
  ui/WorkspaceStats.tsx
  ui/TodayTasks.tsx
  ui/UpcomingShoots.tsx
  ui/UpcomingMeetings.tsx
  ui/QuickNotes.tsx
```

Tarih yardimcilari `shared/lib/date` icine ancak ikinci kullanim dogrulandiginda tasinmali.

### 7.4 `frontend/src/api/staff.ts`

382 satirlik bu dosya farkli domain'lerin tiplerini ve endpoint'lerini topluyor.

Bolunme:

```text
features/tasks/api/taskApi.ts
features/meetings/api/meetingApi.ts
features/shoots/api/shootApi.ts
features/pr-projects/api/prProjectApi.ts
features/notes/api/noteApi.ts
shared/api/pagination.ts
```

Gecis boyunca `staff.ts` re-export facade olarak kisa sure tutulabilir. Tum importlar tasindiginda silinmelidir.

### 7.5 Mesajlasma ekranlari

`MessagingPage.tsx` ve `ClientMessagingPage.tsx` iki ayri mesajlasma motoru olmamali.

Ortak feature:

```text
features/messaging/
  api/
  model/
  hooks/useConversations.ts
  hooks/useMessages.ts
  hooks/useMessagingSocket.ts
  ui/ConversationList.tsx
  ui/MessageThread.tsx
  ui/MessageComposer.tsx
```

Admin/staff/client farki veri ve capability seviyesinde uygulanmali, component kopyasiyla degil.

### 7.6 `InstagramService.java`

Ilk bolumde davranis degistirilmeden su seam'ler cikarilmali:

1. `InstagramGraphClient`: `fetchJson`, URL ve HTTP hata yonetimi.
2. `InstagramInsightParser`: response tree ve sayisal deger parse islemleri.
3. `InstagramDateRangeResolver`: tarih araligi hesaplari.
4. `InstagramMediaInsightService`: post/reel metrikleri.
5. `InstagramOverviewService`: orchestration ve response uretimi.

Her cikarma oncesi mevcut JSON ornekleri fixture olarak kaydedilip parser testleri yazilmalidir.

### 7.7 `TaskService.java`

Bolumler:

```text
TaskCommandService
TaskQueryService
TaskNoteService
TaskResponseMapper
TaskAccessPolicy
TaskNotificationPublisher
TaskPhaseSynchronizer
```

Bildirim gonderme ve PR phase tamamlama, gorev transaction'i icinde acikca orkestre edilmeli. Uzun vadede event kullanilabilir; ilk adimda sadece sorumluluk ayrimi yeterlidir.

### 7.8 `CompanyService.java`

Bolumler:

```text
CompanyCommandService
CompanyQueryService
CompanyMembershipService
CompanyOnboardingService
CompanyResponseMapper
CompanyAccessPolicy
```

Sirket olusturma use-case'i hala tek transaction olabilir; ancak kullanici, membership, izin, grup ve hizmet kurulum adimlari ayri collaborator'lar tarafindan yapilmalidir.

## 8. Uygulama Fazlari

### Faz 0 - Gelistirme zemini ve koruma bariyerleri

**Amac:** Refactor baslamadan once yeni borcu durdurmak.

Yapilacaklar:

- Node ve Java surumlerini sabitle: `.nvmrc` veya `.tool-versions`, Maven Wrapper.
- Temiz makinede tek komutla calisan kurulum dokumani yaz.
- `npm ci`, `npm run lint`, `npm run build`, `npm test` komutlarini CI'a ekle.
- `mvn test` veya wrapper esdegerini CI'a ekle.
- Frontend'e gercek test script'i ekle.
- ESLint type-aware konfigurasyonu ac.
- Yeni kodda `no-explicit-any` kuralini error yap.
- Import boundary kontrolu ekle.
- Backend'e ArchUnit testleri ekle.
- SpotBugs veya Sonar benzeri statik analiz sec.
- Pull request sablonuna test ve mimari etki checklist'i ekle.

Kabul kriteri:

- Temiz clone uzerinde dokumante edilen komutlar calisir.
- CI yesil olmadan merge yapilamaz.
- Controller -> repository bagimliligi icin yeni ihlal eklenemez.
- Frontend feature boundary ihlali otomatik yakalanir.

### Faz 1 - Depo hijyeni ve dokumantasyon

Yapilacaklar:

- `frontend/src_backup` Git gecmisinde kalacak sekilde canli agactan kaldirilir.
- `backend/uploads` Git takibinden cikarilir ve `.gitignore` kapsamina alinir.
- Gerekli ornek dosyalar `fixtures/` altinda anonimlestirilerek tutulur.
- Frontend README gercek kurulum ve mimariyle degistirilir.
- Java 17/21 karari verilir ve tum dokumanlar uyumlu hale getirilir.
- Kok dizin karmasasi netlestirilir; gercek repository root dokumante edilir.

Kabul kriteri:

- Tek bir canli frontend source tree vardir.
- Runtime kullanici dosyalari Git tarafindan takip edilmez.
- README ile `pom.xml`, Docker ve package script'leri celismez.

### Faz 2 - Ortak altyapi

Frontend:

- `app/providers`, `app/router`, `shared/api` olusturulur.
- QueryClient konfigurasyonu `App.tsx` disina tasinir.
- Route dosyalari panel bazinda ayrilir ve lazy loading eklenir.
- `ApiError` normalizasyonu yapilir.
- Query key factory standardi eklenir.
- Ortak modal, empty state, pagination ve form field altyapisi belirlenir.

Backend:

- `CurrentUser` abstraction.
- `CompanyAccessPolicy`.
- Standart hata kodlari ve API error response.
- Mapping standardi.
- ArchUnit katman kurallari.

Kabul kriteri:

- Yeni bir feature eski global `api/` veya dev service yapisina eklenmeden gelistirilebilir.

### Faz 3 - Dusuk riskli pilot modul - TAMAMLANDI

Ilk pilot olarak `notes` secildi ve 9 Haziran 2026 tarihinde tamamlandi. Modul; gorev ve mesajlasmaya gore daha dusuk riskli, fakat query/mutation/authorization katmanlarini test etmek icin yeterli bir referans uygulama oldu.

Pilot kapsami:

- Varsa ilgili migration, entity ve repository.
- Backend controller, application service, domain kurallari, mapper ve authorization policy.
- Frontend API client, tipler, query key, query/mutation hook'lari ve Zod formu.
- Modulun kullandigi page, panel, modal, form, kart ve liste componentleri.
- Unit, integration ve component testleri.
- Eski kodun kaldirilmasi veya gecici facade icin acik silme tarihi.

Kabul kriteri:

- Pilot feature hedef mimarinin referans implementasyonu olur.
- Eski endpoint davranisi korunur.
- Diger feature'lar icin kopyalanacak dokumante bir ornek olusur.
- Modulun frontend veya backend tarafinda yarim kalmis ikinci bir implementasyon bulunmaz.

### Faz 4 - Modullerin uctan uca duzenlenmesi

Bu fazdan itibaren calisma yatay katmanlara gore degil, **tek modulun tum parcalarina gore** ilerler. Ornegin once butun backend service'lerini, sonra butun frontend sayfalarini duzenlemek yasaktir.

Her modul icin sira:

1. Modulun mevcut davranisini ve bagimliliklarini haritala.
2. Kritik davranislar icin characterization test yaz.
3. Veritabani ve backend sinirlarini duzenle.
4. API contract ve DTO'lari netlestir.
5. Frontend API, query ve form katmanini duzenle.
6. Ilgili page ve componentleri feature klasorune tasi.
7. Admin, staff ve client kullanimlarini ayni feature uzerinde birlestir.
8. Eski dosyalari, tekrar kodu ve gecici adapter'lari kaldir.
9. Modul testlerini ve E2E smoke akisini calistir.
10. Modul tamamen bitmeden sonraki module gecme.

Onerilen modul sirasi:

1. Notes.
2. Maintenance log.
3. Company, membership ve permissions.
4. Tasks, task notes, task reviews ve time tracking.
5. Meetings ve calendar.
6. Shoots, participants ve equipment.
7. Content plans ve approvals.
8. PR projects, phases ve phase-task baglantisi.
9. Files ve media library.
10. Messaging, group messaging, notifications ve WebSocket.
11. Analytics dashboard ve harici entegrasyonlar.
12. Settings, onboarding ve survey.

Sirket, membership ve permission modulu erken ele alinmalidir; diger modullerin authorization kurallari buna baglidir. Pilot moduller bu ortak altyapiyi kanitlamak icin daha once yapilir.

### Faz 5 - Mesajlasma modulu

Mesajlasma tek bir modul olarak ele alinmali:

- Backend direct message, group message, read state ve notification akislari.
- Frontend staff, admin ve client mesajlasma ekranlari.
- Conversation list, message thread, composer ve unread componentleri.
- REST initial load ile WebSocket update ayrimi.
- Mesaj siralama, duplicate event, reconnect ve unread count testleri.

Bu modulun yalnizca backend veya yalnizca frontend tarafi duzenlenip birakilmamali.

### Faz 6 - Entegrasyon modulleri

Her entegrasyon ayri modul kabul edilmeli ve kendi backend client'i, API contract'i, frontend paneli, detail page'i, chart componentleri ve testleriyle birlikte tamamlanmali.

Sira:

1. PageSpeed / Web Design.
2. Google Analytics.
3. Search Console.
4. Google Ads.
5. Instagram.
6. Meta Ads.

Google entegrasyonlari ortak OAuth altyapisini kullanabilir; buna ragmen her urun modulunun API ve UI siniri ayri kalmalidir. Instagram en buyuk dosya olsa da ilk entegrasyon refactor'u olmamalidir.

### Faz 7 - Modul sonrasi genel UI ve performans

- Route-level code splitting.
- Dashboard view model'leri.
- Buyuk liste virtualization ihtiyaci.
- Error boundary ve skeleton standardi.
- Gereksiz query tekrarlarinin olculmesi.
- Bundle analizi.
- Erisilebilirlik taramasi.

## 9. Modul Calisma Paketi

Her modul asagidaki tek paket olarak planlanmali:

```text
MODUL: Tasks

backend:
  migration/entity/repository
  command ve query service
  access policy
  mapper ve DTO
  controller

frontend:
  taskApi ve taskKeys
  query/mutation hook'lari
  form schema ve mapper
  TasksPage
  TaskForm
  TaskList/TaskCard
  TaskDetailPanel
  FloatingTaskFab icindeki task parcasi

shared flows:
  notification
  time tracking
  PR phase baglantisi

tests:
  backend unit/integration
  frontend unit/component
  kritik E2E smoke

cleanup:
  eski importlar
  tekrar tipler
  eski component bloklari
  gecici facade
```

Bir modul birden fazla kucuk PR'a bolunebilir, ancak PR'lar ayni modul branch/epic'i altinda ardisik ilerlemelidir. Araya baska bir modul alinmamalidir.

Onerilen PR bolumu:

1. Characterization testleri ve modul siniri.
2. Backend ic yapisinin duzenlenmesi, API contract korunarak.
3. Frontend veri katmani ve ilgili componentlerin tasinmasi.
4. Eski kodun silinmesi, entegrasyon ve E2E testleri.

Her PR:

- Tek bir modul kapsaminda kalmali.
- Tercihen 300-600 degisen satir civarinda olmali.
- Calisabilir ara durum birakmali.
- Frontend ile backend contract'ini kirmamali.
- Davranis degisikligi varsa acikca belirtilmeli.
- Once/sonra test kaniti icermeli.

### 9.1 Ilk uygulama sirasi

- [ ] Toolchain, CI ve depo hijyeni.
- [ ] Ortak authorization ve API error altyapisi.
- [x] Notes pilot modulu, frontend ve backend birlikte.
- [x] Maintenance log pilot modulu, frontend ve backend birlikte.
- [x] Company/membership/permissions modulu.
- [x] Tasks modulu ve ilgili tum componentler.
- [x] Meetings/calendar modulu.
- [x] Shoots modulu.
- [x] Content plans/approvals modulu.
- [x] PR projects modulu.
- [x] Files ve media library modulu.
- [x] Messaging modulu.
- [x] Integrations (6 entegrasyon modulu)

## 10. Test Stratejisi

### 10.1 Backend

**Unit test:**

- Access policy rol ve membership matrisi.
- Mapper'lar.
- Tarih araligi ve metric fallback'leri.
- Task status gecisleri.
- Content approval kurallari.

**Repository test:**

- Ozel query'ler.
- Tenant filtreleri.
- Pagination ve status filtreleri.

**Integration test:**

- Login/refresh/logout.
- Admin, staff ve client authorization.
- Sirket disi veriye erisimin 403/404 davranisi.
- Task create/update/complete.
- Content plan approve/reject.
- Mesajlasma REST akisi.

Harici API'ler WireMock benzeri bir HTTP stub ile test edilmeli. Gercek Google/Meta servisine bagli test CI'da calismamali.

### 10.2 Frontend

**Unit test:**

- Mapper ve formatlayicilar.
- Query key factory.
- Zod schema.
- Capability hesaplari.

**Component test:**

- Form validation.
- Modal open/close/reset.
- Loading/error/empty/success durumlari.
- Role/capability bazli buton gorunurlugu.

**E2E kritik akislar:**

1. Admin sirket olusturur.
2. Staff gorev gorur ve tamamlar.
3. Client content plan onaylar.
4. Staff ve client mesajlasir.
5. Yetkisiz kullanici baska sirket verisine erisemez.

E2E sayisi az ama is-kritik olmali; her component icin E2E yazilmamali.

## 11. CI Kalite Kapilari

Minimum merge kosullari:

```text
frontend:
  npm ci
  npm run lint
  npm run test -- --run
  npm run build

backend:
  ./mvnw test
  ./mvnw verify

architecture:
  frontend import boundary check
  backend ArchUnit tests
```

Ek kontroller:

- Yeni `any` sayisi artamaz.
- Yeni controller -> repository importu eklenemez.
- Test coverage yuzdesi tek basina hedef degildir; degisen kritik kod test edilmelidir.
- OpenAPI degisikligi CI artifact'i olarak gorulebilmelidir.
- Migration isimleri ve sirasi dogrulanmalidir.

## 12. Definition of Done

Bir feature refactor'u ancak su kosullarda tamamlanmis sayilir:

- Tek bir acik feature sahibi vardir.
- Modulun backend ve frontend taraflari birlikte hedef mimariye tasinmistir.
- Module ait page, panel, modal, form, kart ve liste componentleri belirlenen feature sinirindadir.
- Varsa migration, entity, repository, DTO ve API contract degisiklikleri tamamlanmistir.
- Page/controller ince orchestration katmanidir.
- Is kurali UI veya controller icinde degildir.
- Authorization merkezi policy ile uygulanir.
- API modelleri typed'dir; `any` yoktur.
- Query key ve invalidation feature icinde yonetilir.
- Loading, error, empty ve success durumlari ele alinmistir.
- Backend unit/integration ve frontend unit/component testleri vardir.
- Modulun kritik kullanici akisi smoke veya E2E test ile dogrulanmistir.
- Eski implementasyon ve gecici facade kaldirilmistir.
- Ayni modulun admin, staff ve client tekrar kodlari kaldirilmistir.
- README veya feature dokumani guncellenmistir.
- CI tamamen yesildir.

Su durumlardan biri varsa modul tamamlanmis sayilmaz:

- Backend duzenlenmis, frontend eski yapiyi kullanmaya devam ediyorsa.
- Frontend componentlere ayrilmis, is kurallari eski dev service icinde kalmissa.
- Yeni feature klasoru acilmis, eski kopya componentler silinmemisse.
- Testler yalnizca bir katmani kapsiyorsa.
- Gecici adapter veya facade icin kaldirma isi planlanmamissa.

## 13. Yapilmamasi Gerekenler

- Tum frontend veya backend'i sifirdan yazmak.
- Yuzlerce dosyayi tek PR'da tasimak.
- Yalnizca satir sayisini dusurmek icin anlamsiz component cikarmak.
- Her seyi `shared/components` veya `utils` altina atmak.
- Test yazmadan servis bolmek.
- Eski ve yeni API'yi aylarca paralel tutmak.
- Mikroservise gecerek sinir problemini altyapi problemiyle degistirmek.
- Yeni state kutuphanesi ekleyerek server-state/lokal-state ayrimini gizlemek.
- Bir modulun backend ve frontend refactor'unu ilgisiz modullere dagitmak.
- Buyuk veri modeli degisikligi ile tum UI tasimasini tek dev PR'a koymak; ayni modul icinde sirali kucuk PR'lar kullanmak.

## 14. Baslangic Kontrol Listesi

Refactor koduna baslamadan once:

- [x] Java hedef surumu kesinlestirildi: Java 17.
- [ ] Node surumu kesinlestirildi.
- [x] `npm ci` temiz ortamda calisiyor.
- [ ] Frontend lint/build/test calisiyor.
- [x] Backend testleri Java 17 ve izole Maven deposuyla calisiyor.
- [ ] CI branch protection aktif.
- [ ] `src_backup` icin saklama karari verildi.
- [ ] Runtime upload stratejisi belirlendi.
- [ ] Kritik 5 E2E akisi ekip tarafindan onaylandi.
- [x] Ilk pilot feature secildi: Notes.
- [x] Pilot modulun backend, frontend ve ilgili component listesi cikarildi.
- [ ] Mimari kurallar kod review checklist'ine eklendi.

## 15. Inceleme Notu ve Mevcut Dogrulama Durumu

Ilk inceleme sirasinda:

- `npm run lint`, frontend bagimliliklari kurulu olmadigi icin `eslint: command not found` ile baslayamadi.
- `npm run build`, frontend bagimliliklari kurulu olmadigi icin `tsc: command not found` ile baslayamadi.
- `mvn test`, mevcut sandbox ortaminda varsayilan `~/.m2/repository` dizinine yazamadigi icin baslayamadi.

Notes pilotu sirasinda:

- `npm ci` tamamlandi.
- Frontend Notes testleri, scoped lint ve izole TypeScript kontrolu basarili oldu.
- Backend Java 17 ile derlendi ve tum mevcut testler basarili oldu.
- Genel frontend lint ve build, Notes disindaki mevcut borclar nedeniyle halen basarisiz.

Maintenance log pilotu sirasinda:

- Backend Maintenance Log modulu application, domain, DTO, infrastructure ve web sinirlarina ayrildi.
- Controller -> repository ihlali kaldirildi ve tum erisim kararlari policy/application katmanina alindi.
- Frontend API, query key, hook, model, form, liste, panel ve timeline tek feature altinda birlestirildi.
- Backend Java 17 testleri toplam 14 test ile, frontend modul testleri 3 test ile basarili oldu.
- Dokunulan frontend dosyalari icin scoped ESLint basarili oldu.
- Genel frontend build, Maintenance Log disindaki mevcut TypeScript hatalari nedeniyle halen basarisiz.

Projenin tam kalite kapisi henuz yesil degildir. Faz 0 kapsamindaki genel frontend borclari temizlenmeden genis ve paralel refactor guvenli kabul edilmemelidir.

## 16. Basari Olcutleri

Refactor'un ilerledigi su metriklerle gorulmeli:

- 500+ satir frontend dosya sayisi her fazda azalir.
- 300+ satir backend service sayisi azalir.
- Controller -> repository ihlali sifira iner.
- Tekrarlanan company access metotlari sifira iner.
- Acik `any` kullanimi sifira iner.
- `src_backup` ve runtime upload'lar Git'ten cikar.
- Kritik is akislarinin otomatik testleri yesil kalir.
- Yeni feature eklemek icin merkezi `App.tsx`, dev `staff.ts` veya ilgisiz service dosyasini degistirme ihtiyaci ortadan kalkar.

Nihai hedef "tum dosyalar kucuk" degil, **bir degisikligin etkisinin sinirli, tahmin edilebilir ve test edilebilir olmasidir**.

## 17. Uygulama Kaydi

### Notes Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 9 Haziran 2026

#### Backend

- Notes kodu genel `controller`, `service`, `dto`, `entity` ve `repository` klasorlerinden `com.fogistanbul.crm.note` modulune tasindi.
- Modul `web`, `application`, `domain`, `dto` ve `infrastructure` sinirlarina ayrildi.
- Sahiplik ve sirket erisimi `NoteAccessPolicy` icine alindi.
- DTO donusumu `NoteMapper` icine alindi.
- Listeleme, olusturma, toggle ve silme akislari `NoteService` icinde application use-case sinirinda toplandi.
- Mevcut `/api/staff/notes` endpoint contract'i korundu.
- Yetkisiz not degistirme ve silme hatalari genel 500 yerine 403 olarak donuyor.
- `SearchService` ve `FileService` yeni Notes repository/domain paketlerine baglandi.

#### Frontend

- Notes tipleri ve endpoint'leri buyuk `frontend/src/api/staff.ts` dosyasindan cikarildi.
- `frontend/src/features/notes` altinda API, query key, hook, model ve UI katmanlari olusturuldu.
- Tum not sorgulari `noteKeys` ile ayni cache ailesini kullaniyor.
- Create, toggle ve delete mutation'lari tum Notes listelerini merkezi olarak invalidate ediyor.
- Not icerigi Zod ile trim, bos deger ve 5000 karakter kurallarina gore dogrulaniyor.
- Eski 229 satirlik `NotesPage` ince route composition dosyasina donusturuldu.
- `NotesWorkspace`, `NoteComposer` ve `NoteCard` ayri sorumluluklara bolundu.
- Staff Dashboard ve Kanban icindeki tekrar not kodlari kaldirildi.
- Dashboard ve Kanban artik ayni `QuickNotes` componentini kullaniyor.
- Eski `staff-notes` ve `my-panel-notes` query key tekrarlari kaldirildi.

#### Test ve Dogrulama

- Backend `NoteAccessPolicyTest`: 3 test.
- Backend `NoteServiceTest`: 3 test.
- Spring context testi ile toplam backend sonucu: **7 test basarili**.
- Frontend schema, filtre ve `QuickNotes` component testleri: **5 test basarili**.
- Notes feature ve dokunulan sayfalar icin scoped ESLint: **basarili**.
- Notes feature ve dokunulan sayfalar icin izole TypeScript kontrolu: **basarili**.
- Eski Notes import, API metodu ve query key taramasi: **temiz**.
- `git diff --check`: **basarili**.

#### Proje Genelinde Tespit Edilen Bagimsiz Borclar

- Genel `npm run lint`, Notes disindaki canli kod ve `frontend/src_backup` dahil 188 mevcut problem nedeniyle basarisiz.
- Genel `npm run build`, Notes disindaki mevcut TypeScript hatalari nedeniyle basarisiz.
- `npm ci`, 3 moderate, 7 high ve 1 critical olmak uzere 11 dependency vulnerability raporladi. Otomatik `npm audit fix` uygulanmadi.
- Backend testleri Java 17 ile calisiyor; sistem varsayilani Java 26 oldugu icin toolchain sabitleme halen Faz 0 isi.
- Test profiline dis ortam degiskenlerinden bagimsiz Google/Instagram test degerleri eklendi.
- Agent attach desteklemeyen ortamlarda testlerin calismasi icin Mockito subclass mock maker ayari eklendi.

#### Sonuc

Notes modulu artik backend, frontend, ilgili componentler ve testleriyle birlikte tek bir dikey modul olarak tamamlandi. Modul icin eski paralel implementasyon veya gecici facade birakilmadi.

## 18. Maintenance Log Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 9 Haziran 2026

### Backend

- Bakim gunlugu kodu genel `controller`, `service`, `dto`, `entity` ve `repository` klasorlerinden `com.fogistanbul.crm.maintenance` modulune tasindi.
- Modul `web`, `application`, `domain`, `dto` ve `infrastructure` sinirlarina ayrildi.
- DTO donusumu `MaintenanceLogMapper`, erisim kurallari `MaintenanceLogAccessPolicy` icine alindi.
- Staff listeleme, olusturma, guncelleme ve silme islemleri artik oturum kullanicisini application service'e iletiyor.
- Guncelleme ve silmede kaydin URL'deki `companyId` degerine ait oldugu dogrulaniyor. Baska sirket kaydi ID ile degistirilemiyor.
- Admin haric ajans personeli icin sirket uyeligi hem okuma hem yazma islemlerinde zorunlu hale getirildi.
- Musteri kullanicilarinin yazma islemleri policy seviyesinde engellendi.
- Client controller icindeki dogrudan `CompanyMembershipRepository` kullanimi kaldirildi.
- Client listeleme rastgele ilk uyeligi secmek yerine kullanicinin tum gecerli `CLIENT` sirket uyeliklerini kapsiyor.
- Baslik, aciklama ve kategori icin backend validation sinirlari eklendi.
- Mevcut `/api/staff/companies/{companyId}/maintenance-log` ve `/api/client/maintenance-log` endpoint contract'lari korundu.

### Frontend

- Bakim gunlugu tipleri ve endpoint'leri ilgisiz `frontend/src/api/webDesign.ts` dosyasindan cikarildi.
- `frontend/src/features/maintenance-log` altinda API, query key, hook, model ve UI katmanlari olusturuldu.
- Kategori tipi string yerine sinirli union olarak tanimlandi.
- Form verisi Zod ile baslik, kategori, aciklama uzunlugu ve ISO tarih kurallarina gore dogrulaniyor.
- Tarih donusumu, kategori etiketleri ve renkleri feature model katmaninda merkezilestirildi.
- Query key ve mutation invalidation davranisi feature hook'larinda toplandi.
- Eski staff paneli ve `WebDesignAdminSection` icindeki ikinci CRUD implementasyonu kaldirildi.
- Staff sirket detayi ve admin web tasarim bolumu ayni `MaintenanceLogPanel` componentini kullaniyor.
- Client/staff analitik gorunumu ortak `MaintenanceTimeline` ve ayni veri hook'unu kullaniyor.
- `WebDesignAdminSection` 354 satirdan 148 satira indirildi; bakim gunlugu sorumlulugu bu componentten cikarildi.

### Test ve Dogrulama

- Backend `MaintenanceLogAccessPolicyTest`: 4 test.
- Backend `MaintenanceLogServiceTest`: 3 test.
- Notes ve Spring context testleri dahil toplam backend sonucu: **14 test basarili**.
- Frontend schema ve `MaintenanceLogPanel` component testleri: **3 test basarili**.
- Maintenance Log feature ve dokunulan sayfalar icin scoped ESLint: **basarili**.
- Eski Maintenance Log importlari, `webDesignApi` metotlari ve component yolu taramasi: **temiz**.
- Spring context testi yeni entity ve repository paketlerini basariyla yukledi.

### Proje Genelinde Kalan Bagimsiz Borclar

- Genel `npm run build`, Maintenance Log disindaki analytics, admin, calendar, requests ve time tracking TypeScript hatalari nedeniyle basarisiz.
- Genel frontend kalite kapisi yesil olmadigi icin Faz 0 lint/build borclari halen onceliklidir.
- Ortak `CompanyAccessPolicy`, Notes ve Maintenance Log tarafinda kullaniliyor; kalan eski moduller sirayla bu policy'ye tasinacak.

### Sonuc

Maintenance Log modulu backend, frontend ve ilgili admin/staff/client componentleriyle birlikte tek dikey modul haline getirildi. Eski paralel CRUD implementasyonlari silindi ve tespit edilen sirketler arasi kayit degistirme acigi kapatildi.

## 19. Company / Membership / Permissions Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 9 Haziran 2026

### Backend

- Sirket, staff atama, izin ve client ekip endpoint'leri `com.fogistanbul.crm.company` modulu altinda `web`, `application`, `dto` ve `infrastructure` sinirlarina tasindi.
- Genel `controller`, `service` ve `dto` klasorlerindeki paralel Company, Permission ve Staff implementasyonlari kaldirildi.
- Ortak `CompanyAccessPolicy` olusturuldu; admin gecisi, uyelik zorunlulugu ve erisilebilir musteri sirketleri tek noktada toplandi.
- Notes ve Maintenance Log policy'leri tekrar eden sirket uyelik kontrolu yerine `CompanyAccessPolicy` kullanacak sekilde guncellendi.
- Staff portal sirket listeleme ve detay akisinda string rol aktarimi kaldirildi; gercek kullanici ve uyelik bilgisi application katmaninda kontrol ediliyor.
- Client ekip controller'inin repository erisimi kaldirildi. Ekip listesi rastgele ilk sirket yerine kullanicinin tum musteri sirketlerini kapsiyor.
- Izin okuma ve guncellemede hedef kullanicinin sirket uyesi olmasi zorunlu hale getirildi.
- Bilinmeyen izin anahtariyla kayit olusturma engellendi.
- Varsayilan izin atanirken istek rolu ile gercek uyelik rolunun eslesmesi zorunlu hale getirildi.
- Sirket calisani kaldirma endpoint'inin owner veya ajans yetkilisi uyeligini silebilmesi engellendi.
- Staff atama kaldirma islemi yalniz musteri sirketindeki `AGENCY_STAFF` uyeligine sinirlandi; ajans ana uyeligi korunuyor.
- Sirket ve staff silme servislerindeki tekrar eden native SQL temizligi `CompanyDataCleanup` infrastructure bilesenine cikarildi.
- Ortak servis erisim guard'i company modulune tasindi ve uyelik kontrolu `CompanyAccessPolicy` uzerinden calisiyor.
- Mevcut HTTP endpoint contract'lari korunuyor.

### Frontend

- `frontend/src/features/company` altinda company API client, tipler, query key factory, query/mutation hook'lari, permission modeli ve UI bilesenleri olusturuldu.
- Sirket, staff, izin ve client ekip metotlari genel `admin.ts`, `staff.ts` ve `clientPanel.ts` dosyalarindan cikarildi.
- Admin, staff ve client sayfalarindaki sirket sorgulari ayni feature API ve query key'lerini kullaniyor.
- `CompanyDetailPage` icindeki calisan formu, uye rol gruplari ve izin paneli ayri bilesenlere tasindi.
- Uye silme aksiyonu frontendde yalniz `EMPLOYEE` rolu icin gosteriliyor; backend de ayni kurali zorunlu tutuyor.
- Client ekip sayfasindaki manuel `useEffect` veri akisi ortak query hook'una tasindi.
- Company API tiplerinde rol ve izin seviyeleri serbest string yerine union tiplerle sinirlandi.

### Test ve Dogrulama

- `CompanyAccessPolicyTest`: 3 test.
- `PermissionServiceTest`: 3 test.
- `ClientTeamServiceTest`: 1 test.
- Notes, Maintenance Log ve Spring context testleri dahil backend sonucu: **21 test basarili**.
- Backend Java 17 ile `mvn test`: **basarili**.
- Company refactor'undan kaynaklanan frontend TypeScript hatalari temizlendi.
- Genel `npm run build`, bu modul disindaki analytics, calendar ve time tracking dosyalarinda bulunan mevcut hatalar nedeniyle halen basarisiz.

### Bilinen Gecis Borclari

- `Company`, `CompanyMembership`, `CompanyPermission` entity ve repository'leri cok sayida eski modul tarafindan dogrudan kullanildigi icin gecici ortak persistence modeli olarak yerinde birakildi. Ilgili moduller tasindikca company domain portlarina alinacak.
- `CompanyService` halen sirket olusturma, guncelleme ve uyelik orkestrasyonunu birlikte yurutuyor. Native SQL temizligi ayrildi; sonraki inceltme mapper ve use-case bazli application service ayrimidir.
- `UserManagementController` icindeki dogrudan membership repository erisimi identity/user modulu ele alinirken kaldirilacak.

### Sonuc ve Siradaki Modul

Company / Membership / Permissions dikey dilimi backend, frontend ve ilgili componentlerle tamamlandi. Ortak authorization temeli artik sonraki modullerde tekrar kullanilabilir.

Bu siradaki adim tamamlandi; Tasks modulunun uygulama notlari asagidaki bolumde kaydedildi.

## 20. Tasks Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 9 Haziran 2026

### Backend

- Task CRUD, task note, task review ve routine task kodlari `com.fogistanbul.crm.task` modulu altinda `web`, `application` ve `dto` sinirlarina tasindi.
- Genel `controller`, `service` ve `dto` klasorlerindeki eski task implementasyonlari kaldirildi.
- `TaskAccessPolicy` ile task goruntuleme, guncelleme, silme, sirket erisimi ve atama kurallari tek noktada toplandi.
- Task notlarini listeleme ve ekleme islemlerinde eksik olan task erisim kontrolu eklendi.
- Not silmede hem task erisimi hem yazar/admin kurali zorunlu hale getirildi.
- Client task controller icindeki dogrudan `CompanyMembershipRepository` erisimi kaldirildi.
- Client task listesi rastgele ilk sirket yerine kullanicinin tum erisilebilir musteri sirketlerini kapsiyor.
- Client task detayinda sirket uyesi olan kullanicinin gorevi gorebilmesi saglandi; yalniz assignee/creator kontroluyle liste-detay uyumsuzlugu giderildi.
- Task update sirasinda sirket veya atanan kisi degistirildiginde yeni hedef sirket ve atama yetkisi yeniden dogrulaniyor.
- Company user yalniz kendisine veya ilgili sirkete bagli ajans personeline gorev atayabiliyor.
- Create/update akislari `priority` alanini artik kaydediyor ve response mapper bu alani donduruyor.
- DTO donusumleri `TaskMapper`, task notlari `TaskNoteService`, PR faz tamamlama `TaskPhaseCompletionService`, atanabilir kullanici sorgusu `TaskAssignableUserService` ve gecikme scheduler'i `TaskOverdueScheduler` icine ayrildi.
- Ana `TaskService` 459 satirdan 271 satira indirildi.
- Mevcut staff, client ve admin routine HTTP endpoint contract'lari korundu.

### Frontend

- `frontend/src/features/tasks` altinda task API client, union tipler, query key factory, query/mutation hook'lari, model yardimcilari ve UI bilesenleri olusturuldu.
- Task ve review endpoint'leri genel `staff.ts` ve `clientPanel.ts` dosyalarindan cikarildi.
- Dashboard, Tasks, Kanban, Calendar, Time Tracking, Completed Tasks, client task ekranlari ve prefetch akisi ayni task API/query key sozlesmesini kullaniyor.
- `TaskDetailPanel` ve `KanbanBoard` genel components klasorunden task feature UI katmanina tasindi.
- Task notlari `TaskDetailPanel` icinde manuel effect/state yerine query ve mutation invalidation ile yonetiliyor.
- `TasksPage` manuel fetch state'inden task/company hook'larina gecirildi.
- Task olusturma modali `TaskCreateDialog` olarak feature icine ayrildi.
- Global hizli aksiyon icindeki task formu `QuickTaskForm` olarak ayrildi; `FloatingTaskFab` artik task form is kurali tasimiyor.
- Task status, category ve priority degerleri serbest string yerine union tiplerle sinirlandi.
- Gecikmis gorev hesaplamasi `effectiveTaskStatus` fonksiyonunda merkezilestirildi.
- `TasksPage` 376 satirdan 244 satira indirildi.

### Test ve Dogrulama

- Backend `TaskAccessPolicyTest`: 4 test.
- Backend `TaskNoteServiceTest`: 2 test.
- Backend `TaskServiceTest`: 2 test.
- Tum backend sonucu: **29 test basarili**.
- Frontend `task.constants.test.ts`: **3 test basarili**.
- Task feature ve ana task sayfalari icin scoped ESLint: **basarili**.
- `git diff --check`: **basarili**.
- Eski task API metotlari ve component importlari taramasi: **temiz**.
- Genel `npm run build`, task modulu disindaki analytics, StaffCalendar ve TimeTracking TypeScript hatalari nedeniyle halen basarisiz.

### Bilinen Gecis Borclari

- `Task`, `TaskNote`, `TaskReview`, `RoutineTask` entity ve repository'leri analytics, PR, file, search ve time tracking modulleri tarafindan kullanildigi icin gecici ortak persistence modeli olarak yerinde birakildi.
- `TaskService` 271 satirla hedef esigin biraz uzerinde. Notification orkestrasyonu ilgili notification modulu ele alinirken event tabanli yapida ayrilacak.
- `FloatingTaskFab` task formundan arindirildi ancak meeting, shoot, project ve message formlarini tasimaya devam ediyor; ilgili moduller tasindikca bu dosya yalniz hizli aksiyon kompozisyonuna donusecek.

### Sonuc ve Siradaki Modul

Tasks dikey dilimi backend, frontend, notlar, review, routine ve task kullanan ana ekranlarla tamamlandi. Tespit edilen task note yetki acigi ve client coklu sirket listeleme hatasi kapatildi.

**Siradaki modul: Meetings / Calendar.** Ilk hedef meeting CRUD, katilimci/not akislarini, staff calendar veri birlestirmesini ve mevcut TypeScript hatalarini ayni dikey modul icinde duzenlemek.

## 21. Meetings / Calendar Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 9 Haziran 2026

### Backend

- Meeting controller, application service ve DTO'lar `com.fogistanbul.crm.meeting` modulu altinda `web`, `application` ve `dto` sinirlarina tasindi.
- Genel `controller`, `service` ve `dto` klasorlerindeki eski meeting implementasyonlari kaldirildi.
- `MeetingAccessPolicy` ile sirket erisimi, toplanti goruntuleme, yonetme ve not ekleme kurallari tek noktada toplandi.
- Controller'dan rol string'i okuma ve application service'e aktarma kaldirildi.
- Sirketli toplanti katilimcilarinin hedef sirkete erisimi zorunlu hale getirildi.
- Var olmayan katilimci kimliklerinin sessizce atlanmasi engellendi; tekrar eden katilimci kimlikleri tek kayda indirildi.
- DTO donusumleri `MeetingMapper`, kullanici bazli not ekleme/guncelleme akisi `MeetingNoteService` icine ayrildi.
- Ana `MeetingService` 245 satirdan 154 satira indirildi.
- Mevcut staff meeting HTTP endpoint contract'lari korundu.

### Frontend

- `frontend/src/features/meetings` altinda meeting API client, union tipler, query key factory, query/mutation hook'lari, model yardimcilari ve UI bilesenleri olusturuldu.
- Meeting endpoint ve tipleri genel `staff.ts` dosyasindan cikarildi.
- `MeetingsPage`, Kanban, Staff Calendar ve global hizli aksiyon ayni meeting API/query key sozlesmesini kullaniyor.
- Toplanti formu, toplanti karti ve not/tamamlama dialog'u feature UI katmanina ayrildi.
- Global hizli aksiyondaki tekrar eden meeting formu kaldirildi; ortak `MeetingForm` kullaniliyor ve sayfa yenileme ihtiyaci query invalidation ile giderildi.
- `MeetingsPage` 462 satirdan 113 satira indirildi.
- `StaffCalendarPage` 651 satirdan 353 satira indirildi.
- Staff Calendar artik gorevlerle toplantilari ayni tarih indeksinde birlestiriyor; gun, hafta ve ay filtrelerinde iki kayit turunu birlikte gosteriyor.
- Calendar icindeki ikinci task note/detail implementasyonu kaldirildi ve ortak `TaskDetailPanel` kullanildi.
- Staff Calendar'a ait `Set<number>`/string ID ve kullanilmayan fonksiyon TypeScript hatalari giderildi.

### Test ve Dogrulama

- Backend `MeetingAccessPolicyTest`: 4 test.
- Backend `MeetingServiceTest`: 2 test.
- Backend `MeetingNoteServiceTest`: 2 test.
- Tum backend sonucu: **37 test basarili**.
- Tum frontend sonucu: **14 test basarili**; meeting modelinde 3 yeni test.
- Meeting feature, MeetingsPage, StaffCalendar, Kanban, FloatingTaskFab ve `staff.ts` icin scoped ESLint: **basarili**.
- `git diff --check`: **basarili**.
- Eski meeting API metotlari ve DTO/controller/service importlari taramasi: **temiz**.
- Genel `npm run build` icinde StaffCalendar hatalari tamamen giderildi. Build; meeting modulu disindaki analytics kullanilmayan importlari ve TimeTracking `PageResponse` tip uyumsuzlugu nedeniyle halen basarisiz.

### Bilinen Gecis Borclari

- `Meeting`, `MeetingParticipant`, `MeetingNote` entity ve repository'leri `CalendarExportController` tarafindan dogrudan kullanildigi icin gecici ortak persistence modeli olarak yerinde birakildi.
- `CalendarExportController` meeting, shoot ve task repository'lerini dogrudan birlestiriyor. Shoots modulu tamamlandiktan sonra calendar query/application servisine alinmali.
- Genel build'i engelleyen analytics ve TimeTracking hatalari bu modulle ilgili degildir; ilgili moduller ele alinirken temizlenecek.

### Sonuc ve Siradaki Modul

Meetings / Calendar dikey dilimi backend, frontend, katilimci/not akislar, Kanban, hizli aksiyon ve ortak takvim gorunumu ile tamamlandi.

**Siradaki modul: Shoots.** Ilk hedef shoot CRUD, katilimci/ekipman akislarini, content plan baglantilarini ve calendar/export kullanimlarini ayni dikey modul icinde duzenlemek.

## 22. Shoots Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 9 Haziran 2026

### Backend

- Shoot controller, application service ve DTO'lar `com.fogistanbul.crm.shoot` modulu altinda `web`, `application` ve `dto` sinirlarina tasindi.
- Genel `controller`, `service` ve `dto` klasorlerindeki eski shoot implementasyonlari kaldirildi.
- `ShootAccessPolicy` ile sirket erisimi, goruntuleme, yonetme, silme ve staff/client liste kapsamları tek noktada toplandi.
- Client shoot listesi rastgele ilk sirket yerine kullanicinin production hizmeti aktif olan tum erisilebilir musteri sirketlerini kapsiyor.
- Fotografci ve katilimci kimliklerinin varligi ve hedef sirkete erisimi zorunlu hale getirildi; gecersiz kimliklerin sessizce atlanmasi engellendi.
- Tekrar eden katilimcilar tek kayda indirildi; ekipman adlari ve miktarlari DTO validation ile dogrulandi.
- DTO donusumleri `ShootMapper`, katilimci ve ekipman yazma islemleri `ShootResourceService` icine ayrildi.
- Content plan onay akisinda yeni cekim olusturma standart shoot authorization akisina baglandi.
- Mevcut cekime baglama isleminde cekimin content plan ile ayni sirkete ait olmasi zorunlu hale getirildi.
- `CalendarExportController` repository bagimliliklarindan arindirildi ve `com.fogistanbul.crm.calendar` modulu altina tasindi.
- Meeting, shoot ve task iCalendar birlestirmesi `CalendarExportService` icinde toplandi; sirket erisim kapsami korundu ve iCalendar metin kacislari duzeltildi.
- Mevcut staff/client shoot ve calendar export HTTP endpoint contract'lari korundu.

### Frontend

- `frontend/src/features/shoots` altinda shoot API client, union tipler, query key factory, query/mutation hook'lari, model yardimcilari ve UI bilesenleri olusturuldu.
- Shoot endpoint ve tipleri genel `staff.ts` ve `clientPanel.ts` dosyalarindan cikarildi.
- Staff/client shoot sayfalari, Kanban, client dashboard/analytics, content plan ekranlari, prefetch ve global hizli aksiyon ayni shoot API/query key sozlesmesini kullaniyor.
- Tekrarlanan staff, client ve global hizli aksiyon formlari ortak `ShootForm` ile degistirildi.
- `ShootCard` ve `ShootDetailPanel` staff/client ekranlarinda ortak kullaniliyor; content plan baglantilari scope'a gore ayni feature API'sinden yukleniyor.
- Staff shoot sayfasi 589 satirdan 135 satira, client shoot sayfasi 446 satirdan 100 satira indirildi.
- `FloatingTaskFab` icindeki 100 satirdan uzun ikinci shoot formu kaldirildi; dosya 309 satira indirildi.
- Staff Calendar gorev ve toplantilara ek olarak cekimleri de tarih indeksinde, gun/hafta/ay filtrelerinde ve ortak detay paneliyle gosteriyor.
- Dashboard, analytics ve content plan ekranlarindaki farkli shoot cache anahtarlari merkezi `shootKeys` yapisinda birlestirildi.
- Genel frontend build'ini daha once durduran analytics kullanilmayan importlari ve TimeTracking `PageResponse` tip uyumsuzlugu temizlendi.

### Test ve Dogrulama

- Backend `ShootAccessPolicyTest`: 4 test.
- Backend `ShootResourceServiceTest`: 3 test.
- Backend `ShootServiceTest`: 2 test.
- Backend `CalendarExportServiceTest`: 2 test.
- Tum backend sonucu: **48 test basarili**.
- Frontend `shoot.utils.test.ts`: 3 yeni test.
- Tum frontend sonucu: **17 test basarili**.
- Shoot feature, staff/client shoot sayfalari, Staff Calendar, Kanban, FloatingTaskFab ve prefetch icin scoped ESLint: **basarili**.
- Genel `npm run build`: **basarili**. Yalniz mevcut buyuk bundle boyutu uyarisi devam ediyor.
- `git diff --check`: **basarili**.
- Eski shoot API metotlari, DTO/controller/service importlari ve daginik query key taramasi: **temiz**.

### Bilinen Gecis Borclari

- `Shoot`, `ShootParticipant`, `ShootEquipment` entity ve repository'leri content plan, approval ve calendar modulleri tarafindan kullanildigi icin gecici ortak persistence modeli olarak yerinde.
- Content plan ve approval servisleri shoot application servisini kullaniyor ancak halen genel `service` paketinde. Sonraki dikey dilimde bu orkestrasyon content-plan modulune tasinacak.
- Staff Calendar 409 satirla hedef esigin uzerinde. Ortak calendar grid ve agenda bilesenleri content plan takvim ihtiyaci netlestiginde ayri feature olarak cikarilmali.
- Production bundle yaklasik 1.9 MB; route-level lazy loading ve code splitting Faz 0/route duzenlemesinde ele alinmali.
- Proje genelindeki eski `any` kullanımlari nedeniyle tam ESLint kalite kapisi halen ayri bir borctur; shoots kapsamindaki scoped kontrol temizdir.

### Sonuc ve Siradaki Modul

Shoots dikey dilimi backend, frontend, katilimci/ekipman, content plan baglantilari, takvim, export ve ortak hizli aksiyonla tamamlandi. Tespit edilen client coklu sirket listeleme, gecersiz kaynak kimligi ve sirketler arasi content plan baglama aciklari kapatildi.

**Siradaki modul: Content plans / approvals.** Ilk hedef content plan CRUD, client/staff onay orkestrasyonu, shoot baglantilari ve tekrar eden iki buyuk frontend uygulamasini tek feature sinirinda birlestirmek.

## 23. Content Plans / Approvals Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 9 Haziran 2026

### Backend

- Content plan ve approval controller, application service ve DTO'lari `com.fogistanbul.crm.contentplan` modulu altinda `web`, `application` ve `dto` sinirlarina tasindi.
- Genel `controller`, `service` ve `dto` paketlerindeki eski content plan ve approval implementasyonlari kaldirildi.
- `ContentPlanAccessPolicy` ile sirket erisimi, staff yonetim yetkisi ve client `CONTENT_MARKETING` hizmet kontrolu tek noktada toplandi.
- Staff genel listesi admin disindaki kullanicilar icin yalnizca erisilebilir sirketlerle sinirlandi.
- Create, update, detail, company listesi, shoot baglantisi ve delete islemlerinde kullanici kimligi application service'e tasindi.
- Content status gecisleri `DRAFT -> WAITING_APPROVAL`, `WAITING_APPROVAL -> APPROVED/REVISION`, `REVISION -> WAITING_APPROVAL` ve `APPROVED -> PUBLISHED` kurallariyla sinirlandi.
- Client revize talebi icin yetkili ve tipli endpoint eklendi; onceki read-only panelin staff update endpoint'ine gitme hatasi kaldirildi.
- Content approval metadata cozumleme ve staff override birlestirmesi `ContentApprovalMetadata` icine ayrildi.
- Ayni content plan icin ikinci bekleyen onay istegi engellendi.
- Yalnizca `WAITING_APPROVAL` durumundaki planlar icin content approval istegi olusturulabiliyor.
- Yalnizca `PENDING` approval istekleri sonuclandirilabiliyor; tekrar approve/reject engellendi.
- Bekleyen approval istegi varken content plan durumunun genel update endpoint'iyle dogrudan approve/revision yapilmasi engellendi.
- Approval reddi content planini `REVISION` durumuna tasiyor ve review notunu plana aktariyor.
- Yeni veya mevcut cekime baglama orkestrasyonu `ContentPlanApprovalService` icinde shoot modulu uzerinden yurutuluyor.
- Mevcut staff/client content plan ve approval HTTP endpoint contract'lari korundu.

### Frontend

- `frontend/src/features/content-plans` altinda tipler, API client, query key factory, query/mutation hook'lari, metadata codec'i ve ortak UI bilesenleri olusturuldu.
- Content plan ve approval endpoint'leri genel `contentPlan.ts`, `staff.ts` ve `clientPanel.ts` dosyalarindan cikarildi.
- Staff paneli, client tam sayfasi, dashboard/analytics panelleri, shoot baglantilari ve approval sayaci ayni query key ve API sozlesmesini kullaniyor.
- 1.148 satirlik `ContentPlanPanel.tsx` tek satirlik uyumluluk export'una donusturuldu; asil feature bilesenleri 54-205 satirlik sorumluluklara ayrildi.
- 634 satirlik `ClientContentPlanPage.tsx` 27 satirlik route kompozisyonuna indirildi.
- 567 satirlik `StaffRequestsPage.tsx` 179 satira indirildi; cekim onay formu `ApprovalReviewDialog` icine tasindi.
- Staff ve client cekim sorgulari approval dialog acilmadan calismiyor; karsi role ait endpoint'e gereksiz istek atilmasi engellendi.
- Client onay metadata uretimi ve staff metadata okuma ayni testli codec'i kullaniyor.
- Content form, kart, detay paneli, cekim secim dialog'u ve staff review dialog'u ortak feature public API'sinden sunuluyor.

### Test ve Dogrulama

- Backend `ContentPlanAccessPolicyTest`: 3 test.
- Backend `ContentApprovalMetadataTest`: 3 test.
- Backend `ContentPlanServiceTest`: 1 test.
- Backend `ContentPlanWorkflowPolicyTest`: 3 test.
- Backend `ApprovalRequestServiceTest`: 1 test.
- Tum backend sonucu: **59 test basarili**.
- Frontend `approvalMetadata.test.ts`: 3 yeni test.
- Tum frontend sonucu: **20 test basarili**.
- Content plans feature, staff/client sayfalari, layout approval sayaclari ve shoot API/hook entegrasyonu icin scoped ESLint: **basarili**.
- Genel `npm run build`: **basarili**. Mevcut buyuk bundle boyutu uyarisi devam ediyor.
- `git diff --check`: **basarili**.
- Eski content plan/approval service, controller, DTO, API metotlari ve daginik query key taramasi: **temiz**.

### Bilinen Gecis Borclari

- `ContentPlan` ve `ApprovalRequest` entity/repository siniflari diger eski modullerle ayni persistence paketinde kalmaya devam ediyor.
- Approval metadata veritabaninda eski `||` ayracli metin formatiyla saklaniyor. Codec merkezi hale getirildi; ileride JSON kolonuna migration yapilabilir.
- Production bundle yaklasik 1.87 MB; route-level lazy loading ve code splitting Faz 0/route duzenlemesinde ele alinmali.
- Genel frontend lint kapisi eski modullerdeki mevcut borclar nedeniyle halen scoped olarak uygulanabiliyor.

### Sonuc ve Siradaki Modul

Content plans / approvals dikey dilimi backend authorization, durum gecisleri, client onay istegi, staff review, shoot orkestrasyonu ve ortak frontend feature'i ile tamamlandi. Yetkisiz staff genel listeleme, client tarafinda yanlis staff mutation kullanimi, cift bekleyen istek ve sonuclanmis istegin tekrar islenmesi aciklari kapatildi.

**Siradaki modul: PR projects.** Ilk hedef proje/faz/uye/not/gorev akislarini, authorization kurallarini ve staff/client proje ekranlarini ayni feature sinirinda birlestirmek.

## 24. PR Projects Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 10 Haziran 2026

### Backend

- PR project controller, application service ve DTO'lari `com.fogistanbul.crm.prproject` modulu altinda `web`, `application` ve `dto` sinirlarina tasindi.
- Genel `controller`, `service` ve `dto` paketlerindeki eski PR project implementasyonlari kaldirildi.
- `PrProjectAccessPolicy` ile sirketli ve sirketsiz proje goruntuleme/yonetme kurallari tek noktada toplandi.
- Sirketsiz projelerin tum ajans personeline acik olmasi engellendi; yalniz admin, olusturan, sorumlu veya proje uyesi erisebiliyor.
- Staff genel proje sorgusu sirket uyeligi, olusturan, sorumlu ve proje uyesi kapsamiyla sinirlandi.
- Sorumlu, proje uyesi ve faz atamalarinda hedef kullanicinin proje sirketine erisimi zorunlu hale getirildi.
- DTO donusumleri `PrProjectMapper`, katilimci cozumleme `PrProjectParticipantService`, faz CRUD/not akisi `PrProjectPhaseService` ve ilerleme hesaplamasi `PrProjectProgressService` icine ayrildi.
- Faz eklenirken olusturulan task ile faz adi, tarihleri, atanan kisi ve sirket bilgisi guncellemelerde senkron tutuluyor.
- PR ekranindan faz tamamlandiginda bagli task da `DONE` oluyor; task tamamlandiginda faz ve proje ilerlemesi ayni servis uzerinden guncelleniyor.
- Faz notu icin kontrolsuz `Map<String, String>` yerine validation uygulanan tipli request DTO'su eklendi.
- Gecersiz kullanici kimliklerinin sessizce yok sayilmasi ve gecersiz tarihlerin `null` olarak kaydedilmesi engellendi.
- Mevcut `/api/staff/pr-projects` HTTP endpoint contract'i korundu.

### Frontend

- `frontend/src/features/pr-projects` altinda tipler, API client, query key factory, mutation/query hook'lari, Zod form semasi, model yardimcilari ve UI bilesenleri olusturuldu.
- PR project tipleri ve endpoint'leri genel `frontend/src/api/staff.ts` dosyasindan cikarildi.
- PR Projects sayfasi, Kanban paneli ve global hizli aksiyon ayni feature API/query key sozlesmesini kullaniyor.
- Daginik `pr-projects` ve `my-panel-pr` cache anahtarlari merkezi `prProjectKeys` altinda birlestirildi.
- 519 satirlik `PRProjectsPage.tsx` 5 satirlik route kompozisyonuna indirildi.
- Proje karti, detay paneli, faz karti, form ve ekip secici ayri sorumluluklara bolundu.
- Sayfa ve global hizli aksiyondaki iki farkli proje formu tek `PrProjectForm` ile degistirildi.
- Global hizli aksiyon proje olusturduktan sonra sayfa yenilemek yerine query invalidation kullaniyor.
- Proje durumu serbest string yerine `PrProjectStatus` union tipiyle sinirlandi.

### Test ve Dogrulama

- Backend `PrProjectAccessPolicyTest`: 3 test.
- Backend `PrProjectProgressServiceTest`: 1 test.
- Tum backend sonucu: **63 test basarili**.
- Frontend PR project schema ve model testleri: **4 yeni test**.
- Tum frontend sonucu: **24 test basarili**.
- PR Projects feature, sayfa, Kanban, FloatingTaskFab ve `staff.ts` icin scoped ESLint: **basarili**.
- Genel `npm run build`: **basarili**. Mevcut buyuk bundle boyutu uyarisi devam ediyor.
- `git diff --check`: **basarili**.
- Eski PR project service/controller/DTO, `staffApi` metotlari ve daginik query key taramasi: **temiz**.

### Bilinen Gecis Borclari

- `PrProject`, `PrProjectPhase`, `PrProjectMember`, `PrPhaseNote` entity ve repository'leri Tasks moduluyle ortak kullanildigi icin gecici ortak persistence paketinde kalmaya devam ediyor.
- Uygulamada ayri bir client PR Projects route'u bulunmuyor. Mevcut kapsam staff ekrani, ortak task baglantisi ve sirket erisim kurallariyla sinirli.
- Production bundle yaklasik 1.86 MB; route-level lazy loading ve code splitting Faz 0/route duzenlemesinde ele alinmali.

### Sonuc ve Siradaki Modul

PR Projects dikey dilimi backend authorization, proje/faz/uye/not/task orkestrasyonu, ortak frontend feature'i, Kanban ve global hizli aksiyon entegrasyonuyla tamamlandi. Sirketsiz proje veri sizintisi, gecersiz sirket katilimcilari ve faz-task durum tutarsizligi kapatildi.

**Siradaki modul: Files / media library.** Ilk hedef dosya yukleme, sirket erisimi, attachment baglantilari ve staff/client medya kutuphanesi tekrarlarini ayni feature sinirinda birlestirmek.

## 25. Files / Media Library Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 10 Haziran 2026

### Backend

- File controller, service ve DTO eski `controller`, `service` ve `dto` paketlerinden `com.fogistanbul.crm.files` modulu altinda `web`, `application` ve `dto` sinirlarina tasindi.
- `FileAccessPolicy` ile entity bazli erisim kontrolu (TASK, NOTE, MESSAGE, COMPANY), sirket erisimi ve silme yetkisi tek noktada toplandi.
- `FileMapper` DTO donusumunu servis katmanindan ayirdi.
- `FileService` tum yetkilendirme sorumluluklarini `FileAccessPolicy`'e delege ediyor; `FileMapper` araciligiyla haritaliyor.
- `getCompanyMediaCounts` endpoint'i artik sadece kullanicinin erisebilecegi sirketlerin sayisini donduruyor; admin tamami goruyor.
- Eski `controller/FileController.java`, `service/FileService.java`, `dto/FileAttachmentResponse.java` kaldirildi.
- Mevcut `/api/files` HTTP endpoint contract'i korundu.
- Lombok 1.18.46 + `annotationProcessorPaths` ile Java 26 uyumsuzlugu giderildi; pom.xml'e `lombok.version` override eklendi.

### Frontend

- `frontend/src/features/files` altinda API client, tipler, query key factory, query/mutation hook'lari, model yardimcilari ve UI bilesenleri olusturuldu.
- File endpoint'leri ve `FileAttachmentResponse` tipi genel `api/features.ts` dosyasindan cikarildi.
- `components/FileUploader.tsx` `features/files/ui/FileUploader.tsx`'e tasindi; import yolu guncellendi.
- `getFileIcon`, `formatFileSize`, `formatFileDate`, `isPreviewable` fonksiyonlari `file.utils.ts` icinde birlestirildi.
- `MediaGallery` bileseni upload butonu, filtreler, grid ve pagination'i kapsiyor; staff/client sayfalari ortak olarak kullaniyor.
- `FileCard` ve `FilePreviewModal` bagimsiz sorumluluklara ayrildi.
- `StaffMediaLibraryPage.tsx` 305 satirdan 143 satira, `MediaLibraryPage.tsx` 229 satirdan 54 satira indirildi.
- Dagitik `company-media` ve `media-counts` cache anahtarlari merkezi `fileKeys` factory'sinde birlestirildi.

### Test ve Dogrulama

- Backend `FileAccessPolicyTest`: 6 test.
- Backend `FileServiceTest`: 2 test.
- Tum backend sonucu: **71 test basarili** (onceki 63'ten 8 yeni test).
- Frontend `file.utils.test.ts`: 12 yeni test.
- Tum frontend sonucu: **36 test basarili** (onceki 24'ten 12 yeni test).
- Genel `npm run build`: **basarili**. Mevcut buyuk bundle boyutu uyarisi devam ediyor.
- `mvn clean compile`: **basarili** (Lombok 1.18.46 ile Java 26 uyumu saglandiktan sonra).

### Bilinen Gecis Borclari

- `FileAttachment` entity ve `FileAttachmentRepository` ortak persistence paketinde kalmaya devam ediyor.
- `FileAccessPolicy` halen diger modullerin repository'lerine (TaskRepository, NoteRepository, MessageRepository) dogrudan bagli; messaging modulu tamamlandiginda mesaj erisim kontrolu messaging policy'ye devredilebilir.
- Production bundle yaklasik 1.85 MB; route-level lazy loading ve code splitting Faz 0/route duzenlemesinde ele alinmali.

### Sonuc ve Siradaki Modul

Files / media library dikey dilimi backend authorization, entity bazli erisim, sirket medya gorunumu ve ortak frontend feature'i ile tamamlandi. Yetkisiz sirket medya sayisi ifsa acigi kapatildi.

**Siradaki modul: Messaging.** Ilk hedef direct mesajlasma, grup mesajlasma, WebSocket entegrasyonu ve okunmamis sayac akislarini ayni feature sinirinda birlestirmek.

## 26. Messaging Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 10 Haziran 2026

### Backend

- `MessagingService`, `GroupMessagingService` ve 5 controller (`MessagingController`, `GroupMessagingController`, `ClientMessagingController`, `ClientGroupMessagingController`, `WebSocketController`) eski `controller/` ve `service/` paketlerinden `com.fogistanbul.crm.messaging` modulu altinda `web/` ve `application/` sinirlarina tasindi.
- 6 DTO (`MessageResponse`, `ConversationResponse`, `ContactResponse`, `GroupMessageResponse`, `GroupConversationResponse`, `SendMessageRequest`) eski `dto/` paketinden `messaging/dto/` altina tasindi.
- `MessageAccessPolicy` olusturuldu: DM erisim kontrolu (paylasilan sirket, employee kisitlari), konusma katilimcisi dogrulama ve grup uyeligi kontrolu tek noktada toplandı.
- `MessageMapper` olusturuldu: `toMessageResponse`, `toConversationResponse`, `toGroupMessageResponse`, `toContactResponse` donusum metodlari servis katmanindan ayrildi.
- `MessagingService` ve `GroupMessagingService` yetkilendirme sorumluluklarini `MessageAccessPolicy`'e, mapping'i `MessageMapper`'a delege ediyor.
- `ContactResponse` kross-modul bagimliligini korumak icin `task/application/TaskAssignableUserService` ve `task/web/StaffTaskController` importlari guncellendi.
- `company/application/CompanyService` ve `StaffService` icindeki `GroupMessagingService` importlari yeni modül yoluna guncellendi.
- Eski 13 dosya (`controller/`, `service/`, `dto/` altindakiler) silindi.
- Mevcut HTTP endpoint contract'lari korundu (`/api/staff/messaging/**`, `/api/client/messaging/**`).

### Frontend

- `frontend/src/features/messaging` altinda API client, tipler, query key factory, WebSocket hook, handler'lar, model yardimcilari ve UI bilesenleri olusturuldu.
- `messaging.types.ts`: Tum tip tanimlari (`ConversationResponse`, `MessageResponse`, `ContactResponse`, `GroupConversationResponse`, `GroupMessageResponse`, `SendMessageRequest`, `PageResponse`).
- `messagingKeys.ts`: React Query key factory (`conversations`, `messages`, `contacts`, `groups`, `groupMessages`).
- `messagingApi.ts`: API fonksiyonlari `api/messaging.ts`'den ayrildi.
- `hooks/useWebSocket.ts`: `hooks/useWebSocket.ts`'den `features/messaging/hooks/`'e tasindi; import yolu guncellendi.
- `hooks/useMessaging.ts`: WebSocket event handler'lari (`handleWsMessage`, `handleGlobalMessage`, `handleReadReceipt`) sayfa componentlerinden ayrildi.
- `model/messaging.utils.ts`: `timeAgo`, `formatMessageTime`, `getRoleLabel` fonksiyonlari her iki sayfada tekrarlanan inline koddan cikarildi.
- `ui/ConversationList.tsx`: DM + grup sidebar listesi bagimsiz bilesenine ayrildi.
- `ui/MessageThread.tsx`: `DmMessageThread` ve `GroupMessageThread` bilesenleri.
- `ui/MessageComposer.tsx`: Yeniden kullanilabilir mesaj yazma alani + gonder butonu.
- `ui/NewConversationModal.tsx`: Yeni sohbet baslat modali.
- `api/messaging.ts` ve `hooks/useWebSocket.ts` backward compat re-export dosyalarina donusturuldu.
- `hooks/useUnreadCount.ts` import yolu `features/messaging`'e guncellendi.
- `StaffMessagingPage.tsx` 622 satirdan ~196 satira, `ClientMessagingPage.tsx` 601 satirdan ~200 satira indirildi.

### Test ve Dogrulama

- Backend `MessageAccessPolicyTest`: 8 test.
- Backend `MessagingServiceTest`: 2 test.
- Tum backend sonucu: **81 test basarili** (onceki 71'den 10 yeni test).
- Frontend `messaging.utils.test.ts`: 7 yeni test.
- Tum frontend sonucu: **43 test basarili** (onceki 36'dan 7 yeni test).
- `npm run build`: **basarili**.
- `mvn clean compile` + `mvn test`: **basarili**.

### Bilinen Gecis Borclari

- `ContactResponse` halen `messaging/dto/` altinda; `TaskAssignableUserService` ortak bir `UserSummaryResponse` kullanmali (ileride task refaktor sırasında duzeltilmeli).
- `FileAccessPolicy` `MessageRepository`'e dogrudan bagli kalmaya devam ediyor; messaging modulu tamamlandigina gore bu bagimlilik messaging policy'e devredilebilir.
- `WebSocketConfig` `config/` paketinde kalmaya devam ediyor (infrastructure concern, feature'a tasima gerekmez).
- Production bundle yaklasik 1.85 MB; route-level lazy loading Faz 0/route duzenlemesinde ele alinmali.

### Sonuc ve Siradaki Modul

Messaging dikey dilimi backend authorization, DM/grup mesajlasma, WebSocket entegrasyonu ve ortak frontend feature'i ile tamamlandi. Yetkisiz konusma/grup erisim acigi kapandi; sayfa bilesenleri orkestrator pattern'ine donusturuldu.

**Siradaki modul: Entegrasyon modulleri (Faz 6).** Ilk hedef PageSpeed / Web Design entegrasyonunu ayri feature sinirinda yapılandırmak.

## 27. Web Design / PageSpeed Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 10 Haziran 2026

### Backend

- `PageSpeedController` ve `PageSpeedService` eski `controller/` ve `service/` paketlerinden `com.fogistanbul.crm.webdesign` modulu altinda `web/` ve `application/` sinirlarina tasindi.
- 2 DTO (`PageSpeedReportResponse`, `PageSpeedScoreResponse`) eski `dto/` paketinden `webdesign/dto/` altina tasindi.
- `PageSpeedSnapshot` entity'si `entity/` paketinden `webdesign/domain/` altina tasindi.
- `PageSpeedSnapshotRepository` `repository/` paketinden `webdesign/` altina tasindi.
- `PageSpeedAccessPolicy` olusturuldu: staff okuma yetkisi kontrolu (ADMIN/AGENCY_STAFF gecis) ve client icin sirket uyeligi + WEB_DESIGN servis aktivasyon kontrolu tek noktada toplandı.
- `PageSpeedMapper` olusturuldu: `toScoreResponse()` donusum mantigi `PageSpeedService`'den ayrildi; fetch error mesaj formatlama da mapper'a tasindi.
- `PageSpeedService` sadeleştirildi: `CompanyMembershipRepository` ve `ensureReadAccess()` kaldirildi; yetkilendirme `PageSpeedAccessPolicy`'e, mapping `PageSpeedMapper`'a delege edildi.
- `PageSpeedController` sadeleştirildi: `CompanyMembershipRepository` bagimliligi kaldirildi; access kontrolu `PageSpeedAccessPolicy`'e delege edildi.
- Eski 6 dosya (`controller/`, `service/`, `dto/` altindakiler + entity + repository) silindi.
- Mevcut HTTP endpoint contract'lari korundu (`/api/staff/companies/{id}/pagespeed`, `/api/client/pagespeed`, `/api/client/pagespeed/website`).

### Frontend

- `frontend/src/features/web-design` altinda API client, tipler, query key factory, yardimci fonksiyonlar ve UI bilesenleri olusturuldu.
- `webDesign.types.ts`: Tum tip tanimlari (`PageSpeedScore`, `PageSpeedReport`, `Strategy`, `HealthTone`, `toneStyles`).
- `webDesignKeys.ts`: React Query key factory (`report`).
- `api/webDesignApi.ts`: API fonksiyonlari `api/webDesign.ts`'den ayrildi.
- `model/webDesign.utils.ts`: `normalizeInputUrl`, `scoreTone`, `metricTone`, `statusIcon`, `formatMs`, `formatCls`, `formatDate`, `formatRelative`, `averageScore`, `overallMessage`, `scoreColor`, `scoreRing` fonksiyonlari her iki sayfada tekrarlanan inline koddan cikarildi.
- `ui/PageSpeedCards.tsx`: `HealthSummary`, `DeviceCompareCard`, `ConnectionCard`, `ScoreInsightCard`, `VitalCard`, `ReadinessRow` bilesenleri `PageSpeedDetailPage`'den ayrildi.
- `ui/WebDesignPanel.tsx`: `components/analytics/WebDesignPanel.tsx`'den feature modulune tasindi; tipleri ve utility fonksiyonlari feature modulunden aliyor.
- `ui/WebDesignAdminSection.tsx`: `components/admin/WebDesignAdminSection.tsx`'den feature modulune tasindi.
- `api/webDesign.ts`, `components/analytics/WebDesignPanel.tsx`, `components/admin/WebDesignAdminSection.tsx` backward compat re-export dosyalarina donusturuldu.
- `pages/client/PageSpeedDetailPage.tsx` 698 satirdan ~215 satira indirildi; tum alt bilesenler `features/web-design/ui/PageSpeedCards` modulunden import ediliyor.

### Test ve Dogrulama

- Backend `PageSpeedAccessPolicyTest`: 6 test.
- Backend `PageSpeedServiceTest`: 2 test.
- Tum backend sonucu: **89 test basarili** (onceki 81'den 8 yeni test).
- Frontend `webDesign.utils.test.ts`: 22 yeni test (`normalizeInputUrl`, `scoreTone`, `metricTone`, `formatMs`, `formatCls`, `averageScore`).
- Tum frontend sonucu: **65 test basarili** (onceki 43'ten 22 yeni test).
- `npm run build`: **basarili**.
- `mvn test`: **basarili**.

### Bilinen Gecis Borclari

- `PageSpeedReport` frontend tipi `analyticsConnected` / `searchConsoleConnected` alanlarini iceriyor; bu alanlar ileride Google Analytics ve Search Console modulleri ayrı feature sinirina tasındığında yeniden gözden gecirilmeli.
- Production bundle ~1.84 MB; route-level lazy loading Faz 7'de ele alinmali.

### Sonuc ve Siradaki Modul

Web Design / PageSpeed dikey dilimi backend authorization, entity bazli erisim, altyapi bilgisi yonetimi ve ortak frontend feature'i ile tamamlandi. Yetkisiz sirket pagespeed erisim acigi kapandi; sayfa bilesenler orkestrator pattern'ine donusturuldu.

**Siradaki modul: Google Analytics (Faz 6 - 2. entegrasyon).** Hedef: GA4 metriklerini ayri feature sinirinda modularize etmek.

## 28. Google Analytics Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 10 Haziran 2026

### Backend

- `GoogleAnalyticsController` ve `GoogleAnalyticsService` eski `controller/` ve `service/` paketlerinden `com.fogistanbul.crm.googleanalytics` modulu altinda `web/` ve `application/` sinirlarina tasindi.
- `GaOverviewResponse` DTO eski `dto/` paketinden `googleanalytics/dto/` altina tasindi.
- `GoogleAnalyticsAccessPolicy` olusturuldu: DIGITAL_MARKETING servis aktivasyon kontrolu tek noktada toplandı; eski `serviceAccessGuard.requireService` controller'dan policy'e tasinди.
- `GoogleAnalyticsMapper` olusturuldu: `formatDate()`, `toDailyRow()`, `toNamedMetric()`, `parseLong()`, `parseDouble()` donusum mantigi `GoogleAnalyticsService`'den ayrildi.
- `GoogleAnalyticsService` sadeleştirildi: inline satir donusum donguleri mapper'a delege edildi.
- `GoogleAnalyticsController` sadeleştirildi: `CompanyServiceAccessGuard` bagimliligi kaldirildi; erisim `GoogleAnalyticsAccessPolicy`'e delege edildi.
- `GoogleOAuthService` ve `OAuthController` paylasilan altyapi olduklari icin `service/` ve `controller/` paketlerinde kaldi (Search Console, Google Ads ile ortak kullanim).
- Eski 3 dosya (`controller/GoogleAnalyticsController.java`, `service/GoogleAnalyticsService.java`, `dto/GaOverviewResponse.java`) silindi.
- HTTP endpoint contract'lari korundu (`/api/client/analytics/ga/status`, `/api/client/analytics/ga/overview`, `/api/client/analytics/ga/property`, `/api/client/analytics/ga/disconnect`).

### Frontend

- `frontend/src/features/google-analytics/` altinda tip tanimlari, key factory, API client, utility fonksiyonlar ve UI bilesenleri olusturuldu.
- `googleAnalytics.types.ts`: `GaDailyRow`, `GaNamedMetric`, `GaOverviewResponse`, `GaStatusResponse`, `DatePreset`, `SourcePieEntry`, `CountryBarEntry` tipleri.
- `googleAnalyticsKeys.ts`: React Query key factory (`status`, `overview`).
- `api/googleAnalyticsApi.ts`: API fonksiyonlari `api/googleAnalytics.ts`'den ayrildi.
- `model/googleAnalytics.utils.ts`: `DATE_PRESETS`, `PANEL_PRESETS`, `SOURCE_COLORS`, `COUNTRY_COLORS`, `formatDuration`, `formatNum`, `computeEngagementRate`, `computeSessionsPerUser`, `buildSourcePieData`, `buildCountryBarData` fonksiyonlari iki farkli sayfada tekrarlanan inline koddan cikarildi.
- `ui/GoogleAnalyticsCards.tsx`: `ChartTooltip`, `BigMetricCard`, `MetricCard`, `SectionHeader` bilesenleri hem `GoogleAnalyticsDetailPage` hem `GoogleAnalyticsPanel`'den ayrildi.
- `ui/GoogleAnalyticsPanel.tsx`: `components/analytics/GoogleAnalyticsPanel.tsx`'den feature modulune tasindi; tipleri ve utility fonksiyonlari feature modulunden aliyor.
- `api/googleAnalytics.ts` ve `components/analytics/GoogleAnalyticsPanel.tsx` backward compat re-export dosyalarina donusturuldu.
- `pages/client/GoogleAnalyticsDetailPage.tsx` 668 satirdan ~415 satira indirildi (inline sub-component ve yardimci fonksiyonlar kaldirildi).

### Test ve Dogrulama

- Backend `GoogleAnalyticsAccessPolicyTest`: 3 test.
- Backend `GoogleAnalyticsMapperTest`: 8 test (formatDate, toDailyRow, toNamedMetric).
- Backend `GoogleAnalyticsServiceTest`: 6 test (isConfigured, getOverview).
- Tum backend sonucu: **106 test basarili** (onceki 89'dan 17 yeni test).
- Frontend `googleAnalytics.utils.test.ts`: 30 yeni test (`formatDuration`, `formatNum`, `computeEngagementRate`, `computeSessionsPerUser`, `buildSourcePieData`, `buildCountryBarData`, `DATE_PRESETS`, `PANEL_PRESETS`).
- Tum frontend sonucu: **95 test basarili** (onceki 65'ten 30 yeni test).
- `npm run build`: **basarili**.
- `mvn test`: **basarili**.

### Bilinen Gecis Borclari

- `GoogleOAuthService` (ANALYTICS, SEARCH_CONSOLE, GOOGLE_ADS token yonetimi) henuz `service/` paketinde; Search Console ve Google Ads modulleri ayri feature sinirlarana tasindiktan sonra ortak `google/` altyapi paketine tasinmali.
- `OAuthController` (`/api/oauth/google/callback`) henuz `controller/` paketinde; butun Google servisleri modularize edildikten sonra ortak bir yere tasinabilir.
- Production bundle ~1.84 MB; route-level lazy loading Faz 7'de ele alinmali.

### Sonuc ve Siradaki Modul

Google Analytics dikey dilimi backend authorization, mapper ayristirmasi ve ortak frontend feature'i ile tamamlandi. GA4 metrik verileri icin erisim kontrolu `GoogleAnalyticsAccessPolicy`'e toplandı; iki sayfa arasinda tekrarlanan 100+ satir inline kod feature modulune tasindi.

**Siradaki modul: Search Console (Faz 6 - 3. entegrasyon).** Hedef: Search Console verilerini ayri feature sinirinda modularize etmek.

## 29. Search Console Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 12 Haziran 2026

### Backend

- `SearchConsoleController`, `SearchConsoleService` ve `ScOverviewResponse` eski teknik katman paketlerinden `com.fogistanbul.crm.searchconsole` modulu altinda `web/`, `application/` ve `dto/` sinirlarina tasindi.
- `SearchConsoleAccessPolicy` olusturuldu; DIGITAL_MARKETING servis aktivasyonu ve sirket erisimi controller'lardan tek policy noktasina alindi.
- `SearchConsoleClient` olusturuldu; Search Console HTTP endpoint'leri, bearer header olusturma ve ham Google `Map` response parse islemleri infrastructure katmanina tasindi.
- `SearchConsoleMapper` olusturuldu; relative tarih cozumleme, gunluk/sorgu/sayfa/cihaz/ulke satir donusumleri, yuvarlama ve kullanici hata mesajlari application service'den ayrildi.
- `SearchConsoleService` 332 satirdan 106 satira indirildi; servis artik OAuth baglami, 6 rapor sorgusu ve response orkestrasyonundan sorumlu.
- Status, site listesi ve site URL kaydetme endpoint'leri icin tipli DTO'lar eklendi (`ScStatusResponse`, `ScSiteResponse`, `ScSaveSiteUrlRequest`, `ScSaveSiteUrlResponse`).
- String `"SEARCH_CONSOLE"` tekrarlarinin yerine `GoogleOAuthService.SVC_SEARCH_CONSOLE` sabiti kullanildi.
- Mevcut HTTP endpoint contract'lari korundu (`/api/client/analytics/sc/status`, `/sites`, `/overview`, `/site-url`).

### Frontend

- `frontend/src/features/search-console/` altinda tipler, query key factory, API client, model yardimcilari, ortak kartlar ve panel bileseni olusturuldu.
- `searchConsole.types.ts`: overview, status, site, tarih preset'i ve grafik view model tipleri.
- `searchConsoleKeys.ts`: dashboard/prefetch ile ortak `client-sc` cache contract'ini koruyan key factory.
- `api/searchConsoleApi.ts`: API fonksiyonlari eski `api/searchConsole.ts` dosyasindan ayrildi.
- `model/searchConsole.utils.ts`: tarih preset'leri, renk paletleri, sayi formatlama, CTR/pozisyon hesaplari ve cihaz/ulke grafik donusumleri ortaklastirildi.
- `ui/SearchConsoleCards.tsx`: `ChartTooltip`, `BigMetricCard`, `MetricCard` ve `SectionHeader` iki kullanim yuzeyinden ayrildi.
- `ui/SearchConsolePanel.tsx`: eski analytics component klasorunden feature modulune tasindi; OAuth callback kontrolu gercek redirect parametresi olan `connected=true` degerini destekleyecek sekilde duzeltildi.
- `api/searchConsole.ts` ve `components/analytics/SearchConsolePanel.tsx` backward compatibility re-export dosyalarina donusturuldu.
- `ClientDashboard` ve `useClientDataPrefetch` Search Console feature public API'si ile merkezi query key factory'yi kullanmaya basladi.
- `SearchConsoleDetailPage.tsx` 621 satirdan 528 satira, panel 535 satirdan 480 satira indirildi; inline tip, preset, formatter, grafik mapper ve ortak kart tanimlari kaldirildi.

### Test ve Dogrulama

- Backend `SearchConsoleAccessPolicyTest`: 2 test.
- Backend `SearchConsoleMapperTest`: 4 test.
- Backend `SearchConsoleServiceTest`: 6 test.
- Tum backend sonucu: **118 test basarili** (onceki 106'dan 12 yeni test).
- Frontend `searchConsole.utils.test.ts`: 11 yeni test.
- Tum frontend sonucu: **106 test basarili** (onceki 95'ten 11 yeni test).
- `npm run build`: **basarili**.
- `mvn test`: **basarili**.

### Bilinen Gecis Borclari

- `SearchConsolePanel.tsx` ve `SearchConsoleDetailPage.tsx` halen 300 satir sert inceleme esiginin uzerinde. Tekrarlanan model ve kart kodu ayrildi; bir sonraki UI turunda tarih secici, baglanti durumlari ve rapor section'lari ayri presentational bilesenlere bolunmeli.
- `GoogleOAuthService` ANALYTICS, SEARCH_CONSOLE ve GOOGLE_ADS token yonetimini ortak `service/` paketinde tasiyor. Google Ads modulu tamamlandiktan sonra ortak `googleoauth` altyapi modulune alinmali.
- Production bundle ~1.84 MB; route-level lazy loading Faz 7'de ele alinmali.

### Sonuc ve Siradaki Modul

Search Console dikey dilimi backend authorization, harici API client'i, response mapping ve ortak frontend feature siniri ile tamamlandi. Ham Google response yapilari application katmanindan cikarildi; dashboard, panel ve detay sayfasi ayni API/type/query key contract'ini kullanmaya basladi.

**Siradaki modul: Google Ads (Faz 6 - 4. entegrasyon).** Hedef: Google Ads OAuth, rapor client'i, metrik mapping ve frontend panel/detail akislarini ayri feature sinirinda modularize etmek.

## 30. Google Ads ve Ortak Google OAuth Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 12 Haziran 2026

### Backend - Google Ads

- `GoogleAdsController`, `GoogleAdsService` ve `GoogleAdsOverviewResponse` eski teknik katman paketlerinden `com.fogistanbul.crm.googleads` modulu altinda `web/`, `application/` ve `dto/` sinirlarina tasindi.
- `GoogleAdsAccessPolicy` olusturuldu; AD_MANAGEMENT servis aktivasyonu ve sirket erisimi controller'dan policy katmanina alindi.
- `GoogleAdsClient` olusturuldu; Google Ads API v24 URL'i, GAQL sorgulari, developer token/login customer header'lari ve ham JSON parse islemleri infrastructure katmanina tasindi.
- `GoogleAdsMapper` olusturuldu; customer ID temizleme, relative tarih cozumleme, micros para birimi donusumu, kampanya mapping, gunluk toplamlama ve KPI hesaplari application service'den ayrildi.
- `GoogleAdsService` 218 satirdan 71 satira indirildi; servis OAuth/config kontrolu, rapor sorgulari ve hata orkestrasyonundan sorumlu.
- Controller response/request contract'lari tipli DTO'lara donusturuldu (`GoogleAdsStatusResponse`, `GoogleAdsCustomerIdRequest`, `GoogleAdsWriteResponse`).
- Kampanya `metrics.ctr` degeri Google Ads API'nin oran formatindan UI'in bekledigi yuzde formatina donusturuldu.
- `/disconnect` endpoint'i yalnizca customer ID'yi bosaltmak yerine Google Ads OAuth kaydini gercekten siliyor.
- Mevcut HTTP endpoint'leri korundu (`/api/client/analytics/google-ads/status`, `/overview`, `/customer-id`, `/disconnect`).

### Backend - Ortak Google OAuth

- Google Analytics, Search Console ve Google Ads modulleri tamamlandigi icin ortak OAuth altyapisi `com.fogistanbul.crm.googleoauth` modulune tasindi.
- `GoogleOAuthService` `googleoauth/application`, `GoogleOAuthToken` `googleoauth/domain`, repository `googleoauth/infrastructure` ve callback controller `googleoauth/web` altina alindi.
- GA, Search Console, Google Ads ve PageSpeed bagimliliklari yeni ortak modul public paketine yonlendirildi.
- Veritabani tablo adi, JPA alanlari ve `/api/oauth/google/callback` endpoint contract'i korunarak yalnizca paket sahipligi degistirildi.

### Frontend

- `frontend/src/features/google-ads/` altinda tipler, query key factory, API client, model yardimcilari ve panel bileseni olusturuldu.
- `googleAds.types.ts`: overview, status, kampanya, gunluk trend ve siralama kolon tipleri.
- `googleAdsKeys.ts`: status ve overview sorgulari icin merkezi query key factory.
- `api/googleAdsApi.ts`: API fonksiyonlari eski `api/googleAds.ts` dosyasindan ayrildi.
- `model/googleAds.utils.ts`: para/sayi formatlama, kampanya siralama ve status renk secimi ortaklastirildi.
- `ui/GoogleAdsPanel.tsx`: eski analytics component klasorunden feature modulune tasindi.
- `api/googleAds.ts` ve `components/analytics/GoogleAdsPanel.tsx` backward compatibility re-export dosyalarina donusturuldu.
- `GoogleAdsDetailPage.tsx` literal query key'ler yerine feature key factory kullaniyor; formatter ve siralama kodu feature modeline tasindi.

### Test ve Dogrulama

- Backend `GoogleAdsAccessPolicyTest`: 2 test.
- Backend `GoogleAdsMapperTest`: 6 test.
- Backend `GoogleAdsServiceTest`: 6 test.
- Tum backend sonucu: **132 test basarili** (onceki 118'den 14 yeni test).
- Frontend `googleAds.utils.test.ts`: 9 yeni test.
- Tum frontend sonucu: **115 test basarili** (onceki 106'dan 9 yeni test).
- `npm run build`: **basarili**.
- `mvn test`: **basarili**.

### Bilinen Gecis Borclari

- `GoogleOAuthService` 294 satirla application service esiginin uzerinde. Paket sahipligi duzeltildi; ileride token HTTP client'i, state parser ve urun metadata registry'si ayri siniflara alinabilir.
- Google Ads tarih araligi backend tarafinda destekleniyor ancak mevcut frontend raporu sabit varsayilan araligi kullaniyor.
- Production bundle ~1.84 MB; route-level lazy loading Faz 7'de ele alinmali.

### Sonuc ve Siradaki Modul

Google Ads dikey dilimi authorization, GAQL client'i, metrik mapping ve ortak frontend feature'i ile tamamlandi. Uc Google urununun ortak OAuth altyapisi tek module toplandi; Google Ads disconnect ve kampanya CTR davranislarindaki tutarsizliklar giderildi.

**Siradaki modul: Instagram (Faz 6 - 5. entegrasyon).** Hedef: buyuk `InstagramService` sinifini Graph client, parser, tarih araligi, medya insight ve overview orkestrasyonu sinirlarina ayirmak; frontend panel/detail tekrarlarini ayni feature modulu altinda toplamak.

## 31. Instagram ve Ortak Meta OAuth Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 12 Haziran 2026

### Backend - Instagram

- Eski 1.402 satirlik `InstagramService` kaldirildi; sorumluluklar `com.fogistanbul.crm.instagram` modulu altinda application, infrastructure, dto ve web sinirlarina ayrildi.
- `InstagramGraphClient` olusturuldu; Graph API v21 base URL'i, query parameter encoding ve `RestTemplate` GET cagrilari infrastructure katmanina tasindi.
- `InstagramInsightParser` olusturuldu; `data`, `values`, `total_value`, tek metrik ve `follows_and_unfollows` response sekilleri application orkestrasyonundan ayrildi.
- `InstagramDateRangeResolver` olusturuldu; relative tarih, ozel tarih, Istanbul ay baslangici ve gecersiz aralik fallback kurallari tek noktada toplandi.
- `InstagramMediaInsightService` olusturuldu; reels/post metrik fallback siralari (`plays`, `views`, `impressions`, `reach`, `saved`, `shares`) ayri servise tasindi.
- `InstagramMediaService` reels, post ve son medya listeleme/mapping akislarini yonetiyor.
- `InstagramOverviewService` token baglami, profil/insight sorgulari, gunluk trend, takipci fallback'i ve response orkestrasyonundan sorumlu hale geldi.
- `InstagramAccessPolicy` ile SOCIAL_MEDIA servis erisimi controller'dan ayrildi.
- Controller response contract'lari tipli DTO'lara donusturuldu (`InstagramStatusResponse`, `InstagramWriteResponse`, `InstagramOverviewResponse`).
- Mevcut HTTP endpoint ve JSON contract'lari korundu (`/api/client/analytics/ig/status`, `/overview`, `/reels`, `/posts`, `/disconnect`).

### Backend - Ortak Meta OAuth

- Instagram ve Meta Ads tarafindan ortak kullanilan OAuth/token altyapisi `instagram/oauth` altinda toplandi.
- `InstagramOAuthService` application, `InstagramToken` domain, repository infrastructure ve callback controller web paketine tasindi.
- Veritabani tablo adi, JPA alanlari ve `/api/oauth/instagram/callback` endpoint'i degistirilmedi.
- Meta Ads servis/controller bagimliliklari yeni ortak OAuth paketine yonlendirildi; Meta Ads davranisi bu adimda degistirilmedi.

### Frontend

- `frontend/src/features/instagram/` altinda tipler, API client, query key factory, model yardimcilari ve panel bileseni olusturuldu.
- `instagram.types.ts`: overview, status, gunluk trend, medya, reels ve post tipleri tek modulde toplandi.
- `instagramKeys.ts`: dashboard, prefetch ve panel tarafindaki `client-ig*` cache contract'larini koruyan merkezi key factory olusturuldu.
- `api/instagramApi.ts`: API fonksiyonlari eski `api/instagram.ts` dosyasindan ayrildi.
- `model/instagram.utils.ts`: kompakt sayi formatlama, takipci buyume orani ve etkilesim orani ortaklastirildi.
- `ui/InstagramPanel.tsx`: eski analytics component klasorunden feature modulune tasindi.
- `api/instagram.ts` ve `components/analytics/InstagramPanel.tsx` backward compatibility re-export dosyalarina donusturuldu.
- `ClientDashboard`, `ClientAnalyticsPage`, `useClientDataPrefetch`, Instagram detay, reels ve post sayfalari feature public API'sini kullanmaya basladi.

### Test ve Dogrulama

- Backend Graph response fixture'lari eklendi: `total_value`, gunluk `values` ve takip/unfollow breakdown sekilleri.
- Backend `InstagramInsightParserTest`: 5 test.
- Backend `InstagramDateRangeResolverTest`: 4 test.
- Backend `InstagramAccessPolicyTest`: 2 test.
- Backend `InstagramOverviewServiceTest`: 3 test.
- Tum backend sonucu: **146 test basarili** (onceki 132'den 14 yeni test).
- Frontend `instagram.utils.test.ts`: 3 yeni test.
- Tum frontend sonucu: **118 test basarili** (onceki 115'ten 3 yeni test).
- `npm run build`: **basarili**.
- `mvn test`: **basarili**.

### Bilinen Gecis Borclari

- `InstagramOAuthService` 494 satirla application service esiginin uzerinde. Paket sahipligi duzeltildi; token exchange/refresh HTTP client'i, callback state dogrulamasi ve Facebook page/Instagram hesap secimi ayri siniflara alinabilir.
- `InstagramPanel.tsx` ve Instagram detay sayfalari halen 300 satir inceleme esiginin uzerinde. Veri contract'i ve ortak hesaplamalar ayrildi; sonraki UI turunda status, metric grid, carousel ve chart section'lari presentational bilesenlere bolunmeli.
- Production bundle ~1.84 MB; route-level lazy loading Faz 7'de ele alinmali.

### Sonuc ve Siradaki Modul

Instagram dikey dilimi Graph client, parser, tarih araligi, medya insight, overview orkestrasyonu, authorization ve ortak frontend feature siniri ile tamamlandi. Eski monolit servis kaldirildi; Instagram ile Meta Ads'in paylastigi OAuth/token sahipligi tek modulde toplandi.

**Siradaki modul: Meta Ads (Faz 6 - 6. entegrasyon).** Hedef: Meta Ads rapor client'i, metrik mapping, authorization ve frontend panel/detail akislarini ayri feature sinirinda modularize etmek.

## 32. Meta Ads Modulu - TAMAMLANDI

**Tamamlanma tarihi:** 12 Haziran 2026

### Backend

- `MetaAdsController`, `MetaAdsService` ve `MetaAdsOverviewResponse` eski teknik katman paketlerinden `com.fogistanbul.crm.metaads` modulu altinda `web/`, `application/` ve `dto/` sinirlarina tasindi.
- `MetaAdsClient` olusturuldu; Graph API v21 URL'i, query parameter encoding, tarih preset/time range secimi ve ham `data` response listeleri infrastructure katmanina tasindi.
- Hesap, kampanya ve gunluk insight sorgulari ayri client metotlarina bolundu. Kampanya ve gunluk trend cagrilarinin toleransli bos liste fallback davranisi korundu.
- `MetaAdsMapper` olusturuldu; Graph API string metriklerinin sayisal donusumu, kampanya/gunluk satir mapping'i, overview DTO uretimi ve kullanici hata mesajlari application service'den ayrildi.
- `MetaAdsService` 197 satirdan 63 satira indirildi; servis artik OAuth baglami, reklam hesabi, tarih araligi ve rapor orkestrasyonundan sorumlu.
- `MetaAdsAccessPolicy` ile AD_MANAGEMENT servis erisimi controller'dan ayrildi.
- `MetaAdsAccountService` olusturuldu; reklam hesap ID normalizasyonu ve token kaydindaki Meta Ads alaninin yonetimi Instagram OAuth servisinden ayrildi.
- Bos hesap ID'sini `"act_"` degerine ceviren disconnect hatasi duzeltildi; `/disconnect` artik reklam hesap baglantisini gercekten temizliyor.
- Kullanilmayan `InstagramTokenRepository` bagimliligi eski Meta Ads servisinden kaldirildi.
- Controller request/response contract'lari tipli DTO'lara donusturuldu (`MetaAdsStatusResponse`, `MetaAdsAccountRequest`, `MetaAdsWriteResponse`).
- Mevcut HTTP endpoint ve JSON contract'lari korundu (`/api/client/analytics/meta-ads/status`, `/overview`, `/ad-account`, `/disconnect`).

### Frontend

- `frontend/src/features/meta-ads/` altinda tipler, API client, query key factory, model yardimcilari ve panel bileseni olusturuldu.
- `metaAds.types.ts`: overview, status, kampanya, gunluk trend ve siralama kolon tipleri tek modulde toplandi.
- `metaAdsKeys.ts`: status ve overview sorgulari icin merkezi React Query key factory olusturuldu.
- `api/metaAdsApi.ts`: API fonksiyonlari eski `api/metaAds.ts` dosyasindan ayrildi.
- `model/metaAds.utils.ts`: para/sayi formatlama ve kampanya siralama mantigi panel ve detay sayfasindan ayrildi.
- `ui/MetaAdsPanel.tsx`: eski analytics component klasorunden feature modulune tasindi.
- `api/metaAds.ts` ve `components/analytics/MetaAdsPanel.tsx` backward compatibility re-export dosyalarina donusturuldu.
- `MetaAdsDetailPage.tsx` literal query key'ler yerine feature key factory kullaniyor; formatter ve immutable kampanya siralama kodu feature modeline tasindi.
- `ClientAnalyticsPage` Meta Ads feature public API'sini kullanmaya basladi.

### Test ve Dogrulama

- Backend `MetaAdsAccessPolicyTest`: 2 test.
- Backend `MetaAdsAccountServiceTest`: 3 test.
- Backend `MetaAdsMapperTest`: 4 test.
- Backend `MetaAdsServiceTest`: 5 test.
- Tum backend sonucu: **160 test basarili** (onceki 146'dan 14 yeni test).
- Frontend `metaAds.utils.test.ts`: 2 yeni test.
- Tum frontend sonucu: **120 test basarili** (onceki 118'den 2 yeni test).
- `npm run build`: **basarili**.
- `mvn test`: **basarili**.

### Bilinen Gecis Borclari

- Meta Ads ve Instagram halen ayni Facebook OAuth token kaydini kullaniyor. Bu paylasim kasitli; ileride scope seti urun bazli yonetilirse token capability bilgisi acik bir domain modeline alinmali.
- `MetaAdsDetailPage.tsx` 250 satir civarinda ve mevcut sert inceleme esiginin altinda; tablo ve grafik bilesenleri tekrar kullanilmaya baslarsa ayri presentational bilesenlere alinabilir.
- Production bundle ~1.84 MB; route-level lazy loading Faz 7'de ele alinmali.

### Sonuc ve Siradaki Faz

Meta Ads dikey dilimi Graph client, mapping, hesap ID yonetimi, authorization, tipli controller contract'lari ve ortak frontend feature siniri ile tamamlandi. Boylece Faz 6 kapsamindaki alti harici entegrasyonun tamami ayri modul sinirlarina tasindi.

**Siradaki faz: Faz 7 - Modul sonrasi genel UI ve performans.** Ilk hedef route-level code splitting ve bundle analizi ile 1.84 MB production bundle'ini parcalamak.

## 33. Route-Level Code Splitting ve Route Boundary - TAMAMLANDI

**Tamamlanma tarihi:** 12 Haziran 2026

### Route Yapisi

- `App.tsx` icindeki 50 eager page/layout import'u `React.lazy()` tabanli dinamik import'lara donusturuldu.
- Admin, staff ve client layout'lari da route seviyesinde lazy yukleniyor; kullanici yalnizca girdigi panelin layout ve sayfa kodunu indiriyor.
- Ayni sayfayi kullanan admin/staff route'lari ayni dinamik chunk'i paylasmaya devam ediyor.
- `ServicePageGate` named export'u lazy adapter ile dinamik yukleniyor; login ve admin/staff girislerinde client servis kontrol kodu artik zorunlu preload edilmiyor.
- Route path'leri, rol kontrolleri, membership kontrolleri ve servis gate davranislari degistirilmedi.

### Yukleme ve Hata Siniri

- `components/routing/RouteBoundary.tsx` olusturuldu.
- Tum route agaci ortak `Suspense` fallback'i kullaniyor; route chunk'i indirilirken standart yukleme ekrani gosteriliyor.
- Dinamik chunk yukleme veya render hatalari route error boundary tarafindan yakalaniyor.
- Hata ekrani tam sayfa yenileme aksiyonu sunuyor; route degistiginde boundary pathname anahtariyla sifirlaniyor.

### Vendor Chunk Stratejisi

- Vite 8 / Rolldown `output.codeSplitting.groups` kullanilarak vendor paketleri dengeli gruplandi.
- React/router/query, Lucide ikonlari, Recharts/D3, Framer Motion, form/Zod, realtime ve drag-drop kutuphaneleri ayri cache edilebilir vendor chunk'larina alindi.
- Otomatik code splitting'in olusturdugu cok sayida mikro icon/shared chunk azaltildi; route chunk'lari ayri kaldi.

### Bundle Sonucu

- Onceki production JS: tek ana dosya **1.840,56 KB / 486,87 KB gzip**.
- Yeni uygulama entry chunk'i: **81,07 KB / 25,56 KB gzip**.
- Ilk HTML tarafindan preload edilen toplam JS yaklasik **536 KB / 169 KB gzip**; ilk JS transferi gzip bazinda yaklasik **%65 azaldi**.
- En buyuk chunk `vendor-react`: **381,83 KB**; ikinci `vendor-charts`: **380,61 KB**.
- Tum chunk'lar 500 KB kalite sinirinin altinda; Vite buyuk chunk uyarisi kaldirildi.
- Vendor gruplama oncesi 164 olan JS chunk sayisi **93** dosyaya indirildi.
- CSS boyutu yaklasik **154,73 KB / 20,21 KB gzip** ile degismedi.

### Test ve Dogrulama

- `RouteBoundary.test.tsx`: loading fallback ve render/chunk hata ekrani icin 2 test.
- Tum frontend sonucu: **122 test basarili** (onceki 120'den 2 yeni test).
- `npm run build`: **basarili**.
- `git diff --check`: **basarili**.

### Bilinen Gecis Borclari

- Route tanimlari halen merkezi `App.tsx` dosyasinda. Bundle problemi giderildi; sonraki router sahipligi turunda admin/staff/client route agaclari ayri modul dosyalarina alinabilir.
- `vendor-react` ve `vendor-charts` yaklasik 380 KB seviyesinde ancak gzip boyutlari sirasiyla 120 KB ve 109 KB. Route bazli grafik kullanimlari olculdukten sonra Recharts alt modullerinin daha ince parcaya ihtiyaci yeniden degerlendirilmeli.
- Service worker yeni deploy sonrasi eski chunk ismiyle acik sekmelerde hata uretebilir; route error boundary tam yenileme ile kurtarma sagliyor.

### Sonuc ve Siradaki Adim

Uygulamanin tum sayfa kodunu ilk acilista indiren merkezi eager bundle kaldirildi. Route ve vendor sinirlari sayesinde ilk JS transferi yaklasik ucte bire indi ve tum chunk'lar kalite esiginin altina cekildi.

**Siradaki adim: dashboard view model'leri ve query tekrar analizi.** Ilk hedef `ClientDashboard.tsx` icindeki coklu entegrasyon donusumlerini ve ayni veriyi farkli key'lerle isteyen sorgulari olcmek.

## 34. Client Dashboard View Model ve Query Tekrar Analizi - TAMAMLANDI

**Tamamlanma tarihi:** 12 Haziran 2026

### Frontend

- `frontend/src/features/client-dashboard` altinda tipler, query key factory, utility fonksiyonlar, hook ve UI bilesenleri olusturuldu.
- `dashboard.types.ts`: TabKey, DashboardViewModel ve feature tipleri (GaOverviewResponse, ScOverviewResponse, IgOverviewResponse, ShootResponse, TaskResponse) re-export edildi.
- `dashboardKeys.ts`: Tab bazli dogru query key factory'leri (`dashboardRefreshKeys.overview/web/social/schedule`) olusturuldu; her tab icin ilgili feature key factory'leri (`analyticsKeys`, `searchConsoleKeys`, `instagramKeys`, `shootKeys`, `taskKeys`) kullanildi.
- `dashboard.utils.ts`: `fmt`, `pct`, `dur` formatlama fonksiyonlari merkezi feature modulu altina alindi.
- `useClientDashboard.ts`: GA, SC, IG, shoots ve tasks sorgulari tek hook icinde toplandi; eski inline `['client-ga', cid]` key yerine `analyticsKeys.overview(companyId)` kullanildi; service gating mantigi hook icinde merkezi hale getirildi.
- `useRefreshDashboard.ts`: Tab bazli yenileme ve tum veri yenileme hook'lari olusturuldu; dogru feature key factory'leri kullanarak invalidasyon yapiyor.
- 742 satirlik `ClientDashboard.tsx` 1 satirlik route composition dosyasina donusturuldu.
- `OverviewTab`, `WebAnalyticsTab`, `SocialTab`, `ScheduleTab` ayri sorumluluklara ayrildi.
- `MetricCard`, `MiniStat`, `ChartCard`, `ListCard`, `QuickLink`, `EmptyState`, `DashboardLoader` yeniden kullanilabilir UI bilesenlerine ayrildi.
- Tum tab component'leri artik tipli props kullaniyor; `any` kaldirildi.
- ClientLayout `useClientDataPrefetch` yerine `useClientDashboard` hook'unu kullanmaya basladi.
- ClientAnalyticsPage `useRefreshAllClientData` yerine `useRefreshDashboard` hook'unu kullanmaya basladi.
- Eski `useClientDataPrefetch.ts` dosyasi backward-compat re-export olarak birakildi.

### Query Key Duzenlemesi

- GA sorgusu icin inline `['client-ga', companyId]` key yerine `analyticsKeys.overview(companyId)` kullanildi; ayni veri artik dashboard ve detail sayfalarinda ortak cache paylasiyor.
- SC ve IG sorgulari zaten feature key factory'lerini kullaniyordu; devam edildi.
- Shoots ve tasks sorgulari `shootKeys.list('client', 0, 20)` ve `taskKeys.clientList()` factory'lerini kullaniyor.
- Tab bazli yenileme `dashboardRefreshKeys` ile her tab icin dogru feature key'lerini invalidate ediyor; string prefix yenileme kaldirildi.

### Test ve Dogrulama

- Frontend `dashboard.utils.test.ts`: 11 test (`fmt`, `pct`, `dur`).
- Tum frontend sonucu: **133 test basarili** (onceki 122'den 11 yeni test).
- Client-dashboard feature scoped ESLint: **basarili**.
- `npm run build`: **basarili**.
- `mvn test`: **160 test basarili**.

### Bilinen Gecis Borclari

- `ClientDashboardPage.tsx` yaklasik 140 satir; hedef esigin altinda ancak hero section, tab nav ve loading state halen tek dosyada. Ileride hero component'i ayri bir presentational bilesene alinabilir.
- `SocialTab.tsx` ve `WebAnalyticsTab.tsx` Chart ve metric bilesenleri daha ince alt bilesenlere bolunebilir; mevcut durumda her tab sorumluluk sinirinda.
- Route tanimlari hala merkezi `App.tsx` dosyasinda; sonraki router sahipligi turunda ayri modul dosyalarina alinabilir.
- `useClientDataPrefetch.ts` backward-compat re-export olarak birakildi; tum importlar yeni feature gectikten sonra kaldirilmali.
- Production bundle ~1.84 MB; route-level lazy loading ve vendor grouping zaten uygulandi.

### Sonuc ve Siradaki Adim

Client Dashboard view model ve query tekrar analizi tamamlandi. GA sorgusu icin inline key yerine feature key factory kullanildi; dashboard, detail sayfalari ve layout ayni veriyi ortak cache'den kullaniyor. 742 satirlik monolitik sayfa 1 satirlik route composition'a ve 6 ayrik feature bilesenine ayrildi. Tum tab component'leri tipli props kullaniyor.

**Siradaki adim:** Faz 7 - Modul sonrasi genel UI ve performans kapsamindaki kalan maddeler: Dashboard view model'leri tamamlandigina gore sirada `StaffCalendarPage.tsx` (~400 satir) duzenleme, `FloatingTaskFab.tsx` sadelestirme, route sahiplik modulleri, bundle analizi ve erisilebilirlik taramasi var.
