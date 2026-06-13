# Pull Request Review Checklist

## Davranis

- [ ] API davranisi degismemis (mevcut endpoint contract'lari bozulmamis)
- [ ] Yeni ozellik mevcut dev dosyaya eklenmemis, kendi feature klasorunde
- [ ] Eski ve yeni implementasyon paralel tutulmuyorsa, eski kod kaldirilmis
- [ ] Davranis degisikligi varsa acikca belirtilmis

## Mimari Kurallar

- [ ] Controller repository dogrudan kullanmiyor (application service uzerinden)
- [ ] Controller entity dondurmuyor (DTO donduruyor)
- [ ] Authorization merkezi policy uzerinden uygulanmis
- [ ] DTO mapping servis icinde degil, mapper sinifinda
- [ ] Feature icindeki dosyalara dogrudan degil, public API uzerinden erisiliyor
- [ ] `any` tipi kullanilmamis
- [ ] Query key ve invalidation feature icinde tanimli
- [ ] Formlar React Hook Form + Zod ile dogrulanmis
- [ ] API response tipi buyuk UI agacina yayilmamis; view model'e map edilmis

## Boyut Esikleri

- [ ] React page/container 300 satiri asmamis
- [ ] React presentational component 200 satiri asmamis
- [ ] Custom hook 150 satiri asmamis
- [ ] API modulu 200 satiri asmamis
- [ ] Java application service 250 satiri asmamis
- [ ] Java controller 150 satiri asmamis

## Test

- [ ] Backend unit/integration testleri eklenmis
- [ ] Frontend unit/component testleri eklenmis
- [ ] Mevcut testler YESIL kaliyor

## Frontend Bagimlilik Kurallari

- [ ] `shared` feature veya page import etmiyor
- [ ] `entities` page import etmiyor
- [ ] Bir feature digerinin ic dosyasini import etmiyor (yalnizca public index.ts)
- [ ] Page yalnizca route composition ve feature birlestirme yapiyor

## Backend Bagimlilik Kurallari

- [ ] Domain kodu Spring MVC, JPA repository veya HTTP client bilmiyor
- [ ] Harici servis cevabi application service icinde `Map<String, Object>` olarak dolamiyor
- [ ] Feature'lar arasi yan etkiler dogrudan servis zinciri yerine event ile ayrilmis

## Depo Hijyeni

- [ ] `frontend/src_backup` kod icermiyor
- [ ] `backend/uploads` Git tarafindan takip edilmiyor
- [ ] Gereksiz dosya, konsol.log veya debug kodu birakilmamis
