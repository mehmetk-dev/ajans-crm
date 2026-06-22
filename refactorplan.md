# FOG İstanbul CRM — Refactor & İyileştirme Planı

> **Tarih:** 2026-06-22
> **Kapsam:** İlk 5 modülün uçtan uca (Frontend + Backend) detaylı analizi
> **Sonraki ajan için handoff:** Dosyanın sonundaki `### Bir Sonraki Ajan İçin Bekleyen Modüller (Handoff List)` bölümü

---

## İçindekiler

1. [Modül 1: Şirket Yönetimi (company)](#modül-1-şirket-yönetimi-company)
2. [Modül 2: Mesajlaşma Sistemi (messaging)](#modül-2-mesajlaşma-sistemi-messaging)
3. [Modül 3: Görev Yönetimi (task)](#modül-3-görev-yönetimi-task)
4. [Modül 4: Takvim (calendar)](#modül-4-takvim-calendar)
5. [Modül 5: Kimlik Doğrulama & Güvenlik (auth/security)](#modül-5-kimlik-doğrulama--güvenlik-authsecurity)
6. [Bir Sonraki Ajan İçin Bekleyen Modüller (Handoff List)](#bir-sonraki-ajan-i̇çin-bekleyen-modüller-handoff-list)

---

## Modül 1: Şirket Yönetimi (company)

### Genel Bakış

| Katman | Dosya Sayısı | Mimari Desen |
|--------|-------------|-------------|
| Backend | 18 Java dosyası | Domain-driven package by component (`application/`, `web/`, `dto/`, `infrastructure/`) |
| Frontend | 14 TypeScript/TSX dosyası | Feature-based (`ui/`, `hooks/`, `api/`, `model/`) |

Backend dosyaları: `CompanyService.java`, `StaffService.java`, `PermissionService.java`, `CompanyMapper.java`, `CompanyAccessPolicy.java`, `ClientTeamService.java`, `ClientActiveServicesService.java`, `CompanyServiceAccessGuard.java`, `CompanyDataCleanup.java`, 5 controller ve 10 DTO.

Frontend dosyaları: `CreateCompanyForm.tsx`, `EditCompanyForm.tsx`, `CompanyList.tsx`, `CompanyMembersPanel.tsx`, `PermissionPanel.tsx`, `AddEmployeeForm.tsx`, `DeleteCompanyConfirm.tsx`, `MemberGroup.tsx`, hook/API/type dosyaları.

---

### A. Backend İncelemesi

#### A1. Mevcut Mimari Değerlendirmesi

**Olumlu yönler:**
- Domain-driven package-by-component yapısı temiz ve ölçeklenebilir (`company/application/`, `company/web/`, `company/dto/`)
- `CompanyAccessPolicy` ile erişim kontrolü servis katmanından ayrılmış, Single Responsibility uyumu iyi
- `@Transactional` kullanımı doğru yerlerde; şirket oluşturma sırasında `createCompanyWithOwner()` metodu tek transaction altında Company + Person + UserProfile + Membership oluşturuyor
- `CompanyDataCleanup` ile silme işlemlerinde orphan veri bırakılmaması sağlanmış
- `CompanyMapper` component olarak ayrılmış, DTO dönüşümleri merkezi

#### A2. Tespit Edilen Sorunlar ve İyileştirme Önerileri

**1. `CompanyService.java:51-110` — `createCompanyWithOwner` metodunda 21 field manuel set ediliyor**

```java
// MEVCUT (CompanyService.java L57-77):
Company company = new Company();
company.setKind(CompanyKind.CLIENT);
company.setName(req.getName());
company.setIndustry(req.getIndustry());
company.setTaxId(req.getTaxId());
// ... 17 satır daha manuel field ataması
```

**Sorun:** Entity oluşturma sırasında 21 adet `set` çağrısı hem okunabilirliği düşürüyor hem de yeni bir field eklendiğinde bu metodun da güncellenmesi gerekiyor. Aynı pattern `update()` metodunda (L150-178) ve `StaffService.createStaff()` metodunda da tekrar ediyor.

**Aksiyon:** MapStruct veya manuel `toEntity` builder metodu ekleyin:
```java
// Şirket oluşturma için CompanyMapper'a ekleyin:
public Company toEntity(CreateCompanyRequest req) {
    Company company = new Company();
    company.setKind(CompanyKind.CLIENT);
    // ... mapping
    company.setContractStatus(ContractStatus.ACTIVE);
    return company;
}

// Update için:
public void merge(Company company, UpdateCompanyRequest req) {
    // BeanUtils.copyProperties yerine kontrollü merge
}
```

**2. `CompanyMapper.java:22-47` — `toResponse` ve `toDetailedResponse` arasında %70 kod tekrarı**

```java
// MEVCUT: toResponse() ve toDetailedResponse() aynı üyelik sayım mantığını tekrar ediyor
public CompanyResponse toResponse(Company company) {
    List<CompanyMembership> memberships = membershipRepository.findByCompanyId(company.getId());
    // ...
}
public CompanyResponse toDetailedResponse(Company company) {
    List<CompanyMembership> memberships = membershipRepository.findByCompanyId(company.getId());
    // aynı sorgu VE aynı sayım mantığı tekrar
}
```

**Aksiyon:** `toDetailedResponse` metodunu `toResponse`'u çağıracak şekilde yeniden düzenleyin:
```java
public CompanyResponse toDetailedResponse(Company company) {
    CompanyResponse base = toResponse(company); // önce temel mapping
    // base üzerine detay alanlarını ekleyin (members listesi vb.)
    return base.toBuilder() // @Builder(toBuilder = true) gerekir
        .members(memberInfos)
        .build();
}
```

**3. `PermissionService.java:32-49` — İzin anahtarları hard-coded string listesi**

```java
private static final List<String> ALL_PERMISSION_KEYS = List.of(
    "messages.general.write", "messages.dm.start", // ...
);
```

**Sorun:** Bu liste hem backend'de hem frontend'de (`permission.constants.ts`) manuel tutuluyor. Yeni bir izin eklendiğinde iki yerde de güncelleme gerek.

**Aksiyon:** `permission_definitions` tablosunu seed data olarak kullanın ve runtime'da veritabanından çekin:
```java
// PermissionService içinde:
private final PermissionDefinitionRepository definitionRepo;

public List<String> getAllPermissionKeys() {
    return definitionRepo.findAllKeys(); // DB'den canlı çek
}
```

**4. `CompanyService.java:198-232` — `addEmployeeToCompany` metodunda email duplicate kontrolü transaction başında yapılıyor ama `existsByEmail` ile `save` arasında race condition riski var**

**Aksiyon:** Veritabanı seviyesinde `user_profiles.email` kolonuna `UNIQUE` constraint zaten var. `DataIntegrityViolationException`'ı catch edip `ApiException`'a çevirin veya `@Version` ile optimistic locking kullanın:
```java
// GlobalExceptionHandler'da zaten DataIntegrityViolationException handler var,
// ama EMAIL_ALREADY_EXISTS spesifik hatasını verebilmek için:
try {
    userProfileRepository.save(userProfile);
} catch (DataIntegrityViolationException e) {
    throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "...");
}
```

**5. `CompanyService.java:235-247` — `removeEmployeeFromCompany` sadece `EMPLOYEE` rolünü kaldırabiliyor, OWNER kaldırılamıyor ama hata mesajı AccessDeniedException fırlatıyor**

**Aksiyon:** `AccessDeniedException` yerine `ApiException` kullanın (HTTP 403 değil 422 uygun olur):
```java
throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "CANNOT_REMOVE_OWNER",
    "Şirket sahibi bu endpoint ile kaldırılamaz. Şirketi silin.");
```

**6. `PermissionService.java:111-155` — `setDefaultPermissions` metodunda her izin için tek tek DB sorgusu + save yapılıyor (N+1 problem)**

```java
for (Map.Entry<String, PermissionLevel> entry : defaults.entrySet()) {
    CompanyPermission perm = permissionRepository
        .findByUserIdAndCompanyIdAndPermissionKey(userId, companyId, entry.getKey())
        .orElse(CompanyPermission.builder()...);
    perm.setLevel(entry.getValue());
    permissionRepository.save(perm);
}
```

**Aksiyon:** Batch insert/update için `saveAll()` kullanın:
```java
List<CompanyPermission> permissions = new ArrayList<>();
for (var entry : defaults.entrySet()) {
    CompanyPermission perm = permissionRepository
        .findByUserIdAndCompanyIdAndPermissionKey(...)
        .orElse(CompanyPermission.builder()...);
    perm.setLevel(entry.getValue());
    permissions.add(perm);
}
permissionRepository.saveAll(permissions);
```

---

### B. Frontend İncelemesi

#### B1. Mevcut Mimari Değerlendirmesi

**Olumlu yönler:**
- Feature-based klasör yapısı (`features/company/ui/`, `api/`, `hooks/`, `model/`)
- `useCompanies` hook'u ile React Query kullanımı, cache stratejisi doğru
- `CreateCompanyForm` bileşeni controlled form pattern'i ile yazılmış
- Servis katalogu (`SERVICE_CATALOG`) sabit olarak tanımlanmış, tip güvenli

#### B2. Tespit Edilen Sorunlar ve İyileştirme Önerileri

**1. `CreateCompanyForm.tsx:35-163` — 163 satır tek bir bileşen, hiçbir alt bileşene bölünmemiş**

**Sorun:** Form; şirket bilgileri, sosyal medya, şirket sahibi, servis seçimi ve altyapı bilgileri olmak üzere 5 ayrı section içeriyor. Hepsi tek dosyada.

**Aksiyon:** Her section'ı ayrı bir alt bileşene çıkarın:
```
features/company/ui/
├── CreateCompanyForm.tsx        (sadece form state ve submit)
├── CompanyInfoSection.tsx       (şirket bilgileri)
├── SocialMediaSection.tsx       (sosyal medya)
├── OwnerInfoSection.tsx         (şirket sahibi)
├── ServiceSelectionGrid.tsx     (servis katalog seçimi)
└── InfrastructureSection.tsx    (hosting/domain/SSL)
```

**2. Form state yönetimi `CreateCompanyInput` tipi düz obje, her alan değişiminde tüm form re-render oluyor**

**Aksiyon:** `react-hook-form` kullanın (proje planında belirtilmiş):
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const companySchema = z.object({
  name: z.string().min(1, 'Şirket adı zorunlu'),
  // ...
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(companySchema)
});
```

**3. `FormSection` yardımcı bileşeni `CreateCompanyForm.tsx` içinde inline tanımlanmış, tekrar kullanılabilir değil**

**Aksiyon:** `FormSection`'ı `components/ui/` altına shared bileşen olarak taşıyın:
```tsx
// components/ui/FormSection.tsx
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-white/[0.06] rounded-xl">
      <legend className="text-xs text-zinc-500 font-medium px-2">{title}</legend>
      {children}
    </fieldset>
  );
}
```

**4. `PermissionPanel.tsx` — İzin anahtarları frontend'de `permission.constants.ts` dosyasında hard-coded**

Backend'deki aynı sorun. Backend'den `/api/admin/permissions/keys` gibi bir endpoint ile canlı liste çekilmeli.

**5. Hata yönetimi eksik: `onSubmit` hatalarında sadece string `error` state'i var**

**Aksiyon:** React Query `useMutation` ile hata yönetimini merkezi hale getirin:
```tsx
const createCompany = useMutation({
  mutationFn: companyApi.create,
  onError: (error: ApiError) => {
    // error.code, error.message, error.fieldErrors ile spesifik hata gösterimi
  }
});
```

---

### C. Aksiyon Adımları (Öncelik Sırası)

| # | Aksiyon | Öncelik | Tahmini Efor |
|---|---------|---------|-------------|
| 1 | `CompanyService.createCompanyWithOwner()` metoduna MapStruct entity mapper ekle | Yüksek | 2 saat |
| 2 | `PermissionService.setDefaultPermissions()` N+1 problemini `saveAll()` ile çöz | Yüksek | 1 saat |
| 3 | `CreateCompanyForm.tsx` 5 alt bileşene böl ve `react-hook-form` + `zod` ile yeniden yaz | Yüksek | 4 saat |
| 4 | `CompanyMapper.toResponse/toDetailedResponse` kod tekrarını gider | Orta | 1.5 saat |
| 5 | İzin anahtarlarını DB'den canlı çekecek endpoint ekle (`GET /api/admin/permissions/keys`) | Orta | 2 saat |
| 6 | `FormSection` bileşenini shared components'a taşı | Düşük | 0.5 saat |
| 7 | `addEmployeeToCompany` metoduna race-condition koruması ekle | Düşük | 0.5 saat |

---

## Modül 2: Mesajlaşma Sistemi (messaging)

### Genel Bakış

| Katman | Dosya Sayısı | Mimari Desen |
|--------|-------------|-------------|
| Backend | 14 Java dosyası | `application/`, `web/`, `dto/` — AccessPolicy + Service + Controller |
| Frontend | 13 TypeScript/TSX dosyası | Feature-based (`ui/`, `hooks/`, `api/`, `model/`) |

Backend: `MessagingService.java` (199 satır), `GroupMessagingService.java` (167 satır), `MessageAccessPolicy.java` (76 satır), `MessageMapper.java`, 5 controller, 6 DTO.

Frontend: `MessageThread.tsx` (215 satır), `MessageComposer.tsx`, `ConversationList.tsx`, `useWebSocket.ts` (141 satır), `useMessaging.ts`, API/type dosyaları.

---

### A. Backend İncelemesi

#### A1. Mevcut Mimari Değerlendirmesi

**Olumlu yönler:**
- WebSocket (STOMP) + HTTP REST hybrid mimarisi iyi kurgulanmış
- `WebSocketConfig.java:104-130` — `enforceDestinationAuthorization` ile STOMP seviyesinde yetkilendirme yapılıyor
- `MessageAccessPolicy` temiz, her policy metodu tek sorumluluğa sahip
- Cookie-based WebSocket auth (handshake interceptor) ve header-based fallback mekanizması var
- Grup mesajlaşma (`GroupMessagingService`) ve DM (`MessagingService`) ayrı servislerde
- Read receipt mekanizması (`message_read_receipts` tablosu) implemente edilmiş

#### A2. Tespit Edilen Sorunlar ve İyileştirme Önerileri

**1. `MessagingService.java:67-97` — `getMyConversations` metodunda N+1 sorgu problemi var**

```java
// MEVCUT: Her conversation için ayrı ayrı lastMessage sorgusu atılıyor (L89)
return conversations.stream().map(c -> {
    Message lastMessage = messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(c.getId()).orElse(null);
    // ...
}).collect(Collectors.toList());
```

**Aksiyon:** Tek bir JPQL/sorgu ile tüm conversation'ların son mesajlarını çekin:
```java
// MessageRepository'ye ekleyin:
@Query("SELECT m FROM Message m WHERE m.conversation.id IN :ids AND m.createdAt = "
    + "(SELECT MAX(m2.createdAt) FROM Message m2 WHERE m2.conversation.id = m.conversation.id)")
List<Message> findLastMessagesByConversationIds(@Param("ids") List<UUID> ids);
```

**2. `MessagingService.java:100-132` — `sendMessage` metodunda mesaj gönderimi sırasında `RuntimeException` kullanılıyor**

```java
Conversation conversation = conversationRepository.findById(conversationId)
    .orElseThrow(() -> new RuntimeException("Konusma bulunamadi")); // L102
```

**Aksiyon:** Tüm `RuntimeException`'lar `ApiException` ile değiştirilmeli:
```java
.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONVERSATION_NOT_FOUND", "Konuşma bulunamadı"));
```
Aynı durum `GroupMessagingService.java:127` ve `MessagingService.java:137` için de geçerli.

**3. `GroupMessagingService.java:55-67` — `addMemberToCompanyGroup` metodunda null-check zinciri kod akışını karmaşıklaştırıyor**

```java
public void addMemberToCompanyGroup(UUID companyId, UUID userId) {
    UserProfile user = userProfileRepository.findById(userId).orElse(null); // L56
    if (user == null) return;
    GroupConversation group = groupConversationRepository.findByCompanyId(companyId).orElse(null); // L59
    if (group == null) {
        Company company = companyRepository.findById(companyId).orElse(null); // L61
        if (company == null) return;
        group = createCompanyGroup(company, user);
    } else {
        addMemberIfNotExists(group, user);
    }
}
```

**Aksiyon:** `Optional.map/flatMap/orElseThrow` zinciri ile daha okunabilir hale getirin:
```java
@Transactional
public void addMemberToCompanyGroup(UUID companyId, UUID userId) {
    UserProfile user = userProfileRepository.findById(userId)
        .orElseThrow(() -> new ApiException(NOT_FOUND, "USER_NOT_FOUND", "..."));
    
    GroupConversation group = groupConversationRepository.findByCompanyId(companyId)
        .orElseGet(() -> {
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApiException(NOT_FOUND, "COMPANY_NOT_FOUND", "..."));
            return createCompanyGroup(company, user);
        });
    
    addMemberIfNotExists(group, user);
}
```

**4. `WebSocketConfig.java:86-88` — STOMP error handling'de `RuntimeException` fırlatılıyor**

```java
} else {
    throw new RuntimeException("Invalid WebSocket token");
}
```

**Aksiyon:** STOMP hataları için `StompCommandException` veya `MessageDeliveryException` kullanın. `RuntimeException` WebSocket bağlantısını koparır ama anlamlı hata mesajı dönmez.

**5. `GroupMessagingService.java:82-122` — `getMyGroups` metodunda her group için ayrı ayrı `GroupMember` sorgusu yapılıyor**

```java
List<GroupMember> members = groupMemberRepository.findByGroupId(group.getId()); // L96
```

**Aksiyon:** Batch fetch ile tüm group member'ları tek seferde çekin:
```java
List<UUID> groupIds = memberships.stream().map(m -> m.getGroup().getId()).toList();
Map<UUID, List<GroupMember>> membersByGroup = groupMemberRepository
    .findByGroupIdIn(groupIds).stream()
    .collect(Collectors.groupingBy(m -> m.getGroup().getId()));
```

**6. `MessagingService.java:165-198` — `getContacts` metodu 199 satırlık servisin ~35 satırını kaplıyor ve karmaşık yetkilendirme mantığı içeriyor**

**Aksiyon:** Contact listeleme mantığını ayrı bir `ContactService` veya `MessagingService` içinde `getContactsForUser` private metodu olarak refactor edin. Özellikle EMPLOYEE vs diğer roller için branching logic'i test edilebilir küçük metodlara bölün.

---

### B. Frontend İncelemesi

#### B1. Mevcut Mimari Değerlendirmesi

**Olumlu yönler:**
- `useWebSocket` hook'u STOMP bağlantısını, subscription'ları ve send'i kapsüllüyor
- `DmMessageThread` ve `GroupMessageThread` aynı dosyada ama ayrı bileşenler olarak iyi ayrılmış
- Read receipt (✓/✓✓) görsel göstergesi `MessageThread.tsx:103-107` implemente edilmiş
- Ajans çalışanı renk ayrımı (turuncu + "Ajans" badge) `MessageThread.tsx:187-196` yapılmış

#### B2. Tespit Edilen Sorunlar ve İyileştirme Önerileri

**1. `MessageThread.tsx:1-215` — 215 satır tek dosyada iki ayrı bileşen var**

**Aksiyon:** `DmMessageThread` ve `GroupMessageThread`'i ayrı dosyalara çıkarın:
```
features/messaging/ui/
├── DmMessageThread.tsx
├── GroupMessageThread.tsx
├── MessageBubble.tsx          (ortak mesaj balonu)
└── ThreadHeader.tsx           (ortak header)
```

**2. `MessageThread.tsx:82-113` — DM mesaj listesinde `messages.map()` içinde inline JSX fazlasıyla uzun**

**Aksiyon:** Mesaj render'ını `MessageBubble` bileşenine çıkarın:
```tsx
function MessageBubble({ msg, isMine, showSender }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={/* bubble stilleri */}>
        {showSender && <SenderLabel msg={msg} />}
        <p>{msg.content}</p>
        <MessageMeta msg={msg} isMine={isMine} />
      </div>
    </div>
  );
}
```

**3. `useWebSocket.ts:127-138` — `sendMessage` fonksiyonu STOMP üzerinden gönderiyor ancak HTTP fallback yok**

**Aksiyon:** WebSocket bağlantısı koptuğunda HTTP POST `/api/staff/messaging/conversations/{id}/messages` endpoint'ine fallback yapın:
```tsx
const sendMessage = useCallback(async (conversationId: string, content: string) => {
  if (clientRef.current?.connected) {
    clientRef.current.publish({ destination: `/app/chat/${conversationId}`, body: ... });
    return true;
  }
  // HTTP fallback
  await messagingApi.sendMessage(conversationId, { content });
  return true;
}, []);
```

**4. `useWebSocket.ts:36-37` — `console.log` ve `console.error` production'da kalmamalı**

**Aksiyon:** Logger abstraction kullanın veya `import.meta.env.DEV` kontrolü ekleyin:
```tsx
if (import.meta.env.DEV) {
  console.log('[WS] Connected');
}
```

**5. Mesaj input'unda debounce yok, her tuş vuruşunda state güncelleniyor**

**Aksiyon:** `MessageComposer` bileşeninde `useDeferredValue` veya `useMemo` ile input değerini stabilize edin.

---

### C. Aksiyon Adımları (Öncelik Sırası)

| # | Aksiyon | Öncelik | Tahmini Efor |
|---|---------|---------|-------------|
| 1 | Tüm `RuntimeException`'ları `ApiException` ile değiştir (BE) | Yüksek | 1 saat |
| 2 | `getMyConversations` N+1 sorgusunu batch sorgu ile çöz (BE) | Yüksek | 1.5 saat |
| 3 | WS kopunca HTTP fallback mekanizması ekle (FE) | Yüksek | 2 saat |
| 4 | `MessageThread.tsx`'i 3 ayrı bileşene böl (FE) | Orta | 2 saat |
| 5 | `getMyGroups` batch member fetch ekle (BE) | Orta | 1 saat |
| 6 | `addMemberToCompanyGroup` null-check zincirini Optional zincirine çevir (BE) | Düşük | 0.5 saat |
| 7 | Production console.log'larını temizle (FE) | Düşük | 0.5 saat |

---

## Modül 3: Görev Yönetimi (task)

### Genel Bakış

| Katman | Dosya Sayısı | Mimari Desen |
|--------|-------------|-------------|
| Backend | 23 Java dosyası | `application/`, `web/`, `dto/` — 9 service, 10 DTO, 4 controller |
| Frontend | 11 TypeScript/TSX dosyası | Feature-based (`ui/`, `hooks/`, `api/`, `model/`) |

Backend: `TaskService.java` (207 satır), `TaskAccessPolicy.java` (71 satır), `TaskMapper.java`, `TaskNoteService.java`, `TaskReviewService.java`, `TaskNotificationPublisher.java`, `TaskOverdueScheduler.java`, `TaskAssignableUserService.java`, `RoutineTaskService.java`.

---

### A. Backend İncelemesi

#### A1. Mevcut Mimari Değerlendirmesi

**Olumlu yönler:**
- `TaskAccessPolicy` ile okuma/güncelleme/silme/atama yetkileri ayrı ayrı kontrol ediliyor
- `TaskNotificationPublisher` ile bildirim mantığı servis katmanından ayrılmış
- `TaskOverdueScheduler` ile geciken görevler için zamanlanmış kontrol var
- `PrProjectProgressService` ile PR projesi ilerlemesine task completion entegrasyonu yapılmış
- Client, Staff, Admin için ayrı controller'lar (`StaffTaskController`, `ClientTaskController`, `ClientTaskReviewController`, `AdminRoutineController`)

#### A2. Tespit Edilen Sorunlar ve İyileştirme Önerileri

**1. `TaskService.java:73-103` — `getTasksByX` metodlarında aşırı branching ve kod tekrarı**

```java
public Page<TaskResponse> getAllTasks(Pageable pageable, UUID userId) {
    UserProfile user = getUserOrThrow(userId);
    if (user.getGlobalRole() == GlobalRole.ADMIN) {
        return taskRepository.findAll(pageable).map(mapper::toResponse);
    }
    return taskRepository.findByAssignedToId(userId, pageable).map(mapper::toResponse);
}

public Page<TaskResponse> getTasksByStatus(TaskStatus status, Pageable pageable, UUID userId) {
    UserProfile user = getUserOrThrow(userId);
    if (user.getGlobalRole() == GlobalRole.ADMIN) {
        return taskRepository.findByStatus(status, pageable).map(mapper::toResponse);
    }
    // hemen hemen aynı kod tekrar
}
```

**Aksiyon:** Strategy pattern veya en azından private helper metod ile tekrarı azaltın:
```java
private Page<TaskResponse> getTasksByRole(Pageable pageable, UUID userId,
        Supplier<Page<Task>> adminQuery, Function<UUID, Page<Task>> userQuery) {
    UserProfile user = getUserOrThrow(userId);
    Page<Task> tasks = user.getGlobalRole() == GlobalRole.ADMIN
        ? adminQuery.get()
        : userQuery.apply(userId);
    return tasks.map(mapper::toResponse);
}
```

**2. `TaskService.java:195-201` — `deleteTask` metodunda cascade silme yok, task silinince task_reviews, task_notes orphan kalabilir**

**Aksiyon:** JPA entity'de `@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)` ekleyin veya manuel temizlik yapın:
```java
@Transactional
public void deleteTask(UUID taskId, UUID userId) {
    Task task = taskRepository.findById(taskId).orElseThrow(...);
    accessPolicy.requireDelete(task, getUserOrThrow(userId));
    taskReviewRepository.deleteByTaskId(taskId);  // önce reviews
    taskNoteRepository.deleteByTaskId(taskId);     // önce notes
    taskRepository.delete(task);                    // sonra task
}
```

**3. `TaskService.java:40-70` — `createTask` metodunda hata yönetimi `RuntimeException` ile yapılıyor**

```java
Company company = companyRepository.findById(req.getCompanyId())
    .orElseThrow(() -> new RuntimeException("Sirket bulunamadi")); // L48
```

**Aksiyon:** `RuntimeException` → `ApiException` dönüşümü (Modül 2'deki aynı sorun).

**4. `TaskAccessPolicy.java:30-33` — `requireUpdate`, `requireRead` ile aynı mantığı çalıştırıyor**

```java
public void requireUpdate(Task task, UserProfile user) {
    requireRead(task, user); // Okuma yetkisi olan herkes güncelleyebilir
}
```

**Sorun:** Bu, şirket çalışanının (EMPLOYEE) kendine atanmamış görevleri de güncelleyebilmesine izin veriyor olabilir.

**Aksiyon:** `requireUpdate` için ek kontrol ekleyin: Görev sadece atanan kişi veya ADMIN tarafından güncellenebilmeli.

**5. `TaskService.java:143-165` — `updateTask` metodu çok fazla sorumluluk üstleniyor**

Metod; yetki kontrolü, field güncelleme, DONE durum kontrolü, completedAt ayarı, PR progress güncelleme, bildirim gönderme ve save işlemlerini aynı anda yapıyor.

**Aksiyon:** Domain event pattern ile side-effect'leri ayırın:
```java
@Transactional
public TaskResponse updateTask(UUID taskId, UpdateTaskRequest req, UUID userId) {
    Task task = taskRepository.findById(taskId)...;
    accessPolicy.requireUpdate(task, getUserOrThrow(userId));
    applyUpdates(task, req, user);
    if (req.getStatus() == TaskStatus.DONE) {
        task.complete(); // domain method: completedAt set + event publish
    }
    task = taskRepository.save(task);
    eventPublisher.publish(new TaskUpdatedEvent(task)); // notification async
    return mapper.toResponse(task);
}
```

---

### B. Frontend İncelemesi

#### B1. Mevcut Mimari Değerlendirmesi

**Olumlu yönler:**
- `useTasks.ts` hook'u temiz; React Query `useMutation` ile cache invalidation doğru kurgulanmış
- `taskKeys` ile query key factory pattern'i kullanılmış
- `KanbanBoard.tsx`, `TaskCreateDialog.tsx`, `TaskDetailPanel.tsx` ayrı bileşenler olarak bölünmüş

#### B2. Tespit Edilen Sorunlar ve İyileştirme Önerileri

**1. `useTasks.ts:29-34` — `useCreateTask` mutation'ında optimistic update yok**

```tsx
return useMutation({
    mutationFn: (input: CreateTaskInput) => taskApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.staffLists() }),
});
```

**Aksiyon:** Optimistic update ekleyerek kullanıcıya anında geri bildirim verin:
```tsx
onMutate: async (newTask) => {
    await queryClient.cancelQueries({ queryKey: taskKeys.staffLists() });
    const previous = queryClient.getQueryData(taskKeys.staffList('all'));
    queryClient.setQueryData(taskKeys.staffList('all'), (old: Page<TaskResponse>) => ({
        ...old,
        content: [/* optimistic task */, ...old.content]
    }));
    return { previous };
},
onError: (_err, _newTask, context) => {
    queryClient.setQueryData(taskKeys.staffList('all'), context?.previous);
}
```

**2. `KanbanBoard.tsx` — 45KB, muhtemelen çok büyük bir dosya**

**Aksiyon:** Kanban board'u alt bileşenlere bölün:
```
features/tasks/ui/
├── KanbanBoard.tsx       (container, state management)
├── KanbanColumn.tsx      (tek kolon)
├── KanbanCard.tsx        (tek kart)
├── KanbanDragLayer.tsx   (drag & drop)
```

**3. `useTasks.ts:6-12` — `useStaffTasks` hook'unda `size = 100` hard-coded**

**Aksiyon:** Bu değeri konfigürasyondan alın veya `useMemo` ile hesaplanabilir kılın. Özellikle mobil görünümde 100 task çekmek gereksiz.

**4. `useAssignableUsers` hook'u `companyId` parametresine bağlı değil gibi görünüyor**

**Aksiyon:** `useQuery`'nin `enabled` seçeneğini `Boolean(companyId)` olarak ayarlayın ki boş companyId ile sorgu atılmasın.

---

### C. Aksiyon Adımları (Öncelik Sırası)

| # | Aksiyon | Öncelik | Tahmini Efor |
|---|---------|---------|-------------|
| 1 | Task silmede cascade temizlik (task_reviews, task_notes) ekle (BE) | Yüksek | 1 saat |
| 2 | `requireUpdate` yetkilendirmesini sıkılaştır, sadece atanan kişi güncelleyebilsin (BE) | Yüksek | 1 saat |
| 3 | `RuntimeException` → `ApiException` dönüşümü (BE) | Yüksek | 0.5 saat |
| 4 | `useCreateTask` ve `useUpdateTask` mutation'larına optimistic update ekle (FE) | Yüksek | 2 saat |
| 5 | `KanbanBoard.tsx` 45KB dosyayı alt bileşenlere böl (FE) | Orta | 3 saat |
| 6 | `getAllTasks/getTasksByStatus` kod tekrarını gider (BE) | Orta | 1.5 saat |
| 7 | `useAssignableUsers` hook'una `enabled: Boolean(companyId)` ekle (FE) | Düşük | 0.5 saat |

---

## Modül 4: Takvim (calendar)

### Genel Bakış

| Katman | Dosya Sayısı | Mimari Desen |
|--------|-------------|-------------|
| Backend | 2 Java dosyası | `application/CalendarExportService.java`, `web/CalendarExportController.java` |
| Frontend | 10 TypeScript/TSX dosyası | Feature-based (`ui/`, `hooks/`, `model/`) |

Backend: Sadece iCal export endpoint'i var. Meeting/Shoot/Task verilerini kullanıcı yetkisine göre filtreleyip iCal formatında döndürüyor.

Frontend: `CalendarGrid.tsx`, `TaskAgenda.tsx`, `MeetingAgenda.tsx`, `ShootAgenda.tsx`, `useStaffCalendar.ts` hook'u.

---

### A. Backend İncelemesi

#### A1. Mevcut Mimari Değerlendirmesi

**Olumlu yönler:**
- iCal export için `StringBuilder` ile manuel formatlama, kütüphane bağımlılığı yok
- `escapeIcal()` metodu ile özel karakter temizliği yapılmış
- Admin ve normal kullanıcı için yetki bazlı filtreleme (`loadEntries`)

#### A2. Tespit Edilen Sorunlar ve İyileştirme Önerileri

**1. `CalendarExportService.java:48-65` — Admin için `findAll()` kullanılıyor, büyük veride performans sorunu**

```java
if (admin) {
    return new CalendarEntries(
        meetingRepository.findAll(),  // tüm meeting'ler belleğe yükleniyor
        shootRepository.findAll(),    // tüm shoot'lar belleğe yükleniyor
        taskRepository.findAll()      // tüm task'lar belleğe yükleniyor
    );
}
```

**Aksiyon:** En azından tarih filtresi ekleyin (örn. son 1 ay - önümüzdeki 6 ay):
```java
@Query("SELECT m FROM Meeting m WHERE m.meetingDate BETWEEN :start AND :end")
List<Meeting> findAllInRange(@Param("start") Instant start, @Param("end") Instant end);
```

**2. `CalendarExportService.java:76-77` — iCal `SUMMARY` alanı 255 karakter sınırına sahip, truncate yok**

**Aksiyon:** Uzun metinleri kısaltın:
```java
private void appendText(StringBuilder calendar, String property, String value) {
    if (value != null && !value.isBlank()) {
        String truncated = value.length() > 200 ? value.substring(0, 197) + "..." : value;
        calendar.append(property).append(':').append(escapeIcal(truncated)).append("\r\n");
    }
}
```

**3. Modül eksik: Calendar CRUD endpoint'leri yok**

Sadece export var. Takvim verilerini getiren (GET) bir endpoint eklenmeli. Frontend şu anda `useStaffTasks`, `useMeetings`, `useStaffShoots` hook'ları ile ayrı ayrı veri çekiyor.

**Aksiyon:** Backend'e `GET /api/calendar?start=2026-06-01&end=2026-06-30` endpoint'i ekleyerek tüm etkinlikleri tek seferde döndürün:
```java
// CalendarController (yeni)
@GetMapping
public CalendarResponse getCalendar(
    @RequestParam Instant start,
    @RequestParam Instant end,
    Authentication auth) {
    return calendarService.getEvents(userId, start, end);
}
```

**4. iCal'de `VEVENT` için `DTSTAMP` zorunlu alanı eksik**

**Aksiyon:** Her event'e `DTSTAMP:{utcNow}` ekleyin.

---

### B. Frontend İncelemesi

#### B1. Mevcut Mimari Değerlendirmesi

**Olumlu yönler:**
- `useStaffCalendar` hook'u temiz, tüm state ve memoization doğru kullanılmış
- `calendar.index.ts` — `indexTasks`, `indexMeetings`, `indexShoots` ile veri indeksleme pattern'i iyi
- `CalendarGrid.tsx` custom grid yapısı FullCalendar bağımlılığı olmadan çalışıyor
- `quickFilter` ile `TODAY`, `WEEK`, `MONTH`, `DAY` filtreleri var

#### B2. Tespit Edilen Sorunlar ve İyileştirme Önerileri

**1. `useStaffCalendar.ts:15-17` — Üç ayrı veri kaynağından (task, meeting, shoot) ayrı ayrı fetch yapılıyor**

```tsx
const { data: taskData } = useStaffTasks('all', undefined, 200);
const { data: meetingData } = useMeetings(200);
const { data: shootData } = useStaffShoots(0, 200);
```

**Aksiyon:** Backend'e eklenecek tek bir `/api/calendar` endpoint'i ile bu 3 sorguyu tek seferde birleştirin:
```tsx
const { data: calendarData } = useQuery({
    queryKey: calendarKeys.month(year, month),
    queryFn: () => calendarApi.getMonth(year, month),
});
// calendarData.tasks, calendarData.meetings, calendarData.shoots
```

**2. `CalendarGrid.tsx` — Hücre başına inline stil ve inline event handler'lar muhtemelen fazla**

**Aksiyon:** Grid hücrelerini `CalendarCell` bileşenine çıkarın ve `React.memo` ile gereksiz render'ları önleyin:
```tsx
const CalendarCell = React.memo(function CalendarCell({ day, events, isToday, onSelect }: CellProps) {
  // ...
});
```

**3. `calendar.utils.ts` — Pure fonksiyonlar test edilebilir durumda ama dosya büyük olabilir**

**Aksiyon:** `getMonthDays`, `getSelection`, `formatDateKey` gibi fonksiyonların unit testlerini `__tests__/calendar.utils.test.ts` dosyasında genişletin. Özellikle ay geçişleri (Ocak → Aralık) ve artık yıl senaryolarını kapsayın.

**4. `TaskAgenda.tsx`, `MeetingAgenda.tsx`, `ShootAgenda.tsx` — Üç ayrı dosya ama muhtemelen aynı yapıdalar**

**Aksiyon:** Generic bir `AgendaList` bileşeni oluşturun:
```tsx
interface AgendaItem {
    id: string;
    title: string;
    date: string;
    type: 'task' | 'meeting' | 'shoot';
    status?: string;
}
export function AgendaList({ items, onItemClick }: AgendaListProps) { ... }
```

---

### C. Aksiyon Adımları (Öncelik Sırası)

| # | Aksiyon | Öncelik | Tahmini Efor |
|---|---------|---------|-------------|
| 1 | `GET /api/calendar` endpoint'i ekle (tüm etkinlikleri tek seferde döndür) (BE) | Yüksek | 3 saat |
| 2 | Frontend'de 3 ayrı veri sorgusunu tek bir calendar sorgusu ile değiştir (FE) | Yüksek | 2 saat |
| 3 | iCal export'a tarih filtresi ve `DTSTAMP` ekle (BE) | Orta | 1 saat |
| 4 | Agenda bileşenlerini generic `AgendaList` altında birleştir (FE) | Orta | 2 saat |
| 5 | `CalendarCell` bileşenini `React.memo` ile optimize et (FE) | Orta | 1 saat |
| 6 | Calendar utils unit test'lerini genişlet (FE) | Düşük | 1.5 saat |

---

## Modül 5: Kimlik Doğrulama & Güvenlik (auth/security)

### Genel Bakış

| Katman | Dosya Sayısı | Mimari Desen |
|--------|-------------|-------------|
| Backend | 8 Java dosyası | `security/` (JWT), `config/SecurityConfig.java`, `config/WebSocketConfig.java`, `service/AuthService.java` |
| Frontend | 2 TypeScript dosyası | `store/AuthContext.tsx`, `api/auth.ts` |

Backend: `JwtTokenProvider.java` (75 satır), `JwtAuthFilter.java` (66 satır), `SecurityConfig.java` (140 satır), `WebSocketConfig.java` (176 satır), `AuthService.java` (189 satır), `LoginRateLimiter.java`, `CurrentUser.java`.

---

### A. Backend İncelemesi

#### A1. Mevcut Mimari Değerlendirmesi

**Olumlu yönler:**
- JWT token yapısı temiz: `sub` (UUID), `email`, `globalRole` claim'leri
- Refresh token rotation (`AuthService.java:70-72`) — eski token revoke edilip yenisi oluşturuluyor
- Refresh token hash'lenerek (`SHA-256`) veritabanında saklanıyor — plain-text saklanmıyor
- `@Scheduled` ile saatlik expired token temizliği (`AuthService.java:107-110`)
- Cookie-based JWT (`JwtAuthFilter.java:31-33`) — auth header yoksa cookie'den okuyor
- WebSocket handshake'de cookie'den JWT okuma (`WebSocketConfig.java:144-175`)
- STOMP destination bazlı yetkilendirme (`WebSocketConfig.java:104-130`)
- CSRF koruması (`SecurityConfig.java:56-59`) — `/ws/**` ve auth endpoint'leri hariç
- GlobalExceptionHandler kapsamlı: 18 farklı exception handler'ı var

#### A2. Tespit Edilen Sorunlar ve İyileştirme Önerileri

**1. `JwtTokenProvider.java:23-24` — JWT secret key doğrudan `String.getBytes()` ile HMAC key'e çevriliyor**

```java
this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
```

**Sorun:** Secret yeterince uzun değilse (HS256 minimum 256 bit = 32 byte) güvenlik açığı oluşur. `.env` dosyasında bu kontrol yapılmıyor.

**Aksiyon:** Başlangıçta minimum uzunluk kontrolü ekleyin:
```java
public JwtTokenProvider(@Value("${app.jwt.secret}") String secret, ...) {
    if (secret.length() < 32) {
        throw new IllegalStateException("JWT secret must be at least 32 characters");
    }
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
}
```

**2. `SecurityConfig.java:51-94` — `SecurityFilterChain` bean'i çok fazla sorumluluk içeriyor**

140 satırlık config sınıfı; CSRF, CORS, session management, exception handling, authorization rules, filter sıralaması ve bean tanımlarının hepsini içeriyor.

**Aksiyon:** Config'i parçalayın:
```java
@Configuration
public class CorsConfig { /* CORS ayarları */ }

@Configuration  
public class CsrfConfig { /* CSRF ayarları */ }

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig { /* temel security filter chain */ }
```

**3. `AuthService.java:33-37` — Login rate limiting için ayrı bir `LoginRateLimiter` sınıfı var ama `AuthService.login()` metodunda kullanıldığına dair bir iz yok**

`LoginRateLimiter.java` dosyası mevcut ancak `AuthService` içinde çağrılmıyor.

**Aksiyon:** `login()` metoduna rate limiting entegre edin:
```java
@Transactional
public AuthResponse login(LoginRequest request) {
    if (!loginRateLimiter.tryAcquire(request.getEmail())) {
        throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED", "...");
    }
    // ... mevcut login akışı
}
```

**4. `JwtAuthFilter.java:39` — Role claim'ine `ROLE_` prefix'i ekleniyor ama `SecurityConfig.java:82-84` de `hasRole("ADMIN")` kullanılıyor (Spring otomatik `ROLE_` ekler)**

```java
// JwtAuthFilter.java L39:
var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
// SecurityConfig.java L82:
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

Bu doğru çalışıyor (Spring `hasRole("ADMIN")` → `ROLE_ADMIN` arar), ancak `hasRole` yerine `hasAuthority("ROLE_ADMIN")` kullanmak daha açık olur.

**Aksiyon:** Değişiklik gerekmiyor, mevcut hali doğru. Ama kod dokümantasyonuna not düşülebilir.

**5. `AuthService.java:121-127` — `buildAuthResponse` metodunda `UserInfo` içinde sadece ilk membership bilgisi döndürülüyor**

```java
if (user.getGlobalRole() == GlobalRole.COMPANY_USER) {
    List<CompanyMembership> memberships = companyMembershipRepository.findByUserId(user.getId());
    if (!memberships.isEmpty()) {
        membershipRole = memberships.get(0).getMembershipRole().name(); // sadece ilk!
        companyId = memberships.get(0).getCompany().getId().toString();
    }
}
```

**Sorun:** Bir kullanıcı birden fazla şirkete üye olabilir, sadece ilk membership bilgisi döndürülüyor.

**Aksiyon:** `UserInfo`'ya `memberships: Array<{companyId, companyName, role}>` alanı ekleyin veya en azından primary company kavramını tanımlayın.

**6. `GlobalExceptionHandler.java:235-247` — `RuntimeException` handler'ı tüm yakalanmamış RuntimeException'ları 500 Internal Error'a çeviriyor**

Bu, domain logic hatalarının 500 dönmesine neden oluyor. Örneğin `TaskService` içindeki `new RuntimeException("Gorev bulunamadi")` 500 dönecek.

**Aksiyon:** (Modül 2 ve 3'te belirtildiği gibi) Tüm `RuntimeException`'ları `ApiException`'a çevirin. Alternatif olarak `RuntimeException` handler'ında mesaj içeriğine göre conditional status dönebilirsiniz ama bu anti-pattern.

---

### B. Frontend İncelemesi

#### B1. Mevcut Mimari Değerlendirmesi

**Olumlu yönler:**
- `AuthContext.tsx` sade ve anlaşılır (61 satır)
- CSRF token alma → me kontrolü akışı (`authApi.csrf()` → `authApi.me()`) doğru
- `logout` fonksiyonu token'ı revoke edip login sayfasına yönlendiriyor

#### B2. Tespit Edilen Sorunlar ve İyileştirme Önerileri

**1. `AuthContext.tsx:18-32` — `useEffect` içinde CSRF + me sorgusu yapılıyor ama loading state yönetimi yetersiz**

```tsx
useEffect(() => {
    if (window.location.pathname === '/login') {
        setIsLoading(false); // eslint-disable-next-line
        return;
    }
    authApi.csrf()
        .then(() => authApi.me())
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setIsLoading(false));
}, []);
```

**Aksiyon:** React Query ile auth state yönetimini iyileştirin:
```tsx
const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
        await authApi.csrf();
        return authApi.me();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
});
```

**2. Token expiry handling eksik: Access token expire olduğunda refresh token ile yenileme mekanizması frontend'de yok**

**Aksiyon:** Axios interceptor'a 401 response handler'ı ekleyin. 401 alınınca önce `/api/auth/refresh` endpoint'ine istek atıp yeni token alın, sonra orijinal isteği tekrarlayın:
```tsx
// api/client.ts
api.interceptors.response.use(
    response => response,
    async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;
            const { accessToken } = await authApi.refresh();
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return api(error.config);
        }
        return Promise.reject(error);
    }
);
```

**3. `AuthContext.tsx:47` — `logout` sonrası `window.location.href = '/login'` kullanılıyor, SPA içi yönlendirme yerine tam sayfa yenilemesi yapıyor**

**Aksiyon:** React Router `useNavigate` kullanın:
```tsx
const navigate = useNavigate();
const logout = async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
    navigate('/login', { replace: true });
};
```

---

### C. Aksiyon Adımları (Öncelik Sırası)

| # | Aksiyon | Öncelik | Tahmini Efor |
|---|---------|---------|-------------|
| 1 | JWT secret minimum uzunluk kontrolü ekle (BE) | Kritik | 0.5 saat |
| 2 | Frontend'e token refresh interceptor'ı ekle (FE) | Kritik | 2 saat |
| 3 | `LoginRateLimiter`'ı `AuthService.login()` metoduna entegre et (BE) | Yüksek | 1 saat |
| 4 | Tüm `RuntimeException`'ları `ApiException`'a çevir (BE - tüm modülleri kapsar) | Yüksek | 2 saat |
| 5 | `SecurityConfig`'i CORS/CSRF/Security olarak 3 config sınıfına böl (BE) | Orta | 1.5 saat |
| 6 | `UserInfo` response'a tüm membership'leri ekle (BE) | Orta | 1.5 saat |
| 7 | `logout`'ta `window.location.href` yerine `navigate` kullan (FE) | Düşük | 0.5 saat |
| 8 | Auth state'i React Query ile yönet (FE) | Düşük | 1.5 saat |

---

## Bir Sonraki Ajan İçin Bekleyen Modüller (Handoff List)

> Bu bölüm, projedeki **incelenmemiş** tüm modülleri listeler. Bir sonraki agent bu listeden 5 modül seçerek incelemeye devam etmelidir.

### Backend Modülleri

| # | Modül Paketi | Açıklama | Dosya Sayısı (tahmini) |
|---|-------------|----------|----------------------|
| 1 | `shoot/` | Çekim yönetimi (CRUD, ekip, ekipman) | ~12 |
| 2 | `prproject/` | PR projeleri (fazlar, üyeler, notlar) | ~12 |
| 3 | `meeting/` | Toplantı yönetimi (CRUD, katılımcılar, notlar) | ~12 |
| 4 | `note/` | Not yönetimi | ~8 |
| 5 | `googleanalytics/` | Google Analytics API entegrasyonu | ~6 |
| 6 | `instagram/` | Instagram API entegrasyonu | ~6 |
| 7 | `googleads/` | Google Ads API entegrasyonu | ~6 |
| 8 | `metaads/` | Meta (Facebook) Ads API entegrasyonu | ~6 |
| 9 | `searchconsole/` | Google Search Console API entegrasyonu | ~6 |
| 10 | `webdesign/` | Web tasarım/page speed yönetimi | ~6 |
| 11 | `contentplan/` | İçerik planı yönetimi | ~6 |
| 12 | `files/` | Dosya/medya yükleme (Cloudinary) | ~6 |
| 13 | `maintenance/` | Web bakım log yönetimi | ~6 |
| 14 | `googleoauth/` | Google OAuth entegrasyonu | ~4 |
| 15 | `user/application/` | Kullanıcı yönetimi & ayarları (UserManagementService, UserSettingsService) | ~4 |
| 16 | `controller/` | Genel controller'lar (ActivityLog, Dashboard, Notification, Search, TimeTracking, Survey vb.) | ~14 |
| 17 | `service/` | Genel servisler (Dashboard, Email, Survey, TimeTracking, Search vb.) | ~11 |
| 18 | `config/` | Config sınıfları (DataInitializer, AdminPasswordReset vb.) | ~5 |
| 19 | `entity/` | JPA Entity'leri (36 entity) | ~36 |
| 20 | `repository/` | Spring Data JPA repository'leri (35 repo) | ~35 |
| 21 | `dto/` | Genel DTO'lar (15 DTO) | ~15 |
| 22 | `exception/` | Exception handling (zaten kısmen incelendi) | ~6 |

### Frontend Modülleri (features/)

| # | Modül Klasörü | Açıklama | Dosya Sayısı (tahmini) |
|---|-------------|----------|----------------------|
| 23 | `features/shoots/` | Çekim yönetimi UI | ~10 |
| 24 | `features/pr-projects/` | PR projeleri UI | ~10 |
| 25 | `features/meetings/` | Toplantı yönetimi UI | ~10 |
| 26 | `features/notes/` | Not yönetimi UI | ~8 |
| 27 | `features/google-analytics/` | GA dashboard UI | ~6 |
| 28 | `features/instagram/` | Instagram dashboard UI | ~6 |
| 29 | `features/google-ads/` | Google Ads dashboard UI | ~6 |
| 30 | `features/meta-ads/` | Meta Ads dashboard UI | ~6 |
| 31 | `features/search-console/` | Search Console dashboard UI | ~6 |
| 32 | `features/web-design/` | Web tasarım UI | ~6 |
| 33 | `features/content-plans/` | İçerik planı UI | ~6 |
| 34 | `features/files/` | Dosya yükleme UI | ~6 |
| 35 | `features/maintenance-log/` | Bakım log UI | ~6 |
| 36 | `features/kanban/` | Kanban board UI | ~4 |
| 37 | `features/client-analytics/` | Client analitik UI | ~6 |
| 38 | `features/client-dashboard/` | Client dashboard UI | ~4 |
| 39 | `features/serviceCatalog.ts` | Servis katalog sabitleri | 1 |

### Frontend Sayfaları (pages/)

| # | Sayfa Grubu | Açıklama | Dosya Sayısı |
|---|------------|----------|-------------|
| 40 | `pages/admin/` | Admin sayfaları (Dashboard, Companies, Staff, Users, Settings, Analytics, ActivityLog, Routine, StaffDetail, CompanyDetail) | 10 |
| 41 | `pages/staff/` | Staff sayfaları (Dashboard, Calendar, Tasks, Companies, Messaging, Meetings, Shoots, PR, Notes, Kanban, TimeTracking, ContentPlans, Analytics, Settings, Completed, MediaLibrary, Requests) | 18 |
| 42 | `pages/client/` | Client sayfaları (Dashboard, Tasks, Messaging, Team, MediaLibrary, Services, Survey, Settings, Analytics, ContentPlan, Shoots, Onboarding, + 6 entegrasyon detail sayfası) | 20 |
| 43 | `pages/auth/` | Auth sayfaları (Login) | ~2 |

### Paylaşılan Altyapı (Frontend)

| # | Klasör | Açıklama |
|---|--------|----------|
| 44 | `api/` | Axios instance + API fonksiyonları |
| 45 | `components/` | Paylaşılan UI bileşenleri |
| 46 | `hooks/` | Custom hook'lar (useNotifications vb.) |
| 47 | `layouts/` | AdminLayout, StaffLayout, ClientLayout |
| 48 | `i18n/` | Çoklu dil desteği dosyaları |
| 49 | `lib/` | Yardımcı kütüphane fonksiyonları |
| 50 | `store/` | ThemeContext |

### Önerilen İnceleme Sırası (Sonraki 5 Modül)

Bir sonraki agent için **önerilen öncelikli 5 modül**:

1. **shoot** (Çekim Yönetimi) — Çekimler, ekip, ekipman yönetimi; CRUD operasyonları
2. **meeting** (Toplantı Yönetimi) — Toplantı planlama, katılımcı yönetimi
3. **prproject** (PR Proje Yönetimi) — PR projeleri, fazlar, ilerleme takibi
4. **googleanalytics + instagram + googleads + metaads + searchconsole** (Harici API Entegrasyonları) — 5 entegrasyon modülü birlikte incelenebilir
5. **controller/ + service/** (Genel Controller ve Servisler) — Dashboard, Notification, Email, Search, TimeTracking, ActivityLog

---

> **Not:** Bu doküman `refactorplan.md` olarak kaydedilmiştir. Sonraki agent `### Bir Sonraki Ajan İçin Bekleyen Modüller (Handoff List)` başlığından devam edecektir.

---

## Doğrulama Notu — 2026-06-22

Bu bölüm, yukarıdaki audit maddelerinin gerçek kodla karşılaştırılması sonrası eklendi.

### Doğrulanıp Uygulanan Maddeler

1. **JWT secret minimum uzunluk kontrolü doğruydu ve uygulandı.**
   - `JwtTokenProvider` artık 32 karakterden kısa secret ile açık `IllegalStateException` fırlatıyor.
   - Test: `JwtTokenProviderTest`.

2. **Messaging conversation bulunamadığında `RuntimeException` kullanımı doğru bir bulguydu ve düzeltildi.**
   - `sendMessage`, `getMessages`, `markConversationAsRead` artık `CONVERSATION_NOT_FOUND` kodlu `ApiException` kullanıyor.
   - Test: `MessagingServiceTest`.

3. **`getMyConversations` içinde son mesaj için N+1 sorgu bulgusu doğruydu ve düzeltildi.**
   - `MessageRepository.findLatestByConversationIds(...)` eklendi.
   - `MessagingService.getMyConversations(...)` artık son mesajları tek batch sorgu ile alıyor.
   - Test: `MessagingServiceTest`.

4. **Task silmede note/review cleanup eksikliği doğruydu ve düzeltildi.**
   - `TaskService.deleteTask(...)` artık önce `task_reviews`, sonra `task_notes`, sonra `tasks` siler.
   - `TaskReviewRepository.deleteByTaskId(...)` ve `TaskNoteRepository.deleteByTaskId(...)` eklendi.
   - Test: `TaskServiceTest`.

5. **iCal export'ta `DTSTAMP` eksikliği ve uzun text sınırı bulgusu doğruydu ve düzeltildi.**
   - Her `VEVENT` artık `DTSTAMP` içeriyor.
   - `SUMMARY`/`DESCRIPTION`/`LOCATION` gibi text alanları 200 karakterle sınırlandı.
   - Test: `CalendarExportServiceTest`.

### Yanlış veya Eksik Doğrulanmış Maddeler

1. **"Frontend token refresh interceptor yok" maddesi yanlış.**
   - `frontend/src/api/client.ts` içinde 401 sonrası `/api/auth/refresh` çağrısı ve orijinal isteği tekrar deneme mekanizması zaten var.
   - Bu nedenle tekrar uygulanmadı.

2. **"`LoginRateLimiter`, `AuthService.login()` içinde kullanılmıyor" maddesi eksik bağlamla yazılmış.**
   - Rate limiter `AuthService` içinde değil, `AuthController.login(...)` içinde uygulanıyor.
   - Mimari olarak servis katmanına taşınabilir ama mevcut sistemde rate limit koruması yok değil.
   - Bu nedenle bug fix olarak uygulanmadı.

3. **"`KanbanBoard.tsx` 45KB / çok büyük" maddesi yanlış.**
   - Gerçek dosya 179 satır.
   - Bu nedenle parçalama aksiyonu uygulanmadı.

4. **"Mesaj input'unda debounce yok" maddesi bug olarak güçlü değil.**
   - Controlled input'un her tuşta state güncellemesi React için normal davranış.
   - Performans problemi ölçülmeden debounce eklemek UX'i bozabilir.
   - Bu nedenle uygulanmadı.

5. **"`useAssignableUsers` boş `companyId` ile sorgu atmamalı" maddesi kesin bug değil.**
   - API `companyId` opsiyonel kullanılıyor; boş olduğunda tüm atanabilir kullanıcıları listeleme davranışı var.
   - Bu nedenle `enabled: Boolean(companyId)` eklenmedi.

### Doğru Ama Bu Turda Uygulanmayan Maddeler

1. **Calendar admin export'ta `findAll()` kullanımı performans riski olarak doğru.**
   - Ancak tarih aralığı seçimi API/ürün davranışı değiştirir.
   - `export(userId, admin)` imzasına veya controller query parametrelerine karar verilmeden uygulanmadı.

2. **Yeni `GET /api/calendar` endpoint'i önerisi mantıklı ama yeni feature kapsamıdır.**
   - Mevcut refactor doğrulama turunda endpoint eklenmedi.

3. **`TaskAccessPolicy.requireUpdate`, `requireRead` ile aynı çalışıyor; bulgu gerçek ama ürün kararı gerektiriyor.**
   - Güncelleme yetkisini sadece atanmış kişi/admin ile sınırlamak mevcut şirket yetkisi davranışını kırabilir.
   - Yetki matrisi netleştirilmeden uygulanmadı.

4. **Permission key'lerin frontend ve backend'de ayrı tutulması doğru teknik borç.**
   - DB seed + endpoint + frontend tüketimi gerektirdiği için bu turda uygulanmadı.

5. **`AuthResponse.UserInfo` içinde sadece ilk membership dönmesi doğru bir sınırlama.**
   - Response contract değişikliği ve frontend uyarlaması gerektirir.
   - Bu turda uygulanmadı.

6. **`SecurityConfig` parçalama önerisi stil/mimari refactor niteliğinde.**
   - Davranış hatası olmadığı için bu doğrulama/fix turunda uygulanmadı.

### Çalıştırılan Doğrulama

```bash
cd backend
mvn -Dtest=JwtTokenProviderTest,CalendarExportServiceTest,MessagingServiceTest,TaskServiceTest test
```

Sonuç: `Tests run: 11, Failures: 0, Errors: 0, Skipped: 0`.
