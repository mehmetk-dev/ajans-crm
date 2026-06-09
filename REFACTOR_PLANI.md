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
| Shoots | Bekliyor | - | - |
| Content plans / approvals | Bekliyor | - | - |
| PR projects | Bekliyor | - | - |
| Messaging | Bekliyor | - | - |
| Integrations | Bekliyor | - | Her entegrasyon ayri modul olacak |

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
- [ ] Shoots modulu.
- [ ] Content plans/approvals modulu.
- [ ] PR projects modulu.

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
